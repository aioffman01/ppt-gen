from sqlalchemy import Column, String, DateTime
from datetime import datetime
from app.core.database import Base

class Font(Base):
    __tablename__ = "fonts"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    original_name = Column(String)
    filename = Column(String)
    url = Column(String)
    registered_at = Column(DateTime, default=datetime.utcnow)

class Reference(Base):
    __tablename__ = "references"

    id = Column(String, primary_key=True, index=True)
    type = Column(String, index=True) # 'color' or 'link'
    title = Column(String, index=True)
    content = Column(String) # hex colors or link URL
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
