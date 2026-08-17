import random

from fastapi import APIRouter, Depends, HTTPException
from app.database import get_connection
from app.dependencies.auth import get_current_admin


router = APIRouter(
    prefix="/team-shuffle",
    tags=["Team Shuffle"]
)


# =========================================================
# CHECK SUPER ADMIN
# =========================================================

def require_super_admin(current_admin: dict = Depends(get_current_admin)):
    role = str(
        current_admin.get("role")
        or current_admin.get("user_role")
        or ""
    ).lower()

    if role not in ["super_admin", "superadmin", "super admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only Super Admin can manage team shuffle."
        )

    return current_admin


# =========================================================
# GET APPROVED TEAMS
# =========================================================

@router.get("/{tournament_id}/approved-teams")
def get_approved_teams(
    tournament_id: int,
    current_admin: dict = Depends(require_super_admin)
):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT
                id,
                team_name,
                team_logo,
                clan_name,
                captain_name
            FROM registrations
            WHERE tournament_id = %s
              AND status = 'Approved'
            ORDER BY team_name ASC
            """,
            (tournament_id,)
        )

        teams = cursor.fetchall()

        return {
            "tournament_id": tournament_id,
            "total_teams": len(teams),
            "teams": teams
        }

    finally:
        cursor.close()
        connection.close()


# =========================================================
# SHUFFLE TEAMS
# =========================================================

@router.post("/{tournament_id}/shuffle")
def shuffle_teams(
    tournament_id: int,
    group_count: int,
    teams_per_group: int,
    current_admin: dict = Depends(require_super_admin)
):
    if group_count <= 0:
        raise HTTPException(
            status_code=400,
            detail="Group count must be greater than 0."
        )

    if teams_per_group <= 0:
        raise HTTPException(
            status_code=400,
            detail="Teams per group must be greater than 0."
        )

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # -------------------------------------------------
        # GET APPROVED TEAMS
        # -------------------------------------------------

        cursor.execute(
            """
            SELECT
                id,
                team_name,
                team_logo,
                clan_name
            FROM registrations
            WHERE tournament_id = %s
              AND status = 'Approved'
            ORDER BY team_name ASC
            """,
            (tournament_id,)
        )

        teams = cursor.fetchall()

        total_teams = len(teams)
        required_teams = group_count * teams_per_group

        if total_teams == 0:
            raise HTTPException(
                status_code=400,
                detail="No approved teams found for this tournament."
            )

        if total_teams != required_teams:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"You have {total_teams} approved teams, "
                    f"but {group_count} groups × "
                    f"{teams_per_group} teams requires "
                    f"{required_teams} teams."
                )
            )

        # -------------------------------------------------
        # RANDOM SHUFFLE
        # -------------------------------------------------

        random.shuffle(teams)

        groups = []

        for group_index in range(group_count):
            start = group_index * teams_per_group
            end = start + teams_per_group

            group_letter = chr(65 + group_index)

            groups.append({
                "group_name": f"Group {group_letter}",
                "teams": teams[start:end]
            })

        return {
            "tournament_id": tournament_id,
            "total_teams": total_teams,
            "group_count": group_count,
            "teams_per_group": teams_per_group,
            "groups": groups
        }

    finally:
        cursor.close()
        connection.close()


# =========================================================
# SAVE GROUPS
# =========================================================

@router.post("/{tournament_id}/save")
def save_groups(
    tournament_id: int,
    groups: list[dict],
    current_admin: dict = Depends(require_super_admin)
):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        # -------------------------------------------------
        # CHECK TOURNAMENT
        # -------------------------------------------------

        cursor.execute(
            """
            SELECT id
            FROM tournaments
            WHERE id = %s
            """,
            (tournament_id,)
        )

        tournament = cursor.fetchone()

        if not tournament:
            raise HTTPException(
                status_code=404,
                detail="Tournament not found."
            )

        # -------------------------------------------------
        # DELETE EXISTING GROUPS
        # -------------------------------------------------

        cursor.execute(
            """
            DELETE FROM round_robin_groups
            WHERE tournament_id = %s
            """,
            (tournament_id,)
        )

        # -------------------------------------------------
        # INSERT GROUPS
        # -------------------------------------------------

        saved_groups = []

        for group in groups:

            group_name = group.get("group_name")
            teams = group.get("teams", [])

            if not group_name:
                raise HTTPException(
                    status_code=400,
                    detail="Group name is required."
                )

            cursor.execute(
                """
                INSERT INTO round_robin_groups
                (
                    tournament_id,
                    group_name
                )
                VALUES (%s, %s)
                """,
                (
                    tournament_id,
                    group_name
                )
            )

            group_id = cursor.lastrowid

            saved_team_count = 0

            for team in teams:

                registration_id = team.get("id")
                team_name = team.get("team_name")

                if not registration_id or not team_name:
                    raise HTTPException(
                        status_code=400,
                        detail="Invalid team information."
                    )

                # Verify team belongs to tournament
                cursor.execute(
                    """
                    SELECT id
                    FROM registrations
                    WHERE id = %s
                      AND tournament_id = %s
                      AND status = 'Approved'
                    """,
                    (
                        registration_id,
                        tournament_id
                    )
                )

                valid_team = cursor.fetchone()

                if not valid_team:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid approved team: {team_name}"
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
                    (
                        %s,
                        %s,
                        %s,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                    )
                    """,
                    (
                        group_id,
                        registration_id,
                        team_name
                    )
                )

                saved_team_count += 1

            saved_groups.append({
                "group_id": group_id,
                "group_name": group_name,
                "team_count": saved_team_count
            })

        connection.commit()

        return {
            "message": "Teams grouped successfully.",
            "tournament_id": tournament_id,
            "groups": saved_groups
        }

    except Exception:
        connection.rollback()
        raise

    finally:
        cursor.close()
        connection.close()


# =========================================================
# GET SAVED GROUPS
# =========================================================

@router.get("/{tournament_id}/groups")
def get_saved_groups(
    tournament_id: int,
    current_admin: dict = Depends(require_super_admin)
):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT
                g.id AS group_id,
                g.group_name,
                t.id AS registration_id,
                t.team_name,
                t.registration_id
            FROM round_robin_groups g
            LEFT JOIN round_robin_group_teams t
                ON t.group_id = g.id
            WHERE g.tournament_id = %s
            ORDER BY
                g.id ASC,
                t.id ASC
            """,
            (tournament_id,)
        )

        rows = cursor.fetchall()

        groups = {}

        for row in rows:

            group_id = row["group_id"]

            if group_id not in groups:
                groups[group_id] = {
                    "group_id": group_id,
                    "group_name": row["group_name"],
                    "teams": []
                }

            if row["registration_id"]:
                groups[group_id]["teams"].append({
                    "registration_id": row["registration_id"],
                    "team_name": row["team_name"]
                })

        return {
            "tournament_id": tournament_id,
            "groups": list(groups.values())
        }

    finally:
        cursor.close()
        connection.close()