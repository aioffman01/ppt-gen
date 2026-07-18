from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ProjectBase(BaseModel):
    title: str

class ProjectCreate(ProjectBase):
    font_ids: Optional[List[str]] = []
    template_ids: Optional[List[str]] = []
    design_md_ids: Optional[List[str]] = []
    reference_ids: Optional[List[str]] = []

class ProjectUpdate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: str
    folder_name: str
    folder_path: str
    registered_at: datetime

    class Config:
        from_attributes = True
