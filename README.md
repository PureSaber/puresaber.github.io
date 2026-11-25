# puresaber.github.io

实用工具箱：编程与开源、量化研究和自学资源。

## 维护目录

在 [`_data/catalog.yaml`](_data/catalog.yaml) 找到对应的二级分类，编辑条目的 `name`、`url`、`summary` 和 `type`，或按相同格式新增条目。`alias` 用于补充搜索关键词。VS Code 的插件放在 `development` 下对应工具的 `extensions` 里。

条目涉及服务状态、停服日期等易变信息时，用 `checked_at` 和 `checked_source` 记录核验日期和官方来源。GitHub Pages 从同一份 YAML 构建目录卡片和首页搜索索引。

新建或移动分类时，在 [`_data/catalog_navigation.yaml`](_data/catalog_navigation.yaml) 更新目录位置，并让分组标识与条目数据里的键一致。

## 页面维护位置

- 首页：[`index.html`](index.html)。工具与资源入口对应 `/tools/`、`/resources/`。
- 手机应用：[`mobile/index.html`](mobile/index.html)；停用应用归档见 [`mobile/archive/index.html`](mobile/archive/index.html)，图标见 `mobile/icons/`。
- 项目与服务：[`projects/index.html`](projects/index.html)。学习路线见 [`learn/index.html`](learn/index.html)。
- 网站样式与交互：公用样式在 `assets/`，修改对应页面后检查链接与 GitHub Pages 部署结果。

## 工具归档

已正式停用的工具移入 `_data/tool_archive.yaml`，保留名称、图标、官方说明和 `retired_at`，不再进入在用工具搜索。Jules 在 2026-12-31 正式停运前保留于工具目录，届时根据官方状态移入归档。

## 工具图标维护

优先采用 `assets/tool-icons/` 中的本地品牌图标。此次新增的本地 SVG 来源： [Simple Icons](https://github.com/simple-icons/simple-icons)（Canva 与 OneNote 使用 11.15.0 版）、[Lobe Icons](https://github.com/lobehub/lobe-icons)（Qwen、Grok、Doubao、TRAE）、[Devicon](https://github.com/devicons/devicon)（MATLAB）。工具与资源目录的图标已全部改为本地文件，不再依赖浏览器访问第三方 favicon 服务。补充图标的来源见 [`assets/tool-icons/catalog-icon-sources.json`](assets/tool-icons/catalog-icon-sources.json)。新增条目时应提交实际图标文件并设置 `icon` 字段；加载失败时不显示破损图片。
