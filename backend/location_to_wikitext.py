import re

import mwparserfromhell

LOCATION_POSSIBLE_RE = re.compile(r"location possible", re.IGNORECASE)
LOCATION_RE = re.compile(r"location(?: dec)?", re.IGNORECASE)
OBJECT_LOCATION_RE = re.compile(r"object location", re.IGNORECASE)
INFOBOX_RE = re.compile(r"information|artwork|photograph", re.IGNORECASE)
NESW_RE = re.compile(r"[NESW]", re.IGNORECASE)


def add_location_to_wikitext(type, lat, lng, wikitext):
    """
    Adds a {{Location}} template containing `lat`, `lng` to the `wikitext`.
    Replaces previously specified `{{Location}}`, `{{Location dec}}` templates.
    """
    if type not in ["Location", "Object location"]:
        raise ValueError("Invalid location type")

    wikicode = mwparserfromhell.parse(wikitext)

    for template in list(wikicode.filter_templates(recursive=False)):
        if LOCATION_POSSIBLE_RE.match(str(template.name)):
            wikicode.remove(template)

    replaceable = LOCATION_RE if type == "Location" else OBJECT_LOCATION_RE
    for template in wikicode.filter_templates(recursive=False):
        if replaceable.match(str(template.name)):
            wikicode.replace(template, _build_location(type, lat, lng, template))
            return str(wikicode)

    new_template = "{{%s|%s|%s}}" % (type, lat, lng)
    for template in wikicode.filter_templates(recursive=False):
        if INFOBOX_RE.match(str(template.name)):
            wikicode.insert_after(template, "\n%s\n" % new_template)
            return str(wikicode)

    return str(wikicode) + new_template


def _build_location(type, lat, lng, old_template):
    """
    Builds a new {{Location}}/{{Object location}} string with the given
    coordinates, preserving non-coordinate parameters (e.g. region) from
    the old template.
    """
    skip = 8 if _is_dms(old_template) else 2
    parts = ["{{%s|%s|%s" % (type, lat, lng)]
    for param in old_template.params:
        try:
            idx = int(str(param.name))
        except ValueError:
            parts.append("|%s=%s" % (str(param.name), str(param.value)))
            continue
        if idx > skip:
            parts.append("|%s" % str(param.value))
    parts.append("}}")
    return "".join(parts)


def _is_dms(template):
    return (
        template.has(4)
        and template.has(8)
        and NESW_RE.match(str(template.get(4).value))
        and NESW_RE.match(str(template.get(8).value))
    )
