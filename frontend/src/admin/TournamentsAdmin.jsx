import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function TournamentsAdmin() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reauthModalOpen, setReauthModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [reauthForm, setReauthForm] = useState({ username: "", password: "" });
  const [reauthError, setReauthError] = useState("");

  // Toast State
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', title, message }

  const showToast = useCallback((type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchTournaments = async () => {
      try {
        const response = await api.get("/tournaments");
        if (!isMounted) return;
        setTournaments(response.data || []);
      } catch (error) {
        if (!isMounted) return;
        console.error(error);
        showToast("error", "Load Failed", "Failed to fetch tournaments.");
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
  }, [showToast]);

  const deleteTournament = (id) => {
    setPendingDeleteId(id);
    setReauthForm({ username: "", password: "" });
    setReauthError("");
    setReauthModalOpen(true);
  };

  const confirmDeleteReauth = async () => {
    if (!pendingDeleteId) return;

    try {
      const response = await api.post("/administration/verify-credentials", {
        username: reauthForm.username.trim(),
        password: reauthForm.password.trim(),
      });

      if (response.data.success) {
        await api.delete(`/tournaments/${pendingDeleteId}`);
        setTournaments((current) => current.filter((t) => t.id !== pendingDeleteId));
        setReauthModalOpen(false);
        setPendingDeleteId(null);
        setReauthForm({ username: "", password: "" });
        showToast("success", "Tournament Deleted", "Tournament has been permanently removed.");
      }
    } catch (error) {
      console.error(error);
      setReauthError(error?.response?.data?.detail || "Re-authentication failed");
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return String(value).replace("T", " ").slice(0, 16);
  };

  const getStatusClass = (status) => {
    if (status === "Ongoing") {
      return "border-green-500/40 bg-green-500/10 text-green-400";
    }
    if (status === "Upcoming") {
      return "border-blue-500/40 bg-blue-500/10 text-blue-400";
    }
    if (status === "Completed") {
      return "border-amber-500/40 bg-amber-500/10 text-amber-400";
    }
    return "border-zinc-600 bg-zinc-900 text-gray-300";
  };

  const isOngoingTournament = (status) => {
    return String(status || "").trim().toLowerCase() === "ongoing";
  };

  const isCompletedTournament = (status) => {
    return String(status || "").trim().toLowerCase() === "completed";
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-black font-sans text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-4 shadow-xl">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
          <span className="font-semibold text-gray-300">Loading tournaments...</span>
        </div>
      </div>
    );
  }

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
      <div className="mb-10 flex flex-col gap-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Admin Panel
          </p>

          <h1 className="mt-2 text-4xl font-black">Tournaments</h1>

          <p className="mt-2 max-w-2xl text-gray-400">
            Manage tournament details, registration dates, tournament dates, and match setup.
          </p>
        </div>

        <Link to="/admin/tournaments/create">
          <button className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-700">
            + New Tournament
          </button>
        </Link>
      </div>

      {/* EMPTY STATE */}
      {tournaments.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-4xl">
            🏆
          </div>

          <h2 className="text-3xl font-bold">No Tournaments Found</h2>

          <p className="mt-3 text-gray-400">
            Create your first tournament to start managing registrations and matches.
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
            const canManageMatches = isOngoingTournament(tournament.status);
            const isCompleted = isCompletedTournament(tournament.status);

            return (
              <div
                key={tournament.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30 transition hover:border-blue-500/60 hover:shadow-blue-500/10"
              >
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                  {/* LEFT: INFORMATION */}
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
                        {tournament.tournament_format || "Bracket Only"}
                      </span>

                      <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                        {tournament.game_name || "MLBB"}
                      </span>
                    </div>

                    <h2 className="text-2xl font-black">{tournament.title}</h2>

                    <p className="mt-1 text-gray-400">
                      {tournament.subtitle || "No subtitle"}
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                        <p className="text-sm text-gray-500">Prize Pool</p>
                        <p className="mt-1 font-bold text-white">
                          Rs.{" "}
                          {Number(
                            tournament.prize_pool || 0
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                        <p className="text-sm text-gray-500">Registration Start</p>
                        <p className="mt-1 font-bold text-blue-400">
                          {formatDate(tournament.registration_start)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                        <p className="text-sm text-gray-500">Registration End</p>
                        <p className="mt-1 font-bold text-blue-400">
                          {formatDate(tournament.registration_end)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                        <p className="text-sm text-gray-500">Tournament Start</p>
                        <p className="mt-1 font-bold text-white">
                          {formatDate(tournament.tournament_start)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: ACTIONS */}
                  <div className="flex flex-wrap gap-3 xl:w-48 xl:flex-col">
                    {/* EDIT BUTTON (Always Available) */}
                    <Link
                      to={`/admin/tournaments/edit/${tournament.id}`}
                      className="w-full sm:w-auto xl:w-full"
                    >
                      <button className="w-full rounded-xl bg-white px-5 py-3 font-bold text-black transition hover:bg-blue-100">
                        Edit
                      </button>
                    </Link>

                    {/* CONDITION 1: COMPLETED TOURNAMENTS */}
                    {isCompleted ? (
                      <Link
                        to={`/admin/tournaments/champions/${tournament.id}`}
                        className="w-full sm:w-auto xl:w-full"
                      >
                        <button className="w-full rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-3 font-bold text-amber-400 transition hover:bg-amber-500/20">
                          🏆 Match Results
                        </button>
                      </Link>
                    ) : (
                      /* CONDITION 2: UPCOMING & ONGOING TOURNAMENTS */
                      <>
                        <Link
                          to={`/admin/registrationsteam/${tournament.id}`}
                          className="w-full sm:w-auto xl:w-full"
                        >
                          <button className="w-full rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700">
                            Registrations
                          </button>
                        </Link>

                        {canManageMatches ? (
                          <Link
                            to={`/admin/tournament/${tournament.id}/matches`}
                            className="w-full sm:w-auto xl:w-full"
                          >
                            <button className="w-full rounded-xl border border-blue-500/40 bg-black px-5 py-3 font-bold text-white transition hover:bg-blue-500/10">
                              Matches
                            </button>
                          </Link>
                        ) : (
                          <button
                            disabled
                            title="Matches can be managed only for ongoing tournaments"
                            className="w-full sm:w-auto xl:w-full cursor-not-allowed rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 font-bold text-gray-500"
                          >
                            Matches Locked
                          </button>
                        )}

                        <button
                          onClick={() => deleteTournament(tournament.id)}
                          className="w-full sm:w-auto xl:w-full rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reauthModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-xl text-red-400">
                🔒
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Authorization Required</h3>
                <p className="text-xs text-red-400 font-semibold truncate max-w-[220px]">
                  Delete Tournament #{pendingDeleteId}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              You are about to delete this tournament. Please enter your credentials to verify authorization.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={reauthForm.username}
                  onChange={(event) => setReauthForm({ ...reauthForm, username: event.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-red-500 focus:outline-none"
                  placeholder="Username"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={reauthForm.password}
                  onChange={(event) => setReauthForm({ ...reauthForm, password: event.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-red-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              {reauthError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-400">
                  ⚠️ {reauthError}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => {
                  setReauthModalOpen(false);
                  setPendingDeleteId(null);
                  setReauthForm({ username: "", password: "" });
                }}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-zinc-900 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReauth}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-500 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}