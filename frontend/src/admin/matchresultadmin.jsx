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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch Tournament current results
      const resResult = await api.get(`/tournaments/${tournamentId}/results`);
      if (resResult.data) {
        const data = resResult.data;
        setExistingData(data);
        setChampionTeam(data.champion_team || "");
        setRunnerUpTeam(data.runner_up_team || "");
        setThirdPlaceTeam(data.third_place_team || "");
      }

      // Fetch Approved Teams list
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
      alert("Champion team is required!");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("champion_team", championTeam);
    formData.append("runner_up_team", runnerUpTeam);
    formData.append("third_place_team", thirdPlaceTeam);

    if (championLogo) formData.append("champion_logo", championLogo);
    if (runnerUpLogo) formData.append("runner_up_logo", runnerUpLogo);
    if (thirdPlaceLogo) formData.append("third_place_logo", thirdPlaceLogo);

    try {
      await api.post(`/tournaments/${tournamentId}/results`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Match results published successfully!");
      fetchData();
    } catch (err) {
      console.error("Failed to publish results:", err);
      alert(err.response?.data?.detail || "Failed to publish results");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete/Reset Handler
  const handleDeleteResults = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear these results? The podium will be reset."
    );
    if (!confirmed) return;

    try {
      await api.delete(`/tournaments/${tournamentId}/results`);
      alert("Results cleared successfully!");

      setChampionTeam("");
      setRunnerUpTeam("");
      setThirdPlaceTeam("");
      setChampionLogo(null);
      setRunnerUpLogo(null);
      setThirdPlaceLogo(null);

      fetchData();
    } catch (err) {
      console.error("Failed to delete results:", err);
      alert(err.response?.data?.detail || "Failed to delete results");
    }
  };

  // =========================================================
  // 1. MATCHING LOADING SKELETON STATE
  // =========================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-28 rounded-3xl border border-zinc-800/80 bg-zinc-950 p-8" />
          <div className="h-96 rounded-3xl border border-zinc-800/80 bg-zinc-950 p-8" />
        </div>
      </div>
    );
  }

  // =========================================================
  // 2. MAIN ADMIN UI (BLACK & BLUE THEME)
  // =========================================================
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans selection:bg-blue-600 selection:text-white">
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
                  onClick={handleDeleteResults}
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