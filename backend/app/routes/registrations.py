
from fastapi import Request
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.database import get_connection
from fastapi import Depends
from app.dependencies.auth import get_current_admin
from app.utils.cloudinary_upload import upload_image
from typing import Optional

router = APIRouter()



@router.post("/registrations/register")
async def register_team(

    tournament_id: int = Form(...),

    team_name: str = Form(...),
    clan_name: str = Form(...),
    captain_name: str = Form(...),
    captain_email: str = Form(...),
    captain_phone: str = Form(...),
    discord_username: str = Form(...),

    player1_real_name: str = Form(...),
    player1_ign: str = Form(...),
    player1_mlbb_id: str = Form(...),
    player1_server_id: str = Form(...),

    player2_real_name: str = Form(...),
    player2_ign: str = Form(...),
    player2_mlbb_id: str = Form(...),
    player2_server_id: str = Form(...),

    player3_real_name: str = Form(...),
    player3_ign: str = Form(...),
    player3_mlbb_id: str = Form(...),
    player3_server_id: str = Form(...),

    player4_real_name: str = Form(...),
    player4_ign: str = Form(...),
    player4_mlbb_id: str = Form(...),
    player4_server_id: str = Form(...),

    player5_real_name: str = Form(...),
    player5_ign: str = Form(...),
    player5_mlbb_id: str = Form(...),
    player5_server_id: str = Form(...),

    sub1_real_name: str = Form(""),
    sub1_ign: str = Form(""),
    sub1_mlbb_id: str = Form(""),
    sub1_server_id: str = Form(""),

    sub2_real_name: str = Form(""),
    sub2_ign: str = Form(""),
    sub2_mlbb_id: str = Form(""),
    sub2_server_id: str = Form(""),

    team_logo: UploadFile = File(...),
    lobby_screenshot: UploadFile = File(...),

    player1_photo: UploadFile = File(...),
    player2_photo: UploadFile = File(...),
    player3_photo: UploadFile = File(...),
    player4_photo: UploadFile = File(...),
    player5_photo: UploadFile = File(...),

    sub1_photo: UploadFile | None = File(None),
    sub2_photo: UploadFile | None = File(None)

):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT max_teams
        FROM tournaments
        WHERE id=%s
        """,
        (tournament_id,)
    )

    tournament = cursor.fetchone()

    if not tournament:
        cursor.close()
        connection.close()
        raise HTTPException(status_code=404, detail="Tournament not found")

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM registrations
        WHERE tournament_id=%s
        AND status='Approved'
        """,
        (tournament_id,)
    )

    approved_teams = cursor.fetchone()[0]

    if approved_teams >= tournament[0]:
        cursor.close()
        connection.close()
        raise HTTPException(
            status_code=400,
            detail="Registration is full for this tournament"
        )

    team_logo_path = upload_image(team_logo)
    lobby_path = upload_image(lobby_screenshot)

    cursor.execute(
        """
        INSERT INTO registrations
        (
            tournament_id,
            team_name,
            clan_name,
            team_logo,
            captain_name,
            captain_email,
            captain_phone,
            discord_username,
            lobby_screenshot,
            status
        )
        VALUES
        (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """,
        (
            tournament_id,
            team_name,
            clan_name,
            team_logo_path,
            captain_name,
            captain_email,
            captain_phone,
            discord_username,
            lobby_path,
            'Pending'
        )
    )

    registration_id = cursor.lastrowid

    players = [

        (
            player1_real_name,
            player1_ign,
            player1_mlbb_id,
            player1_server_id,
            upload_image(player1_photo),
            False
        ),

        (
            player2_real_name,
            player2_ign,
            player2_mlbb_id,
            player2_server_id,
            upload_image(player2_photo),
            False
        ),

        (
            player3_real_name,
            player3_ign,
            player3_mlbb_id,
            player3_server_id,
            upload_image(player3_photo),
            False
        ),

        (
            player4_real_name,
            player4_ign,
            player4_mlbb_id,
            player4_server_id,
            upload_image(player4_photo),
            False
        ),

        (
            player5_real_name,
            player5_ign,
            player5_mlbb_id,
            player5_server_id,
            upload_image(player5_photo),
            False
        )
    ]

    if sub1_real_name:
        players.append(
            (
                sub1_real_name,
                sub1_ign,
                sub1_mlbb_id,
                sub1_server_id,
                upload_image(sub1_photo) if sub1_photo else "",
                True
            )
        )

    if sub2_real_name:
        players.append(
            (
                sub2_real_name,
                sub2_ign,
                sub2_mlbb_id,
                sub2_server_id,
                upload_image(sub2_photo) if sub2_photo else "",
                True
            )
        )

    for player in players:

        cursor.execute(
            """
            INSERT INTO players
            (
                registration_id,
                real_name,
                ign,
                mlbb_id,
                server_id,
                player_photo,
                is_substitute
            )
            VALUES
            (%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                registration_id,
                player[0],
                player[1],
                player[2],
                player[3],
                player[4],
                player[5]
            )
        )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Registration Successful",
        "registration_id": registration_id
    }
    
@router.get("/registrations")
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

@router.get("/registrations/{registration_id}")
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

@router.put("/registrations/{registration_id}/approve")
def approve_registration(registration_id: int, current_admin: dict = Depends(get_current_admin)):

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

    return {"message": "Team Approved"}
@router.put("/registrations/{registration_id}/reject")
def reject_registration(
    registration_id: int,
    current_admin: dict = Depends(get_current_admin)
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
    
@router.get("/registrationsadmin")
def get_registrations(current_admin: dict = Depends(get_current_admin)):

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
@router.get("/registrations/{registration_id}/full")
def get_registration_full(registration_id: int, current_admin: dict = Depends(get_current_admin)):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM registrations WHERE id=%s",
        (registration_id,)
    )

    registration = cursor.fetchone()

    cursor.execute(
        """
        SELECT *
        FROM players
        WHERE registration_id=%s
        """,
        (registration_id,)
    )

    players = cursor.fetchall()

    cursor.close()
    connection.close()

    return {
        "registration": registration,
        "players": players
    }
    
@router.get("/registrations/tournament/{tournament_id}")
def get_tournament_registrations(tournament_id: int, current_admin: dict = Depends(get_current_admin)):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM registrations
        WHERE tournament_id = %s
        """,
        (tournament_id,)
    )

    registrations = cursor.fetchall()

    cursor.close()
    connection.close()

    return registrations


