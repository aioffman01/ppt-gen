from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Font Schemas
class FontBase(BaseModel):
    title: str

class FontCreate(FontBase):
    id: str
    original_name: str
    filename: str
    url: str

class FontUpdate(FontBase):
    pass

class FontResponse(FontBase):
    id: str
    original_name: str
    filename: str
    url: str
    registered_at: datetime

    class Config:
        from_attributes = True


# Reference Schemas
class ReferenceBase(BaseModel):
    type: str  # 'color' or 'link'
    title: str
    content: str
    description: Optional[str] = None

class ReferenceCreate(ReferenceBase):
    pass

class ReferenceUpdate(ReferenceBase):
    pass

class ReferenceResponse(ReferenceBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
