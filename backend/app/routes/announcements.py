from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile
)

from app.database import get_connection
from app.dependencies.auth import get_current_admin
from app.utils.cloudinary_upload import upload_image

router = APIRouter()


@router.get("/announcements")
def get_announcements():

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT *
            FROM announcements
            ORDER BY created_at DESC
            """
        )

        return cursor.fetchall()

    finally:
        cursor.close()
        connection.close()


@router.get("/announcements/{announcement_id}")
def get_announcement(announcement_id: int):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT *
            FROM announcements
            WHERE id = %s
            """,
            (announcement_id,)
        )

        announcement = cursor.fetchone()

        if not announcement:
            raise HTTPException(
                status_code=404,
                detail="Announcement not found"
            )

        return announcement

    finally:
        cursor.close()
        connection.close()


@router.post("/announcements")
def create_announcement(
    title: str = Form(...),
    message: str = Form(...),
    image: Optional[UploadFile] = File(None),
    current_admin: dict = Depends(get_current_admin)
):

    connection = None
    cursor = None

    try:
        image_url = None

        if image and image.filename:
            image_url = upload_image(
                image,
                "monarchy_esports/announcements"
            )

        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO announcements
            (
                title,
                message,
                image_url
            )
            VALUES
            (%s, %s, %s)
            """,
            (
                title,
                message,
                image_url
            )
        )

        connection.commit()

        return {
            "message": "Announcement Created",
            "announcement_id": cursor.lastrowid,
            "image_url": image_url
        }

    except Exception as error:

        if connection:
            connection.rollback()

        print("Create Announcement Error:", error)

        raise HTTPException(
            status_code=500,
            detail="Failed to create announcement"
        )

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


@router.put("/announcements/{announcement_id}")
def update_announcement(
    announcement_id: int,
    title: str = Form(...),
    message: str = Form(...),
    existing_image_url: str = Form(""),
    image: Optional[UploadFile] = File(None),
    current_admin: dict = Depends(get_current_admin)
):

    connection = None
    cursor = None

    try:
        image_url = existing_image_url or None

        if image and image.filename:
            image_url = upload_image(
                image,
                "monarchy_esports/announcements"
            )

        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE announcements
            SET
                title = %s,
                message = %s,
                image_url = %s
            WHERE id = %s
            """,
            (
                title,
                message,
                image_url,
                announcement_id
            )
        )

        if cursor.rowcount == 0:
            connection.rollback()

            raise HTTPException(
                status_code=404,
                detail="Announcement not found"
            )

        connection.commit()

        return {
            "message": "Announcement Updated",
            "image_url": image_url
        }

    except HTTPException:
        raise

    except Exception as error:

        if connection:
            connection.rollback()

        print("Update Announcement Error:", error)

        raise HTTPException(
            status_code=500,
            detail="Failed to update announcement"
        )

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


@router.delete("/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    current_admin: dict = Depends(get_current_admin)
):

    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            DELETE FROM announcements
            WHERE id = %s
            """,
            (announcement_id,)
        )

        if cursor.rowcount == 0:
            connection.rollback()

            raise HTTPException(
                status_code=404,
                detail="Announcement not found"
            )

        connection.commit()

        return {
            "message": "Announcement Deleted"
        }

    finally:
        cursor.close()
        connection.close()