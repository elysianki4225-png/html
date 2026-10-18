#!/usr/bin/env python3
"""Build compact, self-hosted CJK serif subsets for the display headings.

@fontsource ships Noto Serif SC/JP as ~120 unicode-range chunks. For headings we
only need a small character set, so we subset the relevant chunks, keep their
unicode-range declarations (disjoint), and emit @font-face rules for the brand.
"""
import base64
import pathlib
import re
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONTSRC = pathlib.Path("/home/user/tools/node_modules/@fontsource")
OUT_CSS = ROOT / "tools" / "parts" / "fonts-cjk.css"

# Headings rendered in the display serif (see style.css).
ZH_REGEXES = [
    r'<h1[^>]*>(.*?)</h1>',
    r'<h2[^>]*>(.*?)</h2>',
    r'<h3[^>]*>(.*?)</h3>',
    r'class="product-name"[^>]*>(.*?)<',
    r'class="calendar-title"[^>]*>(.*?)<',
    r'class="subhead"[^>]*>(.*?)<',
]
JA_KEYS = [
    "hero.title", "metrics.title", "story.title", "portfolio.title", "comp.title",
    "log.title", "careers.title", "cta.title", "band.title", "calendar.title",
    "product.1.name", "product.2.name", "product.3.name", "modal.title",
    "modal.success.title", "careers.job1.title", "careers.job2.title",
    "cta.card.title", "metrics.stat1.label", "story.fact1.label",
]


def chars_from_html(all_text: bool = False) -> set:
    text = ""
    for path in (ROOT / "tools" / "parts").glob("*.html"):
        source = path.read_text(encoding="utf-8")
        if all_text:
            source = re.sub(r"<script.*?</script>", "", source, flags=re.S)
            source = re.sub(r"<style.*?</style>", "", source, flags=re.S)
            text += re.sub(r"<[^>]+>", "", source)
        else:
            for pattern in ZH_REGEXES:
                for match in re.findall(pattern, source, flags=re.S):
                    text += re.sub(r"<[^>]+>", "", match)
    extra = "，。、；：“”‘’（）《》！？·—…％"
    for js_path in (ROOT / "tools" / "parts").glob("*.js"):
        text += js_path.read_text(encoding="utf-8")
    return {ch for ch in text if "\u3000" <= ch <= "\u9fff" or ch in extra or "\uff00" <= ch <= "\uffef"}


def chars_from_js(path: pathlib.Path, keys=None) -> set:
    source = path.read_text(encoding="utf-8")
    chars = set()
    if keys is None:
        for match in re.finditer(r"`([^`]*)`", source, flags=re.S):
            text = re.sub(r"<[^>]+>", "", match.group(1))
            chars |= {ch for ch in text if "\u3000" <= ch <= "\u9fff" or "\uff00" <= ch <= "\uffef"}
        return chars
    for key in keys:
        match = re.search(r'"%s":\s*`(.*?)`' % re.escape(key), source, flags=re.S)
        if match:
            chars |= {ch for ch in re.sub(r"<[^>]+>", "", match.group(1)) if "\u3000" <= ch <= "\u9fff"}
    return chars


def parse_css(css_path: pathlib.Path):
    """Return list of (relative_file, unicode_range_string, set_of_codepoints)."""
    css = css_path.read_text(encoding="utf-8")
    blocks = re.findall(r"@font-face\s*\{(.*?)\}", css, flags=re.S)
    entries = []
    for block in blocks:
        src = re.search(r"url\(([^)]*?\.woff2)\)", block)
        rng = re.search(r"unicode-range:\s*([^;]+);", block)
        if not src or not rng:
            continue
        ranges = set()
        for part in rng.group(1).split(","):
            part = part.strip().replace("U+", "")
            if "-" in part:
                a, b = part.split("-")
                try:
                    ranges.update(range(int(a, 16), int(b, 16) + 1))
                except ValueError:
                    pass
            else:
                try:
                    ranges.add(int(part, 16))
                except ValueError:
                    pass
        entries.append((src.group(1), rng.group(1).strip(), ranges))
    return entries


def subset(package: str, weight: int, chars: set, family: str) -> str:
    css_path = FONTSRC / package / f"{weight}.css"
    entries = parse_css(css_path)
    rules = []
    total = 0
    with tempfile.TemporaryDirectory() as tmp:
        for index, (href, unicode_range, covered) in enumerate(entries):
            wanted = {ch for ch in chars if ord(ch) in covered}
            if not wanted:
                continue
            source = (css_path.parent / href).resolve()
            target = pathlib.Path(tmp) / f"sub-{index}.woff2"
            codepoints = ",".join("U+%04X" % ord(ch) for ch in sorted(wanted))
            subprocess.run(
                [
                    "pyftsubset", str(source),
                    f"--unicodes={codepoints}",
                    "--flavor=woff2",
                    "--layout-features=",
                    "--no-hinting",
                    "--desubroutinize",
                    f"--output-file={target}",
                ],
                check=True,
                capture_output=True,
            )
            data = target.read_bytes()
            total += len(data)
            uri = "data:font/woff2;base64," + base64.b64encode(data).decode("ascii")
            rules.append(
                "@font-face{font-family:'%s';font-style:normal;font-weight:%d;font-display:swap;"
                "src:url(%s) format('woff2');unicode-range:%s;}"
                % (family, weight, uri, ",".join("U+%04X" % ord(ch) for ch in sorted(wanted)))
            )
    print(f"{family} {weight}: {len(chars)} chars → {len(rules)} chunks, {total/1024:.0f} KB")
    return "\n".join(rules)


def main() -> None:
    zh_all = chars_from_html(all_text=True)
    ja_all = chars_from_js(ROOT / "tools" / "parts" / "i18n-ja.js")
    extra = set("，。、；：“”‘’（）《》！？·—…％℃°0123456789%")
    zh_all |= extra
    ja_all |= extra
    print("zh text chars:", len(zh_all), "| ja text chars:", len(ja_all))

    # Keep the payload focused: serif display faces for both languages plus a
    # regular Chinese sans for body copy. Other weights load from Google Fonts
    # when available and otherwise fall back to high-quality system CJK faces.
    css = [
        subset("noto-serif-sc", 500, zh_all, "Orchard Serif SC"),
        subset("noto-sans-sc", 400, zh_all, "Orchard Sans SC"),
        subset("noto-serif-jp", 500, ja_all, "Orchard Serif JP"),
        subset("noto-sans-jp", 400, ja_all, "Orchard Sans JP"),
    ]
    OUT_CSS.write_text("\n".join(css) + "\n", encoding="utf-8")
    print("wrote", OUT_CSS, f"{OUT_CSS.stat().st_size/1024:.0f} KB")


if __name__ == "__main__":
    main()
