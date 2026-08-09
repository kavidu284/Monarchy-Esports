from fastapi import Header, HTTPException
from app.auth import verify_token

def get_current_admin(
    authorization: str = Header(None)
):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated"
        )

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    payload = verify_token(token)


    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    return payload