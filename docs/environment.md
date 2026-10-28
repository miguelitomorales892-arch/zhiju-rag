# 全项目依赖总清单与环境准备

清单更新日期：2026-10-28；整体选型版本核验日期：2026-10-23。目标：Windows x86_64 本地开发，Linux amd64 容器运行配套服务与后台任务。

本说明覆盖前端、后端、容器、配套服务、模型接入与验证工具。当前已有最小 API、配置读取与测试，以及最小 Vue 页面、开发代理与前端测试/构建。前端直接依赖已收敛；未启用的库和镜像仍属于后续选型，不代表安装或业务验收完成。尚未拉取服务镜像或下载模型。

**安装策略：按功能增量准备。** 整体选型表不作为一次性安装指令。Python 环境已准备，基础 API、配置和测试依赖已按需安装，完整 requirements 尚未代表当前增量；前端声明与锁文件已收敛并完成安装验证。后续按功能引入依赖，不手工截取完整锁文件、不预先实现所有阶段。

## 全项目总清单

**本页是整个项目的统一清单入口。** 下表把工具、应用依赖、基础设施、模型和交付条件放在一起，后续各节说明具体操作。表中“准备”指清单和配置方案已明确；S 编号代表项目功能实施阶段，不代表已经完成。

本表保留整体选型版本快照；标为后续功能的库不一定存在于当前安装声明。升级时先改实际声明并重新生成锁文件。当前 Python 仍保留 27 项完整方案声明，前端已收敛为 9 项直接声明，镜像共 6 项。完整间接依赖及完整性记录由各锁文件维护。

