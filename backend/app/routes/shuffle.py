import random
from fastapi import APIRouter, Depends, HTTPException
from app.database import get_connection
from app.dependencies.auth import get_current_admin

router = APIRouter(
    prefix="/team-shuffle",
    tags=["Team Shuffle"]
)

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


@router.post("/{tournament_id}/save")
def save_shuffled_groups(
    tournament_id: int,
    payload: dict,
    current_admin: dict = Depends(require_super_admin)
):
    """
    Payload format expected:
    {
       "groups": {
           "Group A": [ {"id": 1, "team_name": "Team Alpha"}, ... ],
           "Group B": [ ... ]
       }
    }
    """
    groups_data = payload.get("groups", {})
    if not groups_data:
        raise HTTPException(status_code=400, detail="No group data provided.")

    connection = get_connection()
    cursor = connection.cursor()

    try:
        connection.start_transaction()

        # Optional: Clear existing round-robin groups for this tournament to allow reshuffling & re-saving
        cursor.execute(
            "SELECT id FROM round_robin_groups WHERE tournament_id = %s",
            (tournament_id,)
        )
        existing_groups = cursor.fetchall()
        if existing_groups:
            group_ids = [g[0] for g in existing_groups]
            format_strings = ','.join(['%s'] * len(group_ids))
            cursor.execute(f"DELETE FROM round_robin_group_teams WHERE group_id IN ({format_strings})", tuple(group_ids))
            cursor.execute("DELETE FROM round_robin_groups WHERE tournament_id = %s", (tournament_id,))

        # Insert new groups and their mapping teams
        for group_name, teams in groups_data.items():
            cursor.execute(
                """
                INSERT INTO round_robin_groups (tournament_id, group_name)
                VALUES (%s, %s)
                """,
                (tournament_id, group_name)
            )
            group_id = cursor.lastrowid

            for team in teams:
                cursor.execute(
                    """
                    INSERT INTO round_robin_group_teams (group_id, registration_id, team_name)
                    VALUES (%s, %s, %s)
                    """,
                    (group_id, team["id"], team["team_name"])
                )

        connection.commit()
        return {"status": "success", "message": "Groups successfully saved to database!"}

    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        cursor.close()
        connection.close()


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
            g.id as group_id, g.group_name,
            t.id as mapping_id, t.registration_id, t.team_name
            FROM round_robin_groups g
            LEFT JOIN round_robin_group_teams t ON g.id = t.group_id
            WHERE g.tournament_id = %s
            """,
            (tournament_id,)
        )
        rows = cursor.fetchall()

        # Format rows into structural object
        groups_map = {}
        for row in rows:
            g_name = row["group_name"]
            if g_name not in groups_map:
                groups_map[g_name] = []
            if row["registration_id"]:
                groups_map[g_name].append({
                    "id": row["registration_id"],
                    "team_name": row["team_name"]
                })

        return {"tournament_id": tournament_id, "groups": groups_map}
    finally:
        cursor.close()
        connection.close()