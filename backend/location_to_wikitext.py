import re


def add_location_to_wikitext(type, lat, lng, wikitext):
    """
    Adds a {{Location}} template containing `lat`, `lng` to the `wikitext`.
    Replaces previously specified `{{Location}}`, `{{Location dec}}` templates.
    """
    if type not in ["Location", "Object location"]:
        raise ValueError("Invalid location type")
    pattern = re.compile(r"\{\{\s*Location possible\s*\}\}", flags=re.IGNORECASE)
    wikitext = pattern.sub("", wikitext)
    location = "{{%s|%s|%s}}" % (type, lat, lng)
    numeric_arg = r"(\|\s*([1-9]\s*=\s*)?[-+.0-9]+\s*)"
    pattern = re.compile(
        (r"\{\{\s*%s\s*(" % type) + numeric_arg + r"{3}\|\s*[NESW]\s*){2}",
        flags=re.IGNORECASE,
    )
    if pattern.search(wikitext):
        return pattern.sub(location[:-2], wikitext, count=1)
    pattern = re.compile(
        (r"\{\{\s*%s( dec)?\s*" % type) + numeric_arg + numeric_arg, flags=re.IGNORECASE
    )
    if pattern.search(wikitext):
        return pattern.sub(location[:-2], wikitext, count=1)
    pattern = re.compile(r"\{\{\s*(Information|Artwork|Photograph)", flags=re.IGNORECASE)
    match = pattern.search(wikitext)
    if match:
        brace_count = 2
        pos = match.start() + 2
        while brace_count > 0 and pos < len(wikitext):
            if wikitext[pos] == "{":
                brace_count += 1
            elif wikitext[pos] == "}":
                brace_count -= 1
            pos += 1
        return "\n".join([wikitext[:pos], location, wikitext[pos:]])
    return wikitext + location
