import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

export default function RegistrationDetails() {
  const {
    id,
    tournamentId,
    registrationId,
  } = useParams();

  // Supports both old route and new tournament route
  const currentRegistrationId =
    registrationId || id;

  const [registration, setRegistration] =
    useState(null);

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // SECURITY RE-AUTHENTICATION MODAL
  // =========================================================

  const [securityModalOpen, setSecurityModalOpen] =
    useState(false);

  const [pendingActionType, setPendingActionType] =
    useState(null); // "approve" | "reject"

  const [reauth, setReauth] = useState({
    username: "",
    password: "",
  });

  const [reauthMessage, setReauthMessage] =
    useState("");

  const [verifying, setVerifying] =
    useState(false);

  // =========================================================
  // TOAST
  // =========================================================

  const [toast, setToast] = useState(null);

  const showToast = useCallback(
    (type, title, message) => {
      setToast({
        type,
        title,
        message,
      });

      setTimeout(() => {
        setToast(null);
      }, 4000);
    },
    []
  );

  // =========================================================
  // FILE URL
  // =========================================================

  const getFileUrl = (filePath) => {
    if (!filePath) return "";

    if (String(filePath).startsWith("http")) {
      return filePath;
    }

    return `${api.defaults.baseURL}/${String(
      filePath
    ).replace(/^\/+/, "")}`;
  };

  // =========================================================
  // DOWNLOAD FILE
  // =========================================================

  const downloadFile = async (
    filePath,
    fileName
  ) => {
    if (!filePath) {
      showToast(
        "error",
        "File Missing",
        "Photo is not available"
      );
      return;
    }

    const fileUrl = getFileUrl(filePath);

    const safeFileName = String(
      fileName || "download"
    )
      .trim()
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-");

    try {
      // Cloudinary image download
      if (
        fileUrl.includes("res.cloudinary.com") &&
        fileUrl.includes("/upload/")
      ) {
        const downloadUrl = fileUrl.replace(
          "/upload/",
          `/upload/fl_attachment:${safeFileName}/`
        );

        const link =
          document.createElement("a");

        link.href = downloadUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        document.body.appendChild(link);
        link.click();
        link.remove();

        return;
      }

      // Local or other hosted file download
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(
          "Unable to download file"
        );
      }

      const blob = await response.blob();

      const blobUrl =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = blobUrl;
      link.download = safeFileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error(
        "Download error:",
        error
      );

      window.open(
        fileUrl,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  // =========================================================
  // FETCH REGISTRATION
  // =========================================================

  const fetchRegistration =
    useCallback(async () => {
      try {
        setLoading(true);

        const response = await api.get(
          `/registrations/${currentRegistrationId}/full`
        );

        setRegistration(
          response.data.registration
        );

        setPlayers(
          response.data.players || []
        );
      } catch (error) {
        console.error(error);

        showToast(
          "error",
          "Load Failed",
          "Failed to load registration details"
        );
      } finally {
        setLoading(false);
      }
    }, [
      currentRegistrationId,
      showToast,
    ]);

  useEffect(() => {
    const load = async () => {
      await fetchRegistration();
    };

    load();
  }, [fetchRegistration]);

  // =========================================================
  // STATUS
  // =========================================================

  const registrationStatus = String(
    registration?.status || "Pending"
  ).toLowerCase();

  const isPending =
    registrationStatus === "pending";

  const isApproved =
    registrationStatus === "approved";

  const isRejected =
    registrationStatus === "rejected";

  // =========================================================
  // OPEN RE-AUTHENTICATION MODAL
  //
  // Used for:
  //
  // Pending -> Reject
  // Approved -> Reject
  // Rejected -> Reapprove
  // =========================================================

  const triggerActionModal = (type) => {
    setPendingActionType(type);

    setReauth({
      username: "",
      password: "",
    });

    setReauthMessage("");

    setSecurityModalOpen(true);
  };

  // =========================================================
  // PENDING -> APPROVED
  //
  // Normal authenticated admin session is enough.
  //
  // IMPORTANT:
  // Rejected -> Approved goes through re-authentication.
  // =========================================================

  const handleApprove = async () => {
    // Rejected -> Reapprove requires
    // security verification.
    if (isRejected) {
      triggerActionModal("approve");
      return;
    }

    // Only Pending should reach this normal
    // approval action.
    if (!isPending) {
      return;
    }

    try {
      await api.put(
        `/registrations/${currentRegistrationId}/approve`
      );

      showToast(
        "success",
        "Approved",
        "Team Approved Successfully"
      );

      await fetchRegistration();
    } catch (error) {
      console.error(
        "Approval error:",
        error
      );

      showToast(
        "error",
        "Approval Failed",
        error.response?.data?.detail ||
          "Unable to approve this team."
      );
    }
  };

  // =========================================================
  // REJECT
  //
  // Pending -> Reject
  // Approved -> Reject
  //
  // BOTH require re-authentication.
  // =========================================================

  const handleReject = () => {
    if (!isPending && !isApproved) {
      return;
    }

    triggerActionModal("reject");
  };

  // =========================================================
  // EXECUTE ACTION AFTER RE-AUTHENTICATION
  // =========================================================

  const executeConfirmedAction = async () => {
    try {
      if (pendingActionType === "approve") {
        // Rejected -> Reapproved

        await api.put(
          `/registrations/${currentRegistrationId}/approve`
        );

        showToast(
          "success",
          "Reapproved",
          "Team Reapproved Successfully"
        );
      }

      if (pendingActionType === "reject") {
        // Pending -> Rejected
        // Approved -> Rejected

        await api.put(
          `/registrations/${currentRegistrationId}/reject`
        );

        showToast(
          "success",
          "Rejected",
          "Team Rejected Successfully"
        );
      }

      setSecurityModalOpen(false);

      setPendingActionType(null);

      setReauth({
        username: "",
        password: "",
      });

      await fetchRegistration();
    } catch (error) {
      console.error(
        "Action error:",
        error
      );

      showToast(
        "error",
        "Action Failed",
        error.response?.data?.detail ||
          "Operation failed."
      );
    }
  };

  // =========================================================
  // RE-AUTHENTICATION
  // =========================================================

  const handleConfirmReauth = async (e) => {
    e.preventDefault();

    if (
      !reauth.username.trim() ||
      !reauth.password.trim()
    ) {
      setReauthMessage(
        "Username and password are required."
      );
      return;
    }

    try {
      setVerifying(true);
      setReauthMessage("");

      const response = await api.post(
        "/administration/verify-credentials",
        {
          username: reauth.username.trim(),
          password: reauth.password,
        }
      );

      if (response.data?.success) {
        await executeConfirmedAction();
      } else {
        setReauthMessage(
          "Authorization failed."
        );
      }
    } catch (error) {
      console.error(
        "Verification failed:",
        error
      );

      setReauthMessage(
        error?.response?.data?.detail ||
          "Invalid credentials or unauthorized action."
      );
    } finally {
      setVerifying(false);
    }
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusClass = (status) => {
    const value = String(
      status || ""
    ).toLowerCase();

    if (value === "approved") {
      return "border-green-500/40 bg-green-500/10 text-green-400";
    }

    if (value === "rejected") {
      return "border-red-500/40 bg-red-500/10 text-red-400";
    }

    return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
  };

  // =========================================================
  // DATE
  // =========================================================

  const formatDate = (value) => {
    if (!value) return "-";

    return String(value)
      .replace("T", " ")
      .slice(0, 16);
  };

  // =========================================================
  // BACK PATH
  // =========================================================

  const backPath = tournamentId
    ? `/admin/tournaments/${tournamentId}/registrations`
    : "/admin/tournaments";

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-black font-sans text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-4 shadow-xl">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />

          <span className="font-semibold text-gray-300">
            Loading registration details...
          </span>
        </div>
      </div>
    );
  }

  // =========================================================
  // NOT FOUND
  // =========================================================

  if (!registration) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center">
          <h2 className="text-3xl font-bold">
            Registration Not Found
          </h2>

          <p className="mt-3 text-gray-400">
            This registration does not exist
            or failed to load.
          </p>

          <Link to={backPath}>
            <button
              type="button"
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              Back to Registrations
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================
  // PLAYERS
  // =========================================================

  const mainPlayers = players.filter(
    (player) => !player.is_substitute
  );

  const substitutePlayers =
    players.filter(
      (player) =>
        player.is_substitute
    );

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="relative min-h-screen bg-black font-sans text-white selection:bg-blue-600 selection:text-white">

      {/* =====================================================
          TOAST NOTIFICATION
      ====================================================== */}

      {toast && (
        <div className="fixed right-6 top-6 z-[200] w-full max-w-md animate-slide-in">
          <div
            className={`flex items-start gap-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
              toast.type === "success"
                ? "border-emerald-500/40 bg-zinc-950/95 text-emerald-400"
                : "border-red-500/40 bg-zinc-950/95 text-red-400"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-current/20 bg-current/10 text-xl font-bold">
              {toast.type === "success"
                ? "✓"
                : "⚠️"}
            </div>

            <div className="min-w-0 flex-1 pr-2">
              <h4 className="text-sm font-bold text-white">
                {toast.title}
              </h4>

              <p className="mt-0.5 text-xs text-gray-300">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setToast(null)
              }
              className="p-1 text-xs font-bold text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          SECURITY RE-AUTHENTICATION MODAL
      ====================================================== */}

      {securityModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md">

          <div className="w-full max-w-md space-y-5 rounded-3xl border border-blue-500/30 bg-zinc-950 p-6 shadow-2xl sm:p-8">

            {/* MODAL HEADER */}

            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-xl text-blue-400">
                🔒
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  Authorization Required
                </h3>

                <p className="max-w-[220px] truncate text-xs font-semibold text-blue-400">
                  {pendingActionType ===
                  "approve"
                    ? "Reapprove"
                    : "Reject"}{" "}
                  Team:{" "}
                  {registration.team_name}
                </p>
              </div>

            </div>

            {/* DESCRIPTION */}

            <p className="text-xs leading-relaxed text-gray-400">
              Please enter your admin
              credentials to verify
              authorization before
              proceeding.
            </p>

            {/* FORM */}

            <form
              onSubmit={handleConfirmReauth}
              className="space-y-4"
            >

              {/* USERNAME */}

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Username
                </label>

                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={reauth.username}
                  onChange={(e) =>
                    setReauth({
                      ...reauth,
                      username:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Username"
                />
              </div>

              {/* PASSWORD */}

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Password
                </label>

                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={reauth.password}
                  onChange={(e) =>
                    setReauth({
                      ...reauth,
                      password:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              {/* ERROR */}

              {reauthMessage && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-400">
                  ⚠️ {reauthMessage}
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-3">

                <button
                  type="button"
                  onClick={() => {
                    setSecurityModalOpen(false);
                    setPendingActionType(null);
                    setReauthMessage("");
                  }}
                  disabled={verifying}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-gray-300 transition hover:bg-zinc-900 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={verifying}
                  className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-lg transition disabled:opacity-50 ${
                    pendingActionType ===
                    "approve"
                      ? "bg-green-600 shadow-green-600/20 hover:bg-green-500"
                      : "bg-red-600 shadow-red-600/20 hover:bg-red-500"
                  }`}
                >
                  {verifying
                    ? "Verifying..."
                    : `Confirm ${
                        pendingActionType ===
                        "approve"
                          ? "Reapprove"
                          : "Reject"
                      }`}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-10 flex flex-col gap-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 md:flex-row md:items-center md:justify-between">

        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Admin Panel
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Registration Details
          </h1>

          <p className="mt-2 max-w-2xl text-gray-400">
            Review team information,
            captain details, lobby
            screenshot, and player list.
          </p>
        </div>
        <Link
          to = {`/admin/registrations/edit/${registration.id}`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
        >
          Edit
        </Link>
        <Link to={backPath}>
          <button
            type="button"
            className="rounded-xl border border-zinc-700 bg-black px-6 py-3 font-bold text-white transition hover:border-blue-500 hover:bg-blue-500/10"
          >
            ← Back
          </button>
        </Link>
      </div>

      {/* =====================================================
          TEAM INFORMATION
      ====================================================== */}

      <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">

          <div className="flex flex-col gap-6 md:flex-row">

            {/* TEAM LOGO */}

            <div>
              <div className="h-36 w-36 overflow-hidden rounded-3xl border border-blue-500/30 bg-black">

                {registration.team_logo ? (
                  <img
                    src={getFileUrl(
                      registration.team_logo
                    )}
                    alt={
                      registration.team_name
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl">
                    🛡️
                  </div>
                )}

              </div>

              {registration.team_logo && (
                <button
                  type="button"
                  onClick={() =>
                    downloadFile(
                      registration.team_logo,
                      `${registration.team_name}-team-logo`
                    )
                  }
                  className="mt-3 w-36 rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Download Logo
                </button>
              )}
            </div>

            {/* TEAM DETAILS */}

            <div>

              <div className="mb-4 flex flex-wrap items-center gap-3">

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                    registration.status
                  )}`}
                >
                  {registration.status ||
                    "Pending"}
                </span>

                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                  Registration #
                  {registration.id}
                </span>

              </div>

              <h2 className="text-4xl font-black">
                {registration.team_name}
              </h2>

              <h2 className="text-2xl font-bold text-gray-400">
                {registration.clan_name}
              </h2>

              <p className="mt-2 text-gray-400">
                Submitted:{" "}
                {formatDate(
                  registration.created_at
                )}
              </p>

              {/* CAPTAIN INFORMATION */}

              <div className="mt-6 grid gap-4 md:grid-cols-2">

                <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="text-sm text-gray-500">
                    Captain Name
                  </p>

                  <p className="mt-1 font-bold text-white">
                    {registration.captain_name ||
                      "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="text-sm text-gray-500">
                    Captain Email
                  </p>

                  <a
                    href={`mailto:${registration.captain_email}`}
                    className="mt-1 block break-all font-bold text-blue-400 hover:underline"
                  >
                    {registration.captain_email ||
                      "-"}
                  </a>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="text-sm text-gray-500">
                    Captain Phone
                  </p>

                  <p className="mt-1 font-bold text-white">
                    {registration.captain_phone ||
                      "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                  <p className="text-sm text-gray-500">
                    Discord Username
                  </p>

                  <p className="mt-1 font-bold text-white">
                    {registration.discord_username ||
                      "-"}
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* =================================================
              ACTION BUTTONS

              PENDING:
              Approve = normal authenticated session
              Reject = re-authentication

              APPROVED:
              Reject = re-authentication

              REJECTED:
              Reapprove = re-authentication
          ================================================== */}

          <div className="flex flex-wrap gap-3 lg:flex-col">

            {/* PENDING */}

            {isPending && (
              <>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700"
                >
                  Approve
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
                >
                  Reject
                </button>
              </>
            )}

            {/* APPROVED */}

            {isApproved && (
              <button
                type="button"
                onClick={handleReject}
                className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700"
              >
                Reject
              </button>
            )}

            {/* REJECTED */}

            {isRejected && (
              <button
                type="button"
                onClick={handleApprove}
                className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700"
              >
                Reapprove
              </button>
            )}

          </div>
        </div>
      </div>

      {/* =====================================================
          LOBBY SCREENSHOT
      ====================================================== */}

      {registration.lobby_screenshot && (
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                Verification
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Lobby Screenshot
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                downloadFile(
                  registration.lobby_screenshot,
                  `${registration.team_name}-lobby-screenshot`
                )
              }
              className="rounded-xl bg-cyan-600 px-6 py-3 font-bold text-white transition hover:bg-cyan-700"
            >
              Download Screenshot
            </button>

          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-black">

            <img
              src={getFileUrl(
                registration.lobby_screenshot
              )}
              alt="Lobby Screenshot"
              className="max-h-[600px] w-full object-contain"
            />

          </div>
        </div>
      )}

      {/* =====================================================
          MAIN PLAYERS
      ====================================================== */}

      <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Team Roster
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Main Players
            </h2>
          </div>

          <span className="rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400">
            {mainPlayers.length} Players
          </span>

        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {mainPlayers.map(
            (player) => (
              <PlayerCard
                key={player.id}
                player={player}
                getFileUrl={getFileUrl}
                downloadFile={downloadFile}
                teamName={
                  registration.team_name
                }
              />
            )
          )}

        </div>
      </div>

      {/* =====================================================
          SUBSTITUTE PLAYERS
      ====================================================== */}

      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Backup Roster
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Substitute Players
            </h2>
          </div>

          <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-400">
            {substitutePlayers.length}{" "}
            Substitutes
          </span>

        </div>

        {substitutePlayers.length ===
        0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-black p-6 text-center">
            <p className="text-gray-400">
              No substitute players added.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {substitutePlayers.map(
              (player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  getFileUrl={getFileUrl}
                  downloadFile={
                    downloadFile
                  }
                  teamName={
                    registration.team_name
                  }
                />
              )
            )}

          </div>
        )}

      </div>
    </div>
  );
}

// =========================================================
// PLAYER CARD
// =========================================================

function PlayerCard({
  player,
  getFileUrl,
  downloadFile,
  teamName,
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-black p-5 transition hover:border-blue-500/60">

      {/* PLAYER HEADER */}

      <div className="mb-5 flex items-center gap-4">

        <div className="h-24 w-24 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900">

          {player.player_photo ? (
            <img
              src={getFileUrl(
                player.player_photo
              )}
              alt={
                player.real_name
              }
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl">
              👤
            </div>
          )}

        </div>

        <div>

          <h3 className="text-xl font-black text-white">
            {player.real_name || "-"}
          </h3>

          <p
            className={`mt-1 text-sm font-bold ${
              player.is_substitute
                ? "text-yellow-400"
                : "text-green-400"
            }`}
          >
            {player.is_substitute
              ? "Substitute Player"
              : "Main Player"}
          </p>

        </div>

      </div>

      {/* PLAYER DETAILS */}

      <div className="space-y-3">

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">

          <p className="text-sm text-gray-500">
            IGN
          </p>

          <p className="mt-1 font-bold text-blue-400">
            {player.ign || "-"}
          </p>

        </div>

        <div className="grid grid-cols-2 gap-3">

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">

            <p className="text-sm text-gray-500">
              MLBB ID
            </p>

            <p className="mt-1 break-all font-bold text-white">
              {player.mlbb_id || "-"}
            </p>

          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">

            <p className="text-sm text-gray-500">
              Server ID
            </p>

            <p className="mt-1 break-all font-bold text-white">
              {player.server_id || "-"}
            </p>

          </div>

        </div>

      </div>

      {/* DOWNLOAD PLAYER PHOTO */}

      {player.player_photo && (
        <button
          type="button"
          onClick={() =>
            downloadFile(
              player.player_photo,
              `${teamName}-${
                player.ign ||
                player.real_name
              }-photo`
            )
          }
          className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700"
        >
          Download Player Photo
        </button>
      )}

    </div>
  );
}