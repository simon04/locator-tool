package server

import (
	"context"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// catscanSQL lists the pages in namespace ns in a category and its
// subcategories up to depth levels below.
const catscanSQL = `
WITH RECURSIVE catscan AS (
    SELECT p.page_title, p.page_namespace, 1 AS depth
    FROM categorylinks c
    JOIN linktarget l ON c.cl_target_id = l.lt_id
    JOIN page p ON c.cl_from = p.page_id AND p.page_is_redirect = 0
    WHERE l.lt_namespace = 14 AND l.lt_title = ?
    UNION ALL
    SELECT p.page_title, p.page_namespace, catscan.depth + 1
    FROM catscan
    JOIN linktarget l ON l.lt_namespace = 14 AND l.lt_title = catscan.page_title
    JOIN categorylinks c ON c.cl_target_id = l.lt_id
    JOIN page p ON c.cl_from = p.page_id AND p.page_is_redirect = 0
    WHERE catscan.depth < ?
)
SELECT DISTINCT page_title FROM catscan WHERE page_namespace = ?`

// handleCatscan lists the pages of a category tree.
func (s *Server) handleCatscan(w http.ResponseWriter, req *http.Request) {
	if s.DB == nil {
		writeError(w, http.StatusServiceUnavailable, "no database configured")
		return
	}
	category := strings.ReplaceAll(req.FormValue("category"), " ", "_")
	ns, _ := strconv.Atoi(req.FormValue("ns"))
	depth, _ := strconv.Atoi(req.FormValue("depth"))
	depth = min(max(depth, 0), 10)
	if category == "" {
		writeError(w, http.StatusBadRequest, "category required")
		return
	}

	ctx, cancel := context.WithTimeout(req.Context(), 2*time.Minute)
	defer cancel()
	rows, err := s.DB.QueryContext(ctx, catscanSQL, category, depth, ns)
	if err != nil {
		slog.Error("catscan failed", "category", category, "error", err)
		writeError(w, http.StatusInternalServerError, "database query failed")
		return
	}
	defer rows.Close()
	pages := []string{}
	for rows.Next() {
		var title string
		if err := rows.Scan(&title); err != nil {
			slog.Error("catscan failed", "category", category, "error", err)
			writeError(w, http.StatusInternalServerError, "database query failed")
			return
		}
		pages = append(pages, title)
	}
	if err := rows.Err(); err != nil {
		slog.Error("catscan failed", "category", category, "error", err)
		writeError(w, http.StatusInternalServerError, "database query failed")
		return
	}
	writeJSON(w, http.StatusOK, map[string][]string{"pages": pages})
}
