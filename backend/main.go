// Command backend serves the locator-tool frontend and its API: OAuth login
// on Wikimedia Commons, edits of file locations, and category listings from
// the Wiki Replicas.
//
// Configuration is by environment variables, see INSTALLING.md.
package main

import (
	"context"
	"database/sql"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-sql-driver/mysql"
	"golang.org/x/oauth2"

	"github.com/simon04/locator-tool/backend/internal/server"
)

func main() {
	if err := run(); err != nil {
		slog.Error("fatal", "error", err)
		os.Exit(1)
	}
}

func run() error {
	s := &server.Server{
		OAuth: &oauth2.Config{
			// https://meta.wikimedia.org/wiki/Special:OAuthListConsumers/view/d61b2b3ceda1f5faf12a8d965d531334
			ClientID: getenv("OAUTH_CONSUMER_KEY", "d61b2b3ceda1f5faf12a8d965d531334"),
			// the consumer is not confidential, PKCE protects the code exchange
			ClientSecret: os.Getenv("OAUTH_CONSUMER_SECRET"),
			Endpoint: oauth2.Endpoint{
				AuthURL:  server.CommonsURL + "rest.php/oauth2/authorize",
				TokenURL: server.CommonsURL + "rest.php/oauth2/access_token",
			},
		},
		DB:      replica(),
		Dist:    os.DirFS(getenv("DIST_DIR", "dist")),
		WikiURL: server.CommonsURL,
		HTTP: &http.Client{
			Timeout:   time.Minute,
			Transport: userAgent{http.DefaultTransport},
		},
	}
	srv := &http.Server{
		Addr:              ":" + getenv("PORT", "8000"),
		Handler:           s.Handler(),
		ReadHeaderTimeout: 10 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	go func() {
		<-ctx.Done()
		shutdown, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		_ = srv.Shutdown(shutdown)
	}()
	slog.Info("listening", "addr", srv.Addr)
	if err := srv.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}

// replica opens the Commons replica holding the category tables, with the
// credentials Toolforge sets in TOOL_REPLICA_USER and TOOL_REPLICA_PASSWORD.
// REPLICA_ADDR overrides the host, e.g. 127.0.0.1:3306 for an SSH tunnel.
func replica() *sql.DB {
	cfg := mysql.NewConfig()
	cfg.User = os.Getenv("TOOL_REPLICA_USER")
	cfg.Passwd = os.Getenv("TOOL_REPLICA_PASSWORD")
	if cfg.User == "" {
		slog.Warn("TOOL_REPLICA_USER not set, /catscan is disabled")
		return nil
	}
	cfg.Net = "tcp"
	// Commons keeps categorylinks and linktarget on this host since September 2026.
	cfg.Addr = getenv("REPLICA_ADDR", "links.commonswiki.web.db.svc.wikimedia.cloud:3306")
	cfg.DBName = "commonswiki_p"
	cfg.Timeout = 10 * time.Second
	connector, err := mysql.NewConnector(cfg)
	if err != nil {
		slog.Error("replica config", "error", err)
		return nil
	}
	db := sql.OpenDB(connector)
	db.SetMaxOpenConns(4)
	// The replicas ask tools not to hold idle connections.
	db.SetConnMaxIdleTime(30 * time.Second)
	return db
}

// userAgent sets the User-Agent of outgoing requests.
type userAgent struct{ http.RoundTripper }

func (t userAgent) RoundTrip(req *http.Request) (*http.Response, error) {
	req = req.Clone(req.Context())
	req.Header.Set("User-Agent", server.UserAgent)
	return t.RoundTripper.RoundTrip(req)
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
