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


## 扩展与组件目录

- 新目录：`/components/`；旧 `/plugins/` 保留并转向新目录，透传 `?host=` 与哈希锚点。
- `_data/catalog.yaml` 是条目资料的唯一来源；`component_id` 是稳定引用 ID。
- `_data/component_catalog.yaml` 只记录已有条目的组件归类、技术生态和功能，不复制描述与图标。
- `_data/component_relations.yaml` 用有类型的边记录依赖、基于、集成、官方配套等关系，并附官方来源；外部配套只展示引用链接，不自动加入正式目录。
- 产品家族（`product_families.yaml`）与技术生态独立：生态归属不表示品牌所有权。
- 新组件不自动从外部检索或入库；目前只包含原工具目录中的已登记条目。


## 统一实体与多对多关系（V2）

- `_data/catalog.yaml` 是软件条目的唯一主库：180 项均有稳定的 `entity_id`；名称、官网、图标和说明只维护这里。
- `_data/component_catalog.yaml` 只保存组件类型、功能归类和来源组的索引，不复制条目本身，也不重复登记生态关系。
- `_data/entity_relations.yaml` 是带类型关系的唯一存储；包含产品家族成员、供应商、技术生态、依赖、集成、官方配套、语言支持等。每条边只写一次，反向检索由前端计算。
- `_data/entity_nodes.yaml` 仅包含无独立软件条目的概念节点（JetBrains 等供应商、Python 等生态）；软件相关名称仍从条目主库读取。
- `_data/product_families.yaml` 只存家族展示名称及折叠放置点，不再存成员关系；工具箱原有折叠交互保留。
- 编程语言关系不等于供应商/产品家族关系；PyCharm、JupyterLab、VS Code 与 Python 语言/生态有关联，不将全部 Python 库归入这些 IDE 的产品家族。
- 组件、工具及资源共用目录数据；旧锚点、旧插件入口以及宿主插件安装链接继续兼容。
- 新增条目：先在主库添加唯一 `entity_id`，如属可复用组件再在组件索引中登记；必要时向关系表添加关联。

- Python / Rust 与各自工具采用生态折叠标识（而非品牌产品家族）；其他既有家族维持原有折叠展示。
