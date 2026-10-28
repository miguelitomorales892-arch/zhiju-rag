from fastapi import FastAPI

from zhiju.api.routes.health import router as health_router

app = FastAPI(title="知据 API")

app.include_router(health_router)
