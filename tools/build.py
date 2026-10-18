#!/usr/bin/env python3
"""Assemble the single-file Orchard Line export website.

Sources live in tools/parts/. The build inlines:
  - custom CSS
  - the geographic route map SVG
  - optimised WebP photography as data URIs
Output: index.html at the repository root.
"""
import base64
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
TOOLS = ROOT / "tools"
PARTS = TOOLS / "parts"

ORDER = [
    "00_head.html",
    "10_header.html",
    "20_hero.html",
    "30_metrics_story.html",
    "40_portfolio.html",
    "50_compliance.html",
    "60_band_logistics.html",
    "70_careers_cta.html",
    "80_footer.html",
    "82_modal.html",
    "84_i18n.html",
    "86_app.html",
]

FONTS = [
    ("Fraunces", 300, "normal", "fraunces-latin-300-normal.woff2"),
    ("Fraunces", 400, "normal", "fraunces-latin-400-normal.woff2"),
    ("Fraunces", 500, "normal", "fraunces-latin-500-normal.woff2"),
    ("Fraunces", 300, "italic", "fraunces-latin-300-italic.woff2"),
    ("Fraunces", 400, "italic", "fraunces-latin-400-italic.woff2"),
    ("Inter", 300, "normal", "inter-latin-300-normal.woff2"),
    ("Inter", 400, "normal", "inter-latin-400-normal.woff2"),
    ("Inter", 500, "normal", "inter-latin-500-normal.woff2"),
    ("Inter", 600, "normal", "inter-latin-600-normal.woff2"),
]

IMAGES = {
    "hero": "hero.webp",
    "grape": "grape.webp",
    "apple": "apple.webp",
    "orange": "orange.webp",
    "orchard": "orchard-story.webp",
    "coldstore": "coldstore.webp",
}


def data_uri(path: pathlib.Path) -> str:
    if path.suffix == ".webp":
        mime = "image/webp"
    elif path.suffix == ".woff2":
        mime = "font/woff2"
    else:
        mime = "image/jpeg"
    payload = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{payload}"


def font_css() -> str:
    """Self-host the Latin brand faces so the typography survives offline."""
    rules = []
    for family, weight, style, filename in FONTS:
        uri = data_uri(ROOT / "assets" / "fonts" / filename)
        rules.append(
            "@font-face{font-family:'%s';font-style:%s;font-weight:%s;font-display:swap;"
            "src:url(%s) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,"
            "U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,"
            "U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;}"
            % (family, style, weight, uri)
        )
    return "\n".join(rules)


def main() -> None:
    html = "\n".join((PARTS / name).read_text(encoding="utf-8") for name in ORDER)
    css = (PARTS / "style.css").read_text(encoding="utf-8")
    css = font_css() + "\n" + (PARTS / "fonts-cjk.css").read_text(encoding="utf-8") + "\n" + css
    map_svg = (TOOLS / "map.svg").read_text(encoding="utf-8")
    map_svg = re.sub(r"\sclass=\"w-full h-auto\"", "", map_svg, count=1)
    app_js = (PARTS / "app.js").read_text(encoding="utf-8")
    i18n_js = "\n".join(
        (PARTS / name).read_text(encoding="utf-8")
        for name in ("i18n-en.js", "i18n-ja.js", "i18n.js")
    )

    html = html.replace("{{CSS}}", css)
    html = html.replace("{{MAP_SVG}}", map_svg)
    html = html.replace("{{APP_JS}}", app_js)
    html = html.replace("{{I18N_JS}}", i18n_js)
    for key, filename in IMAGES.items():
        html = html.replace("{{IMG:" + key + "}}", data_uri(ROOT / "assets" / "img" / filename))

    # Fail loudly if a placeholder survived.
    leftovers = re.findall(r"\{\{(?:IMG:[a-z]+|CSS|MAP_SVG|APP_JS|I18N_JS)\}\}", html)
    if leftovers:
        raise SystemExit(f"Unresolved placeholders: {sorted(set(leftovers))}")

    out = ROOT / "index.html"
    out.write_text(html, encoding="utf-8")
    size = out.stat().st_size
    print(f"Built {out} · {size/1024:.0f} KB")


if __name__ == "__main__":
    main()
