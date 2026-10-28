from argparse import ArgumentParser
from pathlib import Path

import uvicorn

from zhiju.settings import Settings


def main() -> None:
    """读取指定配置文件，启动 API 服务。"""
    parser = ArgumentParser(description="启动知据 API")
    parser.add_argument(
        "--env-file",
        type=Path,
        required=True,
        help=".env 配置文件的路径",
    )
    args = parser.parse_args()

    env_file = args.env_file.resolve()
    if not env_file.is_file():
        parser.error(f"配置文件不存在：{env_file}")

    settings = Settings(_env_file=env_file)

    uvicorn.run(
        "zhiju.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.app_env == "development",
    )


if __name__ == "__main__":
    main()
