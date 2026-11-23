# 工具与手机应用平台全量审计 · 2026-11-22

> **审计状态：预览分支，不代表正式发布。** 来源：\`PureSaber/puresaber.github.io\` 的主目录及本次草稿分支。下方 **逐项清单已经通过源码结构检查**；外部官方平台支持资料只针对高风险或存在争议的项目核实，不应解读为对每一个外部产品都完成实时官网取证。

## 审计覆盖与方法

- 实用工具：**132 个主条目**（另外 **9 个 VS Code 扩展**）；其中 **92 个设置操作系统或 Web 标签**，**40 个未设置**（多数为 Python 库、学习资料，不等于全是标注错误）。
- 手机应用：**157 项**（另有 **2 项归档**）。草稿分支中 **141 通用 / 15 Android 专属 / 1 iOS 专属 / 0 个未分类**。
- 双向跳转：**19 组**；独立「电脑端」链接 **17 条**。源代码检查了两端的锚点存在性，未发现缺失。没有逐个验证每条外部 URL 的实时 HTTP 可达性。
- 图标路径：**132 个工具主条目 + 157 个应用条目**的本地图片路径均在仓库中存在；未逐张做图像识别确认内容正确，也未证明线上无缓存问题。
- 程序筛选：手机页 \`common\` 应包括于 iOS 和 Android 可用结果；手机页全部应用都已有平台字段。工具页未标平台的条目在选择平台时不会出现，属于需要明确的产品规则，而非独立的代码异常。

## 已确认需要说明的事项

| 条目 | 结论 | 建议 |
|---|---|---|
| UU 远程 | Linux 仅内测预约（2026-11-06），还不等于一般可用 | 草稿已移出正式 Linux 平台筛选，保留说明 |
| Microsoft To Do | Windows、Mac 和移动端仍可用，但微软宣布所有 To Do App 2027-06-30 退役 | 草稿已补 Mac 标签并加入退役日期；暂不归档 |
| Skype | 微软官方确认 2025-05-05 消费者版退役 | 工具页已标「历史工具／已退役」；后续可考虑是否移动至独立历史区 |
| TIM Windows | 2026 年有登录失败/版本过低报告；腾讯官网仍显示下载，**未确认官方停运** | 网页保持原有简洁介绍；问题移到下方独立疑点清单 |
| 思源码 Lite | 上海交大官方说明是「交我办」App 内的电子校园卡服务 | 草稿按交我办的双平台入口归为通用，并注明非独立 App |
| PicACG | 官方频道公开 Android APK 和 iOS 网页入口；未证实 App Store 原生应用 | 网页按 Android 安装客户端分类、使用官方主域名，不显示不确定性标签；iOS 原生分发疑问单列 |
| Typeless | Linux 存在 Beta/申请资格条件 | 保留 Linux + 测试版提示 |
| Mendeley | 官方提供 x86-64 Linux AppImage | 保留 Linux，并把说明链接改为官方 Linux 安装说明 |
| Claude | Linux Beta：Ubuntu 22.04+ 或 Debian 12+，x64 / arm64 | 草稿改为更明确的限制 |
| CodexManager | 三系统有构建，但作者说明只有 Windows 桌面构建得到充分验证 | Linux 说明加入限制 |
| 交课表 | 当前链接是 App Store 的 iOS 应用；另有同名第三方 Android 项目，不应直接混为同一个发行版本 | 维持 iOS 标签 |
| Jules | 2026-11-11 起只读、计划 2026-12-31 结束 | 当前工具页已有停用信息，保持 |

新的交叉核验证据：
- PicACG 官方公开频道：https://t.me/s/PicACG
- iTime Google Play：https://play.google.com/store/apps/details?id=com.wisdom.itime；iOS 版本使用相同 bundle id 与 https://itime.fun/help/privacy
- Lo研社 App Store：https://apps.apple.com/cn/app/id6467809127（开发者冯晓磊）；Android 商店版本包名 uni.lolita
- RikkaHub 官方说明：https://github.com/rikkahub/docs/blob/main/download.mdx
- Clash Mi 官方：https://github.com/KaringX/clashmi
- SkyPhone 官方：https://www.skyphone.jp/download/
- DG-Lab 官方：https://www.dungeon-lab.com/app-download
- FlClash 官方：https://github.com/chen08209/FlClash

主要官方来源：
- Microsoft To Do: https://support.microsoft.com/en-us/planner/to-do-to-planner
- Skype: https://support.microsoft.com/en-us/skype/skype-is-retiring-in-may-2025-what-you-need-to-know
- Claude: https://support.claude.com/en/articles/10065433-install-claude-desktop
- Mendeley: https://www.elsevier.support/mendeley/answer/how-do-i-run-mendeley-reference-manager-on-linux
- Typeless: https://www.typeless.com/help/faqs
- 交大思源码: https://net.sjtu.edu.cn/xxfw/sym.htm
- FlClash: https://chen08209.github.io/FlClash/
- Jules: https://jules.google/docs/changelog/
- TIM 仍开放的官网: https://tim.qq.com/
- TIM 登录异常的媒体报告（非官方公告）: https://www.landian.news/archives/113047.html
- UU 远程 Linux 预约报道: https://www.ithome.com/1/023/345.htm

## 工具箱逐项清单（132 项）

> “—” 表示当前没有提供平台标签；不自动视为该平台不可用。引用的是目录字段，不代表逐项外部官网实时核验。

| 所在分组 | 名称 | 目录平台 | 分类类型 |
|---|---|---|---|
| ai | OpenCode | Windows, macOS, Linux | CLI |
| ai | Claude Code | Windows, macOS, Linux | CLI |
| ai | Codex | Windows, macOS, Linux | CLI / 桌面 |
| ai | Google Antigravity（agy） | Windows, macOS, Linux | IDE / CLI |
| ai | Jules | Web | Web / CLI |
| ai | CodexManager | Windows, macOS, Linux | 桌面工具 |
| ai | ChatGPT | Windows, macOS, Web | Web / 桌面 |
| ai | Gemini | Web | Web |
| development | Visual Studio Code | Windows, macOS, Linux, Web | IDE |
| development | Cursor | Windows, macOS, Linux | IDE |
| development | IntelliJ IDEA | Windows, macOS, Linux | IDE |
| development | PyCharm | Windows, macOS, Linux | IDE |
| development | DataGrip | Windows, macOS, Linux | IDE |
| development | Visual Studio | Windows | IDE |
| git-open-source | GitHub CLI（gh） | Windows, macOS, Linux | CLI |
| git-open-source | Git | Windows, macOS, Linux | CLI |
| runtimes | uv | Windows, macOS, Linux | 包管理器 |
| runtimes | Node.js | Windows, macOS, Linux | 运行时 |
| runtimes | npm | Windows, macOS, Linux | 包管理器 |
| runtimes | npx | Windows, macOS, Linux | CLI |
| runtimes | pnpm | Windows, macOS, Linux | 包管理器 |
| runtimes | Python | Windows, macOS, Linux | 语言 |
| runtimes | pip | Windows, macOS, Linux | 包管理器 |
| runtimes | conda | Windows, macOS, Linux | 包管理器 |
| runtimes | Rust | Windows, macOS, Linux | 语言 |
| runtimes | rust-analyzer | Windows, macOS, Linux | 语言服务器 |
| runtimes | Java（OpenJDK） | Windows, macOS, Linux | 语言 / SDK |
| runtimes | .NET SDK | Windows, macOS, Linux | SDK |
| runtimes | GCC（C/C++） | Windows, macOS, Linux | 编译器 |
| runtimes | MSVC（C/C++） | Windows | 编译器 |
| runtimes | Go | Windows, macOS, Linux | 语言 |
| game-development | Unity Hub | Windows, macOS, Linux | 桌面工具 |
| deployment | Docker | Linux | 容器工具 |
| deployment | Docker Desktop | Windows, macOS, Linux | 桌面工具 |
| deployment | Docker Compose | Windows, macOS, Linux | CLI |
| deployment | kubectl | Windows, macOS, Linux | CLI |
| deployment | Vercel CLI | Windows, macOS, Linux | CLI |
| deployment | GitHub Actions | Web | Web |
| deployment | GitHub Pages | Web | Web |
| deployment | IIS | Windows | Web 服务器 |
| deployment | prometheus_client | — | Python 库 |
| api-development | FastAPI | — | Python 框架 |
| api-development | Apifox | Windows, macOS, Linux, Web | Web / 桌面 |
| databases | MySQL | Windows, macOS, Linux | 数据库 |
| databases | MySQL Workbench | Windows, macOS, Linux | 桌面工具 |
| databases | SQLite（sqlite3） | Windows, macOS, Linux | 数据库 / CLI |
| databases | Microsoft SQL Server | Windows, Linux | 数据库 |
| databases | psql | Windows, macOS, Linux | CLI |
| databases | redis-cli | macOS, Linux | CLI |
| databases | Turso | Web | 数据库 / 云服务 |
| research-data | JupyterLab | Windows, macOS, Linux | Notebook |
| research-data | pandas | — | Python 库 |
| research-data | DuckDB | Windows, macOS, Linux | 数据库 |
| research-data | NumPy | — | Python 库 |
| research-data | SciPy | — | Python 库 |
| research-data | Polars | — | 数据框架 |
| research-data | Minitab | Windows, Web | 桌面工具 |
| market-tools | AKShare | — | Python 库 |
| market-tools | pandas-ta | — | Python 库 |
| market-tools | Backtrader | — | Python 库 |
| market-tools | vectorbt | — | Python 库 |
| visualization | Matplotlib | — | Python 库 |
| visualization | Seaborn | — | Python 库 |
| visualization | Altair | — | Python 库 |
| visualization | Plotly | — | Python 库 |
| visualization | Streamlit | — | Python 框架 |
| modeling | scikit-learn（sklearn） | — | Python 库 |
| modeling | LightGBM | — | Python 库 |
| modeling | XGBoost | — | Python 库 |
| modeling | OR-Tools（ortools） | — | 优化库 |
| modeling | Gurobi（gurobipy） | — | 求解器 / Python 接口 |
| modeling | PyTorch（torch） | — | Python 库 |
| modeling | TensorFlow | — | Python 库 |
| modeling | Weights & Biases（W&B） | Web | Web / Python SDK |
| modeling | MLflow | — | 实验平台 |
| modeling | TensorBoard | — | 可视化工具 |
| nlp | jieba | — | Python 库 |
| nlp | OpenCC | Windows, macOS, Linux | CLI / 库 |
| nlp | NLTK | — | Python 库 |
| nlp | spaCy | — | Python 库 |
| nlp | faster-whisper（faster_whisper） | — | Python 库 |
| nlp | Transformers | — | Python 库 |
| nlp | Tokenizers | — | 模型工具 |
| nlp | ONNX Runtime | — | 推理运行时 |
| nlp | Hugging Face Hub | Web | Web / SDK |
| nlp | Buzz | Windows, macOS, Linux | 桌面工具 |
| productivity | Microsoft Office | Windows, macOS, Web | Web / 桌面 |
| productivity | Notion | Windows, macOS, Web | Web / 桌面 |
| productivity | Todoist | Windows, macOS, Linux, Web | Web / 桌面 |
| productivity | Evernote | Windows, macOS, Web | Web / 桌面 |
| productivity | uTools | Windows, macOS, Linux | 桌面工具 |
| productivity | Typeless | Windows, macOS, Linux | 桌面工具 |
| productivity | MiKTeX | Windows, macOS, Linux | 排版工具 |
| productivity | Pandoc | Windows, macOS, Linux | CLI |
| productivity | EndNote | Windows, macOS | 文献工具 |
| productivity | Zotero | Windows, macOS, Linux, Web | 文献工具 |
| productivity | Mendeley | Windows, macOS, Linux, Web | 文献工具 |
| communication | 腾讯会议 | Windows, macOS, Linux, Web | Web / 桌面 |
| communication | QQ（QQNT） | Windows, macOS, Linux | 桌面 / 移动 |
| communication | TIM | Windows | 桌面 / 移动 |
| communication | 微信（WeChat） | Windows, macOS, Linux | 桌面 / 移动 |
| communication | Telegram Desktop | Windows, macOS, Linux, Web | 桌面工具 |
| communication | 飞书（Lark） | Windows, macOS, Linux, Web | Web / 桌面 |
| communication | Slack | Windows, macOS, Linux, Web | Web / 桌面 |
| communication | Discord | Windows, macOS, Linux, Web | Web / 桌面 |
| communication | Zoom | Windows, macOS, Linux, Web | Web / 桌面 |
| communication | Microsoft Teams | Windows, macOS, Web | Web / 桌面 |
| communication | Skype | — | 历史工具 |
| communication | WhatsApp | Windows, macOS, Web | Web / 桌面 |
| communication | Signal | Windows, macOS, Linux | 桌面 / 移动 |
| file-transfer | LocalSend | Windows, macOS, Linux | 桌面 / 移动 |
| file-transfer | Snapdrop | Web | Web |
| remote-desktop | UU 远程 | Windows, macOS | 桌面 / 移动 |
| remote-desktop | Tailscale | Windows, macOS, Linux | 网络工具 |
| remote-desktop | Clash Verge Rev | Windows, macOS, Linux | 桌面工具 |
| virtualization | VMware Workstation | Windows, Linux | 桌面工具 |
| virtualization | MuMu 模拟器 | Windows, macOS | 桌面工具 |
| virtualization | 腾讯手游助手 | Windows | 桌面工具 |
| password-management | Bitwarden CLI | Windows, macOS, Linux | CLI |
| browsers | Google Chrome | Windows, macOS, Linux | 浏览器 |
| browsers | Microsoft Edge | Windows, macOS, Linux | 浏览器 |
| browsers | Mozilla Firefox | Windows, macOS, Linux | 浏览器 |
| media | OBS Studio | Windows, macOS, Linux | 桌面工具 |
| media | FFmpeg | Windows, macOS, Linux | CLI |
| computer-learning | CS 自学指南 | — | 课程目录 |
| computer-learning | Python 官方教程（中文） | — | 教程 |
| computer-learning | MDN 学习 Web 开发 | — | 教程 |
| computer-learning | 《Pro Git》中文版 | — | 书籍 |
| computer-learning | SQLBolt | — | 交互练习 |
| research | 上海期货交易所 · 日周数据 | — | 市场数据 |
| tool-directories | Awesome Selfhosted | — | 工具目录 |
| online-tools | Simon Willison’s Tools | — | 在线工具集 |

## 手机应用逐项清单（157 项）

> “通用”代表 Android+iOS 目录类别；全部应用已经归入通用、Android 或 iOS。外部主链接主要用于识别对应应用，并非当前下载可用性的实时保证。

| 分类 | 应用名 | 平台字段 | 跨页入口 |
|---|---|---|---|
| ai | ChatGPT | 通用 | 关联工具箱 |
| ai | Gemini | 通用 | 关联工具箱 |
| ai | Claude | 通用 | 独立电脑端 |
| ai | DeepSeek | 通用 | — |
| ai | Kimi | 通用 | — |
| ai | RikkaHub Agent | 仅 Android | — |
| ai | Typeless | 通用 | 关联工具箱 |
| ai | 讯飞输入法 | 通用 | — |
| communication | QQ | 通用 | 关联工具箱 |
| communication | 微信 | 通用 | 关联工具箱 |
| communication | Telegram | 通用 | 关联工具箱 |
| communication | WhatsApp | 通用 | 关联工具箱 |
| communication | SkyPhone | 通用 | — |
| communication | 飞书 | 通用 | 关联工具箱 |
| communication | Lark | 通用 | 关联工具箱 |
| communication | 钉钉 | 通用 | 独立电脑端 |
| communication | 腾讯会议 | 通用 | 关联工具箱 |
| communication | 腾讯 TIM | 通用 | 关联工具箱 |
| communication | 腾讯文档 | 通用 | — |
| communication | WPS Office | 通用 | 独立电脑端 |
| communication | 扫描全能王 | 通用 | 独立电脑端 |
| communication | Obsidian | 通用 | 独立电脑端 |
| communication | Notion | 通用 | 关联工具箱 |
| communication | Google Drive | 通用 | 独立电脑端 |
| communication | 阿里云盘 | 通用 | 独立电脑端 |
| communication | QQ 邮箱 | 通用 | — |
| communication | Gmail | 通用 | — |
| communication | Outlook | 通用 | 独立电脑端 |
| communication | Microsoft To Do | 通用 | 独立电脑端 |
| communication | TimeView | 仅 Android | — |
| communication | iTime | 通用 | — |
| communication | 倒数日 · Days Matter | 通用 | — |
| web | Chrome | 通用 | 关联工具箱 |
| web | Firefox | 通用 | 关联工具箱 |
| web | Microsoft Edge | 通用 | 关联工具箱 |
| web | QQ 浏览器 | 通用 | — |
| web | Microsoft Bing | 通用 | — |
| web | 百度 | 通用 | — |
| web | Google | 通用 | — |
| tools | GitHub | 通用 | 关联工具箱 |
| tools | Shizuku | 仅 Android | — |
| tools | Gspace | 仅 Android | — |
| tools | Fake Location | 仅 Android | — |
| tools | MT 管理器 | 仅 Android | — |
| tools | LocalSend | 通用 | 关联工具箱 |
| tools | UU 远程 | 通用 | 关联工具箱 |
| tools | Tailscale | 通用 | 关联工具箱 |
| tools | v2rayNG | 仅 Android | — |
| tools | FlClash | 仅 Android | 独立电脑端 |
| tools | Clash Mi | 通用 | 独立电脑端 |
| tools | Google Authenticator | 通用 | — |
| tools | Google Play 商店 | 仅 Android | — |
| tools | APKPure | 仅 Android | — |
| tools | 腾讯应用宝 | 仅 Android | — |
| tools | 小米音箱 | 通用 | — |
| tools | 索尼 Sound Connect | 通用 | — |
| tools | DG-Lab | 通用 | — |
| media | X | 通用 | — |
| media | Facebook | 通用 | — |
| media | 微博 | 通用 | — |
| media | 知乎 | 通用 | — |
| media | 百度贴吧 | 通用 | — |
| media | Reddit | 通用 | — |
| media | 小红书 | 通用 | — |
| media | Lo研社 | 通用 | — |
| media | 哔哩哔哩 | 通用 | — |
| media | YouTube | 通用 | — |
| media | Twitch | 通用 | — |
| media | 网易云音乐 | 通用 | 独立电脑端 |
| media | Spotify | 通用 | 独立电脑端 |
| media | 5sing 音乐 | 通用 | — |
| media | pixiv | 通用 | — |
| media | PicACG | 仅 Android | — |
| media | 萌娘百科 | 通用 | — |
| media | 豆瓣阅读 | 通用 | — |
| media | 起点读书 | 通用 | — |
| media | 顶点小说 | 仅 Android | — |
| learning | Duolingo | 通用 | — |
| learning | 网易有道词典 | 通用 | 独立电脑端 |
| learning | Voice Tools | 通用 | — |
| learning | Brilliant | 通用 | — |
| learning | 大学搜题酱 | 通用 | — |
| learning | Khan Academy | 通用 | — |
| learning | 百度文库 | 通用 | — |
| learning | 古诗文网 | 通用 | — |
| learning | 交课表 CourseBlock | 仅 iOS | — |
| learning | 思源码 Lite | 通用 | — |
| learning | 交我办 | 通用 | — |
| learning | 学信网 | 通用 | — |
| learning | BOSS 直聘 | 通用 | — |
| learning | OfferShow | 通用 | — |
| learning | 牛客网 | 通用 | — |
| shopping | 淘宝 | 通用 | — |
| shopping | 京东 | 通用 | — |
| shopping | 拼多多 | 通用 | — |
| shopping | 盒马 | 通用 | — |
| shopping | 阿里巴巴（1688） | 通用 | — |
| shopping | 叮咚买菜 | 通用 | — |
| shopping | 摩点 | 通用 | — |
| shopping | 闲鱼 | 通用 | — |
| shopping | 菜鸟 | 通用 | — |
| shopping | 贝壳找房 | 通用 | — |
| local | 高德地图 | 通用 | — |
| local | Google 地图 | 通用 | — |
| local | 铁路 12306 | 通用 | — |
| local | 携程旅行 | 通用 | — |
| local | IHG 洲际优悦会 | 通用 | — |
| local | 飞猪旅行 | 通用 | — |
| local | Airbnb 爱彼迎 | 通用 | — |
| local | 美团 | 通用 | — |
| local | 大众点评 | 通用 | — |
| local | 随申办市民云 | 通用 | — |
| local | 交管 12123 | 通用 | — |
| local | 国家网络身份认证 | 通用 | — |
| local | 中国移动 | 通用 | — |
| local | 秀动 | 通用 | — |
| local | 阿拉订 | 通用 | — |
| local | 大麦 | 通用 | — |
| local | 淘票票 | 通用 | — |
| finance | 中国银行 | 通用 | — |
| finance | 浦发银行 | 通用 | — |
| finance | 招商银行 | 通用 | — |
| finance | 京东金融 | 通用 | — |
| finance | 中国建设银行 | 通用 | — |
| finance | 云闪付 | 通用 | — |
| finance | PayPal | 通用 | — |
| finance | 支付宝 | 通用 | — |
| finance | 数字人民币（e-CNY） | 通用 | — |
| finance | Wise | 通用 | — |
| finance | 东方财富 | 通用 | — |
| finance | 上海证券指 e 通 | 通用 | — |
| finance | 富途牛牛 | 通用 | 独立电脑端 |
| finance | 嘉信理财（Schwab Mobile） | 通用 | — |
| finance | Firstrade 第一证券 | 通用 | — |
| finance | IBKR Mobile（盈透证券） | 通用 | — |
| finance | World App | 通用 | — |
| finance | Binance（币安） | 通用 | — |
| finance | BitPay | 通用 | — |
| games | Steam | 通用 | 独立电脑端 |
| games | TapTap | 通用 | 独立电脑端 |
| games | QooApp | 仅 Android | — |
| games | 小黑盒 | 通用 | — |
| games | 碧蓝档案 | 通用 | — |
| games | 少女前线 2：追放 | 通用 | — |
| games | maimai 查分助手 | 仅 Android | — |
| games | WTRAssistant（战争雷霆助手） | 通用 | — |
| games | Meta Horizon | 通用 | — |
| health | 薄荷健康 | 通用 | — |
| health | 饭橘 | 通用 | — |
| health | Yowell | 通用 | — |
| health | 小米运动健康 | 通用 | — |
| health | 好轻 | 通用 | — |
| health | 好大夫在线 | 通用 | — |
| creation | 美图秀秀 | 通用 | — |
| creation | 无他相机 | 通用 | — |
| creation | 轻颜相机 | 通用 | — |
| creation | 微信公众号助手 | 通用 | — |

## 仍需单独确认的事项（不在网页展示不确定状态）

1. 40 个无工具平台标签的条目应按 **Python 库 / 框架、网页资源、历史工具** 分组制定规则，而非一律补 Windows/macOS/Linux；需要防止平台筛选遗漏适用于该系统的库。
2. PicACG：官方频道确认 Android APK 和 iOS 网页入口，但当前原生 iOS App／IPA 是否为同一主应用、能否稳定安装，仍缺直接的官方发布资料；网页仅标 Android 客户端。不要使用名称相似的第三方下载镜像作为官方证明。
3. TIM Windows：登录可靠性取决于账号/版本，尚未取得腾讯官方停用公告。官网没有加入「待核实」描述，正式状态不臆断。
4. Yowell（优渥）：存在 2023 年第三方安卓 APK 资料及当前 iOS 商店记录，最新 Android 官方分发与版本未取得第一方证据；暂保留原有通用分类，后续可使用安装实测复核。
5. 顶点小说：当前链接是第三方安卓软件资料，缺开发者可认证的第一方下载源；继续保留原安卓条目，不把该资料页称为官方链接。
4. 仅做过本地文件路径完整性检查，未对所有 289 个主目录条目开展逐个外部链接可达性、跨地区 App Store 可下载性或安装实测。

**正式站点主分支未做任何修改。** 本文件用于审计，不等于每个外部应用均已独立安装或完成商店地区验证。
