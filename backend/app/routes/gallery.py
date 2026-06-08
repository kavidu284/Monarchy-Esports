from fastapi import APIRouter
from app.database import get_connection

router = APIRouter()

@router.get("/gallery")
def get_gallery():

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT *
        FROM gallery
        ORDER BY uploaded_at DESC
    """)

    images = cursor.fetchall()

    cursor.close()
    connection.close()

    return images