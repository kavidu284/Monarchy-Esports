from datetime import datetime
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext

from app.database import get_connection
from app.dependencies.auth import get_current_admin

router = APIRouter(prefix="/administration", tags=["administration"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ROLE_DEFINITIONS = {
    "super_admin": {
        "label": "Super Admin",
        "description": "Full system control and user management",
        "permissions": {
            "can_view_dashboard": True,
            "can_manage_users": True,
            "can_edit_tournaments": True,
            "can_create_tournaments": True,
            "can_delete_tournaments": True,
            "can_publish_results": True,
            "can_manage_gallery": True,
            "can_view_tournaments": True,
            "can_manage_matches": True,
        },
    },
    "full_access_staff": {
        "label": "Full Access Staff",
        "description": "All admin privileges enabled",
        "permissions": {
            "can_view_dashboard": True,
            "can_manage_users": False,
            "can_edit_tournaments": True,
            "can_create_tournaments": True,
            "can_delete_tournaments": True,
            "can_publish_results": True,
            "can_manage_gallery": True,
            "can_view_tournaments": True,
            "can_manage_matches": True,
        },
    },
    "tournament_editor": {
        "label": "Tournament Editor",
        "description": "Create and edit tournament details",
        "permissions": {
            "can_view_dashboard": True,
            "can_manage_users": False,
            "can_edit_tournaments": True,
            "can_create_tournaments": True,
            "can_delete_tournaments": False,
            "can_publish_results": False,
            "can_manage_gallery": False,
            "can_view_tournaments": True,
            "can_manage_matches": False,
        },
    },
    "tournament_viewer": {
        "label": "Tournament Viewer",
        "description": "Read-only access to tournament information",
        "permissions": {
            "can_view_dashboard": True,
            "can_manage_users": False,
            "can_edit_tournaments": False,
            "can_create_tournaments": False,
            "can_delete_tournaments": False,
            "can_publish_results": False,
            "can_manage_gallery": False,
            "can_view_tournaments": True,
            "can_manage_matches": False,
        },
    },
    "match_results_manager": {
        "label": "Match Results Manager",
        "description": "Publish or clear match outcomes",
        "permissions": {
            "can_view_dashboard": True,
            "can_manage_users": False,
            "can_edit_tournaments": False,
            "can_create_tournaments": False,
            "can_delete_tournaments": False,
            "can_publish_results": True,
            "can_manage_gallery": False,
            "can_view_tournaments": True,
            "can_manage_matches": True,
        },
    },
    "gallery_manager": {
        "label": "Gallery Manager",
        "description": "Manage gallery uploads and edits",
        "permissions": {
            "can_view_dashboard": True,
            "can_manage_users": False,
            "can_edit_tournaments": False,
            "can_create_tournaments": False,
            "can_delete_tournaments": False,
            "can_publish_results": False,
            "can_manage_gallery": True,
            "can_view_tournaments": True,
            "can_manage_matches": False,
        },
    },
}

PERMISSION_FIELDS = list(ROLE_DEFINITIONS["super_admin"]["permissions"].keys())


def get_permission_overview() -> Dict[str, Dict[str, Any]]:
    overview: Dict[str, Dict[str, Any]] = {}
    for role, definition in ROLE_DEFINITIONS.items():
        permissions = definition["permissions"].copy()
        overview[role] = {
            "label": definition["label"],
            "description": definition["description"],
            "permissions": permissions,
            **permissions,
        }
    return overview


def ensure_admin_schema(connection) -> None:
    cursor = connection.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS admin_security_events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT,
            username VARCHAR(100),
            event_type VARCHAR(100),
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    cursor.execute("SHOW COLUMNS FROM admins LIKE 'role'")
    if cursor.fetchone() is None:
        cursor.execute("ALTER TABLE admins ADD COLUMN role VARCHAR(50) DEFAULT 'full_access_staff'")

    cursor.execute("SHOW COLUMNS FROM admins LIKE 'email'")
    if cursor.fetchone() is None:
        cursor.execute("ALTER TABLE admins ADD COLUMN email VARCHAR(255) DEFAULT NULL")

    for column_name, default_value in [
        ("is_super_admin", "0"),
        ("can_delete_tournaments", "0"),
        ("can_edit_tournaments", "0"),
        ("can_create_tournaments", "0"),
        ("can_publish_results", "0"),
        ("can_manage_gallery", "0"),
        ("can_manage_matches", "0"),
        ("can_manage_users", "0"),
        ("can_view_dashboard", "1"),
        ("can_view_tournaments", "1"),
        ("last_login", "NULL"),
    ]:
        cursor.execute(f"SHOW COLUMNS FROM admins LIKE '{column_name}'")
        if cursor.fetchone() is None:
            cursor.execute(
                f"ALTER TABLE admins ADD COLUMN {column_name} BOOLEAN DEFAULT {default_value}"
            )

    connection.commit()
    cursor.close()


def normalize_role(role_name: Optional[str]) -> str:
    if not role_name:
        return "full_access_staff"
    normalized = str(role_name).strip().lower()
    return normalized if normalized in ROLE_DEFINITIONS else "full_access_staff"


def parse_permission_flags(admin: Dict[str, Any]) -> Dict[str, bool]:
    role_key = normalize_role(admin.get("role"))
    permission_map = ROLE_DEFINITIONS[role_key]["permissions"].copy()

    if bool(admin.get("is_super_admin")):
        for key in permission_map:
            permission_map[key] = True
        return permission_map

    for key in permission_map:
        value = admin.get(key)
        if value is not None:
            permission_map[key] = bool(value)

    return permission_map


def build_permission_columns(role_name: Optional[str], overrides: Optional[Dict[str, bool]] = None) -> Dict[str, Any]:
    normalized_role = normalize_role(role_name)
    base = ROLE_DEFINITIONS[normalized_role]["permissions"].copy()

    if overrides:
        for key, value in overrides.items():
            if key in base:
                base[key] = bool(value)

    if normalized_role == "super_admin":
        for key in base:
            base[key] = True

    result = {
        "role": normalized_role,
        "is_super_admin": normalized_role == "super_admin",
    }
    for field in PERMISSION_FIELDS:
        result[field] = bool(base.get(field, False))

    return result


def get_admin_record(connection, admin_id: Optional[int] = None, username: Optional[str] = None) -> Optional[Dict[str, Any]]:
    if admin_id is None and username is None:
        return None

    cursor = connection.cursor(dictionary=True)

    if admin_id is not None:
        cursor.execute("SELECT * FROM admins WHERE id = %s", (admin_id,))
    else:
        cursor.execute("SELECT * FROM admins WHERE username = %s", (username,))

    admin = cursor.fetchone()
    cursor.close()

    if admin:
        admin["permissions"] = parse_permission_flags(admin)
        admin["role_label"] = ROLE_DEFINITIONS[normalize_role(admin.get("role"))]["label"]

    return admin


def authenticate_admin(username: str, password: str) -> Optional[Dict[str, Any]]:
    connection = get_connection()
    ensure_admin_schema(connection)

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM admins WHERE username = %s", (username,))
    admin = cursor.fetchone()

    if not admin or not pwd_context.verify(password, admin["password_hash"]):
        cursor.close()
        connection.close()
        return None

    cursor.execute(
        "UPDATE admins SET last_login = %s WHERE id = %s",
        (datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"), admin["id"]),
    )
    connection.commit()

    cursor.close()
    connection.close()

    admin["permissions"] = parse_permission_flags(admin)
    admin["role_label"] = ROLE_DEFINITIONS[normalize_role(admin.get("role"))]["label"]
    return admin


def should_log_security_event(admin_record: Optional[Dict[str, Any]], event_type: str) -> bool:
    """Helper function imported by adminlogin.py to determine logging sensitivity."""
    if event_type == "login":
        return bool(admin_record and admin_record.get("is_super_admin"))
    return True


def log_security_event(admin_id: Optional[int], username: Optional[str], event_type: str, details: Optional[str] = None) -> None:
    connection = get_connection()
    ensure_admin_schema(connection)

    cursor = connection.cursor()
    cursor.execute(
        """
        INSERT INTO admin_security_events (admin_id, username, event_type, details)
        VALUES (%s, %s, %s, %s)
        """,
        (admin_id, username, event_type, details),
    )
    connection.commit()
    cursor.close()
    connection.close()


# ==================== ENDPOINTS ====================

@router.get("")
def get_admin_settings(current_admin: dict = Depends(get_current_admin)):
    connection = get_connection()
    ensure_admin_schema(connection)

    admin_id = current_admin.get("admin_id") or current_admin.get("id")
    current_record = get_admin_record(connection, admin_id=admin_id)
    if not current_record:
        connection.close()
        raise HTTPException(status_code=401, detail="Admin session invalid")

    can_manage = bool(current_record.get("is_super_admin")) or bool(current_record.get("permissions", {}).get("can_manage_users"))
    if not can_manage:
        connection.close()
        raise HTTPException(status_code=403, detail="Access restricted: User management permissions required")

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM admins ORDER BY created_at DESC")
    admins = cursor.fetchall()
    for admin in admins:
        admin["permissions"] = parse_permission_flags(admin)
        admin["role_label"] = ROLE_DEFINITIONS[normalize_role(admin.get("role"))]["label"]

    cursor.execute("SELECT * FROM admin_security_events ORDER BY created_at DESC LIMIT 50")
    events = cursor.fetchall()

    cursor.close()
    connection.close()

    return {
        "current_admin": {
            "id": current_record["id"],
            "username": current_record["username"],
            "role": current_record.get("role", "full_access_staff"),
            "permissions": current_record["permissions"],
            "is_super_admin": bool(current_record.get("is_super_admin")),
        },
        "roles": get_permission_overview(),
        "staff": admins,
        "security_events": events,
    }


@router.get("/staff")
def get_all_staff(current_admin: dict = Depends(get_current_admin)):
    connection = get_connection()
    ensure_admin_schema(connection)

    admin_id = current_admin.get("admin_id") or current_admin.get("id")
    current_record = get_admin_record(connection, admin_id=admin_id)

    can_manage = bool(current_record and (current_record.get("is_super_admin") or current_record.get("permissions", {}).get("can_manage_users")))
    if not can_manage:
        connection.close()
        raise HTTPException(status_code=403, detail="Access restricted: User management rights required")

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM admins ORDER BY id ASC")
    admins = cursor.fetchall()
    cursor.close()
    connection.close()

    for admin in admins:
        admin["permissions"] = parse_permission_flags(admin)
        admin["role_label"] = ROLE_DEFINITIONS[normalize_role(admin.get("role"))]["label"]
        admin["is_super_admin"] = bool(admin.get("is_super_admin"))

    return admins


@router.post("/staff")
def create_staff_account(payload: Dict[str, Any], current_admin: dict = Depends(get_current_admin)):
    connection = get_connection()
    ensure_admin_schema(connection)

    admin_id = current_admin.get("admin_id") or current_admin.get("id")
    current_record = get_admin_record(connection, admin_id=admin_id)

    can_manage = bool(current_record and (current_record.get("is_super_admin") or current_record.get("permissions", {}).get("can_manage_users")))
    if not can_manage:
        connection.close()
        raise HTTPException(status_code=403, detail="You lack authorization to create staff accounts")

    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""
    if not username or not password:
        connection.close()
        raise HTTPException(status_code=400, detail="Username and password are required")

    email = (payload.get("email") or "").strip() or None
    role_name = payload.get("role") or "full_access_staff"
    permission_overrides = payload.get("permissions") or {}
    permission_columns = build_permission_columns(role_name, permission_overrides)

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT id FROM admins WHERE username = %s", (username,))
    if cursor.fetchone():
        cursor.close()
        connection.close()
        raise HTTPException(status_code=409, detail="Username already exists")

    cursor.execute(
        """
        INSERT INTO admins (
            username, email, password_hash, role, is_super_admin,
            can_delete_tournaments, can_edit_tournaments, can_create_tournaments,
            can_publish_results, can_manage_gallery, can_manage_matches,
            can_manage_users, can_view_dashboard, can_view_tournaments, last_login
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            username, email, pwd_context.hash(password),
            permission_columns["role"], permission_columns["is_super_admin"],
            permission_columns["can_delete_tournaments"], permission_columns["can_edit_tournaments"],
            permission_columns["can_create_tournaments"], permission_columns["can_publish_results"],
            permission_columns["can_manage_gallery"], permission_columns["can_manage_matches"],
            permission_columns["can_manage_users"], permission_columns["can_view_dashboard"],
            permission_columns["can_view_tournaments"], None,
        ),
    )
    connection.commit()
    cursor.close()
    connection.close()

    log_security_event(current_record["id"], current_record.get("username"), "staff_created", f"Created staff account {username}")
    return {"success": True, "message": "Staff account created"}


def update_staff_logic(admin_id: int, payload: Dict[str, Any], current_admin: dict) -> Dict[str, Any]:
    connection = get_connection()
    ensure_admin_schema(connection)

    curr_id = current_admin.get("admin_id") or current_admin.get("id")
    current_record = get_admin_record(connection, admin_id=curr_id)

    can_manage = bool(current_record and (current_record.get("is_super_admin") or current_record.get("permissions", {}).get("can_manage_users")))
    if not can_manage:
        connection.close()
        raise HTTPException(status_code=403, detail="You lack authorization to modify user rights and passwords")

    role_name = payload.get("role")
    permission_overrides = payload.get("permissions") or {}
    permission_columns = build_permission_columns(role_name, permission_overrides)
    new_password = (payload.get("password") or "").strip()
    email = payload.get("email")

    cursor = connection.cursor()

    if email is not None:
        cursor.execute("UPDATE admins SET email = %s WHERE id = %s", (email.strip() if email else None, admin_id))

    if new_password:
        hashed_password = pwd_context.hash(new_password)
        cursor.execute(
            """
            UPDATE admins SET
                password_hash = %s, role = %s, is_super_admin = %s,
                can_delete_tournaments = %s, can_edit_tournaments = %s, can_create_tournaments = %s,
                can_publish_results = %s, can_manage_gallery = %s, can_manage_matches = %s,
                can_manage_users = %s, can_view_dashboard = %s, can_view_tournaments = %s
            WHERE id = %s
            """,
            (
                hashed_password, permission_columns["role"], permission_columns["is_super_admin"],
                permission_columns["can_delete_tournaments"], permission_columns["can_edit_tournaments"],
                permission_columns["can_create_tournaments"], permission_columns["can_publish_results"],
                permission_columns["can_manage_gallery"], permission_columns["can_manage_matches"],
                permission_columns["can_manage_users"], permission_columns["can_view_dashboard"],
                permission_columns["can_view_tournaments"], admin_id,
            ),
        )
    else:
        cursor.execute(
            """
            UPDATE admins SET
                role = %s, is_super_admin = %s,
                can_delete_tournaments = %s, can_edit_tournaments = %s, can_create_tournaments = %s,
                can_publish_results = %s, can_manage_gallery = %s, can_manage_matches = %s,
                can_manage_users = %s, can_view_dashboard = %s, can_view_tournaments = %s
            WHERE id = %s
            """,
            (
                permission_columns["role"], permission_columns["is_super_admin"],
                permission_columns["can_delete_tournaments"], permission_columns["can_edit_tournaments"],
                permission_columns["can_create_tournaments"], permission_columns["can_publish_results"],
                permission_columns["can_manage_gallery"], permission_columns["can_manage_matches"],
                permission_columns["can_manage_users"], permission_columns["can_view_dashboard"],
                permission_columns["can_view_tournaments"], admin_id,
            ),
        )

    connection.commit()
    cursor.close()
    connection.close()

    log_details = f"Updated rights for admin ID {admin_id}"
    if new_password:
        log_details += " (Password reset applied)"

    log_security_event(current_record["id"], current_record.get("username"), "staff_rights_updated", log_details)
    return {"success": True, "message": "Staff rights and details updated successfully"}


@router.patch("/staff/{admin_id}/permissions")
def update_staff_permissions(admin_id: int, payload: Dict[str, Any], current_admin: dict = Depends(get_current_admin)):
    return update_staff_logic(admin_id, payload, current_admin)


@router.patch("/staff/{admin_id}")
def update_staff_user(admin_id: int, payload: Dict[str, Any], current_admin: dict = Depends(get_current_admin)):
    return update_staff_logic(admin_id, payload, current_admin)


@router.delete("/staff/{admin_id}")
def delete_staff_account(admin_id: int, current_admin: dict = Depends(get_current_admin)):
    connection = get_connection()
    ensure_admin_schema(connection)

    curr_id = current_admin.get("admin_id") or current_admin.get("id")
    current_record = get_admin_record(connection, admin_id=curr_id)

    can_manage = bool(current_record and (current_record.get("is_super_admin") or current_record.get("permissions", {}).get("can_manage_users")))
    if not can_manage:
        connection.close()
        raise HTTPException(status_code=403, detail="You lack authorization to delete staff accounts")

    if curr_id == admin_id:
        connection.close()
        raise HTTPException(status_code=400, detail="You cannot delete your own account")

    cursor = connection.cursor()
    cursor.execute("DELETE FROM admins WHERE id = %s", (admin_id,))
    connection.commit()
    cursor.close()
    connection.close()

    log_security_event(current_record["id"], current_record.get("username"), "staff_deleted", f"Deleted admin account {admin_id}")
    return {"success": True, "message": "Staff account deleted"}


@router.post("/logout")
def logout_admin(current_admin: dict = Depends(get_current_admin)):
    admin_id = current_admin.get("admin_id") or current_admin.get("id")
    username = current_admin.get("username")
    log_security_event(admin_id, username, "staff_logout", f"Admin {username} logged out safely")
    return {"success": True, "message": "Logged out successfully"}


@router.post("/verify-credentials")
def verify_admin_credentials(payload: Dict[str, Any]):
    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")

    admin = authenticate_admin(username, password)
    if not admin:
        log_security_event(None, username, "credential_verification_failed", "Invalid credential pair used")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    authorized = bool(admin.get("is_super_admin")) or bool(admin.get("permissions", {}).get("can_delete_tournaments"))
    if not authorized:
        log_security_event(admin["id"], admin.get("username"), "credential_verification_denied", "Account lacks delete authorization")
        raise HTTPException(status_code=403, detail="Account is not authorized for deletion")

    log_security_event(admin["id"], admin.get("username"), "credential_verification_succeeded", "Re-authentication approved")

    return {
        "success": True,
        "authorized": True,
        "admin": {
            "id": admin["id"],
            "username": admin["username"],
            "role": admin.get("role", "full_access_staff"),
            "permissions": admin.get("permissions", {}),
            "is_super_admin": bool(admin.get("is_super_admin")),
        },
    }


@router.get("/security-events")
def get_security_events(current_admin: dict = Depends(get_current_admin)):
    connection = get_connection()
    ensure_admin_schema(connection)

    curr_id = current_admin.get("admin_id") or current_admin.get("id")
    current_record = get_admin_record(connection, admin_id=curr_id)
    if not current_record or not bool(current_record.get("is_super_admin")):
        connection.close()
        raise HTTPException(status_code=403, detail="Only super admins can view audit logs")

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM admin_security_events ORDER BY created_at DESC LIMIT 100")
    events = cursor.fetchall()
    cursor.close()
    connection.close()

    return {"security_events": events}