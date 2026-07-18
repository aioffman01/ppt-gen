import os
import shutil
import time
import json
import re
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path

from app.core.database import get_db
from app.core.config import settings
from app.crud.crud_project import crud_project
from app.crud.crud_items import crud_font, crud_reference
from app.crud.crud_template import crud_template
from app.crud.crud_design_md import crud_design_md
from app.schemas.project import ProjectResponse, ProjectCreate
from app.models.project import Project

router = APIRouter()

@router.get("", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return crud_project.get_multi(db, limit=1000)

@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db)
):
    if not project_in.title.strip():
        raise HTTPException(status_code=400, detail="프로젝트 제목을 입력해 주세요.")

    # 1. Clean the title to make a safe folder name
    safe_title = re.sub(r'[^a-zA-Z0-9가-힣\s_-]', '', project_in.title).strip()
    safe_title = safe_title.replace(' ', '_')
    if not safe_title:
        safe_title = "project"
        
    timestamp = int(time.time() * 1000)
    folder_name = f"{safe_title}_{timestamp}"
    project_dir = settings.PROJECTS_DIR / folder_name
    
    # 2. Create target subdirectories
    fonts_dir = project_dir / "fonts"
    templates_dir = project_dir / "templates"
    design_md_dir = project_dir / "design_md"
    
    try:
        os.makedirs(project_dir, exist_ok=True)
        os.makedirs(fonts_dir, exist_ok=True)
        os.makedirs(templates_dir, exist_ok=True)
        os.makedirs(design_md_dir, exist_ok=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"프로젝트 디렉토리 생성 실패: {str(e)}")

    # Metadata assembly structures
    meta_fonts = []
    meta_templates = []
    meta_design_mds = []
    meta_references = []

    # 3. Copy Font Files
    for fid in project_in.font_ids:
        font = crud_font.get(db, id=fid)
        if font:
            src = settings.FONT_DIR / font.filename
            dst = fonts_dir / font.original_name
            if os.path.exists(src):
                try:
                    shutil.copy(src, dst)
                    meta_fonts.append({
                        "id": font.id,
                        "title": font.title,
                        "original_name": font.original_name,
                        "copied_path": f"fonts/{font.original_name}"
                    })
                except Exception as e:
                    print(f"Error copying font {font.filename}: {e}")

    # 4. Copy Template Files
    for tid in project_in.template_ids:
        tmpl = crud_template.get(db, id=tid)
        if tmpl:
            src = settings.TEMPLATE_DIR / tmpl.filename
            dst = templates_dir / tmpl.original_name
            if os.path.exists(src):
                try:
                    shutil.copy(src, dst)
                    meta_templates.append({
                        "id": tmpl.id,
                        "title": tmpl.title,
                        "original_name": tmpl.original_name,
                        "copied_path": f"templates/{tmpl.original_name}",
                        "description": tmpl.description
                    })
                except Exception as e:
                    print(f"Error copying template {tmpl.filename}: {e}")

    # 5. Copy Design MD Files
    for dmid in project_in.design_md_ids:
        dmd = crud_design_md.get(db, id=dmid)
        if dmd:
            src = settings.DESIGN_MD_DIR / dmd.filename
            dst = design_md_dir / dmd.filename # keep unique filename or use title.md
            if os.path.exists(src):
                try:
                    shutil.copy(src, dst)
                    meta_design_mds.append({
                        "id": dmd.id,
                        "title": dmd.title,
                        "filename": dmd.filename,
                        "copied_path": f"design_md/{dmd.filename}",
                        "content": dmd.content,
                        "description": dmd.description
                    })
                except Exception as e:
                    print(f"Error copying design md {dmd.filename}: {e}")

    # 6. Gather General References (Links, etc. - no physical files, just metadata)
    for ref_id in project_in.reference_ids:
        ref = crud_reference.get(db, id=ref_id)
        if ref:
            meta_references.append({
                "id": ref.id,
                "type": ref.type,
                "title": ref.title,
                "content": ref.content,
                "description": ref.description
            })

    # 7. Write project_metadata.json
    metadata = {
        "project_id": str(timestamp),
        "project_title": project_in.title,
        "created_at": time.strftime('%Y-%m-%d %H:%M:%S', time.localtime()),
        "fonts": meta_fonts,
        "templates": meta_templates,
        "design_mds": meta_design_mds,
        "references": meta_references
    }
    
    try:
        with open(project_dir / "project_metadata.json", "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"메타데이터 파일 생성 실패: {str(e)}")

    # 8. Save Project entry to DB
    import uuid
    unique_id = str(uuid.uuid4().hex[:12])
    db_obj = Project(
        id=unique_id,
        title=project_in.title,
        folder_name=folder_name,
        folder_path=str(project_dir).replace('\\', '/')
    )
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    return db_obj

@router.delete("/{id}")
def delete_project(id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="해당 프로젝트를 찾을 수 없습니다.")
        
    # Delete the physical project directory
    project_dir = Path(project.folder_path)
    if project_dir.exists() and project_dir.is_dir():
        try:
            shutil.rmtree(project_dir)
        except Exception as e:
            print(f"Error removing project folder {project_dir}: {e}")
            
    db.delete(project)
    db.commit()
    return {"message": "프로젝트가 성공적으로 삭제되었습니다."}
