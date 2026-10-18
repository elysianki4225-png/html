# ORCHARD LINE · 果园航线

**高保真、国际化、带完整合规资质的生鲜水果出口贸易公司官方单页网站**
A high-fidelity, bilingual (EN / 中文 / 日本語) single-page website for a fresh-fruit export house.

> **交付物 / Deliverable: [`index.html`](index.html)** — 单文件，双击即可打开。
> 所有 CSS、JS、图片、字体与航线地图均已内联，无构建依赖、无本地资源请求。
> 唯一的外部请求是 Tailwind CSS CDN 与 Google Fonts（用于中日文字形）；离线时会自动回退到系统字体，版式与交互不受影响。

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
| 9 | 询盘 CTA + 页脚 | 双语公司全称、三处果园基地与分选冷库地址、外贸邮箱、电话、统一社会信用代码、ICP 备案、演示免责声明 |

## 交互

- **三语切换**（`EN / 中文 / 日本語`）：约 400 条文案全覆盖，含标题、按钮、表单、图表标签、SEO 元信息；选择会保存在 `localStorage`，也可用 `?lang=en|zh|ja` 直接指定。
- **出口询盘浮层**：必填校验、错误提示、按语言生成 RFQ 编号与询盘摘要、一键复制编号、`mailto:` 交接给出口部。纯前端，不上传数据。
- **合规标签页**：海关检疫 / 工商法人 / 市场准入 / 出口单证，支持方向键与 Home/End 键操作。
- **航线地图**：悬停或聚焦港口标签，高亮对应航线。
- **滚动体验**：阅读进度条、滚动侦察导航、数字滚动、进入视口动效；全部尊重 `prefers-reduced-motion`。
- **打印样式**：页脚的打印按钮可导出干净的黑白企业简介 PDF。

## 技术与质量

- HTML5 + Tailwind CSS（CDN）+ 一套自有设计系统（森林绿 `#0C231A` / 象牙白 `#F6F2E8` / 黄铜 `#C3A267`）。
- 品牌展示字体 **Fraunces** 与 **Inter** 以 WOFF2 内联自托管，离线亦保持排版质感。
- 语义化结构、跳至主内容链接、`aria-current` / `aria-selected` / `aria-modal`、焦点陷阱与 Esc 关闭、`aria-live` 表单状态。
- 响应式：1440 / 1280 / 1024 / 900 / 768 / 640 / 390 px 逐档验证，无横向溢出。
- SEO：`title` / `description` / Open Graph / canonical / Organization JSON-LD / favicon。
- **演示免责声明**：企业名称、地址、证书与注册编号均为示例数据，页面多处明确标注，不构成真实资质或贸易要约。

## 修改与重新构建

`index.html` 是构建产物，源文件在 `tools/`：

```
tools/
├── build.py            # 将 CSS / JS / 图片 / 字体 / 地图内联为单文件
├── map.svg             # 由 Natural Earth 数据生成的世界航线图（Equirectangular / Natural Earth 投影）
└── parts/
    ├── 00_head.html  … 86_app.html   # 页面分块
    ├── style.css                     # 设计系统与响应式、打印样式
    ├── i18n-en.js, i18n-ja.js        # 英 / 日文案表（中文为 HTML 源文案）
    └── app.js                        # 语言切换、模态框、标签页、地图、计数器等
```

重新生成：

```bash
python3 tools/build.py   # → index.html（约 1.3 MB，自包含）
```

修改图片：替换 `assets/img/*.webp` 后在 `build.py` 的 `IMAGES` 中保持同名即可；字体位于 `assets/fonts/`。

---

© 2026 Qingdao Orchard Line Fruit & Vegetable Import & Export Co., Ltd. — demo brand.

---

## 视觉预览 / Preview

`preview/` 目录内含 16 张桌面与移动端截图（中文 / English / 日本語），覆盖首屏、数据看板、果品、合规、物流地图、招聘、联系、页脚与报价表单。

## 语言与字体

- 中文为源语言（`lang="zh-CN"`），英 / 日文案为独立词典（各 ~410 条），切换后同步更新 `<html lang>`、`<title>`、描述、Open Graph 与 URL（`?lang=en|ja`），并在 `localStorage` 中记忆。
- 拉丁展示字体 Fraunces / Inter 与中日文 Noto Serif / Sans 子集全部以 WOFF2 内联，无 Web Font 依赖；因此断网、内网或字体 CDN 被屏蔽时，排版依旧成立。
- 地图由 Natural Earth 数据 + d3-geo 生成，矢量内联，可无损缩放。

## 数据合规说明

页面中的企业名称、统一社会信用代码、海关编码、CIQ 注册号、GGN、ISO / HACCP 证书编号、地址、电话与业务指标均为**演示用示例数据**，页脚与合规区均已明确声明。上线前请替换为真实证照信息，并按当地广告法、海关与检验检疫公示要求复核。
