# 知据（ZhiJu RAG）

面向技术文档与项目知识的 RAG 应用，采用 Vue 3、FastAPI 和 LangChain。

## 当前交付范围

当前提供最小 FastAPI 健康接口、配置读取与启动入口，以及可检查服务连接的 Vue 页面。前端支持加载、成功、失败、超时与重试，通过开发代理访问后端；已有接口与配置测试。知识库、问答、Agent、数据库迁移及 Compose 部署尚未实现。

## 本地运行

后端使用已准备好的 Python 环境，从 `backend/src` 执行：

```powershell
python -m zhiju --env-file "../../.env"
```

前端需要 Node 24.22.1 与 pnpm 11.25.0，从 `frontend` 执行：

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

默认打开 http://127.0.0.1:5173。根 `.env` 中的 `API_HOST`、`API_PORT` 决定开发代理目标，`FRONTEND_PORT` 决定页面端口，`FRONTEND_API_BASE_PATH` 决定浏览器的请求前缀（默认 `/api`）。例如 `/api/health` 转发到后端 `/health`。前端仅监听本机地址，端口占用时直接报错；修改这些配置后重启对应服务。

浏览器只获得公开的 API 路径，真实 `.env` 不会整体注入页面。该页面仅检查 API 是否可响应，不代表数据库、检索或模型服务就绪。后端停止时页面显示失败，可以在启动后点击重试。

验证命令：前端目录执行 `pnpm test`、`pnpm typecheck`、`pnpm build`；后端 `backend/src` 目录执行 `python -m pytest ../tests -v`。`pnpm preview` 仅用于预览构建产物，不包含开发代理；生产部署需另行配置同源 API 反向代理。

统一入口：**[全项目依赖总清单与环境准备](docs/environment.md)**。开头的总表覆盖开发工具、前后端、后台任务、数据库/队列/检索、容器、模型/OCR、配置数据及测试交付，列出版本、声明位置与启用阶段；后续各节提供具体说明。各生态的安装文件按用途分别维护。

## 后端自动检查

[GitHub Actions 配置](.github/workflows/backend-ci.yml) 在推送、拉取请求或手动触发时检查后端。运行环境为 Windows x64 / Python 3.14.9，依次执行依赖一致性检查、Ruff 规范与格式检查、mypy 和 pytest。

工作流用根 requirements-dev.txt 约束版本，为当前 API 和检查工具生成临时安装清单，再校验哈希并安装；不会安装整套未来功能依赖。临时清单不写入仓库，测试不需要本机 .env、模型密钥或数据库。当前工作流仅覆盖后端，前端与 Linux 服务运行验证另行安排。

本地 Ruff 和 mypy 从 backend 目录运行，pytest 从 backend/src 目录运行，以保持源码路径解析与 CI 一致。云端执行结果以仓库 Actions 页面为准。

## 根目录配置与安装入口

| 文件 | 用途 |
| --- | --- |
| `.env` | 本机全项目开发配置，不提交；初始内容来自样例，密码与模型配置待填写 |
| [.env.example](.env.example) | 可提交的全项目配置样例，说明各字段用途 |
| [environment.yml](environment.yml) | Miniconda 的 Python 解释器与 pip 声明 |
| [requirements.txt](requirements.txt) | Windows API 的 Python 安装入口 |
| [requirements-dev.txt](requirements-dev.txt) | Windows API 加开发工具的完整方案，当前暂不全量安装 |
| [requirements-linux.txt](requirements-linux.txt) | Linux API 安装入口 |
| [requirements-worker.txt](requirements-worker.txt) | Linux API 加 Celery 安装入口 |
| [requirements-documents.txt](requirements-documents.txt) | Linux worker 加文档/OCR 的安装入口 |
| [.gitignore](.gitignore)、[.dockerignore](.dockerignore) | 排除真实配置、安装目录和运行产物，保留样例与依赖锁文件 |

五份完整 requirements 锁文件统一存放在本根目录，backend/ 不保留同名文件或引用层。Python 依赖声明仍在 backend/pyproject.toml；重新生成时直接输出到根目录。安装命令启用哈希校验和仅二进制包安装。各清单是完整的不同用途环境，选择一份，不把 Linux 文档依赖安装到 Windows。前端仍使用 frontend/package.json 与 pnpm-lock.yaml，镜像使用 deploy/images.env。

开发按功能增量推进，只安装当步需要的依赖。Python 整套 requirements 仍是完整选型准备结果，当前不要全量安装。前端声明与锁文件已收敛为最小页面及验证所需的 9 项直接依赖，可执行上述 frozen 安装；路由、状态管理、组件库与文档预览等依赖在功能需要时再加入。

首次准备环境时先核验已有 Conda 环境，不重复创建。首次克隆仓库可将 .env.example 复制为 .env，已有文件不要覆盖。当前后端读取 APP_ENV/API_HOST/API_PORT；前端开发服务器读取前述四个公开配置项，其余配置仍是后续功能契约，不能声称已接入或已验证。

| 目录 | 内容 |
| --- | --- |
| `frontend/` | Vue 连接页面、API 请求、开发代理、组件测试与构建配置 |
| `backend/` | Python 应用、路由、配置、启动入口、测试与依赖声明 |
| `deploy/` | 服务和构建镜像的固定版本与摘要；运行配置随功能加入 |
| `docs/` | 面向使用者的环境、安装与后续运行说明 |

## 开发方式

Windows 本地开发前端与 API；后台任务、PostgreSQL、Redis、Qdrant 使用 Linux 容器。前端由 Node/pnpm 管理，后端由 Conda/Python 管理；数据库服务端和模型服务不由 requirements 安装。

项目独立建设，参考 [Langchain-Chatchat](https://github.com/chatchat-space/Langchain-Chatchat) 的模块职责与实现思路。目前尚未复制其业务代码；实际复用时保留适用的许可、版权与来源说明。
