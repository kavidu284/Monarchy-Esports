from fastapi import APIRouter, Depends, HTTPException
from app.database import get_connection
from app.dependencies.auth import get_current_admin

router = APIRouter()


@router.get("/tournaments/{tournament_id}/round-robin-groups")
def get_round_robin_groups(tournament_id: int):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM round_robin_groups
        WHERE tournament_id=%s
        ORDER BY id ASC
        """,
        (tournament_id,)
    )

    groups = cursor.fetchall()

    for group in groups:
        cursor.execute(
            """
            SELECT *
            FROM round_robin_group_teams
            WHERE group_id=%s
            ORDER BY points DESC, won DESC, bp DESC, team_name ASC
            """,
            (group["id"],)
        )

        group["teams"] = cursor.fetchall()

    cursor.close()
    connection.close()

    return groups


@router.post("/tournaments/{tournament_id}/round-robin-groups")
def create_round_robin_group(
    tournament_id: int,
    data: dict,
    current_admin: dict = Depends(get_current_admin)
):
    group_name = data.get("group_name")

    if not group_name:
        raise HTTPException(
            status_code=400,
            detail="Group name is required"
        )

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO round_robin_groups
        (tournament_id, group_name)
        VALUES (%s,%s)
        """,
        (
            tournament_id,
            group_name
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Group Created Successfully"
    }


@router.delete("/round-robin-groups/{group_id}")
def delete_round_robin_group(
    group_id: int,
    current_admin: dict = Depends(get_current_admin)
):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM round_robin_groups
        WHERE id=%s
        """,
        (group_id,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Group Deleted Successfully"
    }


@router.post("/round-robin-groups/{group_id}/teams")
def add_team_to_group(
    group_id: int,
    data: dict,
    current_admin: dict = Depends(get_current_admin)
):
    registration_id = data.get("registration_id")

    if not registration_id:
        raise HTTPException(
            status_code=400,
            detail="Team is required"
        )

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT id, team_name
        FROM registrations
        WHERE id=%s
        AND status='Approved'
        """,
        (registration_id,)
    )

    team = cursor.fetchone()

    if not team:
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Approved team not found"
        )

    cursor.execute(
        """
        SELECT id
        FROM round_robin_group_teams
        WHERE group_id=%s
        AND registration_id=%s
        """,
        (
            group_id,
            registration_id
        )
    )

    existing_team = cursor.fetchone()

    if existing_team:
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=400,
            detail="Team already added to this group"
        )

    cursor.execute(
        """
        INSERT INTO round_robin_group_teams
        (
            group_id,
            registration_id,
            team_name,
            full_matches,
            played,
            won,
            lost,
            bp,
            points
        )
        VALUES
        (%s,%s,%s,0,0,0,0,0,0)
        """,
        (
            group_id,
            team["id"],
            team["team_name"]
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Team Added Successfully"
    }


@router.put("/round-robin-group-teams/{team_id}")
def update_group_team(
    team_id: int,
    data: dict,
    current_admin: dict = Depends(get_current_admin)
):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE round_robin_group_teams
        SET
            full_matches=%s,
            played=%s,
            won=%s,
            lost=%s,
            bp=%s,
            points=%s
        WHERE id=%s
        """,
        (
            data.get("full_matches", 0),
            data.get("played", 0),
            data.get("won", 0),
            data.get("lost", 0),
            data.get("bp", 0),
            data.get("points", 0),
            team_id
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Team Stats Updated Successfully"
    }


@router.delete("/round-robin-group-teams/{team_id}")
def delete_group_team(
    team_id: int,
    current_admin: dict = Depends(get_current_admin)
):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM round_robin_group_teams
        WHERE id=%s
        """,
        (team_id,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Team Removed Successfully"
    }