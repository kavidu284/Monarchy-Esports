import { Link } from "react-router-dom";
import Countdown from "./Countdown";
import getImageUrl from "../utils/getImageUrl";

export default function TournamentCard({ tournament }) {
  if (!tournament) return null;

  const now = new Date();

  const isCompleted =
    String(tournament.status).toLowerCase() === "completed" ||
    String(tournament.status).toLowerCase() === "finished";

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

  const registrationOpen =
    showRegistration &&
    (!registrationStart || now >= registrationStart) &&
    (!registrationEnd || now <= registrationEnd);

  let countdownTitle = "Tournament Starts In";
  let countdownDate = tournament.tournament_start;
  let endedText = "Tournament Started";

  if (registrationStart && now < registrationStart) {
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

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-950 shadow-xl shadow-black/30 transition hover:border-blue-500/60 hover:shadow-blue-500/10">
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        {/* FIXED CONTAINER SIZE - PREVENTS PORTRAIT IMAGE STRETCHING */}
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-black lg:aspect-none lg:h-auto lg:w-80">
          {/* Ambient blurred backdrop for empty space */}
          <img
            src={getImageUrl(tournament.banner_image)}
            alt=""
            className="absolute inset-0 h-full w-full scale-150 object-cover opacity-40 blur-2xl"
          />

          {/* Centered Image */}
          <img
            src={getImageUrl(tournament.banner_image)}
            alt={tournament.title}
            className="relative h-full w-full object-contain p-2 transition duration-500 hover:scale-105"
            loading="lazy"
            decoding="async"
          />

          {/* Gradient Overlay for Mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent lg:hidden" />
        </div>

        {/* CARD DETAILS CONTENT */}
        <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${
                  tournament.status === "Ongoing"
                    ? "border-green-500/40 bg-green-500/10 text-green-400"
                    : tournament.status === "Upcoming"
                    ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                    : "border-zinc-500/40 bg-zinc-500/10 text-gray-300"
                }`}
              >
                {tournament.status}
              </span>

              <span className="rounded-full border border-zinc-700 bg-black px-3 py-1 text-xs font-bold text-gray-300">
                🎮 {tournament.game_name || "MLBB"}
              </span>

              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                💰 Rs. {Number(tournament.prize_pool || 0).toLocaleString()}
              </span>
            </div>

            <h2 className="text-2xl font-black text-white sm:text-3xl">
              {tournament.title}
            </h2>

            {tournament.subtitle && (
              <p className="mt-2 text-sm font-semibold text-blue-300">
                {tournament.subtitle}
              </p>
            )}

            {countdownDate ? (
              <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 shadow-lg shadow-blue-600/5">
                <Countdown
                  targetDate={countdownDate}
                  title={countdownTitle}
                  endedText={endedText}
                />
              </div>
            ) : null}
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to={`/tournament/${tournament.id}`}
              className={`inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-6 py-3 text-center font-bold text-black transition hover:bg-blue-100 ${
                registrationOpen || isCompleted ? "w-full sm:flex-1" : "w-full"
              }`}
            >
              View Tournament →
            </Link>

            {isCompleted ? (
              <Link
                to={`/tournament/${tournament.id}/result`}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-center font-bold text-black transition hover:bg-amber-400 sm:flex-1"
              >
                🏆 View Results
              </Link>
            ) : registrationOpen ? (
              <Link
                to={`/register/${tournament.id}`}
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-center font-bold text-white transition hover:bg-blue-500 sm:flex-1"
              >
                Register Team
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}