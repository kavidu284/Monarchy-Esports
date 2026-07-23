import { Link } from "react-router-dom";
import Countdown from "./Countdown";
import getImageUrl from "../utils/getImageUrl";

export default function TournamentCard({ tournament }) {
  if (!tournament) return null;

  const now = new Date();

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
    <article className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40 transition duration-300 hover:-translate-y-1.5 hover:border-blue-500/60 hover:shadow-blue-500/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_95%_0%,rgba(59,130,246,0.15),transparent_35%)] opacity-0 transition duration-300 group-hover:opacity-100" />

      <div className="relative aspect-[16/9] overflow-hidden bg-zinc-900 ring-1 ring-white/10">
        <img
          src={getImageUrl(tournament.banner_image)}
          alt={tournament.title}
          className="h-full w-full object-cover object-center contrast-110 brightness-110 saturate-110 transition-transform duration-700 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-blue-600/0 transition duration-500 group-hover:bg-blue-600/5" />

        <span
          className={`absolute right-4 top-4 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide backdrop-blur sm:px-4 sm:py-2 sm:text-xs ${
            tournament.status === "Ongoing"
              ? "border-green-500/40 bg-green-500/10 text-green-400"
              : tournament.status === "Upcoming"
              ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
              : "border-zinc-500/40 bg-zinc-500/10 text-gray-300"
          }`}
        >
          {tournament.status}
        </span>

        <div className="absolute bottom-5 left-5 right-5">
          <h3 className="line-clamp-2 text-2xl font-black leading-tight text-white drop-shadow-lg sm:text-3xl">
            {tournament.title}
          </h3>

          <p className="mt-2 line-clamp-1 text-xs font-semibold text-blue-300 sm:text-sm">
            {tournament.subtitle}
          </p>
        </div>
      </div>

      <div className="relative p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-black/70 p-4 transition hover:border-blue-500/40">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 sm:text-xs">
              Game
            </p>

            <p className="mt-2 truncate text-sm font-black text-white sm:text-base">
              🎮 {tournament.game_name || "MLBB"}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black/70 p-4 transition hover:border-blue-500/40">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 sm:text-xs">
              Prize Pool
            </p>

            <p className="mt-2 text-sm font-black text-blue-400 sm:text-base">
              Rs. {Number(tournament.prize_pool || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {countdownDate ? (
          <div className="mt-4 rounded-2xl border border-blue-500/25 bg-blue-500/5 p-3 shadow-lg shadow-blue-600/5 sm:mt-5 sm:p-5">
            <Countdown
              targetDate={countdownDate}
              title={countdownTitle}
              endedText={endedText}
            />
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2">
          <Link
            to={`/tournament/${tournament.id}`}
            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:bg-blue-500 hover:shadow-blue-600/40 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-base"
          >
            View Tournament
          </Link>

          {registrationOpen ? (
            <Link
              to={`/register/${tournament.id}`}
              className="inline-flex w-full items-center justify-center rounded-xl border border-blue-500/40 bg-black px-5 py-3 text-sm font-black text-white transition-all duration-300 hover:border-blue-400 hover:bg-blue-500/10 hover:shadow-lg hover:shadow-blue-600/10 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-base"
            >
              Register Team
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}