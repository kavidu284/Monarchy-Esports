import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import getImageUrl from "../utils/getImageUrl";
import Countdown from "../components/Countdown";
import ChampionPodium from "../components/championpodim";

export default function TournamentDetails() {
  const { id } = useParams();

  const [tournament, setTournament] = useState(null);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await api.get(`/tournaments/${id}`);
        setTournament(response.data);
      } catch (error) {
        console.error("Error fetching tournament:", error);
      }
    };

    if (id) {
      void fetchTournament();
    }
  }, [id]);

  if (!tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 px-8 py-7 text-center shadow-xl shadow-blue-600/10 sm:px-10 sm:py-8">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
          <p className="font-semibold text-gray-300">Loading tournament...</p>
        </div>
      </div>
    );
  }

  const now = new Date();

  const isUpcoming = tournament.status === "Upcoming";
  const isOngoing = tournament.status === "Ongoing";
  const isCompleted = tournament.status === "Completed";

  // Allow viewing schedule/brackets when ongoing or completed
  const canViewTournament = isOngoing || isCompleted;

  const showRegistration =
    tournament.show_registration === true ||
    tournament.show_registration === 1 ||
    tournament.show_registration === "1";

  const registrationStart = tournament.registration_start
    ? new Date(String(tournament.registration_start).replace(" ", "T"))
    : null;

  const registrationEnd = tournament.registration_end
    ? new Date(String(tournament.registration_end).replace(" ", "T"))
    : null;

  const tournamentStart = tournament.tournament_start
    ? new Date(String(tournament.tournament_start).replace(" ", "T"))
    : null;

  const registrationNotStarted = registrationStart && now < registrationStart;
  const registrationEnded = registrationEnd && now > registrationEnd;

  // Registration can only be open if the tournament is not completed
  const registrationOpen =
    !isCompleted &&
    showRegistration &&
    (!registrationStart || now >= registrationStart) &&
    (!registrationEnd || now <= registrationEnd);

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
  } else if (registrationOpen && registrationEnd) {
    countdownTitle = "Registration Closes In";
    countdownDate = tournament.registration_end;
    endedText = "Registration Closed";
  } else if (tournamentStart && now < tournamentStart) {
    countdownTitle = "Tournament Starts In";
    countdownDate = tournament.tournament_start;
    endedText = "Tournament Started";
  }

  const registrationButtonText = isCompleted
    ? "Tournament Ended"
    : registrationNotStarted
    ? "Registration Soon"
    : registrationEnded
    ? "Registration Closed"
    : isUpcoming
    ? "Registration Soon"
    : "Registration Closed";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER SECTION */}
      <section className="relative overflow-hidden border-b border-zinc-900 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.2),transparent_35%)]">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 md:py-14">
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
                  ? "bg-green-400 animate-pulse"
                  : isUpcoming
                  ? "bg-blue-400"
                  : "bg-blue-400"
              }`}
            />
            {tournament.status}
          </span>

          <h1 className="mt-4 text-3xl font-black leading-tight text-white md:text-5xl lg:text-6xl">
            {tournament.title}
          </h1>

          {tournament.subtitle && (
            <p className="mt-3 text-sm leading-6 text-blue-300 sm:text-lg sm:leading-8">
              {tournament.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* BANNER PHOTO DISPLAY */}
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950 shadow-2xl shadow-blue-950/20">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-black sm:aspect-[21/9]">
            {/* Ambient Blurred Background Image */}
            <img
              src={
                tournament.banner_image
                  ? getImageUrl(tournament.banner_image)
                  : "https://placehold.co/1200x500"
              }
              alt=""
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
            />

            {/* Sharp Main Banner Image */}
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

            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />

            <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-black/60 px-3 py-1.5 text-xs font-semibold text-gray-300 backdrop-blur-md sm:px-4 sm:py-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Tournament Banner
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        {/* ACTION & COUNTDOWN PANEL */}
        <div className="rounded-3xl border border-blue-500/20 bg-zinc-950 p-6 shadow-xl sm:p-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            {/* LEFT SIDE: COUNTDOWN */}
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
                <p className="text-gray-500">Date not released yet.</p>
              )}
            </div>

            {/* RIGHT SIDE: BUTTONS */}
            <div className="flex flex-col justify-center gap-4 sm:flex-row sm:items-center lg:justify-end">
              
              {/* REGISTRATION BUTTON (WHEN REGISTRATION IS OPEN) */}
              {registrationOpen && (
                <Link
                  to={`/register/${tournament.id}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700 sm:w-auto"
                >
                  Register Team
                </Link>
              )}

              {/* DISABLED REGISTRATION STATUS BUTTON (WHEN NOT OPEN AND NOT COMPLETED) */}
              {!registrationOpen && !isCompleted && !isOngoing && (
                <button
                  disabled
                  className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-zinc-800 px-6 py-4 font-bold text-gray-500 sm:w-auto"
                >
                  {registrationButtonText}
                </button>
              )}

              {/* VIEW TOURNAMENT BUTTON (WHEN ONGOING OR COMPLETED) */}
              {canViewTournament && (
                <Link
                  to={`/tournament/${tournament.id}/view`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700 px-6 py-4 font-bold text-white transition hover:bg-zinc-700 sm:w-auto"
                >
                  View Tournament
                </Link>
              )}

              {/* MATCH / PODIUM RESULTS BUTTON (WHEN COMPLETED) */}
              {isCompleted && (
                <Link
                  to={`/tournament/${tournament.id}/results`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-500 sm:w-auto shadow-lg shadow-blue-600/20"
                >
                  🏆 View Results
                </Link>
              )}

              {/* UPCOMING FALLBACK BUTTON (WHEN NOT ONGOING/COMPLETED/REGISTRATION OPEN) */}
              {!registrationOpen && !canViewTournament && (
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

        {/* HALL OF CHAMPIONS / PODIUM */}
        {isCompleted && (
          <div className="mt-12">
            <ChampionPodium tournament={tournament} />
          </div>
        )}

        {/* INFO CARDS */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-gray-500">Game</p>
            <h3 className="mt-2 text-xl font-bold">
              🎮 {tournament.game_name || "Esports"}
            </h3>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-gray-500">Prize Pool</p>
            <h3 className="mt-2 text-xl font-bold">
              💰 Rs.{" "}
              {Number(tournament.prize_pool || 0).toLocaleString()}
            </h3>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-gray-500">Status</p>
            <h3 className="mt-2 text-xl font-bold text-blue-400">
              {tournament.status}
            </h3>
          </div>
        </div>

        {/* RULES & ABOUT SECTIONS */}
        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <h2 className="text-3xl font-bold">Tournament Rules</h2>
          <p className="mt-3 text-gray-400">
            Please read the official tournament rules before registering for this event.
          </p>
          <Link
            to="/rules"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-700 px-6 py-3 font-bold text-white transition hover:border-blue-500 hover:bg-zinc-800"
          >
            View Rules
          </Link>
        </div>

        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <h2 className="text-3xl font-bold">About Tournament</h2>
          <p className="mt-4 leading-8 text-gray-300 whitespace-pre-line">
            {tournament.description || "No description available for this tournament."}
          </p>
        </div>
      </div>
    </div>
  );
}