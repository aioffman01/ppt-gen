from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DesignMDBase(BaseModel):
    title: str
    description: Optional[str] = None
    content: str

class DesignMDCreate(DesignMDBase):
    pass

class DesignMDUpdate(DesignMDBase):
    pass

class DesignMDResponse(DesignMDBase):
    id: str
    filename: str
    url: str
    registered_at: datetime

    class Config:
        from_attributes = True
