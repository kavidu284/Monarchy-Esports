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

  const [actionLoading, setActionLoading] =
    useState(false);

  const getFileUrl = (filePath) => {
    if (!filePath) return "";

    if (String(filePath).startsWith("http")) {
      return filePath;
    }

    return `${api.defaults.baseURL}/${String(
      filePath
    ).replace(/^\/+/, "")}`;
  };

  // New download function
  const downloadFile = async (
    filePath,
    fileName
  ) => {
    if (!filePath) {
      alert("Photo is not available");
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

  const fetchRegistration =
    useCallback(async () => {
      try {
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

        alert(
          "Failed to load registration details"
        );
      } finally {
        setLoading(false);
      }
    }, [currentRegistrationId]);

  useEffect(() => {
    const load = async () => {
      await fetchRegistration();
    };

    load();
  }, [fetchRegistration]);

  const approveTeam = async () => {
    const confirmed =
      window.confirm(
        "Approve this team?"
      );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      await api.put(
        `/registrations/${currentRegistrationId}/approve`
      );

      alert("Team Approved");

      fetchRegistration();
    } catch (error) {
      console.error(error);
      alert("Approve Failed");
    } finally {
      setActionLoading(false);
    }
  };

  const rejectTeam = async () => {
    const confirmed =
      window.confirm(
        "Reject this team?"
      );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      await api.put(
        `/registrations/${currentRegistrationId}/reject`
      );

      alert("Team Rejected");

      fetchRegistration();
    } catch (error) {
      console.error(error);
      alert("Reject Failed");
    } finally {
      setActionLoading(false);
    }
  };

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

  const formatDate = (value) => {
    if (!value) return "-";

    return String(value)
      .replace("T", " ")
      .slice(0, 16);
  };

  const backPath = tournamentId
      ? `/admin/tournaments/${tournamentId}/registrations`
      : "/admin/tournaments"
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
          <p className="text-gray-400">
            Loading registration details...
          </p>
        </div>
      </div>
    );
  }

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
            <button className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700">
              Back to Registrations
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const mainPlayers = players.filter(
    (player) => !player.is_substitute
  );

  const substitutePlayers =
    players.filter(
      (player) =>
        player.is_substitute
    );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}

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

        <Link to={backPath}>
          <button className="rounded-xl border border-zinc-700 bg-black px-6 py-3 font-bold text-white transition hover:border-blue-500 hover:bg-blue-500/10">
            ← Back
          </button>
        </Link>
      </div>

      {/* TEAM INFO */}

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

          {/* ACTIONS */}

          <div className="flex flex-wrap gap-3 lg:flex-col">
            <button
              onClick={approveTeam}
              disabled={actionLoading}
              className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading
                ? "Processing..."
                : "Approve"}
            </button>

            <button
              onClick={rejectTeam}
              disabled={actionLoading}
              className="rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading
                ? "Processing..."
                : "Reject"}
            </button>
          </div>
        </div>
      </div>

      {/* LOBBY SCREENSHOT */}

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

      {/* MAIN PLAYERS */}

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
          {mainPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              getFileUrl={getFileUrl}
              downloadFile={downloadFile}
              teamName={
                registration.team_name
              }
            />
          ))}
        </div>
      </div>

      {/* SUBSTITUTE PLAYERS */}

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

function PlayerCard({
  player,
  getFileUrl,
  downloadFile,
  teamName,
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-black p-5 transition hover:border-blue-500/60">
      <div className="mb-5 flex items-center gap-4">
        <div className="h-24 w-24 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900">
          {player.player_photo ? (
            <img
              src={getFileUrl(
                player.player_photo
              )}
              alt={player.real_name}
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