import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function TournamentsAdmin() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await api.get("/tournaments");

        console.log("API DATA:", response.data);

        setTournaments(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const deleteTournament = async (id) => {
    const confirmed = window.confirm(
      "Delete this tournament?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/tournaments/${id}`);

      setTournaments(
        tournaments.filter((t) => t.id !== id)
      );
    } catch (error) {
      console.error(error);
      alert("Failed to delete tournament");
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";

    return String(value)
      .replace("T", " ")
      .slice(0, 16);
  };

  const getStatusClass = (status) => {
    if (status === "Ongoing") {
      return "border-green-500/40 bg-green-500/10 text-green-400";
    }

    if (status === "Upcoming") {
      return "border-blue-500/40 bg-blue-500/10 text-blue-400";
    }

    return "border-zinc-600 bg-zinc-900 text-gray-300";
  };

  const isOngoingTournament = (status) => {
    return String(status || "")
      .trim()
      .toLowerCase() === "ongoing";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
          <p className="text-gray-400">
            Loading tournaments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <div className="mb-10 flex flex-col gap-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Admin Panel
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Tournaments
          </h1>

          <p className="mt-2 max-w-2xl text-gray-400">
            Manage tournament details, registration dates,
            tournament dates, and match setup.
          </p>
        </div>

        <Link to="/admin/tournaments/create">
          <button className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-700">
            + New Tournament
          </button>
        </Link>
      </div>

      {/* EMPTY */}
      {tournaments.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-4xl">
            🏆
          </div>

          <h2 className="text-3xl font-bold">
            No Tournaments Found
          </h2>

          <p className="mt-3 text-gray-400">
            Create your first tournament to start managing
            registrations and matches.
          </p>

          <Link to="/admin/tournaments/create">
            <button className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700">
              Create Tournament
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {tournaments.map((tournament) => {
            const canManageMatches =
              isOngoingTournament(tournament.status);

            return (
              <div
                key={tournament.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30 transition hover:border-blue-500/60 hover:shadow-blue-500/10"
              >
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                  {/* LEFT */}
                  <div className="flex-1">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                          tournament.status
                        )}`}
                      >
                        {tournament.status}
                      </span>

                      <span className="rounded-full border border-zinc-700 bg-black px-3 py-1 text-xs font-bold text-gray-300">
                        {tournament.tournament_format ||
                          "Bracket Only"}
                      </span>

                      <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                        {tournament.game_name || "MLBB"}
                      </span>
                    </div>

                    <h2 className="text-2xl font-black">
                      {tournament.title}
                    </h2>

                    <p className="mt-1 text-gray-400">
                      {tournament.subtitle || "No subtitle"}
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                        <p className="text-sm text-gray-500">
                          Prize Pool
                        </p>

                        <p className="mt-1 font-bold text-white">
                          Rs.{" "}
                          {Number(
                            tournament.prize_pool || 0
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                        <p className="text-sm text-gray-500">
                          Registration Start
                        </p>

                        <p className="mt-1 font-bold text-blue-400">
                          {formatDate(
                            tournament.registration_start
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                        <p className="text-sm text-gray-500">
                          Registration End
                        </p>

                        <p className="mt-1 font-bold text-blue-400">
                          {formatDate(
                            tournament.registration_end
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                        <p className="text-sm text-gray-500">
                          Tournament Start
                        </p>

                        <p className="mt-1 font-bold text-white">
                          {formatDate(
                            tournament.tournament_start
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-3 xl:flex-col">
                    <Link
                      to={`/admin/tournaments/edit/${tournament.id}`}
                    >
                      <button className="w-full rounded-xl bg-white px-5 py-3 font-bold text-black transition hover:bg-blue-100">
                        Edit
                      </button>
                    </Link>
                    <Link
                      to={`/admin/registrationsteam/${tournament.id}`}
                      className="rounded-lg bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
                    >
                      Registrations
                    </Link>      
                    {canManageMatches ? (
                      <Link
                        to={`/admin/tournament/${tournament.id}/matches`}
                      >
                        <button className="w-full rounded-xl border border-blue-500/40 bg-black px-5 py-3 font-bold text-white transition hover:bg-blue-500/10">
                          Matches
                        </button>
                      </Link>
                    ) : (
                      <button
                        disabled
                        title="Matches can be managed only for ongoing tournaments"
                        className="w-full cursor-not-allowed rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 font-bold text-gray-500"
                      >
                        Matches Locked
                      </button>
                    )}

                    <button
                      onClick={() =>
                        deleteTournament(tournament.id)
                      }
                      className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}