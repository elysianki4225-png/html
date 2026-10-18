# Build pipeline

`index.html` in the repository root is generated. Edit the sources here, then:

```bash
python3 tools/cjk_fonts.py   # re-subset CJK display faces if headings changed
python3 tools/build.py       # inline everything → ../index.html
```

| File | Purpose |
|------|---------|
| `build.py` | Assembles `parts/`, inlines CSS/JS/WebP/woff2/SVG map into one file |
| `cjk_fonts.py` | Subsets Noto Serif SC/JP to the characters used in headings |
| `map.svg` | Natural Earth route map (generated from `world-atlas` + `d3-geo`) |
| `parts/*.html` | Page sections in document order |
| `parts/style.css` | Design system, responsive rules, print stylesheet |
| `parts/app.js` | Language switching, RFQ modal, tabs, map focus, counters |
| `parts/i18n-en.js`, `parts/i18n-ja.js` | English and Japanese copy decks |
| `parts/fonts-cjk.css` | Generated CJK subsets (do not edit by hand) |

Assets live in `../assets/img` (WebP photography) and `../assets/fonts` (Latin woff2).
