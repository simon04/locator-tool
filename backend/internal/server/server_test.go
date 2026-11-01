package server

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"sync"
	"testing"
	"testing/fstest"

	"golang.org/x/oauth2"
)

// fakeWiki answers api.php like Commons for File:Example.jpg (pageid 42) and
// records the write actions.
type fakeWiki struct {
	mu       sync.Mutex
	actions  []url.Values
	badtoken bool
}

func (f *fakeWiki) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	if req.Header.Get("Authorization") != "Bearer secret" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	if req.URL.Path == "/rest.php/oauth2/resource/profile" {
		_, _ = io.WriteString(w, `{"username":"Example"}`)
		return
	}
	_ = req.ParseForm()
	f.mu.Lock()
	defer f.mu.Unlock()
	switch req.Form.Get("action") {
	case "query":
		_, _ = io.WriteString(w, `{"curtimestamp":"2026-11-01T00:00:00Z","query":{"pages":[{"pageid":42,"ns":6,"revisions":[{"timestamp":"2026-10-01T00:00:00Z","slots":{
			"main":{"content":"{{Information|description=x}}\n{{Location|1|2}}"},
			"mediainfo":{"content":"{\"id\":\"M42\",\"statements\":{\"P1259\":[{\"id\":\"M42$abc\"}]}}"}}}]}],
			"tokens":{"csrftoken":"csrf+\\"}}}`)
	default:
		if req.Form.Get("token") != `csrf+\` || f.badtoken {
			f.badtoken = false
			_, _ = io.WriteString(w, `{"error":{"code":"badtoken","info":"Invalid CSRF token."}}`)
			return
		}
		f.actions = append(f.actions, req.Form)
		_, _ = io.WriteString(w, `{"`+req.Form.Get("action")+`":{"result":"Success"}}`)
	}
}

func newTestServer(t *testing.T) (*httptest.Server, *fakeWiki) {
	t.Helper()
	wiki := &fakeWiki{}
	api := httptest.NewServer(wiki)
	t.Cleanup(api.Close)
	s := &Server{
		WikiURL: api.URL + "/",
		HTTP:    api.Client(),
		Dist: fstest.MapFS{
			"index.html":      {Data: []byte("<html>")},
			"assets/app-1.js": {Data: []byte("app")},
		},
	}
	srv := httptest.NewServer(s.Handler())
	t.Cleanup(srv.Close)
	return srv, wiki
}

func do(t *testing.T, method, url, token, body string, header ...string) (*http.Response, string) {
	t.Helper()
	req, _ := http.NewRequest(method, url, strings.NewReader(body))
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	for i := 0; i < len(header); i += 2 {
		req.Header.Set(header[i], header[i+1])
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	b, _ := io.ReadAll(resp.Body)
	return resp, string(b)
}

func TestStatic(t *testing.T) {
	srv, _ := newTestServer(t)
	for path, want := range map[string]string{"/": "<html>", "/oauth-callback": "<html>", "/assets/app-1.js": "app"} {
		resp, body := do(t, http.MethodGet, srv.URL+path, "", "")
		if resp.StatusCode != http.StatusOK || body != want {
			t.Errorf("GET %s = %d %q, want %q", path, resp.StatusCode, body, want)
		}
	}
	resp, _ := do(t, http.MethodGet, srv.URL+"/", "", "")
	if resp.Header.Get("X-Frame-Options") != "DENY" || resp.Header.Get("X-Content-Type-Options") != "nosniff" {
		t.Errorf("security headers missing: %v", resp.Header)
	}
}

func TestUser(t *testing.T) {
	srv, _ := newTestServer(t)
	if resp, body := do(t, http.MethodGet, srv.URL+"/user", "secret", ""); resp.StatusCode != http.StatusOK || body != `{"user":"Example"}`+"\n" {
		t.Errorf("GET /user = %d %s", resp.StatusCode, body)
	}
	for _, token := range []string{"", "wrong"} {
		if resp, _ := do(t, http.MethodGet, srv.URL+"/user", token, ""); resp.StatusCode != http.StatusUnauthorized {
			t.Errorf("GET /user with token %q = %d, want 401", token, resp.StatusCode)
		}
	}
}

const editBody = `{"pageid":42,"locations":[{"type":"Location","lat":12.3,"lng":45.6},{"type":"Object location","lat":-1,"lng":2}]}`

func TestEdit(t *testing.T) {
	srv, wiki := newTestServer(t)
	wiki.badtoken = true
	resp, body := do(t, http.MethodPost, srv.URL+"/edit", "secret", editBody, "Content-Type", "application/json")
	if resp.StatusCode != http.StatusOK || body != `{"result":{"edit":{"result":"Success"}}}`+"\n" {
		t.Fatalf("POST /edit = %d %s", resp.StatusCode, body)
	}
	if len(wiki.actions) != 3 {
		t.Fatalf("got %d write actions, want 3", len(wiki.actions))
	}
	edit, set, create := wiki.actions[0], wiki.actions[1], wiki.actions[2]
	wantText := "{{Information|description=x}}\n{{Object location|-1|2}}\n\n{{Location|12.3|45.6}}"
	if edit.Get("action") != "edit" || edit.Get("text") != wantText || edit.Get("summary") != "{{Location}}, {{Object location}}" ||
		edit.Get("basetimestamp") != "2026-10-01T00:00:00Z" || edit.Get("assert") != "user" {
		t.Errorf("edit = %v", edit)
	}
	if set.Get("action") != "wbsetclaimvalue" || set.Get("claim") != "M42$abc" {
		t.Errorf("set claim = %v", set)
	}
	if create.Get("action") != "wbcreateclaim" || create.Get("entity") != "M42" || create.Get("property") != "P9149" {
		t.Errorf("create claim = %v", create)
	}
	var value map[string]any
	_ = json.Unmarshal([]byte(create.Get("value")), &value)
	if value["latitude"] != -1.0 || value["longitude"] != 2.0 {
		t.Errorf("claim value = %v", value)
	}
}

func TestEditRejects(t *testing.T) {
	srv, wiki := newTestServer(t)
	for _, tt := range []struct {
		name, token, body string
		header            []string
		want              int
	}{
		{"no token", "", editBody, nil, http.StatusUnauthorized},
		{"wrong token", "wrong", editBody, nil, http.StatusUnauthorized},
		{"invalid type", "secret", `{"pageid":42,"locations":[{"type":"Foo","lat":1,"lng":2}]}`, nil, http.StatusBadRequest},
		{"lat out of range", "secret", `{"pageid":42,"locations":[{"type":"Location","lat":100,"lng":2}]}`, nil, http.StatusBadRequest},
		{"no locations", "secret", `{"pageid":42,"locations":[]}`, nil, http.StatusBadRequest},
		{"cross origin", "secret", editBody, []string{"Sec-Fetch-Site", "cross-site"}, http.StatusForbidden},
	} {
		resp, body := do(t, http.MethodPost, srv.URL+"/edit", tt.token, tt.body, tt.header...)
		if resp.StatusCode != tt.want {
			t.Errorf("%s: POST /edit = %d %s, want %d", tt.name, resp.StatusCode, body, tt.want)
		}
	}
	if len(wiki.actions) != 0 {
		t.Errorf("got write actions %v, want none", wiki.actions)
	}
}

func TestLogin(t *testing.T) {
	srv, _ := newTestServer(t)
	srv.Config.Handler = (&Server{OAuth: &oauth2.Config{
		ClientID: "key",
		Endpoint: oauth2.Endpoint{AuthURL: "https://commons.example/authorize"},
	}}).Handler()
	client := &http.Client{CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
	resp, err := client.Get(srv.URL + "/login?state=s1&code_challenge=c1")
	if err != nil {
		t.Fatal(err)
	}
	loc, _ := url.Parse(resp.Header.Get("Location"))
	q := loc.Query()
	if resp.StatusCode != http.StatusFound || loc.Host != "commons.example" || q.Get("state") != "s1" ||
		q.Get("code_challenge") != "c1" || q.Get("code_challenge_method") != "S256" || q.Get("client_id") != "key" {
		t.Errorf("GET /login = %d %s", resp.StatusCode, loc)
	}
}