| 范围与用途 | 组件 / 版本或确定条件 | 权威声明 / 保存位置 | 准备与首次启用 |
| --- | --- | --- | --- |
| 开发机与版本管理 | Windows x86_64；现有 Git；WSL2 / Linux containers；资源、虚拟化和端口待现场核验 | 见第 2 节；实际机器状态在搭建时记录 | S-01 核验；容器阶段完成 WSL2 配置 |
| Python 环境及解析工具 | Conda / Miniconda 核验已有安装；CPython 3.14.9 标准 GIL；uv 0.12.19 | environment.yml；backend/README.md | S-01 用户创建专用环境，不修改 base |
| JavaScript 环境及包管理 | Node.js 24.22.1 LTS；pnpm 11.25.0 | frontend/.node-version；package.json；pnpm-workspace.yaml | S-01 用户准备工具、按锁安装 |
| 容器工具 | Docker Desktop 4.96.3 候选；随附 Compose 插件，5.6.0 为准备基线 | 第 2 节；实际安装版本另行核对 | 使用配套服务前准备；没有执行安装 |
| API、校验、上传 | fastapi 0.161.1；uvicorn 0.54.0；pydantic 2.14.1；pydantic-settings 2.16.1；python-multipart 0.0.32 | backend/pyproject.toml → requirements*.txt | S-01 最小 API 按需加入；上传依赖到上传功能时加入 |
| RAG 编排与模型协议 | langchain 1.4.7；langchain-core 1.7.0；langchain-openai 1.7.2；langchain-text-splitters 1.1.3 | backend/pyproject.toml → requirements*.txt | S-04/05 实现检索与回答时按需加入 |
| 存储客户端与迁移 | qdrant-client 1.20.0；sqlalchemy[asyncio] 2.1.6；alembic 1.20.1；psycopg[binary] 3.3.6 | backend/pyproject.toml → requirements*.txt | S-02 加数据库依赖，S-04 加向量客户端 |
| HTTP、密码与文本解析 | httpx 0.28.1；pwdlib[argon2] 0.3.1；markdown-it-py 4.2.0 | backend/pyproject.toml → requirements*.txt | 实现认证、导入及 HTTP 调用时按需加入 |
| 后台任务客户端 | celery[redis] 5.6.3；redis 6.4.0（Python 客户端） | backend/pyproject.toml → requirements-worker.txt | S-03 Linux worker；不在原生 Windows 运行 Celery worker |
| 文档解析与 OCR | docling[rapidocr] 2.142.1；torch 2.14.1+cpu；torchvision 0.29.1+cpu；RapidOCR、ONNX Runtime 等间接版本随锁文件 | backend/pyproject.toml → requirements-documents.txt | S-09 文档 worker；S-12 启用 OCR；模型另行准备 |
| 后端检查、测试与打包 | ruff 0.17.2；mypy 2.4.0；pytest 9.1.1；pytest-asyncio 1.4.0；pytest-cov 7.1.0；build 1.6.1 | backend/pyproject.toml → requirements-dev.txt | 随当前代码加入必要检查；打包工具到打包阶段加入 |
| 前端页面与构建 | vue 3.5.44；typescript 6.0.3；vite 8.3.5；@vitejs/plugin-vue 6.0.10 | frontend/package.json → pnpm-lock.yaml | S-01 最小页面所需依赖，进入前端步骤时加入 |
| 前端路由、状态与组件 | vue-router 5.4.0；pinia 4.1.0；element-plus 2.14.7 | 后续候选，当前不在安装声明中 | 登录及知识库页面需要时逐项核验并加入 |
| 回答展示与 PDF 预览 | markdown-it 15.0.3；dompurify 3.4.17；@types/markdown-it 14.2.0；pdfjs-dist 6.4.299 | 后续候选，当前不在安装声明中 | S-05 加回答展示依赖，S-09 加 PDF 预览依赖 |
| 前端静态检查与类型 | eslint 10.13.0；@eslint/js 10.0.1；eslint-plugin-vue 10.11.1；vue-eslint-parser 10.4.1；typescript-eslint 8.72.0；globals 17.13.0；vue-tsc 3.3.13；@types/node 24.19.2 | frontend/package.json → pnpm-lock.yaml | 随最小前端加入必要检查并建立规则 |
| 前端组件与端到端测试 | vitest 5.0.5；@vue/test-utils 2.5.1；jsdom 30.1.3；@playwright/test 1.64.1 | frontend/package.json → pnpm-lock.yaml | 组件测试随当前行为加入；S-05 加端到端工具及所需浏览器 |
| 业务数据库服务 | PostgreSQL 18.6-bookworm | deploy/images.env，含 sha256 摘要 | S-02 拉取并启动，迁移和持久化实测 |
| 队列服务 | Redis 8.10.2-trixie（服务端） | deploy/images.env，含 sha256 摘要 | S-03 与 Celery 联调；与 Python redis 包分别管理 |
| 向量与全文检索服务 | Qdrant v1.20.0 | deploy/images.env，含 sha256 摘要 | S-04 向量、S-06 BM25；S-01 可先做隔离探测 |
| 应用构建基础镜像 | Python 3.14.9-slim-bookworm；Node 24.22.1-bookworm-slim | deploy/images.env，含 sha256 摘要 | worker / 应用容器构建时使用 |
| Web 交付与代理 | Nginx 1.30.6-trixie；部署域名及 HTTPS 证书待部署方案确定 | deploy/images.env；后续 deploy/ 真实配置 | S-16；本地开发先用 Vite 代理 |
| 回答模型服务 | Qwen 系列服务方向；供应商、精确模型 ID、endpoint、预算及数据外发范围待确认 | 第 6 节配置契约；真实凭据在不提交的根 .env 或部署环境 | S-05 首次调用前确认，不预填密钥或产生费用 |
| Embedding / Reranker | Qwen3-Embedding-0.6B / Qwen3-Reranker-0.6B 为候选；实际服务模型与修订待确定 | 第 6 节；维度、协议和索引版本随实现固定 | S-04 Embedding，S-07 重排；不是已部署的模型 |
| OCR 资源与系统依赖 | Docling / RapidOCR 模型修订、哈希、缓存；解析库所需 Linux 动态库待目标镜像导入验证 | 后续文档 worker Dockerfile 与模型资源配置 | S-09/12 逐项确定；当前没有下载模型或安装系统库 |
| 配置、原件和持久化数据 | 分离开发/测试/生产配置；原件、数据库、向量、日志、缓存与备份 | 开发配置在不提交的根 .env；数据在仓库外 .local/；样例和部署定义可提交 | 随功能建立；路径、凭据、权限、备份恢复均需核验 |
| 评测与自动检查 | 固定开发集与独立测试集；pytest / Vitest / Playwright；最小 GitHub Actions | 可公开测试及 CI 随源码进入仓库；私有资料与结果在 .local/ | S-01 建检查基线，评测贯穿功能；CI 尚未建立 |

