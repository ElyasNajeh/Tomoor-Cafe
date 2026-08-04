from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user

from app.features.sliders import service
from app.features.sliders.schema import SliderCreate

router = APIRouter(prefix="/sliders", tags=["Sliders"])


@router.post("/")
def create_slider(
    slider_data: SliderCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.create_slider(db, slider_data)


@router.get("/")
def get_sliders(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.get_sliders(db)


@router.get("/activesliders")
def get_active_sliders(db: Session = Depends(get_db)):
    return service.get_active_sliders(db)


@router.get("/{slider_id}")
def get_slider(slider_id: int, db: Session = Depends(get_db)):
    return service.get_slider(db, slider_id)


@router.put("/{slider_id}")
def update_slider(
    slider_data: SliderCreate,
    slider_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.update_slider(db, slider_id, slider_data)


@router.delete("/{slider_id}")
def delete_slider(
    slider_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.delete_slider(db, slider_id)


@router.patch("/{slider_id}/toggle-status")
def toggle_slider_status(
    slider_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    return service.toggle_slider_status(db, slider_id)


@router.post("/upload-image")
def upload_image(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
):
    return service.upload_image(file)
