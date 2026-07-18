from sqlalchemy import Column, String, DateTime
from datetime import datetime
from app.core.database import Base

class Template(Base):
    __tablename__ = "templates"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    original_name = Column(String)
    filename = Column(String)
    url = Column(String)
    description = Column(String, nullable=True)
    registered_at = Column(DateTime, default=datetime.utcnow)
