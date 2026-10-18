# ORCHARD LINE · 果园航线

**高保真、国际化、带完整合规资质的生鲜水果出口贸易公司官方单页网站**
A high-fidelity, multilingual (EN / 中文 / 日本語) single-page website for a fresh-fruit export house.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-elysianki4225--png.github.io-0C231A?style=flat-square)](https://elysianki4225-png.github.io/html/)
[![Repository](https://img.shields.io/badge/GitHub-elysianki4225--png%2Fhtml-C3A267?style=flat-square&logo=github)](https://github.com/elysianki4225-png/html)

| | 地址 |
|---|---|
| **在线演示 / Live demo** | **<https://elysianki4225-png.github.io/html/>** |
| **GitHub 仓库 / Repository** | **<https://github.com/elysianki4225-png/html>** |
| **单页文件 / Deliverable** | [`index.html`](index.html) |

演示站由 GitHub Pages 从 `main` 分支根目录发布；单文件 `index.html` 也可直接下载双击打开，无需服务器与构建步骤。

---

## 页面模块

| # | 模块 | 说明 |
|---|------|------|
| 0 | 顶部信息条 + 导航 | 中英品牌 Logo、EN / 中文 / 日文 切换、锚点导航、粘性滚动状态、移动端全屏菜单 |
| 1 | 首屏 Hero | 冷藏集装箱港口实景、冷链遥测浮层、认证信任条、`索取出口报价单` 主 CTA |
| 2 | 出口数据看板 | 每日 8–12 个 40' 冷藏集装箱、冷库日吞吐 260 t、18 个直航港口、100% 批次随附检疫与温控记录 |
| 3 | 产地与果园 | 合约果园 12,600 亩、38 家合作社、4 座注册包装厂、创始人引述 |
| 4 | 出口果品 | 阳光玫瑰青提 / 红富士苹果 / 赣南脐橙，逐项标注 Brix、果径、冷链温度、出口包装、MOQ、HS 编码 |
| 5 | 产季日历 | 四品类 12 个月的采收期 / 冷藏供应期矩阵 |
| 6 | 合规公示 | 海关报关代码、出境果园与包装厂注册号、GLOBALG.A.P. GGN、ISO 22000、HACCP、AEO；工商与法人信息；目的国准入表；出口单证清单。编号支持一键复制 |
| 7 | 冷链物流 | 青岛港前湾冷链泊位、深圳蛇口港、TAO / CGO / PVG 空运枢纽、互动式航线地图、主干航线温控表、六节点作业规程 |
| 8 | 人才招聘 | 生鲜冷链外贸业务主管、出境水果检验检疫品控员（含职责、要求、薪酬、投递入口） |
| 9 | 询盘 CTA + 页脚 | 双语公司全称、三处果园基地与分选冷库地址、外贸邮箱、电话、统一社会信用代码、ICP / 公安备案 |

## 交互

- **三语切换**（`EN / 中文 / 日本語`）：约 400 条文案全覆盖，含标题、按钮、表单、图表标签、SEO 元信息；选择会保存在 `localStorage`，也可用 `?lang=en|zh|ja` 直接指定。
- **出口询盘浮层**：必填校验、错误提示、按语言生成 RFQ 编号与询盘摘要、一键复制编号、`mailto:` 交接给出口部。纯前端，不上传数据。
- **合规标签页**：海关检疫 / 工商法人 / 市场准入 / 出口单证，支持方向键与 Home/End 键操作。
- **航线地图**：悬停或聚焦港口标签，高亮对应航线。
- **滚动体验**：阅读进度条、滚动侦察导航、数字滚动、进入视口动效；全部尊重 `prefers-reduced-motion`。
- **打印样式**：页脚的打印按钮可导出干净的黑白企业简介 PDF。

## 技术与质量

- HTML5 + Tailwind CSS（CDN）+ 一套自有设计系统（森林绿 `#0C231A` / 象牙白 `#F6F2E8` / 黄铜 `#C3A267`）。
- 单文件交付：CSS、JS、6 张 WebP 摄影图、航线地图 SVG、Fraunces / Inter 及中日文 Noto 字体子集全部内联。
- 语义化结构、跳至主内容链接、`aria-current` / `aria-selected` / `aria-modal`、焦点陷阱与 Esc 关闭、`aria-live` 表单状态。
- 响应式：360 / 390 / 414 / 768 / 834 / 1024 / 1280 / 1440 px 逐档验证，无横向溢出。
- SEO：`title` / `description` / Open Graph / canonical / hreflang / Organization JSON-LD / favicon。

## 视觉预览 / Preview

`preview/` 目录内含 16 张桌面与移动端截图（中文 / English / 日本語），覆盖首屏、数据看板、果品、合规、物流地图、招聘、联系、页脚与报价表单。

## 语言与字体

- 中文为源语言（`lang="zh-CN"`），英 / 日文案为独立词典，切换后同步更新 `<html lang>`、`<title>`、描述、Open Graph 与 URL（`?lang=en|ja`），并在 `localStorage` 中记忆。
- 拉丁展示字体 Fraunces / Inter 与中日文 Noto Serif / Sans 子集全部以 WOFF2 内联，无 Web Font 依赖；因此断网、内网或字体 CDN 被屏蔽时，排版依旧成立。
- 地图由 Natural Earth 数据 + d3-geo 生成，矢量内联，可无损缩放。

## 部署 / Deployment

- GitHub Pages：`main` 分支根目录 → <https://elysianki4225-png.github.io/html/>
- 本地预览：直接打开 `index.html`，或 `python3 -m http.server 8000`
- 更新站点：修改 `tools/parts/` 后执行 `python3 tools/cjk_fonts.py && python3 tools/build.py`，提交新的 `index.html`

## 修改与重新构建

`index.html` 是构建产物，源文件在 `tools/`：

```
tools/
├── build.py            # 将 CSS / JS / 图片 / 字体 / 地图内联为单文件
├── cjk_fonts.py        # 按页面实际用字裁剪中日文字体子集
├── map.svg             # Natural Earth 世界航线图
└── parts/
    ├── 00_head.html  … 86_app.html   # 页面分块
    ├── style.css                     # 设计系统、响应式与打印样式
    ├── i18n-en.js, i18n-ja.js        # 英 / 日文案表（中文为 HTML 源文案）
    └── app.js                        # 语言切换、模态框、标签页、地图、计数器等
```

```bash
python3 tools/cjk_fonts.py   # 仅当页面文案改动时执行
python3 tools/build.py       # → index.html（约 2.6 MB，自包含）
```

图片位于 `assets/img/`，字体位于 `assets/fonts/`；替换后在 `build.py` 中保持文件名一致即可。
