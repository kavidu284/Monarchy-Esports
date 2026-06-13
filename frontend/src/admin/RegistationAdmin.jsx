import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminRegistrations() {
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTournaments = async () => {
      try {
        const response = await api.get("/tournaments");

        if (isMounted) {
          setTournaments(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTournaments();

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "ongoing") {
      return "border-green-500/40 bg-green-500/10 text-green-400";
    }

    if (value === "upcoming") {
      return "border-blue-500/40 bg-blue-500/10 text-blue-400";
    }

    return "border-zinc-600 bg-zinc-900 text-gray-300";
  };

  const formatDate = (value) => {
    if (!value) return "-";

    return String(value).replace("T", " ").slice(0, 16);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
          <p className="text-gray-400">
            Loading registrations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <div className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Admin Panel
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Registrations
            </h1>

            <p className="mt-2 max-w-2xl text-gray-400">
              Select a tournament to view, approve, or reject registered
              teams.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-6 py-4">
            <p className="text-sm text-gray-400">
              Total Tournaments
            </p>

            <p className="mt-1 text-3xl font-black text-blue-400">
              {tournaments.length}
            </p>
          </div>
        </div>
      </div>

      {/* EMPTY */}
      {tournaments.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-xl shadow-black/30">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-4xl">
            📝
          </div>

          <h2 className="text-3xl font-bold">
            No Tournaments Found
          </h2>

          <p className="mt-3 text-gray-400">
            Create a tournament first to manage team registrations.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-blue-500/10"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                    tournament.status
                  )}`}
                >
                  {tournament.status}
                </span>

                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                  {tournament.game_name || "MLBB"}
                </span>
              </div>

              <h2 className="text-2xl font-black text-white">
                {tournament.title}
              </h2>

              <p className="mt-2 min-h-[48px] text-gray-400">
                {tournament.subtitle || "No subtitle"}
              </p>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="text-sm text-gray-500">
                    Registration Start
                  </p>

                  <p className="mt-1 font-bold text-blue-400">
                    {formatDate(tournament.registration_start)}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="text-sm text-gray-500">
                    Registration End
                  </p>

                  <p className="mt-1 font-bold text-white">
                    {formatDate(tournament.registration_end)}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate(
                    `/admin/registrationsteam/${tournament.id}`
                  )
                }
                className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
              >
                Manage Teams
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}