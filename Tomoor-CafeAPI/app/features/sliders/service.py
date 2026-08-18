from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session


from app.shared import crud
from app.features.sliders.model import Slider
from app.features.sliders.schema import SliderCreate
from app.features.sliders.images import save_slider_upload
from app.shared.images import cleanup_replaced_image


def active_slider_uses_order(db: Session, display_order: int, excluded_id: int | None = None):
    query = db.query(Slider).filter(
        Slider.display_order == display_order,
        Slider.is_active == True,
    )
    if excluded_id is not None:
        query = query.filter(Slider.id != excluded_id)
    return query.first()


def create_slider(db: Session, slider_data: SliderCreate):
    exist_slider = (
        db.query(Slider)
        .filter(
            (Slider.title_ar == slider_data.title_ar)
            | (Slider.title_en == slider_data.title_en)
        )
        .first()
    )
    if exist_slider:
        raise HTTPException(status_code=400, detail="Slider already exists")
    if slider_data.is_active and active_slider_uses_order(db, slider_data.display_order):
        raise HTTPException(
            status_code=400,
            detail="Display order is already used by a visible slider",
        )
    slider = Slider(
        title_ar=slider_data.title_ar,
        title_en=slider_data.title_en,
        display_order=slider_data.display_order,
        is_active=slider_data.is_active,
        image=slider_data.image,
    )
    return crud.create(db, slider)


def get_sliders(db: Session):
    return crud.get_all(db, Slider)


def get_active_sliders(db: Session):
    return db.query(Slider).filter(Slider.is_active == True).all()


def get_slider(db: Session, slider_id: int):
    slider = crud.get_by_id(db, Slider, slider_id)
    if not slider:
        raise HTTPException(status_code=404, detail="Slider not found")
    return slider


def update_slider(db: Session, slider_id: int, slider_data: SliderCreate):
    slider = crud.get_by_id(db, Slider, slider_id)
    if not slider:
        raise HTTPException(status_code=404, detail="Slider not found")
    exist_slider = (
        db.query(Slider)
        .filter(
            Slider.id != slider_id,
            (
                (Slider.title_ar == slider_data.title_ar)
                | (Slider.title_en == slider_data.title_en)
            ),
        )
        .first()
    )
    if exist_slider:
        raise HTTPException(status_code=400, detail="Slider already exists")
    if slider_data.is_active and active_slider_uses_order(
        db, slider_data.display_order, slider_id
    ):
        raise HTTPException(
            status_code=400,
            detail="Display order is already used by a visible slider",
        )
    previous_image = slider.image
    updated_slider = crud.update_by_id(db, Slider, slider_id, slider_data.model_dump())
    cleanup_replaced_image(db, previous_image, updated_slider.image)
    return updated_slider


def delete_slider(db: Session, slider_id: int):
    slider = crud.delete_by_id(db, Slider, slider_id)
    if not slider:
        raise HTTPException(status_code=404, detail="Slider not found")
    return slider


def toggle_slider_status(db: Session, slider_id: int):
    slider = crud.get_by_id(db, Slider, slider_id)

    if not slider:
        raise HTTPException(status_code=404, detail="Slider not found")

    if not slider.is_active and active_slider_uses_order(db, slider.display_order, slider_id):
        raise HTTPException(
            status_code=400,
            detail="This slider cannot be shown because its display order is already used by a visible slider",
        )

    slider.is_active = not slider.is_active

    db.commit()

    db.refresh(slider)

    return slider


def upload_image(file: UploadFile):
    return save_slider_upload(file)
