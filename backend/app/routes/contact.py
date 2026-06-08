from fastapi import APIRouter
from app.database import get_connection

router = APIRouter()

@router.post("/contact")
def send_message(data: dict):

    connection = get_connection()
    cursor = connection.cursor()

    query = """
    INSERT INTO contact_messages
    (
        name,
        email,
        subject,
        message
    )
    VALUES
    (%s,%s,%s,%s)
    """

    values = (
        data["name"],
        data["email"],
        data["subject"],
        data["message"]
    )

    cursor.execute(query, values)

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Message Sent Successfully"
    }
    
@router.get("/messages")
def get_messages():

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT *
        FROM contact_messages
        ORDER BY created_at DESC
    """)

    messages = cursor.fetchall()

    cursor.close()
    connection.close()

    return messages