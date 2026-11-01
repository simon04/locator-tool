package server

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"strings"
)

// errUnauthorized is returned when the wiki rejects the access token.
var errUnauthorized = errors.New("unauthorized")

// apiError is an error of the MediaWiki Action API.
type apiError struct {
	Code string `json:"code"`
	Info string `json:"info"`
}

func (e *apiError) Error() string { return e.Code + ": " + e.Info }

// wiki calls the wiki on behalf of the user owning an OAuth access token.
type wiki struct {
	http      *http.Client
	url       string
	token     string
	csrfToken string
}

func (s *Server) wiki(req *http.Request) (*wiki, error) {
	token, ok := strings.CutPrefix(req.Header.Get("Authorization"), "Bearer ")
	if !ok || token == "" {
		return nil, errUnauthorized
	}
	return &wiki{http: s.HTTP, url: s.WikiURL, token: token}, nil
}

// do sends form to path relative to the script path and decodes the JSON
// response into v.
func (c *wiki) do(ctx context.Context, method, path string, form url.Values, v any) error {
	req, err := http.NewRequestWithContext(ctx, method, c.url+path, strings.NewReader(form.Encode()))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+c.token)
	if form != nil {
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden {
		return errUnauthorized
	}
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("%s %s: %s", method, path, resp.Status)
	}
	return json.NewDecoder(resp.Body).Decode(v)
}

// query calls api.php and decodes the result into v.
func (c *wiki) query(ctx context.Context, params url.Values, v any) error {
	params.Set("format", "json")
	params.Set("formatversion", "2")
	var raw json.RawMessage
	if err := c.do(ctx, http.MethodPost, "api.php", params, &raw); err != nil {
		return err
	}
	var result struct {
		Error *apiError `json:"error"`
	}
	if err := json.Unmarshal(raw, &result); err != nil {
		return err
	}
	if result.Error != nil {
		if result.Error.Code == "mwoauth-invalid-authorization" {
			return errUnauthorized
		}
		return result.Error
	}
	return json.Unmarshal(raw, v)
}

// write calls a writing action of api.php with the CSRF token and returns the
// raw result, also for an *apiError.
func (c *wiki) write(ctx context.Context, params url.Values) (json.RawMessage, error) {
	params.Set("format", "json")
	params.Set("formatversion", "2")
	params.Set("assert", "user")
	// MediaWiki may reject a freshly obtained CSRF token (badtoken); then
	// obtain a new CSRF token and retry once.
	for attempt := 0; ; attempt++ {
		params.Set("token", c.csrfToken)
		var raw json.RawMessage
		if err := c.do(ctx, http.MethodPost, "api.php", params, &raw); err != nil {
			return nil, err
		}
		var result struct {
			Error *apiError `json:"error"`
		}
		if err := json.Unmarshal(raw, &result); err != nil {
			return nil, err
		}
		if result.Error == nil {
			return raw, nil
		}
		if result.Error.Code != "badtoken" || attempt > 0 {
			return raw, result.Error
		}
		slog.Warn("badtoken, retrying", "action", params.Get("action"))
		var tokens struct {
			Query struct {
				Tokens struct {
					CSRFToken string `json:"csrftoken"`
				} `json:"tokens"`
			} `json:"query"`
		}
		if err := c.query(ctx, url.Values{"action": {"query"}, "meta": {"tokens"}}, &tokens); err != nil {
			return nil, err
		}
		c.csrfToken = tokens.Query.Tokens.CSRFToken
	}
}
