"""Snaps spacing and sizing in the site's CSS (and inline style attributes) to a 4px grid.

  python scripts/snap-4pt.py            # dry run: prints what would change
  python scripts/snap-4pt.py --write    # rewrites the files

Rules
- margin, padding, gap, top/right/bottom/left/inset, width/height (and min-): every px value of 3px or more goes to the
  nearest multiple of 4 (halves go up). Values under 3px (1px and 2px hairlines, borders, optical nudges) are left alone.
- line-height: px values go to a multiple of 4. A unitless line-height next to a px font-size becomes a px value on the grid.
- Left alone on purpose: font sizes, border widths, radii, shadows, transforms, max-width, media-query breakpoints,
  intro.css (its geometry is computed in JS) and anything not written in px.
"""
import glob, os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "site")
WRITE = "--write" in sys.argv
SKIP_CSS = {"intro.css"}

SPACING = re.compile(r"^(?:margin(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?|padding(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?|gap|row-gap|column-gap|top|right|bottom|left|inset|width|height|min-width|min-height)$")
PX = re.compile(r"(?<![\w.#-])(-?)(\d+(?:\.\d+)?)px")
changes = []

def snap(n):
    return int((n + 2) // 4 * 4)

def snap_px(value, where):
    def r(m):
        n = float(m.group(2))
        if n < 3:
            return m.group(0)
        s = snap(n)
        if s != n:
            changes.append((where, m.group(0), m.group(1) + str(s) + "px"))
        return m.group(1) + str(s) + "px"
    return PX.sub(r, value)

def snap_declaration(prop, value, where):
    p = prop.strip().lower()
    if "url(" in value:
        return value
    if SPACING.match(p):
        return snap_px(value, where + " " + p)
    if p == "line-height":
        return snap_px(value, where + " " + p)
    if p == "font":                                  # only the line-height after the slash
        def fl(m):
            n = float(m.group(1))
            if n < 3:
                return m.group(0)
            s = snap(n)
            if s != n:
                changes.append((where + " font/", m.group(0), "/" + str(s) + "px"))
            return "/" + str(s) + "px"
        return re.sub(r"/\s*(\d+(?:\.\d+)?)px", fl, value)
    return value

DECL = re.compile(r"(?P<p>[-a-zA-Z]+)\s*:\s*(?P<v>[^;{}]+)(?P<e>;|(?=\}))")

def process_block(body, where):
    """body = the text between { and } of one rule (no nested braces)."""
    fs = re.search(r"(?<![-\w])font-size\s*:\s*(\d+(?:\.\d+)?)px", body)
    fsh = re.search(r"(?<![-\w])font\s*:[^;{}]*?(\d+(?:\.\d+)?)px\s*/", body)
    size = float((fs or fsh).group(1)) if (fs or fsh) else None

    def d(m):
        prop, val = m.group("p"), m.group("v")
        new = snap_declaration(prop, val, where)
        if prop.strip().lower() == "line-height" and size and re.fullmatch(r"\s*\d*\.?\d+\s*", new):
            px = max(4, snap(size * float(new)))
            changes.append((where + " line-height", new.strip(), str(px) + "px"))
            new = str(px) + "px"
        return prop + ": " + new.strip() + m.group("e") if new != val else m.group(0)
    return DECL.sub(d, body)

def process_css(text, where):
    out, i = [], 0
    # innermost rule bodies only: { ... } without nested braces
    return re.sub(r"\{([^{}]*)\}", lambda m: "{" + process_block(m.group(1), where) + "}", text)

def process_html(text, where):
    def attr(m):
        inner = m.group(2)
        parts = inner.split(";")
        res = []
        for part in parts:
            if ":" in part:
                k, v = part.split(":", 1)
                res.append(k + ":" + snap_declaration(k, v, where + " inline"))
            else:
                res.append(part)
        return m.group(1) + ";".join(res) + m.group(3)
    return re.sub(r'(style=")([^"]*)(")', attr, text)

files = []
for f in sorted(glob.glob(os.path.join(ROOT, "*.css"))):
    if os.path.basename(f) in SKIP_CSS:
        continue
    files.append((f, "css"))
for f in sorted(glob.glob(os.path.join(ROOT, "*.html")) + glob.glob(os.path.join(ROOT, "work", "*.html"))):
    files.append((f, "html"))

total = 0
for f, kind in files:
    before = len(changes)
    s = open(f, encoding="utf-8").read()
    t = process_css(s, os.path.basename(f)) if kind == "css" else process_html(s, os.path.basename(f))
    n = len(changes) - before
    total += n
    print(f"{os.path.relpath(f, ROOT):34s} {n:4d} changes")
    if WRITE and t != s:
        open(f, "w", encoding="utf-8", newline="").write(t)
print("total", total, "(written)" if WRITE else "(dry run)")
if "--list" in sys.argv:
    for c in changes:
        print(c)
