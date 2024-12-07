import re


def add_location_to_wikitext(type, lat, lng, wikitext):
    r"""
    Adds a {{Location}} template containing `lat`, `lng` to the `wikitext`.
    Replaces previously specified `{{Location}}`, `{{Location dec}}` templates.

    >>> add_location_to_wikitext(None, 12.3, 45.6, "")
    Traceback (most recent call last):
    ...
    ValueError: Invalid location type
    >>> add_location_to_wikitext('foo bar', 12.3, 45.6, "")
    Traceback (most recent call last):
    ...
    ValueError: Invalid location type
    >>> add_location_to_wikitext('Location', 12.3, 45.6, "")
    '{{Location|12.3|45.6}}'
    >>> add_location_to_wikitext('Location', 12.3, 45.6, "{{Information}}{{Location|87.65|-43.21|region:XY-Z}}")
    '{{Information}}{{Location|12.3|45.6|region:XY-Z}}'
    >>> add_location_to_wikitext('Location', 12.3, 45.6, "{{Information}}{{Location|34|1|27.37|N|116|9|29.88|W|region:XY}}")
    '{{Information}}{{Location|12.3|45.6|region:XY}}'
    >>> add_location_to_wikitext('Location', 12.3, 45.6, "{{Information}}{{Location|87.65|-43.21|region:XY-Z}}{{Location possible}}")
    '{{Information}}{{Location|12.3|45.6|region:XY-Z}}'
    >>> add_location_to_wikitext('Location', 12.3, 45.6, "Foo\n{{Information|foo={{de|sdf}}|bar={{lic}}}}Bar")
    'Foo\n{{Information|foo={{de|sdf}}|bar={{lic}}}}\n{{Location|12.3|45.6}}\nBar'
    >>> add_location_to_wikitext('Location', 12.3, 45.6, "X\n{{Location dec|50.917385|13.342268}}\nX")
    'X\n{{Location|12.3|45.6}}\nX'
    >>> add_location_to_wikitext('Location', 12.3, 45.6, "{{location dec|43.599468|1.445375|region:FR}}\n")
    '{{Location|12.3|45.6|region:FR}}\n'
    >>> add_location_to_wikitext('Object location', 12.3, 45.6, "")
    '{{Object location|12.3|45.6}}'
    >>> add_location_to_wikitext('Object location', 12.3, 45.6, "{{Information}}{{Location|9.99|9.99|region:XY-Z}}{{Object location|87.65|-43.21|region:XY-Z}}")
    '{{Information}}{{Location|9.99|9.99|region:XY-Z}}{{Object location|12.3|45.6|region:XY-Z}}'
    >>> add_location_to_wikitext('Object location', 12.3, 45.6, "{{object location|87.65|-43.21|region:XY-Z}}")
    '{{Object location|12.3|45.6|region:XY-Z}}'
    >>> add_location_to_wikitext('Location', 12.3, 45.6, "{{Location |1=47.27 |2=11.426944444444 }}")
    '{{Location|12.3|45.6}}'
    >>> add_location_to_wikitext('Location', 12.3, 45.6, "{{Artwork|title = {{fr|1=Place de la gare de Rennes, début XXe siècle}}}}{{PD-Art}}[[Category:Place de la Gare (Rennes)]]")
    '{{Artwork|title = {{fr|1=Place de la gare de Rennes, début XXe siècle}}}}\n{{Location|12.3|45.6}}\n{{PD-Art}}[[Category:Place de la Gare (Rennes)]]'
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
    pattern = re.compile(r"\{\{\s*(Information|Artwork)", flags=re.IGNORECASE)
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
