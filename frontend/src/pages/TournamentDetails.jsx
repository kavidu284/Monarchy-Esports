import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import getImageUrl from "../utils/getImageUrl";
import Countdown from "../components/Countdown";
import ChampionPodium from "../components/championpodim";

export default function TournamentDetails() {
  const { id } = useParams();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchTournament = async () => {
      if (!id) {
        setError("Tournament ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/tournaments/${id}`);

        if (!cancelled) {
          setTournament(response.data);
        }
      } catch (err) {
        console.error("Error fetching tournament:", err);

        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
              "Failed to load tournament."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchTournament();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 px-8 py-7 text-center shadow-xl shadow-blue-600/10 sm:px-10 sm:py-8">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />

          <p className="font-semibold text-gray-300">
            Loading tournament...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="w-full max-w-xl rounded-3xl border border-red-500/20 bg-zinc-950 p-8 text-center shadow-2xl">
          <div className="mb-5 text-5xl">⚠️</div>

          <h1 className="text-2xl font-black">
            Unable to Load Tournament
          </h1>

          <p className="mt-3 text-gray-400">
            {error || "Tournament not found."}
          </p>

          <Link
            to="/tournaments"
            className="mt-7 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-500"
          >
            ← Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  /* =========================================================
     TOURNAMENT STATUS
  ========================================================= */

  const now = new Date();

  const isUpcoming = tournament.status === "Upcoming";
  const isOngoing = tournament.status === "Ongoing";
  const isCompleted = tournament.status === "Completed";

  const canViewTournament =
    isOngoing || isCompleted;

  /* =========================================================
     REGISTRATION
  ========================================================= */

  const showRegistration =
    tournament.show_registration === true ||
    tournament.show_registration === 1 ||
    tournament.show_registration === "1";

  const registrationStart = tournament.registration_start
    ? new Date(
        String(tournament.registration_start).replace(" ", "T")
      )
    : null;

  const registrationEnd = tournament.registration_end
    ? new Date(
        String(tournament.registration_end).replace(" ", "T")
      )
    : null;

  const tournamentStart = tournament.tournament_start
    ? new Date(
        String(tournament.tournament_start).replace(" ", "T")
      )
    : null;

  /* =========================================================
     TEAM COUNTS
  ========================================================= */

  const maxTeams = Number(tournament.max_teams || 0);

  const approvedTeams = Number(
    tournament.approved_team_count ??
      tournament.registration_count ??
      0
  );

  const remainingTeams = Math.max(
    0,
    maxTeams - approvedTeams
  );

  const teamProgress =
    maxTeams > 0
      ? Math.min(
          100,
          (approvedTeams / maxTeams) * 100
        )
      : 0;

  const registrationClosed =
    tournament.is_registration_full ||
    (maxTeams > 0 &&
      approvedTeams >= maxTeams);

  /* =========================================================
     REGISTRATION TIME
  ========================================================= */

  const registrationNotStarted =
    registrationStart &&
    now < registrationStart;

  const registrationEnded =
    registrationEnd &&
    now > registrationEnd;

  const registrationOpen =
    !isCompleted &&
    showRegistration &&
    !registrationNotStarted &&
    !registrationEnded &&
    !registrationClosed;

  /* =========================================================
     COUNTDOWN
  ========================================================= */

  let countdownTitle = "Tournament Starts In";
  let countdownDate = tournament.tournament_start;
  let endedText = "Tournament Started";

  if (isCompleted) {
    countdownTitle = "Tournament Status";
    countdownDate = null;
    endedText = "Tournament Completed";
  } else if (registrationNotStarted) {
    countdownTitle = "Registration Opens In";
    countdownDate = tournament.registration_start;
    endedText = "Registration Open";
  } else if (
    registrationOpen &&
    registrationEnd
  ) {
    countdownTitle = "Registration Closes In";
    countdownDate = tournament.registration_end;
    endedText = "Registration Closed";
  } else if (
    tournamentStart &&
    now < tournamentStart
  ) {
    countdownTitle = "Tournament Starts In";
    countdownDate = tournament.tournament_start;
    endedText = "Tournament Started";
  }

  /* =========================================================
     REGISTRATION BUTTON
  ========================================================= */

  const registrationButtonText = isCompleted
    ? "Tournament Ended"
    : registrationNotStarted
    ? "Registration Soon"
    : registrationEnded
    ? "Registration Closed"
    : registrationClosed
    ? "Registration Full"
    : isUpcoming
    ? "Registration Soon"
    : "Registration Closed";

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div className="min-h-screen bg-black text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-zinc-900 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.2),transparent_35%)]">

        <div className="mx-auto w-full max-w-6xl px-6 py-10 md:py-14">

          {/* STATUS */}
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold ${
              isOngoing
                ? "border-green-500/40 bg-green-500/10 text-green-400"
                : isUpcoming
                ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                : "border-blue-500/40 bg-blue-500/10 text-blue-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isOngoing
                  ? "animate-pulse bg-green-400"
                  : "bg-blue-400"
              }`}
            />

            {tournament.status}
          </span>

          {/* TITLE */}
          <h1 className="mt-4 text-3xl font-black leading-tight text-white md:text-5xl lg:text-6xl">
            {tournament.title}
          </h1>

          {/* SUBTITLE */}
          {tournament.subtitle && (
            <p className="mt-3 text-sm leading-6 text-blue-300 sm:text-lg sm:leading-8">
              {tournament.subtitle}
            </p>
          )}

        </div>
      </section>

      {/* =====================================================
          BANNER
      ===================================================== */}

      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">

        <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950 shadow-2xl shadow-blue-950/20">

          <div className="relative aspect-[16/9] w-full overflow-hidden bg-black sm:aspect-[21/9]">

            {/* BLURRED BACKGROUND */}
            <img
              src={
                tournament.banner_image
                  ? getImageUrl(tournament.banner_image)
                  : "https://placehold.co/1200x500"
              }
              alt=""
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
            />

            {/* MAIN IMAGE */}
            <img
              src={
                tournament.banner_image
                  ? getImageUrl(tournament.banner_image)
                  : "https://placehold.co/1200x500"
              }
              alt={tournament.title}
              className="relative h-full w-full object-contain object-center"
              loading="eager"
              decoding="async"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />

            {/* LABEL */}
            <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-black/60 px-3 py-1.5 text-xs font-semibold text-gray-300 backdrop-blur-md sm:px-4 sm:py-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Tournament Banner
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">

        {/* ===================================================
            COUNTDOWN + ACTIONS
        =================================================== */}

        <div className="rounded-3xl border border-blue-500/20 bg-zinc-950 p-6 shadow-xl sm:p-8">

          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">

            {/* COUNTDOWN */}
            <div>

              <p className="mb-4 text-sm font-bold uppercase tracking-widest text-blue-400">
                {countdownTitle}
              </p>

              {isCompleted ? (
                <p className="text-2xl font-bold text-blue-400">
                  🏆 Tournament Concluded
                </p>
              ) : countdownDate ? (
                <Countdown
                  targetDate={countdownDate}
                  endedText={endedText}
                />
              ) : (
                <p className="text-gray-500">
                  Date not released yet.
                </p>
              )}

            </div>

            {/* BUTTONS */}
            <div className="flex flex-col justify-center gap-4 sm:flex-row sm:items-center lg:justify-end">

              {/* REGISTER */}
              {registrationOpen && (
                <Link
                  to={`/register/${tournament.id}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700 sm:w-auto"
                >
                  Register Team
                </Link>
              )}

              {/* DISABLED REGISTRATION */}
              {(!registrationOpen ||
                registrationClosed) &&
                !isCompleted &&
                !isOngoing && (
                  <button
                    disabled
                    className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-zinc-800 px-6 py-4 font-bold text-gray-500 sm:w-auto"
                  >
                    {registrationButtonText}
                  </button>
                )}

              {/* VIEW TOURNAMENT */}
              {canViewTournament && (
                <Link
                  to={`/tournament/${tournament.id}/view`}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 px-6 py-4 font-bold text-white transition hover:bg-zinc-700 sm:w-auto"
                >
                  View Tournament
                </Link>
              )}

              {/* RESULTS */}
              {isCompleted && (
                <Link
                  to={`/tournament/${tournament.id}/results`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 sm:w-auto"
                >
                  🏆 View Results
                </Link>
              )}

              {/* FALLBACK */}
              {!registrationOpen &&
                !canViewTournament &&
                !isCompleted &&
                !isOngoing && (
                  <button
                    disabled
                    className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-zinc-800 px-6 py-4 font-bold text-gray-500 sm:w-auto"
                  >
                    View Tournament Soon
                  </button>
                )}

            </div>
          </div>
        </div>

        {/* ===================================================
            TEAM CAPACITY
        =================================================== */}

        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl sm:p-8">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                Tournament Capacity
              </p>

              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Approved Teams
              </h2>

              <p className="mt-2 text-gray-500">
                Current approved teams for this tournament.
              </p>

            </div>

            <div className="text-left sm:text-right">

              <div className="flex items-end gap-2 sm:justify-end">

                <span className="text-4xl font-black text-green-400">
                  {approvedTeams}
                </span>

                <span className="mb-1 text-xl font-bold text-gray-500">
                  / {maxTeams || "—"}
                </span>

              </div>

              <p className="mt-1 text-sm font-semibold text-gray-500">
                {maxTeams > 0
                  ? registrationClosed
                    ? "Tournament Full"
                    : `${remainingTeams} spots remaining`
                  : "Team limit not set"}
              </p>

            </div>

          </div>

          {/* PROGRESS BAR */}
          {maxTeams > 0 && (
            <div className="mt-7">

              <div className="mb-2 flex justify-between text-xs font-bold">

                <span className="text-gray-500">
                  Team Registration
                </span>

                <span className="text-green-400">
                  {Math.round(teamProgress)}%
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-zinc-800">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-green-500 transition-all duration-700"
                  style={{
                    width: `${teamProgress}%`,
                  }}
                />

              </div>

            </div>
          )}

        </div>

        {/* ===================================================
            INFO CARDS
        =================================================== */}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {/* GAME */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-500">
              Game
            </p>

            <h3 className="mt-2 text-xl font-bold text-white">
              🎮 {tournament.game_name || "Esports"}
            </h3>

          </div>

          {/* PRIZE */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-500">
              Prize Pool
            </p>

            <h3 className="mt-2 text-xl font-bold text-white">
              💰 Rs.{" "}
              {Number(
                tournament.prize_pool || 0
              ).toLocaleString()}
            </h3>

          </div>

          {/* APPROVED */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-500">
              Approved Teams
            </p>

            <h3 className="mt-2 text-3xl font-black text-green-400">
              {approvedTeams}
              <span className="ml-1 text-lg text-gray-500">
                / {maxTeams || "—"}
              </span>
            </h3>

          </div>

          {/* STATUS */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-sm text-gray-500">
              Status
            </p>

            <h3 className="mt-2 text-xl font-bold text-blue-400">
              {tournament.status}
            </h3>

          </div>

        </div>

        {/* ===================================================
            HALL OF CHAMPIONS
        =================================================== */}

        {isCompleted && (
          <div className="mt-12">
            <ChampionPodium
              tournament={tournament}
            />
          </div>
        )}

        {/* ===================================================
            RULES
        =================================================== */}

        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">

          <h2 className="text-3xl font-bold">
            Tournament Rules
          </h2>

          <p className="mt-3 text-gray-400">
            Please read the official tournament rules
            before registering for this event.
          </p>

          <Link
            to="/rules"
            className="mt-6 inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 font-bold text-white transition hover:border-blue-500 hover:bg-zinc-800"
          >
            View Rules
          </Link>

        </div>

        {/* ===================================================
            ABOUT
        =================================================== */}

        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">

          <h2 className="text-3xl font-bold">
            About Tournament
          </h2>

          <p className="mt-4 whitespace-pre-line leading-8 text-gray-300">
            {tournament.description ||
              "No description available for this tournament."}
          </p>

        </div>

        {/* ===================================================
            TOURNAMENT DETAILS
        =================================================== */}

        <div className="mt-10 grid gap-6 md:grid-cols-2">

          {/* REGISTRATION PERIOD */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">

            <h2 className="text-xl font-black">
              Registration Period
            </h2>

            <div className="mt-5 space-y-4">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Opens
                </p>

                <p className="mt-1 font-semibold text-white">
                  {registrationStart
                    ? registrationStart.toLocaleString()
                    : "Not announced"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Closes
                </p>

                <p className="mt-1 font-semibold text-white">
                  {registrationEnd
                    ? registrationEnd.toLocaleString()
                    : "Not announced"}
                </p>
              </div>

            </div>
          </div>

          {/* TOURNAMENT PERIOD */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">

            <h2 className="text-xl font-black">
              Tournament Period
            </h2>

            <div className="mt-5 space-y-4">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Starts
                </p>

                <p className="mt-1 font-semibold text-white">
                  {tournamentStart
                    ? tournamentStart.toLocaleString()
                    : "Not announced"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Ends
                </p>

                <p className="mt-1 font-semibold text-white">
                  {tournament.tournament_end
                    ? new Date(
                        String(
                          tournament.tournament_end
                        ).replace(" ", "T")
                      ).toLocaleString()
                    : "Not announced"}
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}