@router.get("/tournaments/{tournament_id}/approved-teams")
def get_approved_teams(tournament_id: int):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            id,
            team_name,
            team_logo
        FROM registrations
        WHERE tournament_id=%s
        AND status='Approved'
        ORDER BY team_name
        """,
        (tournament_id,)
    )

    teams = cursor.fetchall()

    cursor.close()
    connection.close()

    return teams
@router.get("/registrations/tournament/{tournament_id}/approved-teams-details")
def get_approved_teams_details(
    tournament_id: int,
    current_admin: dict = Depends(get_current_admin)
):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Get approved teams
        cursor.execute(
            """
            SELECT
                r.id AS team_id,
                r.team_name,
                r.captain_name,
                r.captain_phone,
                r.created_at
            FROM registrations r
            WHERE r.tournament_id = %s
              AND r.status = 'Approved'
            ORDER BY r.created_at ASC, r.team_name ASC
            """,
            (tournament_id,)
        )

        teams = cursor.fetchall()

        # Get players for every approved team
        for team in teams:
            cursor.execute(
                """
                SELECT
                    id,
                    real_name,
                    ign,
                    mlbb_id,
                    server_id,
                    is_substitute
                FROM players
                WHERE registration_id = %s
                ORDER BY
                    is_substitute ASC,
                    id ASC
                """,
                (team["team_id"],)
            )

            team["players"] = cursor.fetchall()

        return {
            "tournament_id": tournament_id,
            "teams": teams,
            "total_teams": len(teams)
        }

    finally:
        cursor.close()
        connection.close()


@router.put("/registrations/{registration_id}/edit")
async def edit_registration(
    request: Request,
    registration_id: int,
    team_name: str = Form(...),
    clan_name: Optional[str] = Form(None),
    captain_name: str = Form(...),
    captain_email: Optional[str] = Form(None),
    captain_phone: Optional[str] = Form(None),
    discord_username: Optional[str] = Form(None),
    status: str = Form("Pending"),
    team_logo: Optional[UploadFile] = File(None),
    lobby_screenshot: Optional[UploadFile] = File(None),
    current_admin: dict = Depends(get_current_admin)
):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM registrations WHERE id = %s", (registration_id,))
        registration = cursor.fetchone()

        if not registration:
            raise HTTPException(status_code=404, detail="Registration not found")

        team_logo_url = registration["team_logo"]
        if team_logo:
            team_logo_url = upload_image(team_logo)

        lobby_url = registration["lobby_screenshot"]
        if lobby_screenshot:
            lobby_url = upload_image(lobby_screenshot)

        # 1. Update main registration details
        cursor.execute(
            """
            UPDATE registrations
            SET
                team_name = %s,
                clan_name = %s,
                team_logo = %s,
                captain_name = %s,
                captain_email = %s,
                captain_phone = %s,
                discord_username = %s,
                lobby_screenshot = %s,
                status = %s
            WHERE id = %s
            """,
            (
                team_name,
                clan_name,
                team_logo_url,
                captain_name,
                captain_email,
                captain_phone,
                discord_username,
                lobby_url,
                status,
                registration_id
            )
        )

        # 2. Update dynamic players from the raw form data payload
        form = await request.form()
        
        cursor.execute(
            "SELECT id, player_photo FROM players WHERE registration_id = %s ORDER BY is_substitute ASC, id ASC",
            (registration_id,)
        )
        existing_players = cursor.fetchall()

        player_count = int(form.get("player_count", 0))
        for i in range(player_count):
            p_id = form.get(f"player_{i}_id")
            real_name = form.get(f"player_{i}_real_name", "")
            ign = form.get(f"player_{i}_ign", "")
            mlbb_id = form.get(f"player_{i}_mlbb_id", "")
            server_id = form.get(f"player_{i}_server_id", "")
            is_sub = 1 if str(form.get(f"player_{i}_is_substitute", "0")) == "1" else 0

            existing_p = next((p for p in existing_players if str(p["id"]) == str(p_id)), None)
            photo_url = existing_p["player_photo"] if existing_p else ""

            p_photo_file = form.get(f"player_{i}_photo")
            if hasattr(p_photo_file, "filename") and p_photo_file.filename:
                photo_url = upload_image(p_photo_file)

            if p_id:
                cursor.execute(
                    """
                    UPDATE players
                    SET real_name = %s, ign = %s, mlbb_id = %s, server_id = %s, player_photo = %s, is_substitute = %s
                    WHERE id = %s AND registration_id = %s
                    """,
                    (real_name, ign, mlbb_id, server_id, photo_url, is_sub, p_id, registration_id)
                )

        connection.commit()
        return {"message": "Registration updated successfully", "registration_id": registration_id}

    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        print("EDIT REGISTRATION ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()