// Package server serves the locator-tool frontend and its API.
package server

import (
	"database/sql"
	"encoding/json"
	"io"
	"io/fs"
	"net/http"
	"path"
	"strings"

	"golang.org/x/oauth2"
)

// UserAgent identifies the tool, as https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits asks for.
const UserAgent = "locator-tool (https://locator-tool.toolforge.org/; https://github.com/simon04/locator-tool)"

// CommonsURL is the script path of Wikimedia Commons.
const CommonsURL = "https://commons.wikimedia.org/w/"

// Server handles HTTP requests.
type Server struct {
	// OAuth is the OAuth 2.0 client registered on Commons.
	OAuth *oauth2.Config
	// DB reads the Commons replica; nil if not configured.
	DB *sql.DB
	// Dist is the built frontend; nil to serve none.
	Dist fs.FS
	// WikiURL is the script path of the wiki to edit, CommonsURL by default.
	WikiURL string
	// HTTP sends requests to the wiki.
	HTTP *http.Client
}

// Handler returns the HTTP handler.
func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) {
		_, _ = io.WriteString(w, "OK\n")
	})
	mux.HandleFunc("GET /login", s.handleLogin)
	mux.HandleFunc("POST /token", s.handleToken)
	mux.HandleFunc("GET /user", s.handleUser)
	mux.HandleFunc("POST /edit", s.handleEdit)
	mux.HandleFunc("GET /catscan", s.handleCatscan)
	mux.HandleFunc("GET /", s.handleStatic)
	handler := http.NewCrossOriginProtection().Handler(mux)
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		handler.ServeHTTP(w, req)
	})
}

// handleStatic serves the frontend. Paths that are no file, such as
// /oauth-callback, get index.html, the single-page app's entry point.
func (s *Server) handleStatic(w http.ResponseWriter, req *http.Request) {
	if s.Dist == nil {
		http.NotFound(w, req)
		return
	}
	name := strings.TrimPrefix(path.Clean("/"+req.URL.Path), "/")
	if info, err := fs.Stat(s.Dist, name); name == "" || err != nil || info.IsDir() {
		name = "index.html"
	}
	if strings.HasPrefix(name, "assets/") {
		// Vite emits content-hashed asset names.
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	} else {
		w.Header().Set("Cache-Control", "no-cache")
	}
	http.ServeFileFS(w, req, s.Dist, name)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
