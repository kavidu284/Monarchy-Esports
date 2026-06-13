import { Link } from "react-router-dom";
import Countdown from "./Countdown";

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
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40 transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/70 hover:shadow-blue-600/20">
      {/* Glow Effects */}
      <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-blue-600/10 blur-3xl transition duration-500 group-hover:bg-blue-500/20" />
      <div className="absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl transition duration-500 group-hover:bg-cyan-400/20" />

      <div className="relative h-64 overflow-hidden bg-zinc-900">
        <img
          src={tournament.banner_image}
          alt={tournament.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-blue-600/0 transition duration-500 group-hover:bg-blue-600/10" />

        <span
          className={`absolute right-4 top-4 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide backdrop-blur ${
            tournament.status === "Ongoing"
              ? "border-green-500/40 bg-green-500/10 text-green-400"
              : tournament.status === "Upcoming"
              ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
              : "border-zinc-500/40 bg-zinc-500/10 text-gray-300"
          }`}
        >
          {tournament.status}
        </span>

        <div className="absolute left-4 top-4 rounded-full border border-zinc-700 bg-black/70 px-4 py-2 text-xs font-bold text-gray-300 backdrop-blur">
          🎮 {tournament.game_name || "MLBB"}
        </div>

        <div className="absolute bottom-5 left-5 right-5">
          <h3 className="line-clamp-1 text-3xl font-black text-white drop-shadow-lg">
            {tournament.title}
          </h3>

          <p className="mt-2 line-clamp-1 text-sm font-semibold text-blue-300">
            {tournament.subtitle}
          </p>
        </div>
      </div>

      <div className="relative p-6">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-zinc-800 bg-black p-4 transition hover:border-blue-500/40">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Game
            </p>

            <p className="mt-2 font-black text-white">
              🎮 {tournament.game_name}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black p-4 transition hover:border-blue-500/40">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Prize Pool
            </p>

            <p className="mt-2 font-black text-blue-400">
              Rs. {Number(tournament.prize_pool || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {countdownDate ? (
          <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 shadow-lg shadow-blue-600/5">
            <p className="mb-4 text-sm font-black uppercase tracking-widest text-blue-300">
              {countdownTitle}
            </p>

            <Countdown
              targetDate={countdownDate}
              endedText={endedText}
            />
          </div>
        ) : null}

        <div className="mt-6 grid gap-3">
          <Link
            to={`/tournament/${tournament.id}`}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 font-black text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/40"
          >
            View Tournament
          </Link>

          {registrationOpen ? (
            <Link
              to={`/register/${tournament.id}`}
              className="inline-flex w-full items-center justify-center rounded-2xl border border-blue-500/40 bg-black px-6 py-4 font-black text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-500/10 hover:shadow-lg hover:shadow-blue-600/10"
            >
              Register Team
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}