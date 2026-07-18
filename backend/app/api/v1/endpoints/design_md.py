import os
import time
import re
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path

from app.core.database import get_db
from app.core.config import settings
from app.crud.crud_design_md import crud_design_md
from app.schemas.design_md import DesignMDResponse, DesignMDCreate
from app.models.design_md import DesignMD

router = APIRouter()

@router.get("", response_model=List[DesignMDResponse])
def get_design_mds(db: Session = Depends(get_db)):
    return crud_design_md.get_multi(db, limit=1000)

@router.post("", response_model=DesignMDResponse, status_code=201)
def create_design_md(
    item_in: DesignMDCreate,
    db: Session = Depends(get_db)
):
    if not item_in.title.strip() or not item_in.content.strip():
        raise HTTPException(status_code=400, detail="제목과 마크다운 내용을 모두 입력해 주세요.")
        
    # Clean the title to make a safe filename
    safe_title = re.sub(r'[^a-zA-Z0-9가-힣\s_-]', '', item_in.title).strip()
    safe_title = safe_title.replace(' ', '_')
    if not safe_title:
        safe_title = "unnamed"
        
    filename = f"{int(time.time() * 1000)}-{safe_title}.md"
    file_path = settings.DESIGN_MD_DIR / filename
    
    # Save the markdown content into a physical .md file (using utf-8)
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(item_in.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"마크다운 파일 생성 실패: {str(e)}")

    import uuid
    unique_id = str(uuid.uuid4().hex[:12])
    
    db_obj = DesignMD(
        id=unique_id,
        title=item_in.title,
        filename=filename,
        url=f"/DESIGN_MD/{filename}",
        description=item_in.description,
        content=item_in.content
    )
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    return db_obj

@router.delete("/{id}")
def delete_design_md(id: str, db: Session = Depends(get_db)):
    item = crud_design_md.get(db, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="해당 디자인 마크다운 문서를 찾을 수 없습니다.")
        
    # Delete the physical file
    file_path = settings.DESIGN_MD_DIR / item.filename
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Error removing design md file {file_path}: {e}")
            
    db.delete(item)
    db.commit()
    return {"message": "디자인 마크다운 파일이 성공적으로 삭제되었습니다."}
