
from fastapi import APIRouter, UploadFile, File, Form
from app.database import get_connection
from fastapi import Depends
from app.dependencies.auth import get_current_admin
from app.utils.cloudinary_upload import upload_image

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


@router.post("/gallery")
async def create_gallery_image(
    tournament_id: int = Form(None),
    caption: str = Form(""),
    image: UploadFile = File(...),
    current_admin: dict = Depends(get_current_admin)
):

    image_url = upload_image(
        image,
        "monarchy_esports/gallery"
    )    
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO gallery
        (
            tournament_id,
            image_url,
            caption
        )
        VALUES
        (%s,%s,%s)
        """,
        (
            tournament_id,
            image_url,
            caption
        )
    )

    connection.commit()

    image_id = cursor.lastrowid

    cursor.close()
    connection.close()

    return {
        "message": "Image Uploaded",
        "id": image_id
    }


@router.delete("/gallery/{image_id}")
def delete_gallery_image(image_id: int, current_admin: dict = Depends(get_current_admin)):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM gallery WHERE id=%s",
        (image_id,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Image Deleted"
    }
