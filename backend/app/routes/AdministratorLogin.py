from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from passlib.context import CryptContext

from app.database import get_connection
from app.auth import create_access_token
from app.routes.administration import authenticate_admin, log_security_event

router = APIRouter(prefix="/administration", tags=["Administration Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class StaffLoginPayload(BaseModel):
    username: str
    password: str


@router.post("/login")
def staff_login(payload: StaffLoginPayload):
    username = payload.username.strip()
    password = payload.password

    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required.",
        )

    # Validate staff account credentials
    admin = authenticate_admin(username, password)

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid staff username or password.",
        )

    # Issue JWT Token with staff identity
    token = create_access_token(
        {
            "admin_id": admin["id"],
            "username": admin["username"],
            "sub": admin["username"],
            "role": admin.get("role", "full_access_staff"),
        }
    )

    # Log successful staff login event
    log_security_event(
        admin["id"],
        admin.get("username"),
        "staff_login",
        f"Staff member logged in with role: {admin.get('role_label', 'Staff')}",
    )

    return {
        "success": True,
        "access_token": token,
        "admin": {
            "id": admin["id"],
            "username": admin["username"],
            "role": admin.get("role", "full_access_staff"),
            "role_label": admin.get("role_label", "Full Access Staff"),
            "is_super_admin": bool(admin.get("is_super_admin")),
            "permissions": admin.get("permissions", {}),
        },
    }