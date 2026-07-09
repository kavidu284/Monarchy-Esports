from fastapi import APIRouter, Depends, Form, File, UploadFile
from app.database import get_connection
from app.dependencies.auth import get_current_admin
from typing import Optional
from app.utils.cloudinary_upload import upload_image, upload_file

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
    title: str = Form(...),
    subtitle: str = Form(""),
    description: str = Form(""),
    game_name: str = Form("Mobile Legends: Bang Bang"),
    prize_pool: float = Form(0),
    status: str = Form("Upcoming"),
    registration_start: Optional[str] = Form(None),
    registration_end: Optional[str] = Form(None),
    tournament_start: Optional[str] = Form(None),
    tournament_end: Optional[str] = Form(None),
    max_teams: int = Form(64),
    tournament_format: str = Form("Bracket Only"),
    banner_image: Optional[UploadFile] = File(None),
    rulebook_file: Optional[UploadFile] = File(None),
    current_admin: dict = Depends(get_current_admin)
):
    connection = get_connection()
    cursor = connection.cursor()

    registration_start = clean_datetime(registration_start)
    registration_end = clean_datetime(registration_end)
    tournament_start = clean_datetime(tournament_start)
    tournament_end = clean_datetime(tournament_end)

    show_registration = auto_show_registration(
        registration_start,
        registration_end
    )
    banner_image_path = upload_image(
        banner_image,
        "monarchy_esports/tournament_banners"
    )

    rulebook_file_path = upload_file(
        rulebook_file,
        "monarchy_esports/rulebooks"
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
        title,
        subtitle,
        description,
        game_name,
        banner_image_path,
        rulebook_file_path,
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

    cursor.execute(query, values)

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Tournament Created Successfully",
        "banner_image": banner_image_path,
        "rulebook_url": rulebook_file_path
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
    title: str = Form(...),
    subtitle: str = Form(""),
    description: str = Form(""),
    game_name: str = Form("Mobile Legends: Bang Bang"),
    prize_pool: float = Form(0),
    status: str = Form("Upcoming"),
    registration_start: Optional[str] = Form(None),
    registration_end: Optional[str] = Form(None),
    tournament_start: Optional[str] = Form(None),
    tournament_end: Optional[str] = Form(None),
    max_teams: int = Form(64),
    tournament_format: str = Form("Bracket Only"),
    banner_image: Optional[str] = Form(None),
    banner_image_file: Optional[UploadFile] = File(None),
    rulebook_url: Optional[str] = Form(None),
    rulebook_file: Optional[UploadFile] = File(None),
    current_admin: dict = Depends(get_current_admin)
):
    connection = get_connection()
    cursor = connection.cursor()

    registration_start = clean_datetime(registration_start)

    registration_end = clean_datetime(registration_end)

    tournament_start = clean_datetime(tournament_start)

    tournament_end = clean_datetime(tournament_end)

    show_registration = auto_show_registration(
        registration_start,
        registration_end
    )

    if banner_image_file:
        banner_image = upload_image(
            banner_image_file,
            "monarchy_esports/tournament_banners"
        )

    if rulebook_file:
        rulebook_url = upload_file(
            rulebook_file,
            "monarchy_esports/rulebooks"
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
        tournament_format,
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