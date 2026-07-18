from sqlalchemy import Column, String, DateTime
from datetime import datetime
from app.core.database import Base

class DesignMD(Base):
    __tablename__ = "design_md"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    filename = Column(String)
    url = Column(String)
    description = Column(String, nullable=True)
    content = Column(String) # Raw markdown text
    registered_at = Column(DateTime, default=datetime.utcnow)
