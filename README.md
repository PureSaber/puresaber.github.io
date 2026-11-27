# puresaber.github.io

实用工具箱：编程与开源、量化研究和自学资源。

## 维护目录

在 [`_data/catalog.yaml`](_data/catalog.yaml) 找到对应的二级分类，编辑条目的 `name`、`url`、`summary` 和 `type`，或按相同格式新增条目。`alias` 用于补充搜索关键词。编辑器扩展统一录入 `editor-extensions` 组，并在 `_data/component_catalog.yaml` 的同名分组登记组件类型；需要在具体宿主（如 VS Code）下折叠显示时，通过插件条目的 `integrations` 标注宿主及安装入口，不要重复录入。

条目涉及服务状态、停服日期等易变信息时，用 `checked_at` 和 `checked_source` 记录核验日期和官方来源。GitHub Pages 从同一份 YAML 构建目录卡片和首页搜索索引。

新建或移动分类时，在 [`_data/catalog_navigation.yaml`](_data/catalog_navigation.yaml) 更新目录位置，并让分组标识与条目数据里的键一致。

## 页面维护位置

- 首页：[`index.html`](index.html)。主要目录入口包括 `/tools/`、`/components/`、`/resources/`；手机应用与统一学习入口另有独立页面。
- 手机应用：[`mobile/index.html`](mobile/index.html)；停用应用归档见 [`mobile/archive/index.html`](mobile/archive/index.html)，图标见 `mobile/icons/`。
- 项目与服务：[`projects/index.html`](projects/index.html)。统一学习入口见 [`learn/index.html`](learn/index.html)，其中包含五大学科和三条职业路线；职业详情保留在 [`career/`](career/) 目录，旧 URL 继续可用。
- 网站样式与交互：公用样式在 `assets/`，修改对应页面后检查链接与 GitHub Pages 部署结果。

## 工具归档

已正式停用的工具移入 `_data/tool_archive.yaml`，保留名称、图标、官方说明和 `retired_at`，不再进入在用工具搜索。Jules 在 2026-12-31 正式停运前保留于工具目录，届时根据官方状态移入归档。

## 工具图标维护

优先采用 `assets/tool-icons/` 中的本地品牌图标。此次新增的本地 SVG 来源： [Simple Icons](https://github.com/simple-icons/simple-icons)（Canva 与 OneNote 使用 11.15.0 版）、[Lobe Icons](https://github.com/lobehub/lobe-icons)（Qwen、Grok、Doubao、TRAE）、[Devicon](https://github.com/devicons/devicon)（MATLAB）。工具与资源目录的图标已全部改为本地文件，不再依赖浏览器访问第三方 favicon 服务。补充图标的来源见 [`assets/tool-icons/catalog-icon-sources.json`](assets/tool-icons/catalog-icon-sources.json)。新增条目时应提交实际图标文件并设置 `icon` 字段；加载失败时不显示破损图片。


## 扩展与组件目录

- 新目录：`/components/`；旧 `/plugins/` 保留并转向新目录，透传 `?host=` 与哈希锚点。
- `_data/catalog.yaml` 是条目资料的唯一来源；`component_id` 是稳定引用 ID。
- `_data/component_catalog.yaml` 只记录已有条目的组件归类、技术生态和功能，不复制描述与图标。
- 组件只保留类型、生态与功能筛选，不再显示额外的依赖、集成、配套关系网络。原有产品家族与编辑器插件宿主折叠保持不变。
- 产品家族（`product_families.yaml`）与技术生态独立：生态归属不表示品牌所有权。
- 新组件不自动从外部检索或入库；目前只包含原工具目录中的已登记条目。
