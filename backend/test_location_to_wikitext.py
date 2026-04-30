import unittest

from location_to_wikitext import add_location_to_wikitext


class AddLocationToWikitextTest(unittest.TestCase):
    def test_invalid_type_none(self):
        with self.assertRaises(ValueError):
            add_location_to_wikitext(None, 12.3, 45.6, "")

    def test_invalid_type_string(self):
        with self.assertRaises(ValueError):
            add_location_to_wikitext("foo bar", 12.3, 45.6, "")

    def test_empty_wikitext(self):
        actual = add_location_to_wikitext("Location", 12.3, 45.6, "")
        self.assertEqual(actual, "{{Location|12.3|45.6}}")

    def test_replaces_decimal_location_preserving_region(self):
        actual = add_location_to_wikitext(
            "Location",
            12.3,
            45.6,
            "{{Information}}{{Location|87.65|-43.21|region:XY-Z}}",
        )
        self.assertEqual(actual, "{{Information}}{{Location|12.3|45.6|region:XY-Z}}")

    def test_replaces_dms_location_preserving_region(self):
        actual = add_location_to_wikitext(
            "Location",
            12.3,
            45.6,
            "{{Information}}{{Location|34|1|27.37|N|116|9|29.88|W|region:XY}}",
        )
        self.assertEqual(actual, "{{Information}}{{Location|12.3|45.6|region:XY}}")

    def test_removes_location_possible(self):
        actual = add_location_to_wikitext(
            "Location",
            12.3,
            45.6,
            "{{Information}}{{Location|87.65|-43.21|region:XY-Z}}{{Location possible}}",
        )
        self.assertEqual(actual, "{{Information}}{{Location|12.3|45.6|region:XY-Z}}")

    def test_inserts_after_information_template(self):
        actual = add_location_to_wikitext(
            "Location",
            12.3,
            45.6,
            "Foo\n{{Information|foo={{de|sdf}}|bar={{lic}}}}Bar",
        )
        self.assertEqual(
            actual,
            "Foo\n{{Information|foo={{de|sdf}}|bar={{lic}}}}\n{{Location|12.3|45.6}}\nBar",
        )

    def test_replaces_location_dec(self):
        actual = add_location_to_wikitext(
            "Location",
            12.3,
            45.6,
            "X\n{{Location dec|50.917385|13.342268}}\nX",
        )
        self.assertEqual(actual, "X\n{{Location|12.3|45.6}}\nX")

    def test_replaces_lowercase_location_dec_preserving_region(self):
        actual = add_location_to_wikitext(
            "Location",
            12.3,
            45.6,
            "{{location dec|43.599468|1.445375|region:FR}}\n",
        )
        self.assertEqual(actual, "{{Location|12.3|45.6|region:FR}}\n")

    def test_object_location_empty_wikitext(self):
        actual = add_location_to_wikitext("Object location", 12.3, 45.6, "")
        self.assertEqual(actual, "{{Object location|12.3|45.6}}")

    def test_object_location_replaces_only_object_location(self):
        actual = add_location_to_wikitext(
            "Object location",
            12.3,
            45.6,
            "{{Information}}{{Location|9.99|9.99|region:XY-Z}}{{Object location|87.65|-43.21|region:XY-Z}}",
        )
        self.assertEqual(
            actual,
            "{{Information}}{{Location|9.99|9.99|region:XY-Z}}{{Object location|12.3|45.6|region:XY-Z}}",
        )

    def test_object_location_lowercase(self):
        actual = add_location_to_wikitext(
            "Object location",
            12.3,
            45.6,
            "{{object location|87.65|-43.21|region:XY-Z}}",
        )
        self.assertEqual(actual, "{{Object location|12.3|45.6|region:XY-Z}}")

    def test_replaces_location_with_named_args(self):
        actual = add_location_to_wikitext(
            "Location",
            12.3,
            45.6,
            "{{Location |1=47.27 |2=11.426944444444 }}",
        )
        self.assertEqual(actual, "{{Location|12.3|45.6}}")

    def test_inserts_after_artwork_template(self):
        actual = add_location_to_wikitext(
            "Location",
            12.3,
            45.6,
            "{{Artwork|title = {{fr|1=Place de la gare de Rennes, début XXe siècle}}}}{{PD-Art}}[[Category:Place de la Gare (Rennes)]]",
        )
        self.assertEqual(
            actual,
            "{{Artwork|title = {{fr|1=Place de la gare de Rennes, début XXe siècle}}}}\n{{Location|12.3|45.6}}\n{{PD-Art}}[[Category:Place de la Gare (Rennes)]]",
        )


if __name__ == "__main__":
    unittest.main()
