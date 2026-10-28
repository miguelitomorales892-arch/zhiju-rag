from fastapi.testclient import TestClient

from zhiju.main import app


def test_health_returns_ok() -> None:
    """健康检查接口应返回 HTTP 200 和约定的状态信息。"""
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
