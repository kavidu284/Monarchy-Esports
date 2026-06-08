from fastapi import APIRouter
from app.database import get_connection

router = APIRouter(prefix="/register")

@router.post("/register")
def register_team(data: dict):

    connection = get_connection()
    cursor = connection.cursor()

    registration_sql = """
    INSERT INTO registrations
    (
        tournament_id,
        team_name,
        team_logo,
        captain_name,
        captain_email,
        captain_phone,
        discord_username
    )
    VALUES
    (%s,%s,%s,%s,%s,%s,%s)
    """

    registration_values = (
        data["tournament_id"],
        data["team_name"],
        data["team_logo"],
        data["captain_name"],
        data["captain_email"],
        data["captain_phone"],
        data["discord_username"]
    )

    cursor.execute(
        registration_sql,
        registration_values
    )

    registration_id = cursor.lastrowid

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Registration Created",
        "registration_id": registration_id
    }
    
@router.get("")
def get_registrations():

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT *
        FROM registrations
        ORDER BY created_at DESC
    """)

    registrations = cursor.fetchall()

    cursor.close()
    connection.close()

    return registrations

@router.get("/{registration_id}")
def get_registration(
    registration_id: int
):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM registrations
        WHERE id=%s
        """,
        (registration_id,)
    )

    registration = cursor.fetchone()

    cursor.close()
    connection.close()

    return registration

@router.put("/{registration_id}/approve")
def approve_registration(
    registration_id: int
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE registrations
        SET status='Approved'
        WHERE id=%s
        """,
        (registration_id,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Team Approved"
    }
    
@router.put("/{registration_id}/reject")
def reject_registration(
    registration_id: int
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE registrations
        SET status='Rejected'
        WHERE id=%s
        """,
        (registration_id,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Team Rejected"
    }