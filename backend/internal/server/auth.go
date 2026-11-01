package server

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"golang.org/x/oauth2"
)

// handleLogin redirects to the OAuth authorization on Commons. The frontend
// generates state and the PKCE code verifier, keeps them, and passes state and
// the S256 code challenge. Commons redirects back to /oauth-callback, where
// the frontend calls /token.
func (s *Server) handleLogin(w http.ResponseWriter, req *http.Request) {
	state, challenge := req.FormValue("state"), req.FormValue("code_challenge")
	if state == "" || challenge == "" {
		writeError(w, http.StatusBadRequest, "state and code_challenge required")
		return
	}
	u := s.OAuth.AuthCodeURL(state,
		oauth2.SetAuthURLParam("code_challenge", challenge),
		oauth2.SetAuthURLParam("code_challenge_method", "S256"))
	http.Redirect(w, req, u, http.StatusFound)
}

// handleToken exchanges an authorization code for an access token, keeping
// the OAuth client configuration in the backend.
func (s *Server) handleToken(w http.ResponseWriter, req *http.Request) {
	var body struct {
		Code     string `json:"code"`
		Verifier string `json:"code_verifier"`
	}
	if err := json.NewDecoder(http.MaxBytesReader(w, req.Body, 1<<16)).Decode(&body); err != nil || body.Code == "" || body.Verifier == "" {
		writeError(w, http.StatusBadRequest, "code and code_verifier required")
		return
	}
	ctx := context.WithValue(req.Context(), oauth2.HTTPClient, s.HTTP)
	token, err := s.OAuth.Exchange(ctx, body.Code, oauth2.VerifierOption(body.Verifier))
	if err != nil {
		slog.Warn("OAuth token exchange failed", "error", err)
		writeError(w, http.StatusUnauthorized, "token exchange failed")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"access_token": token.AccessToken,
		"expires_in":   int(time.Until(token.Expiry).Seconds()),
	})
}

// handleUser returns the name of the user owning the access token.
func (s *Server) handleUser(w http.ResponseWriter, req *http.Request) {
	c, err := s.wiki(req)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "not logged in")
		return
	}
	var profile struct {
		Username string `json:"username"`
	}
	if err := c.do(req.Context(), http.MethodGet, "rest.php/oauth2/resource/profile", nil, &profile); err != nil {
		if errors.Is(err, errUnauthorized) {
			writeError(w, http.StatusUnauthorized, "not logged in")
			return
		}
		slog.Warn("fetching profile failed", "error", err)
		writeError(w, http.StatusBadGateway, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"user": profile.Username})
}
