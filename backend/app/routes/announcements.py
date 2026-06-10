from fastapi import APIRouter
from app.database import get_connection

router = APIRouter()


@router.get("/announcements")
def get_announcements():

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT *
        FROM announcements
        ORDER BY created_at DESC
    """)

    announcements = cursor.fetchall()

    cursor.close()
    connection.close()

    return announcements


@router.get("/announcements/{announcement_id}")
def get_announcement(announcement_id: int):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM announcements
        WHERE id = %s
        """,
        (announcement_id,)
    )

    announcement = cursor.fetchone()

    cursor.close()
    connection.close()

    return announcement

# CREATE ANNOUNCEMENT
@router.post("/announcements")
def create_announcement(data: dict):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO announcements
        (
            title,
            message
        )
        VALUES
        (%s,%s)
        """,
        (
            data["title"],
            data["message"]
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Announcement Created"
    }


# UPDATE ANNOUNCEMENT
@router.put("/announcements/{announcement_id}")
def update_announcement(
    announcement_id: int,
    data: dict
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE announcements
        SET
            title=%s,
            message=%s
        WHERE id=%s
        """,
        (
            data["title"],
            data["message"],
            announcement_id
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Announcement Updated"
    }


# DELETE ANNOUNCEMENT
@router.delete("/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: int
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM announcements
        WHERE id=%s
        """,
        (announcement_id,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Announcement Deleted"
    }
