import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function MatchResultAdmin() {
  const { id: tournamentId } = useParams();
  const navigate = useNavigate();

  // Form State
  const [championTeam, setChampionTeam] = useState("");
  const [runnerUpTeam, setRunnerUpTeam] = useState("");
  const [thirdPlaceTeam, setThirdPlaceTeam] = useState("");

  // File State
  const [championLogo, setChampionLogo] = useState(null);
  const [runnerUpLogo, setRunnerUpLogo] = useState(null);
  const [thirdPlaceLogo, setThirdPlaceLogo] = useState(null);

  // App & Alert State
  const [existingData, setExistingData] = useState(null);
  const [approvedTeams, setApprovedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Toast State
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', title, message }

  // Security Re-Authentication Modal State for Clearing Results
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [reauth, setReauth] = useState({ username: "", password: "" });
  const [reauthMessage, setReauthMessage] = useState("");
  const [verifying, setVerifying] = useState(false);

  const showToast = useCallback((type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const resResult = await api.get(`/tournaments/${tournamentId}/results`);
      if (resResult.data) {
        const data = resResult.data;
        setExistingData(data);
        setChampionTeam(data.champion_team || "");
        setRunnerUpTeam(data.runner_up_team || "");
        setThirdPlaceTeam(data.third_place_team || "");
      }

      const resTeams = await api.get(`/tournaments/${tournamentId}/approved-teams`);
      setApprovedTeams(resTeams.data || []);
    } catch (err) {
      console.error("Failed to load initial data:", err);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        const resResult = await api.get(`/tournaments/${tournamentId}/results`);
        if (!isMounted) return;

        if (resResult.data) {
          const data = resResult.data;
          setExistingData(data);
          setChampionTeam(data.champion_team || "");
          setRunnerUpTeam(data.runner_up_team || "");
          setThirdPlaceTeam(data.third_place_team || "");
        }

        const resTeams = await api.get(`/tournaments/${tournamentId}/approved-teams`);
        if (!isMounted) return;

        setApprovedTeams(resTeams.data || []);
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load initial data:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [tournamentId]);

  // Submit/Publish Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!championTeam) {
      showToast("error", "Validation Error", "Champion team is required!");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("champion_team", championTeam);
    formData.append("runner_up_team", runnerUpTeam);
    formData.append("third_place_team", thirdPlaceTeam);

    if (championLogo) formData.append("champion_logo", championLogo);
    if (runnerUpLogo) formData.append("runner_logo", runnerUpLogo);
    if (thirdPlaceLogo) formData.append("third_logo", thirdPlaceLogo);

    try {
      await api.post(`/tournaments/${tournamentId}/results`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("success", "Published", "Match results published successfully!");
      fetchData();
    } catch (err) {
      console.error("Failed to publish results:", err);
      showToast("error", "Publish Failed", err.response?.data?.detail || "Failed to publish results");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Security Modal for Deleting/Resetting Results
  const triggerDeleteModal = () => {
    setReauth({ username: "", password: "" });
    setReauthMessage("");
    setSecurityModalOpen(true);
  };

  // Execute Actual Results Clearing
  const executeDeleteResults = async () => {
    try {
      await api.delete(`/tournaments/${tournamentId}/results`);
      showToast("success", "Results Cleared", "The podium has been successfully reset.");

      setChampionTeam("");
      setRunnerUpTeam("");
      setThirdPlaceTeam("");
      setChampionLogo(null);
      setRunnerUpLogo(null);
      setThirdPlaceLogo(null);
      setExistingData(null);
      setSecurityModalOpen(false);

      fetchData();
    } catch (err) {
      console.error("Failed to delete results:", err);
      showToast("error", "Reset Failed", err.response?.data?.detail || "Failed to clear results");
    }
  };

  // Handle Re-Authentication Submit
  const handleConfirmReauth = async (e) => {
    e.preventDefault();
    if (!reauth.username.trim() || !reauth.password.trim()) {
      setReauthMessage("Username and password are required.");
      return;
    }

    try {
      setVerifying(true);
      setReauthMessage("");
      const response = await api.post("/administration/verify-credentials", {
        username: reauth.username.trim(),
        password: reauth.password.trim(),
      });

      if (response.data?.success) {
        await executeDeleteResults();
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setReauthMessage(
        error?.response?.data?.detail || "Invalid credentials or unauthorized action."
      );
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-black font-sans text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-4 shadow-xl">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
          <span className="font-semibold text-gray-300">Loading match results...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black font-sans text-white p-6 md:p-10 selection:bg-blue-600 selection:text-white">
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

      {/* SECURITY AUTHENTICATION DELETE MODAL */}
      {securityModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-xl text-red-400">
                🔒
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Authorization Required</h3>
                <p className="text-xs text-red-400 font-semibold truncate max-w-[220px]">
                  Clear results for Tournament #{tournamentId}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              You are about to clear all tournament podium results. Please enter your credentials to verify authorization.
            </p>

            <form onSubmit={handleConfirmReauth} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={reauth.username}
                  onChange={(e) => setReauth({ ...reauth, username: e.target.value })}
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
                  value={reauth.password}
                  onChange={(e) => setReauth({ ...reauth, password: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-red-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              {reauthMessage && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-400">
                  ⚠️ {reauthMessage}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSecurityModalOpen(false)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-zinc-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-500 transition disabled:opacity-50"
                >
                  {verifying ? "Verifying..." : "Confirm Clear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER BLOCK */}
        <div className="flex flex-col gap-6 rounded-3xl border border-zinc-800/80 bg-zinc-950 p-8 shadow-2xl shadow-blue-950/10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Admin Panel
            </p>

            <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight">
              Match Results & Champions
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Manage tournament podium placement and individual team logos.
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="rounded-xl border border-zinc-700 bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-zinc-900"
          >
            ← Back to Tournaments
          </button>
        </div>

        {/* MAIN FORM CONTAINER */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-black/50 space-y-6">
            
            {/* TOURNAMENT STATUS BADGES */}
            <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800/80 pb-6">
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 uppercase tracking-wider">
                {existingData?.status || "Completed"}
              </span>

              <span className="rounded-full border border-zinc-800 bg-black px-3 py-1 text-xs font-bold text-gray-400">
                Tournament ID: #{tournamentId}
              </span>

              <span className="rounded-full border border-blue-500/20 bg-zinc-900 px-3 py-1 text-xs font-bold text-blue-300">
                {existingData?.title || "eSports Tournament"}
              </span>
            </div>

            {/* PODIUM INPUT SECTION */}
            <div className="grid gap-6">

              {/* 🏆 1ST PLACE (CHAMPION) */}
              <div className="rounded-2xl border-2 border-blue-500/40 bg-gradient-to-b from-blue-600/10 via-black to-black p-6 space-y-4 shadow-lg shadow-blue-500/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-blue-400">🏆 1st Place (Champion)</h2>
                  <span className="text-xs text-blue-400/80 font-mono font-bold tracking-widest">
                    REQUIRED
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-2">
                      Team Name
                    </label>
                    <input
                      type="text"
                      list="approved-teams-list"
                      value={championTeam}
                      onChange={(e) => setChampionTeam(e.target.value)}
                      placeholder="Select or enter team"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-blue-500 focus:outline-none transition"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-2">
                      Champion Team Logo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setChampionLogo(e.target.files[0])}
                      className="w-full text-xs text-gray-400 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-500/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-blue-400 hover:file:bg-blue-500/20 transition cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 🥈 2ND PLACE (RUNNER-UP) */}
              <div className="rounded-2xl border border-zinc-800/80 bg-black p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-300">🥈 2nd Place (Runner-Up)</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-2">
                      Team Name
                    </label>
                    <input
                      type="text"
                      list="approved-teams-list"
                      value={runnerUpTeam}
                      onChange={(e) => setRunnerUpTeam(e.target.value)}
                      placeholder="Select or enter team"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-2">
                      Runner-Up Team Logo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setRunnerUpLogo(e.target.files[0])}
                      className="w-full text-xs text-gray-400 file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-bold file:text-gray-300 hover:file:bg-zinc-700 transition cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 🥉 3RD PLACE */}
              <div className="rounded-2xl border border-zinc-800/80 bg-black p-6 space-y-4">
                <h2 className="text-xl font-bold text-blue-400">🥉 3rd Place</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-2">
                      Team Name
                    </label>
                    <input
                      type="text"
                      list="approved-teams-list"
                      value={thirdPlaceTeam}
                      onChange={(e) => setThirdPlaceTeam(e.target.value)}
                      placeholder="Select or enter team"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 font-bold uppercase mb-2">
                      3rd Place Team Logo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setThirdPlaceLogo(e.target.files[0])}
                      className="w-full text-xs text-gray-400 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-500/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-blue-400 hover:file:bg-blue-500/20 transition cursor-pointer"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* DATALIST AUTOCOMPLETE */}
            <datalist id="approved-teams-list">
              {approvedTeams.map((team) => (
                <option key={team.id} value={team.team_name} />
              ))}
            </datalist>

            {/* ACTIONS */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800/80">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed"
              >
                {submitting ? "Publishing..." : "Publish Results"}
              </button>

              {existingData?.champion_team && (
                <button
                  type="button"
                  onClick={triggerDeleteModal}
                  className="rounded-xl bg-red-600/90 px-6 py-3 font-bold text-white transition hover:bg-red-500 shadow-lg shadow-red-600/20"
                >
                  Delete Results
                </button>
              )}
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}