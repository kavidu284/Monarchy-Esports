from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.tournaments import router as tournament_router
from app.routes.announcements import router as announcements_router
from app.routes.registrations import router as registrations_router
from app.routes.contact import router as contact_router
from app.routes.gallery import router as gallery_router

app = FastAPI()

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

@app.get("/")
def root():
    return {
        "message": "Monarchy Esports API Running"
    }