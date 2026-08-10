from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

load_dotenv()

from app.routes.tournaments import router as tournament_router
from app.routes.announcements import router as announcements_router
from app.routes.registrations import router as registrations_router
from app.routes.contact import router as contact_router
from app.routes.gallery import router as gallery_router
from app.routes.adminlogin import router as super_admin_login_router
from app.routes.AdminDashboard import router as admin_dashboard_router
from app.routes.matches import router as matches_router
from app.routes.round_robin import router as round_robin_router
from app.routes.result import router as result_router
from app.routes.administration import router as administration_router
from app.routes.AdministratorLogin import router as admin_login_router



app = FastAPI()

# Create uploads folder if not exists
os.makedirs("uploads", exist_ok=True)

# Serve uploaded images/files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tournament_router)
app.include_router(announcements_router)
app.include_router(registrations_router)
app.include_router(contact_router)
app.include_router(gallery_router)
app.include_router(super_admin_login_router)
app.include_router(admin_dashboard_router)
app.include_router(matches_router)
app.include_router(round_robin_router)
app.include_router(result_router)
app.include_router(administration_router)
app.include_router(admin_login_router)


@app.get("/")
def root():
    return {
        "message": "Monarchy Esports API Running"
    }