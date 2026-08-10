from typing import Callable
from fastapi import Header, HTTPException, status, Depends
from app.auth import verify_token

def get_current_admin(authorization: str = Header(None)) -> dict:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
        )

    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired or invalid",
        )

    return payload

def require_permission(permission_key: str) -> Callable:
    def permission_dependency(current_admin: dict = Depends(get_current_admin)) -> dict:
        if current_admin.get("is_super_admin"):
            return current_admin

        permissions = current_admin.get("permissions", {})
        if not permissions.get(permission_key):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Missing required permission: '{permission_key}'",
            )
        return current_admin

    return permission_dependency