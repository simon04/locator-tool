import re

def add_location_to_wikitext(lat, lng, wikitext):
    r"""
    >>> add_location_to_wikitext(12.3, 45.6, "")
    '{{Location|12.3|45.6}}'
    >>> add_location_to_wikitext(12.3, 45.6, "{{Information}}{{Location|87.65|-43.21|region:XY-Z}}")
    '{{Information}}{{Location|12.3|45.6|region:XY-Z}}'
    >>> add_location_to_wikitext(12.3, 45.6, "{{Information}}{{Location|34|1|27.37|N|116|9|29.88|W|region:XY}}")
    '{{Information}}{{Location|12.3|45.6|region:XY}}'
    >>> add_location_to_wikitext(12.3, 45.6, "Foo\n{{Information|foo={{de|sdf}}|bar={{lic}}}}Bar")
    'Foo\n{{Information|foo={{de|sdf}}|bar={{lic}}}}\n{{Location|12.3|45.6}}\nBar'
    >>> add_location_to_wikitext(12.3, 45.6, "X\n{{Location dec|50.917385|13.342268}}\nX")
    'X\n{{Location|12.3|45.6}}\nX'
    >>> add_location_to_wikitext(12.3, 45.6, "{{location dec|43.599468|1.445375|region:FR}}\n")
    '{{Location|12.3|45.6|region:FR}}\n'
    """
    location = "{{Location|%s|%s}}" % (lat, lng)
    numericArg = r'(\|\s*[-+.0-9]+\s*)'
    pattern = re.compile(r'\{\{\s*Location\s*(' + numericArg + '{3}\|\s*[NESW]\s*){2}', flags=re.IGNORECASE)
    if pattern.search(wikitext):
        return pattern.sub(location[:-2], wikitext, count=1)
    pattern = re.compile(r'\{\{\s*Location( dec)?\s*' + numericArg + numericArg, flags=re.IGNORECASE)
    if pattern.search(wikitext):
        return pattern.sub(location[:-2], wikitext, count=1)
    pattern = re.compile(r'\{\{\s*Information', flags=re.IGNORECASE)
    match = pattern.search(wikitext)
    if match:
        braceCount = 2
        pos = match.start() + 2
        while braceCount > 0 and pos < len(wikitext):
            if wikitext[pos] == '{':
                braceCount = braceCount + 1
            elif wikitext[pos] == '}':
                braceCount = braceCount - 1
            pos = pos + 1
        return '\n'.join([wikitext[:pos], location, wikitext[pos:]])
    return wikitext + location
