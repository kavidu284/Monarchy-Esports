import { useCallback, useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import getImageUrl from "../utils/getImageUrl";

export default function EditRegistration() {
  const { id, tournamentId, registrationId } = useParams();
  const currentRegistrationId = registrationId || id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [registration, setRegistration] = useState({
    team_name: "",
    clan_name: "",
    captain_name: "",
    captain_email: "",
    captain_phone: "",
    discord_username: "",
    team_logo: "",
    lobby_screenshot: "",
    status: "Pending",
  });

  const [players, setPlayers] = useState([]);

  const [teamLogo, setTeamLogo] = useState(null);
  const [lobbyScreenshot, setLobbyScreenshot] = useState(null);
  const [playerPhotos, setPlayerPhotos] = useState({});

  // Security Re-Authentication Modal State
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [reauth, setReauth] = useState({ username: "", password: "" });
  const [reauthMessage, setReauthMessage] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Toast Notifications State
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const fetchRegistration = useCallback(async () => {
    if (!currentRegistrationId) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/registrations/${currentRegistrationId}/full`);
      const data = response.data || {};
      const reg = data.registration || {};
      const playersList = data.players || [];

      setRegistration({
        id: reg.id || currentRegistrationId,
        team_name: reg.team_name || "",
        clan_name: reg.clan_name || "",
        captain_name: reg.captain_name || "",
        captain_email: reg.captain_email || "",
        captain_phone: reg.captain_phone || "",
        discord_username: reg.discord_username || "",
        team_logo: reg.team_logo || "",
        lobby_screenshot: reg.lobby_screenshot || "",
        status: reg.status || "Pending",
      });

      setPlayers(
        Array.isArray(playersList)
          ? playersList.map((player) => ({
              id: player.id || null,
              real_name: player.real_name || "",
              ign: player.ign || "",
              mlbb_id: player.mlbb_id || "",
              server_id: player.server_id || "",
              player_photo: player.player_photo || "",
              is_substitute:
                player.is_substitute === true ||
                player.is_substitute === 1 ||
                player.is_substitute === "1",
            }))
          : []
      );
    } catch (err) {
      console.error("Failed to load registration:", err);
      const errorMessage =
        err?.response?.data?.detail || "Failed to load registration details.";
      setError(errorMessage);
      showToast("error", "Load Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentRegistrationId, showToast]);

  const fetchRegistrationRef = useRef(fetchRegistration);
  useEffect(() => {
    fetchRegistrationRef.current = fetchRegistration;
  }, [fetchRegistration]);

  useEffect(() => {
    void fetchRegistrationRef.current();
  }, [currentRegistrationId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegistration((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlayerChange = (index, field, value) => {
    setPlayers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubstituteChange = (index, checked) => {
    setPlayers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], is_substitute: checked };
      return updated;
    });
  };

  const handlePlayerPhotoChange = (index, file) => {
    setPlayerPhotos((prev) => ({ ...prev, [index]: file }));
  };

  // Add Substitute Logic (Enforcing max 7 total roster members)
  const handleAddSubstitute = () => {
    if (players.length >= 7) {
      showToast("error", "Limit Reached", "A team can have a maximum of 7 players (5 Main + 2 Substitutes).");
      return;
    }

    setPlayers((prev) => [
      ...prev,
      {
        id: null,
        real_name: "",
        ign: "",
        mlbb_id: "",
        server_id: "",
        player_photo: "",
        is_substitute: true,
      },
    ]);
  };

  // Remove Player Logic (Ensuring at least 5 main players remain)
  const handleRemovePlayer = (index) => {
    const playerToRemove = players[index];
    const mainPlayersCount = players.filter((p) => !p.is_substitute).length;

    if (!playerToRemove.is_substitute && mainPlayersCount <= 5) {
      showToast("error", "Action Denied", "Teams must have exactly 5 mandatory main players.");
      return;
    }

    setPlayers((prev) => prev.filter((_, i) => i !== index));
    setPlayerPhotos((prev) => {
      const updatedPhotos = { ...prev };
      delete updatedPhotos[index];
      return updatedPhotos;
    });
  };

  const executeSave = async () => {
    try {
      setSaving(true);
      setError("");

      const mainPlayersCount = players.filter((p) => !p.is_substitute).length;
      if (mainPlayersCount !== 5) {
        showToast("error", "Validation Error", "There must be exactly 5 main players.");
        setSaving(false);
        setSecurityModalOpen(false);
        return;
      }

      if (players.length > 7) {
        showToast("error", "Validation Error", "Maximum roster size is 7 players.");
        setSaving(false);
        setSecurityModalOpen(false);
        return;
      }

      const formData = new FormData();
      formData.append("team_name", registration.team_name);
      formData.append("clan_name", registration.clan_name || "");
      formData.append("captain_name", registration.captain_name);
      formData.append("captain_email", registration.captain_email || "");
      formData.append("captain_phone", registration.captain_phone || "");
      formData.append("discord_username", registration.discord_username || "");
      formData.append("status", registration.status || "Pending");

      if (teamLogo) formData.append("team_logo", teamLogo);
      if (lobbyScreenshot) formData.append("lobby_screenshot", lobbyScreenshot);

      formData.append("player_count", String(players.length));

      players.forEach((player, index) => {
        if (player.id) formData.append(`player_${index}_id`, String(player.id));
        formData.append(`player_${index}_real_name`, player.real_name || "");
        formData.append(`player_${index}_ign`, player.ign || "");
        formData.append(`player_${index}_mlbb_id`, player.mlbb_id || "");
        formData.append(`player_${index}_server_id`, player.server_id || "");
        formData.append(`player_${index}_is_substitute`, player.is_substitute ? "1" : "0");

        if (playerPhotos[index]) {
          formData.append(`player_${index}_photo`, playerPhotos[index]);
        }
      });

      await api.put(`/registrations/${currentRegistrationId}/edit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("success", "Saved", "Registration updated successfully.");
      setSecurityModalOpen(false);
      setTeamLogo(null);
      setLobbyScreenshot(null);
      setPlayerPhotos({});

      await fetchRegistration();
    } catch (err) {
      console.error("Failed to update registration:", err);
      const errorMessage =
        err?.response?.data?.detail || "Failed to update registration.";
      setError(errorMessage);
      showToast("error", "Save Failed", errorMessage);
      setSecurityModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const mainPlayersCount = players.filter((p) => !p.is_substitute).length;
    if (mainPlayersCount !== 5) {
      showToast("error", "Roster Error", "You must configure exactly 5 main players.");
      return;
    }

    setReauth({ username: "", password: "" });
    setReauthMessage("");
    setSecurityModalOpen(true);
  };

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
        password: reauth.password,
      });

      if (response.data?.success) {
        await executeSave();
      } else {
        setReauthMessage("Authorization failed.");
      }
    } catch (err) {
      console.error("Verification failed:", err);
      setReauthMessage(
        err?.response?.data?.detail ||
          "Invalid credentials or unauthorized action."
      );
    } finally {
      setVerifying(false);
    }
  };

  const backPath = tournamentId
    ? `/admin/tournaments/${tournamentId}/registrations`
    : "/admin/tournaments";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-black font-sans text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-4 shadow-xl">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
          <span className="font-semibold text-gray-300">Loading registration details...</span>
        </div>
      </div>
    );
  }

  const currentSubsCount = players.filter((p) => p.is_substitute).length;

  return (
    <div className="relative min-h-screen bg-black px-4 py-8 font-sans text-white sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed right-6 top-6 z-[200] w-full max-w-md">
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
            <div className="min-w-0 flex-1 pr-2">
              <h4 className="text-sm font-bold text-white">{toast.title}</h4>
              <p className="mt-0.5 text-xs text-gray-300">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Security Re-Authentication Modal */}
      {securityModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md">
          <div className="w-full max-w-md space-y-5 rounded-3xl border border-blue-500/30 bg-zinc-950 p-6 shadow-2xl sm:p-8">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-xl text-blue-400">
                🔒
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Authorization Required</h3>
                <p className="max-w-[220px] truncate text-xs font-semibold text-blue-400">
                  Save Changes: {registration.team_name}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmReauth} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">Username</label>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={reauth.username}
                  onChange={(e) => setReauth({ ...reauth, username: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">Password</label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={reauth.password}
                  onChange={(e) => setReauth({ ...reauth, password: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-blue-500"
                />
              </div>

              {reauthMessage && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-400">
                  ⚠️ {reauthMessage}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-3">
                <button
                  type="button"
                  onClick={() => setSecurityModalOpen(false)}
                  disabled={verifying}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg"
                >
                  {verifying ? "Verifying..." : "Confirm & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">Admin Panel</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">Edit Team Registration</h1>
            <p className="mt-2 text-gray-400">Modify team configurations, status, and manage roster members.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/admin/registrations/${currentRegistrationId}`}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 font-bold text-white transition hover:border-blue-500"
            >
              View Details
            </Link>
            <Link
              to={backPath}
              className="rounded-xl border border-zinc-700 bg-black px-5 py-3 font-bold text-white transition hover:border-blue-500"
            >
              ← Back
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Team Information */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl sm:p-8">
            <h2 className="text-2xl font-black">Team Information</h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-300">Team Name *</label>
                <input
                  type="text"
                  name="team_name"
                  value={registration.team_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-300">Clan Name</label>
                <input
                  type="text"
                  name="clan_name"
                  value={registration.clan_name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-300">Captain Name *</label>
                <input
                  type="text"
                  name="captain_name"
                  value={registration.captain_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-300">Captain Email</label>
                <input
                  type="email"
                  name="captain_email"
                  value={registration.captain_email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-300">Captain Phone</label>
                <input
                  type="text"
                  name="captain_phone"
                  value={registration.captain_phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-300">Discord Username</label>
                <input
                  type="text"
                  name="discord_username"
                  value={registration.discord_username}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-300">Status</label>
                <select
                  name="status"
                  value={registration.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Team Logo */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-bold text-gray-300">Team Logo</label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {registration.team_logo && (
                  <img
                    src={getImageUrl(registration.team_logo)}
                    alt="Team Logo"
                    className="h-24 w-24 rounded-xl border border-zinc-700 object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTeamLogo(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-400"
                />
              </div>
            </div>

            {/* Lobby Screenshot */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-bold text-gray-300">Lobby Screenshot</label>
              {registration.lobby_screenshot && (
                <img
                  src={getImageUrl(registration.lobby_screenshot)}
                  alt="Lobby"
                  className="mb-4 max-h-64 rounded-xl border border-zinc-700 object-contain"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLobbyScreenshot(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-400"
              />
            </div>
          </div>

          {/* Roster Section with 5 Main Mandatory + Optional Substitutes (Max 7) */}
          <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black">Edit Roster Members</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Must have exactly 5 Main Players. Substitutes are optional (Up to 2 allowed).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-400">
                  {players.length} / 7 Total Members
                </span>

                {currentSubsCount < 2 && players.length < 7 && (
                  <button
                    type="button"
                    onClick={handleAddSubstitute}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-blue-500"
                  >
                    + Add Substitute
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {players.map((player, index) => (
                <div key={player.id || `new-${index}`} className="rounded-2xl border border-zinc-800 bg-black p-5 space-y-4 relative">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-blue-400">
                      {player.is_substitute ? `Substitute Member` : `Main Player ${index + 1}`}
                    </span>
                    
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs text-gray-400">
                        <input
                          type="checkbox"
                          checked={Boolean(player.is_substitute)}
                          onChange={(e) => handleSubstituteChange(index, e.target.checked)}
                          className="h-4 w-4 accent-blue-600"
                        />
                        Substitute
                      </label>

                      {/* Allow removing substitutes or excess rows */}
                      {player.is_substitute && (
                        <button
                          type="button"
                          onClick={() => handleRemovePlayer(index)}
                          className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 rounded bg-red-500/10 border border-red-500/20"
                          title="Remove substitute"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-gray-400">Real Name *</label>
                    <input
                      type="text"
                      value={player.real_name}
                      onChange={(e) => handlePlayerChange(index, "real_name", e.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-sm text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-gray-400">IGN *</label>
                    <input
                      type="text"
                      value={player.ign}
                      onChange={(e) => handlePlayerChange(index, "ign", e.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-sm text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-gray-400">MLBB ID *</label>
                      <input
                        type="text"
                        value={player.mlbb_id}
                        onChange={(e) => handlePlayerChange(index, "mlbb_id", e.target.value)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-sm text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-gray-400">Server ID *</label>
                      <input
                        type="text"
                        value={player.server_id}
                        onChange={(e) => handlePlayerChange(index, "server_id", e.target.value)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <label className="mb-1 block text-xs text-gray-400">Player Photo</label>
                    <div className="flex items-center gap-3">
                      {player.player_photo && (
                        <img
                          src={getImageUrl(player.player_photo)}
                          alt={player.ign}
                          className="h-14 w-14 rounded-xl border border-zinc-700 object-cover"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePlayerPhotoChange(index, e.target.files?.[0] || null)}
                        className="block w-full text-xs text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(backPath)}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 font-bold text-white transition hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-8 py-3 font-black text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}