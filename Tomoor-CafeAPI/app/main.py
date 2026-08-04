from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.init_db import init_db

from app.features.admins.router import router as admins_router
from app.features.auth.router import router as auth_router
from app.features.categories.router import router as categories_router
from app.features.dashboard.router import router as dashboard_router
from app.features.products.router import router as products_router
from app.features.sliders.router import router as sliders_router

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


app.include_router(categories_router)
app.include_router(products_router)
app.include_router(sliders_router)
app.include_router(admins_router)
app.include_router(auth_router)
app.include_router(dashboard_router)
