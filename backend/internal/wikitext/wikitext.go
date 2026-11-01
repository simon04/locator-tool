// Package wikitext adds {{Location}} and {{Object location}} templates to
// the wikitext of a file description page.
package wikitext

import (
	"fmt"
	"regexp"
	"strconv"
)

// Type is the kind of location template.
type Type string

const (
	// Location is the camera location, {{Location}}.
	Location Type = "Location"
	// ObjectLocation is the location of the depicted object, {{Object location}}.
	ObjectLocation Type = "Object location"
)

// Valid reports whether t is a known template.
func (t Type) Valid() bool {
	return t == Location || t == ObjectLocation
}

const numericArg = `(\|\s*([1-9]\s*=\s*)?[-+.0-9]+\s*)`

var (
	locationPossible = regexp.MustCompile(`(?i)\{\{\s*Location possible\s*\}\}`)
	infoTemplate     = regexp.MustCompile(`(?i)\{\{\s*(Information|Artwork|Photograph)`)
	// dms matches {{Location|deg|min|sec|N|deg|min|sec|E…, per type.
	dms = map[Type]*regexp.Regexp{}
	// dec matches {{Location|lat|lng… and {{Location dec|lat|lng…, per type.
	dec = map[Type]*regexp.Regexp{}
)

func init() {
	for _, t := range []Type{Location, ObjectLocation} {
		name := regexp.QuoteMeta(string(t))
		dms[t] = regexp.MustCompile(`(?i)\{\{\s*` + name + `\s*(` + numericArg + `{3}\|\s*[NESW]\s*){2}`)
		dec[t] = regexp.MustCompile(`(?i)\{\{\s*` + name + `( dec)?\s*` + numericArg + numericArg)
	}
}

// AddLocation adds a template of type t with lat, lng to wikitext. It replaces
// a previously specified template of the same type (also {{Location dec}} and
// the degrees/minutes/seconds form), keeping further arguments such as
// region:XY, and removes {{Location possible}}. Otherwise it inserts the
// template after {{Information}}, {{Artwork}} or {{Photograph}}, or appends it.
func AddLocation(t Type, lat, lng float64, wikitext string) (string, error) {
	if !t.Valid() {
		return "", fmt.Errorf("invalid location type %q", t)
	}
	wikitext = locationPossible.ReplaceAllLiteralString(wikitext, "")
	// without the closing braces, to keep further arguments
	head := "{{" + string(t) + "|" + formatCoordinate(lat) + "|" + formatCoordinate(lng)
	for _, re := range []*regexp.Regexp{dms[t], dec[t]} {
		if re.MatchString(wikitext) {
			return re.ReplaceAllLiteralString(wikitext, head), nil
		}
	}
	location := head + "}}"
	if loc := infoTemplate.FindStringIndex(wikitext); loc != nil {
		end := matchingBraces(wikitext, loc[0])
		return wikitext[:end] + "\n" + location + "\n" + wikitext[end:], nil
	}
	return wikitext + location, nil
}

// matchingBraces returns the position after the template starting with "{{"
// at start, or len(s) if it is not closed.
func matchingBraces(s string, start int) int {
	depth := 2
	pos := start + 2
	for depth > 0 && pos < len(s) {
		switch s[pos] {
		case '{':
			depth++
		case '}':
			depth--
		}
		pos++
	}
	return pos
}

func formatCoordinate(x float64) string {
	return strconv.FormatFloat(x, 'f', -1, 64)
}