这份清单覆盖当前已约定的整体方案。供应商模型、OCR 资源及镜像系统库等尚需实际选择或运行验证的项目也列在表中，明确待办条件；“已列入清单”不表示已经安装或完成选定。无需额外安装的能力使用已有组件：前端 HTTP/SSE 用 fetch/AbortController，日志先用 Python logging，Agent 先沿用 LangChain；暂不引入独立模型推理平台或另一套监控基础设施。

## 1. 文件分别管理什么

| 入口 | 管理范围 | 不包含什么 |
| --- | --- | --- |
| [前端 package.json](../frontend/package.json) | 前端运行库和开发工具的精确版本，唯一人工声明入口 | Python、数据库服务端 |
| [pnpm-lock.yaml](../frontend/pnpm-lock.yaml) | 前端完整依赖树、间接版本和完整性哈希 | 浏览器安装、页面实现 |
| [.node-version](../frontend/.node-version)、[pnpm-workspace.yaml](../frontend/pnpm-workspace.yaml) | Node 目标版本、依赖解析约束；当前仅一个前端包 | 不自动建立 Node 环境 |
| [根 environment.yml](../environment.yml) | Conda 的 Python 解释器与 pip；从 app/ 根目录创建环境 | 不安装前端或 Python 业务包 |
| [后端依赖说明](../backend/README.md) | Python 声明、五种平台/进程清单和 Conda 解释器 | Vue、Node、数据库服务端 |
| [images.env](../deploy/images.env) | 六个镜像的版本和不可变摘要 | 尚无消费它的 Compose/Dockerfile；不能直接启动系统 |
| [根 .env.example](../.env.example) / 本机根 .env | 全项目开发配置入口；密码、模型地址/ID 等由用户填写 | 当前尚无读取代码，不代表服务可运行 |
| [根 requirements.txt](../requirements.txt) 及同级分组入口 | 完整 Python 锁文件直接保存在 app/ 根目录，按用途选择一份安装 | 不安装前端包、数据库服务或模型权重 |
| 本说明 | 全项目总表、准备顺序、启用时机、待确认配置和验收 | 不保存真实凭据 |

Python 直接版本只在 pyproject 维护，前端直接版本只在 package.json 维护；锁文件由工具生成。镜像的精确引用只在 images.env 维护。安装包完整性哈希与镜像摘要用于识别产物，不保证没有漏洞。

统一清单用于看清整个系统，各生态的声明与锁文件用于实际安装。Python、npm 包和容器镜像需要各自的工具读取，因此保留在对应目录；Python requirements 的体积主要来自完整间接依赖与多个发行包哈希，并不表示已经编写大量业务功能。

## 2. 开发机工具

| 工具 | 准备基线 | 用途与边界 |
| --- | --- | --- |
| Conda / Miniconda | 优先核验已有 Conda，不重复安装发行器 | 创建后端专用环境；已安装发行器的版本由搭建时记录，环境目标由 environment.yml 固定 |
| CPython | 3.14.9，标准 GIL，64 位 | Windows API 与 Linux worker 使用相同 Python 小版本；不用自由线程版 |
| Node.js | 24.22.1 LTS | 前端开发与构建；保留已选 LTS 路线，采用该线的新补丁 |
| pnpm | 11.25.0 | 本次实际使用的现有锁文件生成器，项目固定同一版本；不是当前最新主版本 |
| uv | 0.12.19 | 已有 Python 依赖解析工具；后端安装也可使用目标环境的 pip，不强制再安装另一套工具 |
| Docker Desktop | 4.96.3 Windows x86_64 稳定版作为准备候选 | 配套服务阶段由用户安装/核验；使用 Linux containers 与 WSL2 后端 |
| Docker Compose | 随 Desktop 提供的插件；5.6.0 为准备基线 | 核对 `docker compose version`；不另装旧版 `docker-compose` Python 包 |
| Git | 使用现有受维护版本 | 不属于前端或后端安装依赖，本次不改变 Git 安装 |

