from fastapi import APIRouter
from passlib.context import CryptContext
from app.database import get_connection
from app.auth import create_access_token

router = APIRouter()

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


@router.post("/login")
def admin_login(data: dict):
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {
            "success": False,
            "message": "Username and password required"
        }

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM admins
        WHERE username=%s
        """,
        (username,)
    )

    admin = cursor.fetchone()

    cursor.close()
    connection.close()

    if not admin:
        return {
            "success": False,
            "message": "Invalid Credentials"
        }

    password_match = pwd_context.verify(
        password,
        admin["password_hash"]
    )

    if not password_match:
        return {
            "success": False,
            "message": "Invalid Credentials"
        }

    token = create_access_token(
        {
            "admin_id": admin["id"],
            "username": admin["username"]
        }
    )

    return {
        "success": True,
        "access_token": token,
        "admin": {
            "id": admin["id"],
            "username": admin["username"]
        }
    }