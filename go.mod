// The Go backend lives in ./backend; the module is at the repository root
// for the Toolforge build service (Heroku Go buildpack).
// +heroku install ./backend

module github.com/simon04/locator-tool

go 1.26.0

ignore (
	./dist
	./node_modules
)

require (
	github.com/go-sql-driver/mysql v1.10.1
	golang.org/x/oauth2 v0.37.0
)

require filippo.io/edwards25519 v1.2.0 // indirect
