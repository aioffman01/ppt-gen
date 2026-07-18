from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TemplateBase(BaseModel):
    title: str
    description: Optional[str] = None

class TemplateCreate(TemplateBase):
    id: str
    original_name: str
    filename: str
    url: str

class TemplateUpdate(TemplateBase):
    pass

class TemplateResponse(TemplateBase):
    id: str
    original_name: str
    filename: str
    url: str
    registered_at: datetime

    class Config:
        from_attributes = True
