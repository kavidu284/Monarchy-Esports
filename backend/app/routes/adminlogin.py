from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from passlib.context import CryptContext

from app.database import get_connection
from app.auth import create_access_token
from app.routes.administration import (
    ensure_admin_schema,
    log_security_event,
    should_log_security_event,
)

router = APIRouter()

INVALID_CREDENTIALS_MESSAGE = "Invalid Credentials"
SUPER_ADMIN_ONLY_MESSAGE = "Access Denied: Only Super Admins are authorized for this portal."

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class SuperAdminLoginRequest(BaseModel):
    username: str
    password: str


@router.post("/superAdmin/login")
def super_admin_login(data: SuperAdminLoginRequest):
    username = data.username.strip()
    password = data.password

    if not username or not password:
        return {
            "success": False,
            "message": "Username and password are required.",
        }

    connection = get_connection()
    ensure_admin_schema(connection)
    cursor = connection.cursor(dictionary=True)

    try:
        # Fetch account details
        cursor.execute(
            """
            SELECT *
            FROM admins
            WHERE username = %s
            """,
            (username,),
        )
        admin = cursor.fetchone()

        # 1. Check account existence
        if not admin:
            log_security_event(
                None,
                username,
                "login_failed",
                "Non-existent username used for Super Admin login attempt",
            )
            return {
                "success": False,
                "message": INVALID_CREDENTIALS_MESSAGE,
            }

        # 2. Verify password hash
        password_match = pwd_context.verify(password, admin["password_hash"])
        if not password_match:
            log_security_event(
                admin["id"],
                admin.get("username"),
                "login_failed",
                "Incorrect password entered during Super Admin login attempt",
            )
            return {
                "success": False,
                "message": INVALID_CREDENTIALS_MESSAGE,
            }

        # 3. STRICT GUARD: Reject non-super admin accounts
        if not bool(admin.get("is_super_admin")):
            log_security_event(
                admin["id"],
                admin.get("username"),
                "super_admin_login_denied",
                "Standard staff account attempted Super Admin console login",
            )
            return {
                "success": False,
                "message": SUPER_ADMIN_ONLY_MESSAGE,
            }

        # 4. Construct Super Admin permission flags
        permissions = {
            "can_delete_tournaments": True,
            "can_edit_tournaments": True,
            "can_create_tournaments": True,
            "can_publish_results": True,
            "can_manage_gallery": True,
            "can_manage_matches": True,
            "can_manage_users": True,
            "can_view_dashboard": True,
            "can_view_tournaments": True,
        }

        # 5. Update last_login timestamp
        update_cursor = connection.cursor()
        try:
            update_cursor.execute(
                "UPDATE admins SET last_login = %s WHERE id = %s",
                (datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"), admin["id"]),
            )
            connection.commit()
        finally:
            update_cursor.close()

        # 6. Record successful security event
        if should_log_security_event(admin, "login"):
            log_security_event(
                admin["id"],
                admin.get("username"),
                "super_admin_login_succeeded",
                "Super admin authenticated successfully",
            )

        # 7. Issue JWT token with claims
        token = create_access_token(
            {
                "admin_id": admin["id"],
                "username": admin["username"],
                "role": "super_admin",
                "is_super_admin": True,
                "permissions": permissions,
            }
        )

        return {
            "success": True,
            "access_token": token,
            "admin": {
                "id": admin["id"],
                "username": admin["username"],
                "role": "super_admin",
                "is_super_admin": True,
                "permissions": permissions,
            },
        }

    except Exception as err:
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Super admin authentication process failed: {str(err)}",
        )
    finally:
        cursor.close()
        connection.close()