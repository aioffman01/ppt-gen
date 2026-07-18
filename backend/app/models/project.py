from sqlalchemy import Column, String, DateTime
from datetime import datetime
from app.core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    folder_name = Column(String)
    folder_path = Column(String)
    registered_at = Column(DateTime, default=datetime.utcnow)
