# 知据后端依赖

目标解释器：**CPython 3.14.9，标准 GIL 版，x86_64**。依赖声明唯一来源为 `pyproject.toml`，五份 requirements 文件统一位于项目根目录 app/，由解析器生成，包含间接依赖、固定版本和 SHA-256 哈希。修改依赖时更新声明并重新生成，不手改多份锁定结果。

**当前采用按功能增量安装。** 下列五份清单是此前完整方案的解析结果，暂不直接全量安装。首个功能开始前，先将 pyproject.toml 与对应锁文件收敛为当前功能及必要检查所需依赖，再提供该步安装命令；之后随功能扩展，不由用户手工删除间接依赖。

## 选择安装清单

| 文件 | 适用环境 | 包含内容 |
| --- | --- | --- |
| `requirements.txt` | Windows x86_64 API | FastAPI、LangChain、存储/模型客户端、认证和基础 Markdown 处理 |
| `requirements-dev.txt` | Windows x86_64 开发 | 完整 API 依赖，加 Ruff、mypy、pytest、构建工具；不需要再安装上一份 |
| `requirements-linux.txt` | Linux x86_64 API | 对应 Linux 平台的完整 API 依赖 |
| `requirements-worker.txt` | Linux x86_64 worker / dispatcher | 完整 Linux API 依赖，加 Celery 与 Redis 客户端 |
| `requirements-documents.txt` | Linux x86_64 文档工作进程 | 完整 worker 依赖，加 Docling、RapidOCR、ONNX Runtime 和 CPU 版 PyTorch |

Linux 清单按 glibc 2.28 基线解析，不适用于 Alpine/musl、ARM 或 Python 3.15。文档清单的两个 PyTorch 依赖使用官方 CPU wheel 的固定 URL 与哈希，限定 CPython 3.14/Linux x86_64；不要在 Windows 安装这份清单。Celery 工作进程只在 Linux 容器运行。

`requirements.txt` 是 Windows 默认入口，采用常见复数文件名；不要把它当作所有平台通用清单。每份清单都是完整安装集，选符合进程用途的一份。API 不需要加载 Docling/OCR；这些组件到复杂文档处理阶段再启用。

完整清单只保留在项目根目录，本目录不保留同名 requirements 或转引文件。本目录继续维护 Python 的 pyproject.toml 声明；Conda 解释器声明也已统一移到项目根目录。安装见 [根 README](../README.md)；全项目配置样例统一位于根 [.env.example](../.env.example)。

## 环境与安装

根目录的 [environment.yml](../environment.yml) 只声明 Conda 解释器与 pip，不自动安装业务依赖。当前先由用户核验并创建/选择专用环境，确认解释器路径与版本。业务依赖安装命令在当前功能的声明和锁文件收敛后提供，使用哈希校验及仅二进制包约束；不安装到 base。

当前文件只提供第三方依赖，业务 Python 包与构建配置尚未建立，暂不执行 `pip install .`。Vue/Node 依赖不属于 Python requirements；PostgreSQL、Qdrant、Redis 服务端也需由部署配置提供，安装对应 Python 客户端不会安装数据库服务。

`langchain-openai` 用于接入实际支持相应协议的模型服务，不代表必须使用某一家模型供应商；各供应商的流式、工具调用和 Embedding 行为仍需单独验证。模型权重不随 requirements 下载；解析/OCR 组件首次运行时的资源下载需要另行配置。

## 重新生成

使用支持下述选项的 uv（本清单生成器版本为 0.12.19），在 backend/ 目录执行，输出到上一级项目根目录。以下命令仅解析和写清单，不安装项目包或创建环境：

```powershell
uv pip compile pyproject.toml --python-version 3.14.9 --python-platform x86_64-pc-windows-msvc --prerelease disallow --resolution highest --only-binary :all: --no-python-downloads --default-index https://pypi.org/simple --generate-hashes --emit-index-url -o ../requirements.txt
uv pip compile pyproject.toml --group dev -c ../requirements.txt --python-version 3.14.9 --python-platform x86_64-pc-windows-msvc --prerelease disallow --resolution highest --only-binary :all: --no-python-downloads --default-index https://pypi.org/simple --generate-hashes --emit-index-url -o ../requirements-dev.txt
uv pip compile pyproject.toml -c ../requirements.txt --python-version 3.14.9 --python-platform x86_64-manylinux_2_28 --prerelease disallow --resolution highest --only-binary :all: --no-python-downloads --default-index https://pypi.org/simple --generate-hashes --emit-index-url -o ../requirements-linux.txt
uv pip compile pyproject.toml --extra worker -c ../requirements-linux.txt --python-version 3.14.9 --python-platform x86_64-manylinux_2_28 --prerelease disallow --resolution highest --only-binary :all: --no-python-downloads --default-index https://pypi.org/simple --generate-hashes --emit-index-url -o ../requirements-worker.txt
uv pip compile pyproject.toml --extra worker --extra documents -c ../requirements-worker.txt --python-version 3.14.9 --python-platform x86_64-manylinux_2_28 --prerelease disallow --resolution highest --only-binary :all: --no-python-downloads --default-index https://pypi.org/simple --generate-hashes --emit-index-url -o ../requirements-documents.txt
```

现有锁文件保留迁移前的原始生成命令注释用于溯源；重新生成以本节命令为准，不直接照抄旧注释的输出路径。迁移仅改变位置，文件内容与哈希未变。

依次生成，让各平台/用途共用包保持一致；平台专属包可以不同。主动升级间接依赖时添加 `--upgrade` 并按相同顺序生成；直接依赖需先修改 pyproject 中的固定版本。遇到冲突时记录原因，不能用覆盖依赖约束或忽略依赖的方式伪造成功。

## 验证边界

当前清单通过目标平台的完整依赖解析与预编译包可用性检查；不能据此声称 API、数据库、流式问答、Celery、OCR 或模型服务已运行成功。实际安装后仍需执行导入、启动、数据库连接、队列与解析样本等验证。哈希用于核对包文件，不代表软件不存在漏洞。
