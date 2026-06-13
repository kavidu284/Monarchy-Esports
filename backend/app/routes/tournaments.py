from fastapi import APIRouter, Depends
from app.database import get_connection
from app.dependencies.auth import get_current_admin

router = APIRouter()


def clean_datetime(value):
    if value == "" or value is None:
        return None

    value = str(value).replace("T", " ")

    if len(value) == 16:
        value = value + ":00"

    return value


def auto_show_registration(registration_start, registration_end):
    if registration_start and registration_end:
        return 1

    return 0


@router.get("/tournaments")
def get_tournaments():
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT *
        FROM tournaments
        ORDER BY created_at DESC
    """)

    tournaments = cursor.fetchall()

    cursor.close()
    connection.close()

    return tournaments


@router.get("/tournaments/{tournament_id}")
def get_tournament(tournament_id: int):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM tournaments
        WHERE id = %s
        """,
        (tournament_id,)
    )

    tournament = cursor.fetchone()

    cursor.close()
    connection.close()

    return tournament


@router.post("/tournaments")
def create_tournament(
    data: dict,
    current_admin: dict = Depends(get_current_admin)
):
    connection = get_connection()
    cursor = connection.cursor()

    registration_start = clean_datetime(
        data.get("registration_start")
    )

    registration_end = clean_datetime(
        data.get("registration_end")
    )

    tournament_start = clean_datetime(
        data.get("tournament_start")
    )

    tournament_end = clean_datetime(
        data.get("tournament_end")
    )

    show_registration = auto_show_registration(
        registration_start,
        registration_end
    )

    query = """
    INSERT INTO tournaments
    (
        title,
        subtitle,
        description,
        game_name,
        banner_image,
        rulebook_url,
        prize_pool,
        status,
        registration_start,
        registration_end,
        tournament_start,
        tournament_end,
        show_registration,
        max_teams,
        tournament_format
    )
    VALUES
    (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """

    values = (
        data.get("title"),
        data.get("subtitle"),
        data.get("description"),
        data.get("game_name", "Mobile Legends: Bang Bang"),
        data.get("banner_image"),
        data.get("rulebook_url"),
        data.get("prize_pool", 0),
        data.get("status", "Upcoming"),
        registration_start,
        registration_end,
        tournament_start,
        tournament_end,
        show_registration,
        data.get("max_teams", 64),
        data.get("tournament_format", "Bracket Only")
    )

    cursor.execute(query, values)

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Tournament Created Successfully"
    }


@router.delete("/tournaments/{tournament_id}")
def delete_tournament(
    tournament_id: int,
    current_admin: dict = Depends(get_current_admin)
):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM tournaments
        WHERE id=%s
        """,
        (tournament_id,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Tournament Deleted"
    }


@router.put("/tournaments/{tournament_id}")
def update_tournament(
    tournament_id: int,
    data: dict,
    current_admin: dict = Depends(get_current_admin)
):
    connection = get_connection()
    cursor = connection.cursor()

    registration_start = clean_datetime(
        data.get("registration_start")
    )

    registration_end = clean_datetime(
        data.get("registration_end")
    )

    tournament_start = clean_datetime(
        data.get("tournament_start")
    )

    tournament_end = clean_datetime(
        data.get("tournament_end")
    )

    show_registration = auto_show_registration(
        registration_start,
        registration_end
    )

    query = """
    UPDATE tournaments
    SET
        title=%s,
        subtitle=%s,
        description=%s,
        game_name=%s,
        banner_image=%s,
        rulebook_url=%s,
        prize_pool=%s,
        status=%s,
        registration_start=%s,
        registration_end=%s,
        tournament_start=%s,
        tournament_end=%s,
        show_registration=%s,
        max_teams=%s,
        tournament_format=%s
    WHERE id=%s
    """

    values = (
        data.get("title"),
        data.get("subtitle"),
        data.get("description"),
        data.get("game_name", "Mobile Legends: Bang Bang"),
        data.get("banner_image"),
        data.get("rulebook_url"),
        data.get("prize_pool", 0),
        data.get("status", "Upcoming"),
        registration_start,
        registration_end,
        tournament_start,
        tournament_end,
        show_registration,
        data.get("max_teams", 64),
        data.get("tournament_format", "Bracket Only"),
        tournament_id
    )

    cursor.execute(query, values)

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Tournament Updated"
    }


@router.get("/tournaments/{tournament_id}/matches")
def get_matches(tournament_id: int):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM matches
        WHERE tournament_id=%s
        ORDER BY match_date, match_time
        """,
        (tournament_id,)
    )

    matches = cursor.fetchall()

    cursor.close()
    connection.close()

    return matches