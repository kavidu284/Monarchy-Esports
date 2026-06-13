import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import Countdown from "../components/Countdown";

export default function TournamentDetails() {
  const { id } = useParams();

  const [tournament, setTournament] = useState(null);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await api.get(`/tournaments/${id}`);
        setTournament(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    if (id) {
      void fetchTournament();
    }
  }, [id]);

  if (!tournament) {
    return (
      <div className="min-h-screen bg-black py-20 text-center text-white">
        Loading...
      </div>
    );
  }

  const now = new Date();

  const isUpcoming = tournament.status === "Upcoming";
  const isOngoing = tournament.status === "Ongoing";
  const isCompleted = tournament.status === "Completed";

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

  const registrationNotStarted =
    registrationStart && now < registrationStart;

  const registrationEnded =
    registrationEnd && now > registrationEnd;

  const registrationOpen =
    showRegistration &&
    (!registrationStart || now >= registrationStart) &&
    (!registrationEnd || now <= registrationEnd);

  let countdownTitle = "Tournament Starts In";
  let countdownDate = tournament.tournament_start;
  let endedText = "Tournament Started";

  if (registrationNotStarted) {
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

  const registrationButtonText = registrationNotStarted
    ? "Registration Soon"
    : registrationEnded
    ? "Registration Closed"
    : isUpcoming
    ? "Registration Soon"
    : "Registration Closed";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
          <img
            src={
              tournament.banner_image ||
              "https://placehold.co/1200x500"
            }
            alt={tournament.title}
            className="h-96 w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

          <div className="absolute bottom-8 left-8 right-8">
            <span
              className={`mb-4 inline-flex rounded-full border px-4 py-1 text-sm font-bold ${
                tournament.status === "Ongoing"
                  ? "border-green-500/40 bg-green-500/10 text-green-400"
                  : tournament.status === "Upcoming"
                  ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                  : "border-zinc-500/40 bg-zinc-500/10 text-gray-300"
              }`}
            >
              {tournament.status}
            </span>

            <h1 className="text-5xl font-bold">
              {tournament.title}
            </h1>

            <p className="mt-2 text-xl text-blue-300">
              {tournament.subtitle}
            </p>
          </div>
        </div>

        {/* ACTION PANEL */}
        <div className="mt-10 rounded-3xl border border-blue-500/20 bg-zinc-950 p-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-widest text-blue-400">
                {countdownTitle}
              </p>

              {countdownDate ? (
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

            <div className="grid gap-4 sm:grid-cols-2">
              {registrationOpen ? (
                <Link
                  to={`/register/${tournament.id}`}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-4 font-bold text-white transition hover:bg-blue-700"
                >
                  Register Team
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex cursor-not-allowed items-center justify-center rounded-xl bg-zinc-800 px-6 py-4 font-bold text-gray-500"
                >
                  {registrationButtonText}
                </button>
              )}

              {canViewTournament ? (
                <Link
                  to={`/tournament/${tournament.id}/view`}
                  className="inline-flex items-center justify-center rounded-xl border border-blue-500/40 bg-black px-6 py-4 font-bold text-white transition hover:bg-blue-500/10"
                >
                  View Tournament
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex cursor-not-allowed items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-4 font-bold text-gray-500"
                >
                  Tournament Coming Soon
                </button>
              )}

              <Link
                to="/rules"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-4 font-bold text-white transition hover:border-blue-500 hover:bg-zinc-800"
              >
                View Rules
              </Link>

              {canViewTournament ? (
                <Link
                  to={`/tournament/${tournament.id}/view`}
                  className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-4 font-bold text-black transition hover:bg-blue-100"
                >
                  Schedule / Bracket
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex cursor-not-allowed items-center justify-center rounded-xl bg-zinc-800 px-6 py-4 font-bold text-gray-500"
                >
                  Schedule Coming Soon
                </button>
              )}
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-gray-500">Game</p>
            <h3 className="mt-2 text-xl font-bold">
              🎮 {tournament.game_name}
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

        {/* RULES */}
        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <h2 className="text-3xl font-bold">
            Tournament Rules
          </h2>

          <p className="mt-3 text-gray-400">
            Please read the official tournament rules before
            registering for this event.
          </p>

          <Link
            to="/rules"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
          >
            View Rules
          </Link>
        </div>

        {/* ABOUT */}
        <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <h2 className="text-3xl font-bold">
            About Tournament
          </h2>

          <p className="mt-4 whitespace-pre-line leading-8 text-gray-300">
            {tournament.description}
          </p>
        </div>
      </div>
    </div>
  );
}