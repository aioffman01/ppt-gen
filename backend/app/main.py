import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.api import router as api_router

# Create SQLite tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In dev, allow all. In prod, restrict.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static folders
os.makedirs(settings.FONT_DIR, exist_ok=True)
os.makedirs(settings.TEMPLATE_DIR, exist_ok=True)
os.makedirs(settings.DESIGN_MD_DIR, exist_ok=True)
app.mount("/FONT", StaticFiles(directory=str(settings.FONT_DIR)), name="FONT")
app.mount("/TEMPLATE", StaticFiles(directory=str(settings.TEMPLATE_DIR)), name="TEMPLATE")
app.mount("/DESIGN_MD", StaticFiles(directory=str(settings.DESIGN_MD_DIR)), name="DESIGN_MD")



# Include v1 API endpoints
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to PPT Reference Vault API"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
