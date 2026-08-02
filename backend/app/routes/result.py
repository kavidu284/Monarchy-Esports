from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    status,
)

from app.database import get_connection
from app.dependencies.auth import get_current_admin
from app.utils.cloudinary_upload import upload_image

router = APIRouter(
    prefix="/tournaments",
    tags=["Tournament Results"],
)


# =======================================================
# GET SINGLE TOURNAMENT RESULTS
# =======================================================
@router.get("/{tournament_id}/results")
def get_tournament_results(tournament_id: int):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            id,
            title,
            game_name,
            banner_image,
            status,
            champion_team,
            runner_up_team,
            third_place_team,
            champion_logo,
            runner_up_logo,
            third_place_logo,
            created_at
        FROM tournaments
        WHERE id = %s
        """,
        (tournament_id,),
    )

    tournament = cursor.fetchone()

    cursor.close()
    connection.close()

    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found",
        )

    return tournament


# =======================================================
# GET ALL COMPLETED TOURNAMENT RESULTS
# =======================================================
@router.get("/results")
def get_completed_tournaments():
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            id,
            title,
            game_name,
            banner_image,
            champion_team,
            runner_up_team,
            third_place_team,
            champion_logo,
            runner_up_logo,
            third_place_logo,
            status,
            created_at
        FROM tournaments
        WHERE status='Completed'
        ORDER BY created_at DESC
        """
    )

    tournaments = cursor.fetchall()

    cursor.close()
    connection.close()

    return tournaments


# =======================================================
# CREATE / UPDATE TOURNAMENT RESULTS
# =======================================================
@router.post("/{tournament_id}/results")
async def create_or_update_results(
    tournament_id: int,
    champion_team: str = Form(...),
    runner_up_team: Optional[str] = Form(None),
    third_place_team: Optional[str] = Form(None),
    champion_logo: Optional[UploadFile] = File(None),
    runner_up_logo: Optional[UploadFile] = File(None),
    third_place_logo: Optional[UploadFile] = File(None),
    current_admin: dict = Depends(get_current_admin),
):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            champion_logo,
            runner_up_logo,
            third_place_logo
        FROM tournaments
        WHERE id=%s
        """,
        (tournament_id,),
    )

    existing = cursor.fetchone()

    if not existing:
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found",
        )

    champion_logo_url = (
        upload_image(champion_logo)
        if champion_logo
        else existing["champion_logo"]
    )

    runner_logo_url = (
        upload_image(runner_up_logo)
        if runner_up_logo
        else existing["runner_up_logo"]
    )

    third_logo_url = (
        upload_image(third_place_logo)
        if third_place_logo
        else existing["third_place_logo"]
    )

    cursor.execute(
        """
        UPDATE tournaments
        SET
            champion_team=%s,
            runner_up_team=%s,
            third_place_team=%s,
            champion_logo=%s,
            runner_up_logo=%s,
            third_place_logo=%s,
            status='Completed'
        WHERE id=%s
        """,
        (
            champion_team,
            runner_up_team,
            third_place_team,
            champion_logo_url,
            runner_logo_url,
            third_logo_url,
            tournament_id,
        ),
    )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Tournament results published successfully!",
        "tournament_id": tournament_id,
        "status": "Completed",
    }


# =======================================================
# DELETE TOURNAMENT RESULTS
# =======================================================
@router.delete("/{tournament_id}/results")
def delete_results(
    tournament_id: int,
    current_admin: dict = Depends(get_current_admin),
):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        "SELECT id FROM tournaments WHERE id=%s",
        (tournament_id,),
    )

    if not cursor.fetchone():
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found",
        )

    cursor.execute(
        """
        UPDATE tournaments
        SET
            champion_team=NULL,
            runner_up_team=NULL,
            third_place_team=NULL,
            champion_logo=NULL,
            runner_up_logo=NULL,
            third_place_logo=NULL,
            status='Upcoming'
        WHERE id=%s
        """,
        (tournament_id,),
    )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Tournament results cleared successfully!",
        "tournament_id": tournament_id,
        "status": "Upcoming",
    }