import re
import os
import shutil
import time
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pathlib import Path

from app.core.database import get_db
from app.core.config import settings
from app.crud.crud_items import crud_font, crud_reference
from app.schemas.schemas import FontResponse, FontCreate, ReferenceResponse, ReferenceCreate
from app.models.models import Font, Reference

from app.api.v1.endpoints.templates import router as templates_router
from app.api.v1.endpoints.design_md import router as design_md_router
from app.api.v1.endpoints.projects import router as projects_router

router = APIRouter()

router.include_router(templates_router, prefix="/templates", tags=["templates"])
router.include_router(design_md_router, prefix="/design-md", tags=["design-md"])
router.include_router(projects_router, prefix="/projects", tags=["projects"])




# --- Font Routes ---

@router.get("/fonts", response_model=List[FontResponse])
def get_fonts(db: Session = Depends(get_db)):
    return crud_font.get_multi(db, limit=1000)

@router.post("/fonts", response_model=FontResponse, status_code=201)
async def upload_font(
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    original_name = file.filename
    ext = Path(original_name).suffix
    # Validate font extension
    if ext.lower() not in ['.ttf', '.otf', '.woff', '.woff2']:
        raise HTTPException(status_code=400, detail="허용되지 않는 폰트 파일 형식입니다. (.ttf, .otf, .woff, .woff2 형식만 가능)")
        
    # Unique file name to prevent collision
    filename = f"{int(time.time() * 1000)}-{file.filename}"
    file_path = settings.FONT_DIR / filename
    
    # Save file to physical /FONT directory
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"파일 저장 실패: {str(e)}")

    font_in = FontCreate(
        id=str(int(time.time() * 1000)),
        title=title,
        original_name=original_name,
        filename=filename,
        url=f"/FONT/{filename}"
    )
    
    # Save to database
    db_obj = crud_font.create(db, obj_in=font_in)
    return db_obj


@router.delete("/fonts/{id}")
def delete_font(id: str, db: Session = Depends(get_db)):
    font = crud_font.get(db, id=id)
    if not font:
        raise HTTPException(status_code=404, detail="해당 폰트를 찾을 수 없습니다.")
        
    # Delete the physical file
    file_path = settings.FONT_DIR / font.filename
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Error removing file {file_path}: {e}")
            
    # Delete from database
    crud_font.remove(db, id=id)
    return {"message": "폰트가 성공적으로 삭제되었습니다."}


# --- Reference Routes ---

@router.get("/references", response_model=List[ReferenceResponse])
def get_references(db: Session = Depends(get_db)):
    return crud_reference.get_multi(db, limit=1000)

@router.post("/references", response_model=ReferenceResponse, status_code=201)
def create_reference(
    ref_in: ReferenceCreate,
    db: Session = Depends(get_db)
):
    # Additional validation if needed
    if ref_in.type not in ['color', 'link']:
        raise HTTPException(status_code=400, detail="유형은 'color' 또는 'link' 여야 합니다.")
        
    import uuid
    # Create unique string ID
    unique_id = str(uuid.uuid4().hex[:12])
    
    # Custom create call since schema is different from model definition
    from fastapi.encoders import jsonable_encoder
    obj_in_data = jsonable_encoder(ref_in)
    db_obj = Reference(id=unique_id, **obj_in_data)
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    return db_obj

@router.delete("/references/{id}")
def delete_reference(id: str, db: Session = Depends(get_db)):
    ref = crud_reference.get(db, id=id)
    if not ref:
        raise HTTPException(status_code=404, detail="해당 자료를 찾을 수 없습니다.")
        
    db.delete(ref)
    db.commit()
    return {"message": "자료가 성공적으로 삭제되었습니다."}
