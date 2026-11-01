package server

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/simon04/locator-tool/backend/internal/wikitext"
)

type editRequest struct {
	PageID    int `json:"pageid"`
	Locations []struct {
		Type wikitext.Type `json:"type"`
		Lat  float64       `json:"lat"`
		Lng  float64       `json:"lng"`
	} `json:"locations"`
}

func (r *editRequest) valid() bool {
	if r.PageID <= 0 || len(r.Locations) == 0 || len(r.Locations) > 2 {
		return false
	}
	for _, l := range r.Locations {
		if !l.Type.Valid() || l.Lat < -90 || l.Lat > 90 || l.Lng < -180 || l.Lng > 180 {
			return false
		}
	}
	return true
}

// properties are the structured data properties per template.
var properties = map[wikitext.Type]string{
	// coordinates of the point of view (P1259)
	wikitext.Location: "P1259",
	// coordinates of depicted place (P9149)
	wikitext.ObjectLocation: "P9149",
}

// handleEdit adds the locations to the wikitext of a file and to its
// structured data.
func (s *Server) handleEdit(w http.ResponseWriter, req *http.Request) {
	c, err := s.wiki(req)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "not logged in")
		return
	}
	var body editRequest
	if err := json.NewDecoder(http.MaxBytesReader(w, req.Body, 1<<16)).Decode(&body); err != nil || !body.valid() {
		writeError(w, http.StatusBadRequest, "invalid edit request")
		return
	}
	ctx := req.Context()
	slog.Info("edit", "pageid", body.PageID, "locations", body.Locations)

	var r struct {
		CurTimestamp string `json:"curtimestamp"`
		Query        struct {
			Pages []struct {
				Missing   bool `json:"missing"`
				Revisions []struct {
					Timestamp string `json:"timestamp"`
					Slots     map[string]struct {
						Content string `json:"content"`
					} `json:"slots"`
				} `json:"revisions"`
			} `json:"pages"`
			Tokens struct {
				CSRFToken string `json:"csrftoken"`
			} `json:"tokens"`
		} `json:"query"`
	}
	err = c.query(ctx, url.Values{
		"action":       {"query"},
		"pageids":      {strconv.Itoa(body.PageID)},
		"prop":         {"revisions"},
		"rvprop":       {"content|timestamp"},
		"rvslots":      {"*"},
		"meta":         {"tokens"},
		"curtimestamp": {"1"},
	}, &r)
	if errors.Is(err, errUnauthorized) {
		writeError(w, http.StatusUnauthorized, "not logged in")
		return
	} else if err != nil {
		slog.Warn("query failed", "pageid", body.PageID, "error", err)
		writeError(w, http.StatusBadGateway, err.Error())
		return
	}
	if len(r.Query.Pages) == 0 || r.Query.Pages[0].Missing || len(r.Query.Pages[0].Revisions) == 0 {
		writeError(w, http.StatusNotFound, "page not found")
		return
	}
	rev := r.Query.Pages[0].Revisions[0]
	c.csrfToken = r.Query.Tokens.CSRFToken

	text := rev.Slots["main"].Content
	summary := make([]string, len(body.Locations))
	for i, l := range body.Locations {
		if text, err = wikitext.AddLocation(l.Type, l.Lat, l.Lng, text); err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		summary[i] = "{{" + string(l.Type) + "}}"
	}
	result, err := c.write(ctx, url.Values{
		"action":         {"edit"},
		"pageid":         {strconv.Itoa(body.PageID)},
		"summary":        {strings.Join(summary, ", ")},
		"text":           {text},
		"basetimestamp":  {rev.Timestamp},
		"starttimestamp": {r.CurTimestamp},
		"nocreate":       {"1"},
	})
	var apiErr *apiError
	if errors.As(err, &apiErr) {
		// the frontend shows the result
		slog.Warn("edit failed", "pageid", body.PageID, "error", err)
		writeJSON(w, http.StatusOK, map[string]json.RawMessage{"result": result})
		return
	} else if err != nil {
		slog.Warn("edit failed", "pageid", body.PageID, "error", err)
		writeError(w, http.StatusBadGateway, err.Error())
		return
	}

	// structured data: update the first claim of the property, or create one
	var mediainfo struct {
		Statements map[string][]struct {
			ID string `json:"id"`
		} `json:"statements"`
	}
	if slot, ok := rev.Slots["mediainfo"]; ok {
		_ = json.Unmarshal([]byte(slot.Content), &mediainfo)
	}
	for _, l := range body.Locations {
		value, _ := json.Marshal(map[string]any{
			"latitude":  l.Lat,
			"longitude": l.Lng,
			"globe":     "http://www.wikidata.org/entity/Q2",
			"precision": 0.000001,
		})
		params := url.Values{"snaktype": {"value"}, "value": {string(value)}}
		property := properties[l.Type]
		if claims := mediainfo.Statements[property]; len(claims) > 0 {
			params.Set("action", "wbsetclaimvalue")
			params.Set("claim", claims[0].ID)
		} else {
			params.Set("action", "wbcreateclaim")
			params.Set("entity", "M"+strconv.Itoa(body.PageID))
			params.Set("property", property)
		}
		if _, err := c.write(ctx, params); err != nil {
			slog.Warn("structured data edit failed", "pageid", body.PageID, "property", property, "error", err)
		}
	}

	writeJSON(w, http.StatusOK, map[string]json.RawMessage{"result": result})
}
