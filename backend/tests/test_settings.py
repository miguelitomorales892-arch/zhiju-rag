from pathlib import Path

import pytest
from pydantic import ValidationError
from pytest import MonkeyPatch

from zhiju.settings import Settings


def test_settings_reads_port_from_env_file(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """从临时配置文件读取端口，并转换为整数。"""
    # 隔离当前进程的同名环境变量，确保测试读取的是文件内容。
    for name in ("APP_ENV", "API_HOST", "API_PORT"):
        monkeypatch.delenv(name, raising=False)

    env_file = tmp_path / ".env"
    env_file.write_text("API_PORT=8001\n", encoding="utf-8")

    settings = Settings(_env_file=env_file)

    assert settings.api_port == 8001
    assert isinstance(settings.api_port, int)


def test_settings_rejects_invalid_port() -> None:
    """超出允许范围的端口应触发配置校验错误。"""
    with pytest.raises(ValidationError, match="api_port"):
        Settings(
            _env_file=None,
            app_env="test",
            api_host="127.0.0.1",
            api_port=70000,
        )


def test_environment_variable_overrides_env_file(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """同名进程环境变量应优先于配置文件。"""
    for name in ("APP_ENV", "API_HOST", "API_PORT"):
        monkeypatch.delenv(name, raising=False)

    env_file = tmp_path / ".env"
    env_file.write_text("API_PORT=8001\n", encoding="utf-8")

    monkeypatch.setenv("API_PORT", "9000")

    settings = Settings(_env_file=env_file)

    assert settings.api_port == 9000


def test_settings_rejects_invalid_environment(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """配置文件中的运行环境名称必须属于允许值。"""
    for name in ("APP_ENV", "API_HOST", "API_PORT"):
        monkeypatch.delenv(name, raising=False)

    env_file = tmp_path / ".env"
    env_file.write_text("APP_ENV=invalid\n", encoding="utf-8")

    with pytest.raises(ValidationError, match="app_env"):
        Settings(_env_file=env_file)
