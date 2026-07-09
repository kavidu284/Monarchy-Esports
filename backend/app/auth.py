from jose import jwt, JWTError
from datetime import datetime, timedelta

ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(hours=12)

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
def verify_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except Exception as e:
        return None