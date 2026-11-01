package wikitext

import "testing"

func TestAddLocation(t *testing.T) {
	tests := []struct {
		name     string
		typ      Type
		wikitext string
		want     string
	}{
		{
			name: "empty wikitext",
			typ:  Location,
			want: "{{Location|12.3|45.6}}",
		},
		{
			name:     "replaces decimal location preserving region",
			typ:      Location,
			wikitext: "{{Information}}{{Location|87.65|-43.21|region:XY-Z}}",
			want:     "{{Information}}{{Location|12.3|45.6|region:XY-Z}}",
		},
		{
			name:     "replaces DMS location preserving region",
			typ:      Location,
			wikitext: "{{Information}}{{Location|34|1|27.37|N|116|9|29.88|W|region:XY}}",
			want:     "{{Information}}{{Location|12.3|45.6|region:XY}}",
		},
		{
			name:     "removes location possible",
			typ:      Location,
			wikitext: "{{Information}}{{Location|87.65|-43.21|region:XY-Z}}{{Location possible}}",
			want:     "{{Information}}{{Location|12.3|45.6|region:XY-Z}}",
		},
		{
			name:     "inserts after information template",
			typ:      Location,
			wikitext: "Foo\n{{Information|foo={{de|sdf}}|bar={{lic}}}}Bar",
			want:     "Foo\n{{Information|foo={{de|sdf}}|bar={{lic}}}}\n{{Location|12.3|45.6}}\nBar",
		},
		{
			name:     "replaces location dec",
			typ:      Location,
			wikitext: "X\n{{Location dec|50.917385|13.342268}}\nX",
			want:     "X\n{{Location|12.3|45.6}}\nX",
		},
		{
			name:     "replaces lowercase location dec preserving region",
			typ:      Location,
			wikitext: "{{location dec|43.599468|1.445375|region:FR}}\n",
			want:     "{{Location|12.3|45.6|region:FR}}\n",
		},
		{
			name: "object location empty wikitext",
			typ:  ObjectLocation,
			want: "{{Object location|12.3|45.6}}",
		},
		{
			name:     "object location replaces only object location",
			typ:      ObjectLocation,
			wikitext: "{{Information}}{{Location|9.99|9.99|region:XY-Z}}{{Object location|87.65|-43.21|region:XY-Z}}",
			want:     "{{Information}}{{Location|9.99|9.99|region:XY-Z}}{{Object location|12.3|45.6|region:XY-Z}}",
		},
		{
			name:     "object location lowercase",
			typ:      ObjectLocation,
			wikitext: "{{object location|87.65|-43.21|region:XY-Z}}",
			want:     "{{Object location|12.3|45.6|region:XY-Z}}",
		},
		{
			name:     "replaces location with named args",
			typ:      Location,
			wikitext: "{{Location |1=47.27 |2=11.426944444444 }}",
			want:     "{{Location|12.3|45.6}}",
		},
		{
			name:     "inserts after artwork template",
			typ:      Location,
			wikitext: "{{Artwork|title = {{fr|1=Place de la gare de Rennes, début XXe siècle}}}}{{PD-Art}}[[Category:Place de la Gare (Rennes)]]",
			want:     "{{Artwork|title = {{fr|1=Place de la gare de Rennes, début XXe siècle}}}}\n{{Location|12.3|45.6}}\n{{PD-Art}}[[Category:Place de la Gare (Rennes)]]",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := AddLocation(tt.typ, 12.3, 45.6, tt.wikitext)
			if err != nil {
				t.Fatal(err)
			}
			if got != tt.want {
				t.Errorf("AddLocation() =\n%q\nwant\n%q", got, tt.want)
			}
		})
	}
}

func TestAddLocationInvalidType(t *testing.T) {
	for _, typ := range []Type{"", "foo bar"} {
		if _, err := AddLocation(typ, 12.3, 45.6, ""); err == nil {
			t.Errorf("AddLocation(%q) succeeded, want error", typ)
		}
	}
}
