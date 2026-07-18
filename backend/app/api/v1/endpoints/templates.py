import os
import shutil
import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pathlib import Path

from app.core.database import get_db
from app.core.config import settings
from app.crud.crud_template import crud_template
from app.schemas.template import TemplateResponse, TemplateCreate

router = APIRouter()

@router.get("", response_model=List[TemplateResponse])
def get_templates(db: Session = Depends(get_db)):
    return crud_template.get_multi(db, limit=1000)

@router.post("", response_model=TemplateResponse, status_code=201)
async def upload_template(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    original_name = file.filename
    ext = Path(original_name).suffix
    # Allow presentation/document extensions
    if ext.lower() not in ['.pptx', '.potx', '.ppt', '.pot', '.pdf']:
        raise HTTPException(status_code=400, detail="허용되지 않는 템플릿 파일 형식입니다. (.pptx, .potx, .ppt, .pdf 형식만 가능)")
        
    filename = f"{int(time.time() * 1000)}-{file.filename}"
    file_path = settings.TEMPLATE_DIR / filename
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"템플릿 파일 저장 실패: {str(e)}")

    template_in = TemplateCreate(
        id=str(int(time.time() * 1000)),
        title=title,
        description=description,
        original_name=original_name,
        filename=filename,
        url=f"/TEMPLATE/{filename}"
    )
    
    return crud_template.create(db, obj_in=template_in)

@router.delete("/{id}")
def delete_template(id: str, db: Session = Depends(get_db)):
    template = crud_template.get(db, id=id)
    if not template:
        raise HTTPException(status_code=404, detail="해당 템플릿을 찾을 수 없습니다.")
        
    # Delete the physical file
    file_path = settings.TEMPLATE_DIR / template.filename
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Error removing template file {file_path}: {e}")
            
    crud_template.remove(db, id=id)
    return {"message": "템플릿이 성공적으로 삭제되었습니다."}
