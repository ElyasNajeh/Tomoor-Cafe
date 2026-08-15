from contextlib import asynccontextmanager
import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.seed_catalog import seed_catalog
from app.db.session import sessionLocal

from app.features.admins.router import router as admins_router
from app.features.auth.router import router as auth_router
from app.features.categories.router import router as categories_router
from app.features.dashboard.router import router as dashboard_router
from app.features.products.router import router as products_router
from app.features.sliders.router import router as sliders_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    with sessionLocal() as db:
        try:
            seeded = seed_catalog(db)
            db.commit()
            if seeded:
                logger.info("Initial catalog seed completed")
        except Exception:
            db.rollback()
            raise
    yield


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

upload_dir = Path(settings.UPLOAD_DIR)
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")


app.include_router(categories_router)
app.include_router(products_router)
app.include_router(sliders_router)
app.include_router(admins_router)
app.include_router(auth_router)
app.include_router(dashboard_router)