pnpm 最新主版本已为 12。本次为了遵守“不安装工具/依赖”的边界，使用本机已有 11.25.0 完成真实解析并固定生成器；未声称 pnpm 12 有兼容性冲突。需要升级时，由用户操作安装新工具，重新生成、审查并验证锁文件后一起更新 packageManager。不能只改版本标签宣称新生成器已验证。

`nodeVersion` 是解析时检查 engines 的目标值，不会替用户升级实际 Node。安装时仍须人工核对 `node --version` 和 `pnpm --version`；`.node-version` 本身也不是安装程序。pnpm 的 `pmOnFail: error` 在版本不符时报错，不自动下载其他包管理器。

Docker/WSL 的 Windows 版本、虚拟化、内存、磁盘和可用端口在搭建前核对；这不是已经配置好的机器状态。Docker Desktop 负责提供引擎与 Compose，选择版本后仍要记录实际输出。当前不需要 GPU/CUDA 工具链。

来源：[Node 24.22.1](https://nodejs.org/en/blog/release/v24.22.1)、[pnpm 版本与 Node 配置](https://pnpm.io/settings/cli)、[Docker Desktop 发布记录](https://docs.docker.com/desktop/release-notes/)、[Windows 安装条件](https://docs.docker.com/desktop/setup/install/windows-install/)。

## 3. 前端依赖

当前前端声明与锁文件只保留 9 项直接依赖：vue、@vitejs/plugin-vue、vite、typescript、vue-tsc、@types/node、vitest、@vue/test-utils、jsdom。以下表格同时保留后续依赖的启用时机，未启用的包不会提前安装。

| 类别 | 包 | 首次使用 |
| --- | --- | --- |
| 页面与构建 | vue、typescript、vite、@vitejs/plugin-vue | S-01 最小页面 |
| 路由、状态、组件库 | vue-router、pinia、element-plus | 登录、知识库及任务页面；不把所有局部状态放进 Pinia |
| Markdown / HTML 安全展示 | markdown-it、dompurify、@types/markdown-it | S-05 回答与来源；Markdown 默认禁用原始 HTML |
| PDF 来源预览 | pdfjs-dist | S-09；worker 与主库必须来自同一锁定版本，不使用浮动 CDN worker |
| 静态检查 | eslint、@eslint/js、eslint-plugin-vue、vue-eslint-parser、typescript-eslint、globals、vue-tsc、@types/node | S-01 随真实代码建立配置 |
| 组件测试 | vitest、@vue/test-utils、jsdom | 随组件行为添加测试 |
| 浏览器端到端 | @playwright/test | S-05 首条用户流程；浏览器二进制到那时单独安装 |

当前使用 Vue 3.5.44、Vite 8.3.5、@vitejs/plugin-vue 6.0.10；未使用 Vue Router、Pinia 或 Element Plus。当前启用依赖的精确版本以 package.json 为准；后续候选版本在启用时重新核验。

TypeScript 采用 6.0.3：本次查询到最新 7.0.2，但 typescript-eslint 8.72.0 要求 `<6.1.0`，不能直接搭配。@types/node 采用 24 系列，避免对 Node 24 程序暴露 Node 26 专有类型。没有使用 peer 忽略、强制覆盖或跳过依赖来制造成功。

当前前端请求使用浏览器原生 fetch/AbortController，5 秒超时，校验 HTTP 状态和 JSON 响应。样式为普通 CSS，不引入 UI 框架、图标库、外部字体或自动导入插件。

核对 Node/pnpm 后，从 `app/frontend/` 执行以下命令安装当前增量：

```powershell
node --version
pnpm --version
pnpm install --frozen-lockfile
```

运行 `pnpm dev` 启动页面，`pnpm test` 执行请求/组件/开发配置测试，`pnpm typecheck` 检查类型，`pnpm build` 先检查类型再构建。当前未配置 ESLint 与 CI；它们属于后续 S-01 检查基线。没有全局放开依赖脚本。开发代理仅读取根 .env 中的四个公开参数，进程环境变量优先；仅把公开 API 前缀传给浏览器。服务端默认 localhost 回环地址和严格端口，部署时另行设置反向代理。

仅重新解析锁文件、不安装的维护命令：

```powershell
pnpm install --lockfile-only --ignore-scripts --strict-peer-dependencies
pnpm audit --json
```

不要同时生成 package-lock.json 或 yarn.lock。升级时先修改 package.json 的精确版本，再生成锁文件、检查 peer/engines 与安全公告并运行相关构建测试。[pnpm lockfile-only 说明](https://pnpm.io/cli/install)。

## 4. 后端与工作进程

| 进程/用途 | 安装入口 | 启用阶段 |
| --- | --- | --- |
| Windows 开发 API | environment.yml → requirements-dev.txt | 首个 API 功能前先收敛清单，再安装该增量及必要检查工具 |
| Windows 仅运行 API | requirements.txt | 确需不带开发工具的环境时 |
| Linux API | requirements-linux.txt | 容器交付阶段 |
| Linux Celery worker / dispatcher | requirements-worker.txt | S-03；持久化待投递、重试与幂等逻辑随后实现 |
| Linux 文档 worker | requirements-documents.txt | S-09 复杂格式，S-12 配置并启用 OCR |

Celery 使用同一后端 Python 包，不另建独立业务项目。文档清单已包含 Docling、RapidOCR、ONNX Runtime 与 CPU PyTorch；安装依赖与下载解析/OCR 模型是两步。容器 Dockerfile 实现时需要检查 OpenCV/解析库的系统动态库需求，不能认为有 wheel 就保证在 slim 镜像可导入。

本地 Conda 安装步骤及哈希校验见后端 README；五份完整 requirements*.txt 已直接迁移至 app/ 根目录，backend/ 不再保留同名文件；安装在根目录执行，重新生成命令仍在 backend/ 执行并输出到根目录。本次锁文件内容与哈希不变；不存在已验证的 worker 启动命令，也未创建运行环境。Python 包中的 redis 6.4.0 是客户端版本，与下表 Redis 服务端版本分别管理。

## 5. 容器与配套服务

镜像已经按精确标签与 registry 摘要锁定，核对各 manifest 含 Linux amd64；仅请求了镜像元数据，没有拉取层。当前不创建缺少应用入口的占位 Dockerfile 或不能运行的 API/worker 服务。

| 组件 | 镜像候选版本 | 用途与启用阶段 |
| --- | --- | --- |
| PostgreSQL | 18.6-bookworm | S-02：业务数据、权限、任务与会话；19 当前仍为 RC，不采用 |
| Redis | 8.10.2-trixie | S-03：Celery broker；持久化和故障恢复要实测，不能当唯一任务历史 |
| Qdrant | v1.20.0 | S-01 可做隔离技术探测；S-04 向量、S-06 原生全文 BM25 |
| Python 基础镜像 | 3.14.9-slim-bookworm | worker 与 Linux API 构建；glibc 路线，匹配现有 CPU wheel，不用 Alpine |
| Node 构建镜像 | 24.22.1-bookworm-slim | 前端容器构建时使用，与本地目标版本一致 |
| Nginx | 1.30.6-trixie（stable 分支） | S-16 静态页面、同源 API 与 SSE 代理；本地先使用 Vite 开发代理 |

这些是待运行验证的版本候选。Redis 客户端可解析不代表 Celery 与该服务端已联调；Qdrant 的中文 BM25、术语分词、过滤与删除一致性也必须单独验证。Nginx stable 与 mainline 是不同发行分支，这里明确采用 stable 的新补丁。

后续 Compose/Dockerfile 从 images.env 读取对应引用，不能另抄一套浮动版本。修改镜像标签时同时重新获取摘要和核对平台，旧摘要不会自动跟随标签更新。

配套服务运行配置在对应阶段实现，必须落实：

- 开发时宿主端口仅绑定 `127.0.0.1`；浏览器只访问 API，不直接访问数据库/检索服务。数据库密码、Redis 凭据与 Qdrant API key 由私有配置提供，不放 images.env。
- PostgreSQL 18 镜像持久化挂载根为 `/var/lib/postgresql`，不能照搬旧版只挂 `/var/lib/postgresql/data` 的示例。Redis 使用 `/data`，Qdrant 使用 `/qdrant/storage`；实施时以锁定镜像文档再次核验。
- Windows API 与 Linux worker 用稳定相对文件键共享原件，宿主根与容器挂载根分别注入。本机开发配置由根 `.env` 提供；运行数据的宿主源路径位于仓库外 `.local/`，在 Compose 中显式挂载；核验 Windows bind mount 对数据库/索引的兼容性和性能。若实际验证要求改用独立 Linux 文件系统或 named volume，先明确布局与备份并由用户确认调整，不静默把数据写到另一个位置。生产持久化独立配置。
- 开发、测试、生产分别使用目录/卷、数据库、队列命名空间与凭据。不得把 `down -v` 或删除整个 `.local/` 当作常规重启步骤。
- 容器默认服务名（postgres、redis、qdrant）与宿主映射地址分别配置；Compose 插值文件不等于所有变量自动传入容器。

参考：[PostgreSQL 镜像](https://hub.docker.com/_/postgres)、[Redis 官方镜像清单](https://raw.githubusercontent.com/docker-library/official-images/master/library/redis)、[Qdrant 1.20 发布](https://github.com/qdrant/qdrant/releases/tag/v1.20.0)、[Nginx 官方镜像清单](https://raw.githubusercontent.com/docker-library/official-images/master/library/nginx)。

## 6. 模型接入与实际配置

模型服务也是全项目准备的一部分，但托管服务不是通过 requirements 安装的模型权重。当前优先服务 API；尚未选定账号、预算与允许发送的数据，不能伪造可用 endpoint、密钥或模型版本。

| 角色 | 当前方向 | 首次调用前必须确定 | 验证 |
| --- | --- | --- | --- |
| 回答 LLM | 优先评估 Qwen 系列服务 | 供应商、完整 base URL、精确模型 ID/版本、私有凭据、上下文/输出上限、计费与超时 | 中文技术问答、流式结束/取消、用量统计；Agent 阶段再验证工具调用 |
| Embedding | Qwen3-Embedding-0.6B 为可控对照候选；托管时记录供应商实际提供的模型 | 模型 ID/修订、维度、输入上限、查询指令、批量限制 | 中英文、错误码/路径、查询与文档编码一致性；切换模型需新索引 |
| Reranker | Qwen3-Reranker-0.6B 为候选，S-07 接入 | endpoint、协议、模型修订、截断方式、候选上限、分数方向 | 超时回退、排序与质量/成本对比；不能假设它等同聊天或 Embedding 接口 |
| 文档/OCR 模型 | Docling 与 RapidOCR 所需模型，CPU 路线 | 模型清单、固定 revision/哈希、缓存位置、下载来源与中英文配置 | PDF 表格、扫描页、页码定位；离线验证前不宣称离线可用 |

上述 Embedding/Reranker 是既有方案的候选，不宣称为当日最新或最优；实际服务选择前再核对供应情况与评测。暂不预装 Ollama、Xinference、vLLM、CUDA 或供应商 SDK；确定本地部署后只选择必要的一条路线，更新依赖并验证，不全部安装。

`langchain-openai` 是现有的协议适配依赖，不代表已确定 OpenAI 为供应商，也不能保证任意兼容接口具备流式/工具调用能力。[Qwen Embedding/Reranker 官方说明](https://qwenlm.github.io/blog/qwen3-embedding/)。

根 `.env.example` 已提供全项目配置契约，本机根 `.env` 已按样例创建，密码和未确定的模型项留空。根 `.gitignore` 排除真实配置，`.dockerignore` 阻止其进入构建上下文。当前尚无 settings、Vite 或 Compose 读取这些键，后续实现必须显式接入、按功能校验必填项；不能因为文件存在就宣称配置已经生效。

| 配置 | 保存位置与准备要求 |
| --- | --- |
| 实际开发/测试配置 | 本机开发统一使用 `app/.env`，不提交；测试另用专用配置及数据，不能复用开发资源 |
| 无密钥配置样例 | 根 `.env.example` 已建立；S-01 实现 settings 时逐项对齐字段、校验与说明，后续按功能补充 |
| 基础连接 | PostgreSQL、Qdrant、Redis 的地址/凭据，按宿主与容器区分；缺失时报错，不自动连接其他环境 |
| 文件和缓存 | `DATA_ROOT=../.local/development`；未来实现按 app/ 根解析，其下按用途分目录；容器覆盖为挂载根，不硬编码本机绝对路径 |
| 模型配置 | LLM/Embedding/Rerank 分开配置地址、模型和凭据；用量/费用预算及资料外发范围先确认 |
| 前端 | 默认同源 `/api`，无需模型密钥；如增加 `VITE_*`，只放可公开的构建参数 |

## 7. 按阶段准备，不一次启动所有服务

| 顺序 | 用户操作与启用内容 | 通过条件 |
| --- | --- | --- |
| 1 | 核对已有 Conda、Node/pnpm、Docker/WSL、资源与端口；保留其他项目环境 | 明确现有与目标版本，不重复安装或改动 base |
| 2 | 创建专用 Conda 环境，只准备 Python/pip；首个功能前再收敛并安装当步依赖 | 先验证解释器路径与版本；加入当步依赖后再做 pip check 和相关导入 |
| 3 | 进入前端步骤时准备目标 Node/pnpm，收敛声明与锁文件后安装当前增量 | frozen 安装成功；最小前端建立后再验证类型、lint、组件测试和构建 |
| 4 | S-01 建立前后端最小入口、接入现有根配置样例与忽略规则、建立最小 CI | 前后端通信和配置错误可测；无密钥检查在新环境复现 |
| 5 | S-02 启动 PostgreSQL；S-03 加 Redis、worker/dispatcher 与原件存储 | 数据库连接/迁移、任务重复/重启/失败行为通过 |
| 6 | S-04 接入 Qdrant 和 Embedding；S-05 接入回答模型 | 授权范围内上传→检索→问答→来源走通；S-01 可提前做 Qdrant 技术风险探测 |
| 7 | S-06/07 混合与重排；S-09 复杂格式；S-11 Agent；S-12 OCR | 各自固定样本、权限、失败、预算与质量验收通过 |
| 8 | S-05 起安装所需 Playwright 浏览器并做端到端；S-16 完成 Nginx 与全容器交付 | 流式取消、代理、持久化、备份恢复及隔离环境复现 |

在依赖真实资料的功能前确认范围与首批样本；安装环境不代替需求验收。遇到安装或运行错误，先核对当前步骤，不通过忽略约束绕过错误。

## 8. 当前验证边界

- 前端已在 Node 24.22.1 / pnpm 11.25.0 上执行 frozen 安装、22 项测试、类型检查与构建；真实浏览器验证本地 API 代理、离线恢复和桌面/移动布局。Linux 原生运行尚未验证。
- 后端最小 API、配置与 5 项测试已运行通过；httpx 弃用警告尚未处理。五份完整方案锁文件仍属于静态解析结果，不表示整套依赖都安装或运行通过。
- 六个容器镜像完成 registry manifest、摘要与 Linux amd64 核验；未拉取、扫描镜像层或执行容器。
- 尚未进行 Docker Compose 渲染、数据库/队列联调、模型调用、OCR 资源下载和效果验证。环境阶段出现冲突时调整声明与锁定文件，不能绕过约束声称通过。
- 尚未实现知识库业务、CI 或完整部署定义。当前最小前后端可联调，不代表完整 RAG 应用已完成。
