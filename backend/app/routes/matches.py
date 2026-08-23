from fastapi import APIRouter, Depends
from app.database import get_connection
from app.dependencies.auth import get_current_admin

router = APIRouter()


@router.post("/tournaments/{tournament_id}/matches")
def create_match(
    tournament_id: int,
    data: dict,
    current_admin: dict = Depends(get_current_admin)
):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO matches
        (
            tournament_id,
            team1,
            team2,
            winner,
            match_date,
            match_time,
            status,
            stage,
            bracket_round,
            match_no
        )
        VALUES
        (%s,%s,%s,NULL,%s,%s,'Upcoming',%s,%s,%s)
        """,
        (
            tournament_id,
            data["team1"],
            data["team2"],
            data["match_date"],
            data["match_time"],
            data.get("stage", "Bracket"),
            data.get("bracket_round", "Round 1"),
            data.get("match_no")
        )
    )

    connection.commit()
    cursor.close()
    connection.close()

    return {"message": "Match Created Successfully"}


@router.get("/tournaments/{tournament_id}/matches")
def get_matches(tournament_id: int):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            id,
            tournament_id,
            team1,
            team2,
            winner,
            match_date,
            match_time,
            status,
            stage,
            bracket_round,
            match_no,
            created_at
        FROM matches
        WHERE tournament_id=%s
        ORDER BY match_no ASC, match_date ASC, match_time ASC
        """,
        (tournament_id,)
    )

    matches = cursor.fetchall()

    cursor.close()
    connection.close()

    return matches


@router.put("/matches/{match_id}/winner")
def update_winner(
    match_id: int,
    data: dict,
    current_admin: dict = Depends(get_current_admin)
):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE matches
        SET winner=%s,
            status='Completed'
        WHERE id=%s
        """,
        (
            data["winner"],
            match_id
        )
    )

    connection.commit()
    cursor.close()
    connection.close()

    return {"message": "Winner Updated"}

@router.delete("/matches/{match_id}")
def delete_match(
    match_id: int,
    current_admin: dict = Depends(get_current_admin)
):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM matches WHERE id=%s",
        (match_id,)
    )

    connection.commit()
    cursor.close()
    connection.close()

    return {"message": "Match Deleted Successfully"}

@router.put("/matches/{match_id}")
def update_match(
    match_id: int,
    data: dict,
    current_admin: dict = Depends(get_current_admin)
):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE matches
        SET team1 = %s,
            team2 = %s,
            match_date = %s,
            match_time = %s,
            stage = %s,
            bracket_round = %s,
            match_no = %s
        WHERE id = %s
        """,
        (
            data["team1"],
            data["team2"],
            data["match_date"],
            data["match_time"],
            data.get("stage", "Bracket"),
            data.get("bracket_round", "Round 1"),
            data.get("match_no"),
            match_id
        )
    )

    connection.commit()
    cursor.close()
    connection.close()

    return {"message": "Match Updated Successfully"}