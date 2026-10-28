from fastapi import APIRouter

router = APIRouter(tags=["健康检查"])


@router.get("/health")
def check_health() -> dict[str, str]:
    """确认 API 可以响应请求，不检查数据库或模型服务。"""
    return {"status": "ok"}
