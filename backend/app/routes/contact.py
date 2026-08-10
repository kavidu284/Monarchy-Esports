from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.database import get_connection

router = APIRouter(tags=["messages"])


# Input validation models
class ContactInputSchema(BaseModel):
    name: str
    email: EmailStr
    subject: Optional[str] = "No Subject"
    message: str


class StatusUpdateSchema(BaseModel):
    status: str  # 'unread' | 'read' | 'archived'


# =========================================================
# PUBLIC: SUBMIT CONTACT FORM MESSAGE
# =========================================================
@router.post("/contact")
def send_message(payload: ContactInputSchema):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        query = """
        INSERT INTO contact_messages (name, email, subject, message, status)
        VALUES (%s, %s, %s, %s, 'unread')
        """
        values = (
            payload.name.strip(),
            payload.email.strip(),
            payload.subject.strip() if payload.subject else "No Subject",
            payload.message.strip(),
        )

        cursor.execute(query, values)
        connection.commit()

        return {"message": "Message Sent Successfully"}
    except Exception as err:
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit message: {str(err)}",
        )
    finally:
        cursor.close()
        connection.close()


# =========================================================
# OPEN: GET ALL MESSAGES (NO SECURITY)
# =========================================================
@router.get("/messages")
def get_messages():
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT *
            FROM contact_messages
            ORDER BY created_at DESC
            """
        )
        messages = cursor.fetchall()
        return messages
    finally:
        cursor.close()
        connection.close()


# =========================================================
# OPEN: GET SINGLE MESSAGE BY ID (NO SECURITY)
# =========================================================
@router.get("/messages/{message_id}")
def get_message(message_id: int):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT *
            FROM contact_messages
            WHERE id = %s
            """,
            (message_id,),
        )
        message = cursor.fetchone()

        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Message #{message_id} not found.",
            )

        return message
    finally:
        cursor.close()
        connection.close()


# =========================================================
# OPEN: UPDATE MESSAGE STATUS (NO SECURITY)
# =========================================================
@router.patch("/messages/{message_id}")
def update_message_status(message_id: int, payload: StatusUpdateSchema):
    if payload.status not in ["unread", "read", "archived"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status value. Use 'unread', 'read', or 'archived'.",
        )

    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            UPDATE contact_messages
            SET status = %s
            WHERE id = %s
            """,
            (payload.status, message_id),
        )
        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Message #{message_id} not found.",
            )

        return {"message": f"Message status updated to '{payload.status}'"}
    except HTTPException as http_err:
        connection.rollback()
        raise http_err
    except Exception as err:
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update status: {str(err)}",
        )
    finally:
        cursor.close()
        connection.close()


# =========================================================
# OPEN: DELETE MESSAGE (NO SECURITY)
# =========================================================
@router.delete("/messages/{message_id}")
def delete_message(message_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            DELETE FROM contact_messages
            WHERE id = %s
            """,
            (message_id,),
        )
        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Message #{message_id} not found.",
            )

        return {"message": "Message Deleted Successfully"}
    except HTTPException as http_err:
        connection.rollback()
        raise http_err
    except Exception as err:
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete message: {str(err)}",
        )
    finally:
        cursor.close()
        connection.close()