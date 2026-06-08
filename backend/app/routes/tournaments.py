from fastapi import APIRouter
from app.database import get_connection

router = APIRouter()

@router.get("/tournaments")
def get_tournaments():

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM tournaments")

    tournaments = cursor.fetchall()

    cursor.close()
    connection.close()

    return tournaments


@router.get("/tournaments/{tournament_id}")
def get_tournament(tournament_id: int):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM tournaments WHERE id = %s",
        (tournament_id,)
    )

    tournament = cursor.fetchone()

    cursor.close()
    connection.close()

    return tournament