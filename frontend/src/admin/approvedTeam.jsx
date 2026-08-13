import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function ApprovedTeam() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [tournament, setTournament] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

useEffect(() => {
  if (!tournamentId) {
    return;
  }

  let mounted = true;

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [tournamentResponse, teamsResponse] =
        await Promise.all([
          api.get(`/tournaments/${tournamentId}`),
          api.get(
            `/registrations/tournament/${tournamentId}/approved-teams-details`
          ),
        ]);

      if (!mounted) return;

      setTournament(tournamentResponse.data);

      const data = teamsResponse.data;

      setTeams(
        Array.isArray(data?.teams)
          ? data.teams
          : []
      );
    } catch (err) {
      console.error("Approved teams error:", err);

      if (!mounted) return;

      setError(
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to load approved teams."
      );
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  loadData();

  return () => {
    mounted = false;
  };
}, [tournamentId]);

  const mainPlayers = (players = []) =>
    players.filter(
      (player) =>
        player.is_substitute === false ||
        player.is_substitute === 0
    );

  const substitutePlayers = (players = []) =>
    players.filter(
      (player) =>
        player.is_substitute === true ||
        player.is_substitute === 1
    );

  const getPlayer = (players, index) => {
    return mainPlayers(players)[index] || null;
  };

  const getSub = (players, index) => {
    return substitutePlayers(players)[index] || null;
  };

  const printPage = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />

          <h2 className="text-xl font-bold">
            Loading approved teams...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-8 text-white">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-500/30 bg-zinc-950 p-10 text-center">

          <div className="mb-4 text-5xl">
            ⚠️
          </div>

          <h1 className="text-2xl font-black">
            Failed to load approved teams
          </h1>

          <p className="mt-4 text-red-400">
            {error}
          </p>

          <div className="mt-6 flex justify-center gap-3">

            <button
              onClick={() =>
                navigate(`/admin/tournaments/${tournamentId}`)
              }
              className="rounded-xl border border-zinc-700 px-5 py-3 font-bold hover:border-blue-500"
            >
              ← Back
            </button>

            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-blue-600 px-5 py-3 font-bold hover:bg-blue-500"
            >
              Retry
            </button>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 text-white sm:p-6">

      <style>
        {`
          @media print {
            body {
              background: white !important;
            }

            .no-print {
              display: none !important;
            }

            .print-table {
              width: 100% !important;
              min-width: 0 !important;
              color: black !important;
              background: white !important;
              font-size: 8px !important;
            }

            .print-table th,
            .print-table td {
              color: black !important;
              background: white !important;
              border: 1px solid #777 !important;
              padding: 4px !important;
            }

            @page {
              size: landscape;
              margin: 8mm;
            }
          }
        `}
      </style>

      <div className="mx-auto max-w-[2200px]">

        {/* HEADER */}

        <div className="no-print mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                Admin Panel
              </p>

              <h1 className="mt-2 text-3xl font-black">
                Approved Teams
              </h1>

              <p className="mt-2 text-gray-400">
                {tournament?.title || "Tournament"}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">

                <span className="rounded-full bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-400">
                  Tournament #{tournamentId}
                </span>

                <span className="rounded-full bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400">
                  {teams.length} Approved
                </span>

              </div>

            </div>

            <div className="flex gap-3">

              <button
                onClick={() =>
                  navigate(`/admin/registrationsteam/${tournamentId}`)
                }
                className="rounded-xl border border-zinc-700 px-5 py-3 font-bold hover:border-blue-500"
              >
                ← Back
              </button>

              <button
                onClick={printPage}
                className="rounded-xl bg-blue-600 px-5 py-3 font-bold hover:bg-blue-500"
              >
                📄 Print / PDF
              </button>

            </div>

          </div>
        </div>

        {/* EMPTY */}

        {teams.length === 0 && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center">

            <div className="text-6xl">
              👥
            </div>

            <h2 className="mt-5 text-2xl font-black">
              No Approved Teams
            </h2>

            <p className="mt-3 text-gray-400">
              There are currently no approved teams for this tournament.
            </p>

          </div>
        )}

        {/* TABLE */}

        {teams.length > 0 && (
          <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-950">

            <table className="print-table min-w-[2400px] w-full border-collapse">

              <thead>

                <tr className="bg-zinc-900">

                  <Th>Team</Th>
                  <Th>Captain</Th>
                  <Th>Mobile</Th>

                  <Th>P1 Name</Th>
                  <Th>P1 ID</Th>
                  <Th>P1 IGN</Th>

                  <Th>P2 Name</Th>
                  <Th>P2 ID</Th>
                  <Th>P2 IGN</Th>

                  <Th>P3 Name</Th>
                  <Th>P3 ID</Th>
                  <Th>P3 IGN</Th>

                  <Th>P4 Name</Th>
                  <Th>P4 ID</Th>
                  <Th>P4 IGN</Th>

                  <Th>P5 Name</Th>
                  <Th>P5 ID</Th>
                  <Th>P5 IGN</Th>

                  <Th sub>Sub 1 Name</Th>
                  <Th sub>Sub 1 ID</Th>
                  <Th sub>Sub 1 IGN</Th>

                  <Th sub>Sub 2 Name</Th>
                  <Th sub>Sub 2 ID</Th>
                  <Th sub>Sub 2 IGN</Th>

                  <Th>Date</Th>
                  <Th>Team ID</Th>

                </tr>

              </thead>

              <tbody>

                {teams.map((team) => {

                  const players = Array.isArray(team.players)
                    ? team.players
                    : [];

                  const p1 = getPlayer(players, 0);
                  const p2 = getPlayer(players, 1);
                  const p3 = getPlayer(players, 2);
                  const p4 = getPlayer(players, 3);
                  const p5 = getPlayer(players, 4);

                  const sub1 = getSub(players, 0);
                  const sub2 = getSub(players, 1);

                  return (
                    <tr
                      key={team.team_id}
                      className="border-t border-zinc-800 hover:bg-zinc-900"
                    >

                      <Td bold>
                        {team.team_name || "-"}
                      </Td>

                      <Td>
                        {team.captain_name || "-"}
                      </Td>

                      <Td>
                        {team.captain_phone || "-"}
                      </Td>

                      <Player player={p1} />
                      <Player player={p2} />
                      <Player player={p3} />
                      <Player player={p4} />
                      <Player player={p5} />

                      <Player
                        player={sub1}
                        sub
                      />

                      <Player
                        player={sub2}
                        sub
                      />

                      <Td>
                        {team.created_at
                          ? new Date(
                              team.created_at
                            ).toLocaleDateString()
                          : "-"}
                      </Td>

                      <Td>
                        <span className="font-mono text-blue-400">
                          #{team.team_id}
                        </span>
                      </Td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>
    </div>
  );
}


/* =========================================================
   TABLE HEADER
========================================================= */

function Th({ children, sub = false }) {
  return (
    <th
      className={`whitespace-nowrap border-r border-zinc-800 px-4 py-4 text-left text-xs font-black uppercase ${
        sub
          ? "text-yellow-400"
          : "text-blue-400"
      }`}
    >
      {children}
    </th>
  );
}


/* =========================================================
   NORMAL CELL
========================================================= */

function Td({ children, bold = false }) {
  return (
    <td className="whitespace-nowrap border-r border-zinc-800 px-4 py-5">
      <span
        className={
          bold
            ? "font-black text-white"
            : "text-gray-300"
        }
      >
        {children}
      </span>
    </td>
  );
}


/* =========================================================
   PLAYER
========================================================= */

function Player({ player, sub = false }) {
  return (
    <>
      <td className="whitespace-nowrap border-r border-zinc-800 px-4 py-5">
        <span
          className={
            sub
              ? "font-semibold text-yellow-300"
              : "text-white"
          }
        >
          {player?.real_name || "-"}
        </span>
      </td>

      <td className="whitespace-nowrap border-r border-zinc-800 px-4 py-5">
        <span className="font-mono text-sm text-gray-300">
          {player?.mlbb_id || "-"}
        </span>
      </td>

      <td className="whitespace-nowrap border-r border-zinc-800 px-4 py-5">
        <span className="text-gray-300">
          {player?.ign || "-"}
        </span>
      </td>
    </>
  );
}