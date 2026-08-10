import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function RegistrationsAdmin() {
  const [registrations, setRegistrations] = useState([]);
  const [tournament, setTournament] = useState(null);

  // Toast State
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', title, message }

  const showToast = useCallback((type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const getFileUrl = (filePath) => {
    if (!filePath) return "";
    if (filePath.startsWith("http")) return filePath;

    const baseURL = api.defaults?.baseURL || "";
    return `${baseURL}/${filePath}`;
  };

  const navigate = useNavigate();
  const { tournamentId } = useParams();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const tournamentRes = await api.get(
          `/tournaments/${tournamentId}`
        );
        if (!isMounted) return;
        setTournament(tournamentRes.data);

        const regRes = await api.get(
          `/registrations/tournament/${tournamentId}`
        );
        if (!isMounted) return;
        setRegistrations(regRes.data);
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        showToast("error", "Load Failed", "Failed to fetch registrations");
      }
    };

    if (tournamentId) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [tournamentId, showToast]);

  const approveTeam = async (id) => {
    try {
      await api.put(`/registrations/${id}/approve`);
      showToast("success", "Team Approved", "Team has been approved successfully.");

      const res = await api.get(
        `/registrations/tournament/${tournamentId}`
      );
      setRegistrations(res.data);
    } catch (err) {
      console.error(err);
      showToast("error", "Action Failed", err.response?.data?.detail || "Failed to approve team");
    }
  };

  const rejectTeam = async (id) => {
    try {
      await api.put(`/registrations/${id}/reject`);
      showToast("success", "Team Rejected", "Team has been rejected.");

      const res = await api.get(
        `/registrations/tournament/${tournamentId}`
      );
      setRegistrations(res.data);
    } catch (err) {
      console.error(err);
      showToast("error", "Action Failed", err.response?.data?.detail || "Failed to reject team");
    }
  };

  const getTournamentStatusClass = (status) => {
    if (status === "Ongoing") {
      return "border-green-500/40 bg-green-500/10 text-green-400";
    }

    if (status === "Upcoming") {
      return "border-blue-500/40 bg-blue-500/10 text-blue-400";
    }

    return "border-zinc-600 bg-zinc-900 text-gray-300";
  };

  const getTeamStatusClass = (status) => {
    if (status === "Approved") {
      return "border-green-500/40 bg-green-500/10 text-green-400";
    }

    if (status === "Rejected") {
      return "border-red-500/40 bg-red-500/10 text-red-400";
    }

    return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
  };

  if (!tournament) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-black font-sans text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-4 shadow-xl">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
          <span className="font-semibold text-gray-300">Loading registrations...</span>
        </div>
      </div>
    );
  }

  const status = tournament.status;

  const isUpcoming = status === "Upcoming";
  const isOngoing = status === "Ongoing";
  const isCompleted = status === "Completed";

  return (
    <div className="relative min-h-screen bg-black font-sans text-white selection:bg-blue-600 selection:text-white">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 right-6 z-[200] w-full max-w-md animate-slide-in">
          <div
            className={`flex items-start gap-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
              toast.type === "success"
                ? "border-emerald-500/40 bg-zinc-950/95 text-emerald-400"
                : "border-red-500/40 bg-zinc-950/95 text-red-400"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-current/20 bg-current/10 text-xl font-bold">
              {toast.type === "success" ? "✓" : "⚠️"}
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-sm font-bold text-white">{toast.title}</h4>
              <p className="mt-0.5 text-xs text-gray-300">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 text-gray-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Admin Panel
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Registrations
            </h1>

            <p className="mt-2 max-w-2xl text-gray-400">
              Manage registered teams for this tournament.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${getTournamentStatusClass(
                  tournament.status
                )}`}
              >
                {tournament.status}
              </span>

              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                {tournament.game_name || "MLBB"}
              </span>

              <span className="rounded-full border border-zinc-700 bg-black px-3 py-1 text-xs font-bold text-gray-300">
                Tournament #{tournament.id}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin/tournaments")}
            className="rounded-xl border border-zinc-700 bg-black px-6 py-3 font-bold text-white transition hover:border-blue-500 hover:bg-blue-500/10"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* TOURNAMENT INFO */}
      <div className="mb-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30">
          <p className="text-sm text-gray-500">
            Tournament
          </p>

          <p className="mt-2 text-xl font-black text-white">
            {tournament.title}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30">
          <p className="text-sm text-gray-500">
            Total Teams
          </p>

          <p className="mt-2 text-4xl font-black text-blue-400">
            {Array.isArray(registrations)
              ? registrations.length
              : 0}
          </p>
        </div>

        <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6 shadow-xl shadow-black/30">
          <p className="text-sm text-gray-500">
            Current Status
          </p>

          <p className="mt-2 font-bold text-blue-400">
            {tournament.status}
          </p>
        </div>
      </div>

      {/* UPCOMING */}
      {isUpcoming && (
        <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-8 shadow-xl shadow-black/30">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-500/30 bg-black text-3xl">
              🔒
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                Registrations Not Available
              </h2>

              <p className="mt-2 text-gray-400">
                Tournament begins soon. No registrations available yet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ONGOING / COMPLETED */}
      {(isOngoing || isCompleted) && (
        <div>
          {Array.isArray(registrations) &&
          registrations.length > 0 ? (
            <div className="grid gap-6">
              {registrations.map((team) => (
                <div
                  key={team.id}
                  className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30 transition hover:border-blue-500/60 hover:shadow-blue-500/10"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center">
                      <div className="h-24 w-24 overflow-hidden rounded-2xl border border-blue-500/30 bg-black">
                          {team.team_logo ? (
                <img
                  src={getFileUrl(team.team_logo)}
                  alt={team.team_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-5xl">
                  🛡️
                </div>
              )}
                      </div>

                      <div>
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold ${getTeamStatusClass(
                              team.status
                            )}`}
                          >
                            {team.status}
                          </span>

                          <span className="rounded-full border border-zinc-700 bg-black px-3 py-1 text-xs font-bold text-gray-400">
                            Team #{team.id}
                          </span>
                        </div>

                        <h2 className="text-2xl font-black text-white">
                          {team.team_name}
                        </h2>

                        <div className="mt-3 grid gap-2 text-sm text-gray-400 md:grid-cols-2">
                          <p>
                            Captain:{" "}
                            <span className="font-semibold text-white">
                              {team.captain_name}
                            </span>
                          </p>

                          <p>
                            Email:{" "}
                            <span className="font-semibold text-blue-400">
                              {team.captain_email}
                            </span>
                          </p>

                          <p>
                            Status:{" "}
                            <span className="font-semibold text-white">
                              {team.status}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 lg:flex-col">
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/registrations/${team.id}`
                          )
                        }
                        className="rounded-xl bg-white px-5 py-3 font-bold text-black transition hover:bg-blue-100"
                      >
                        View
                      </button>

                      {isOngoing && (
                        <>
                          <button
                            onClick={() =>
                              approveTeam(team.id)
                            }
                            className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              rejectTeam(team.id)
                            }
                            className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-xl shadow-black/30">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-4xl">
                👥
              </div>

              <h2 className="text-3xl font-bold">
                No Teams Registered
              </h2>

              <p className="mt-3 text-gray-400">
                No teams registered.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}