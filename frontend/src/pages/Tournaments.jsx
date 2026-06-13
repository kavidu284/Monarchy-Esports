import { useEffect, useState } from "react";
import api from "../services/api";
import TournamentSection from "../components/TournamentSection";
import { Link } from "react-router-dom";

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const response = await api.get("/tournaments");

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.tournaments || [];

        setTournaments(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void loadTournaments();
  }, []);

  const normalizeStatus = (status) => {
    return String(status || "")
      .trim()
      .toLowerCase();
  };

  const current = tournaments.filter(
    (t) => normalizeStatus(t.status) === "ongoing"
  );

  const upcoming = tournaments.filter(
    (t) => normalizeStatus(t.status) === "upcoming"
  );

  const completed = tournaments.filter(
    (t) => normalizeStatus(t.status) === "completed"
  );

  const otherTournaments = tournaments.filter((t) => {
    const status = normalizeStatus(t.status);

    return (
      status !== "ongoing" &&
      status !== "upcoming" &&
      status !== "completed"
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 px-10 py-8 text-center shadow-xl shadow-blue-600/10">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />

          <p className="font-semibold text-gray-300">
            Loading tournaments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-900 py-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.22),transparent_35%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.08),transparent_35%)]" />

        <div className="relative mx-auto max-w-5xl px-6">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-400">
            Monarchy Esports
          </p>

          <h1 className="mt-4 text-5xl font-black leading-tight md:text-7xl">
            Tournaments
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-400 md:text-xl">
            Explore current, upcoming, and completed Monarchy Esports
            tournaments.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
              <p className="text-3xl font-black text-blue-400">
                {current.length}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Current
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-3xl font-black text-white">
                {upcoming.length}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Upcoming
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-3xl font-black text-white">
                {completed.length}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Completed
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* RULES BOX */}
        <div className="mb-16 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/30">
          <div className="border-b border-zinc-800 bg-blue-500/5 p-8 md:p-10">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Official Guidelines
            </p>

            <h2 className="mt-3 text-4xl font-black">
              Tournament Rules
            </h2>

            <p className="mt-4 max-w-3xl leading-7 text-gray-400">
              All participants must read and agree to the official
              Monarchy Esports tournament rules before registering.
            </p>
          </div>

          <div className="grid gap-5 p-8 md:grid-cols-2 md:p-10">
            <div className="rounded-2xl border border-zinc-800 bg-black p-6 transition hover:border-blue-500/50">
              <div className="mb-4 text-3xl">📝</div>

              <h3 className="text-xl font-black">
                Eligibility & Registration
              </h3>

              <p className="mt-3 leading-7 text-gray-400">
                Accurate information required. One team per player.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-6 transition hover:border-blue-500/50">
              <div className="mb-4 text-3xl">👥</div>

              <h3 className="text-xl font-black">
                Team Requirements
              </h3>

              <p className="mt-3 leading-7 text-gray-400">
                5 Main Players + up to 2 Substitutes.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-6 transition hover:border-blue-500/50">
              <div className="mb-4 text-3xl">⚔️</div>

              <h3 className="text-xl font-black">
                Match Rules
              </h3>

              <p className="mt-3 leading-7 text-gray-400">
                Be ready on time. Walkovers apply.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-6 transition hover:border-blue-500/50">
              <div className="mb-4 text-3xl">🛡️</div>

              <h3 className="text-xl font-black">
                Fair Play
              </h3>

              <p className="mt-3 leading-7 text-gray-400">
                No cheating, hacks, exploits or account sharing.
              </p>
            </div>
          </div>

          <div className="flex justify-center border-t border-zinc-800 p-8">
            <Link
              to="/rules"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-7 py-4 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              View Full Tournament Rules
            </Link>
          </div>
        </div>

        {/* TOURNAMENT LIST */}
        {tournaments.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-xl shadow-black/30">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-4xl">
              🏆
            </div>

            <h3 className="text-3xl font-black text-white">
              No Tournaments Found
            </h3>

            <p className="mt-3 text-gray-500">
              Admin has not created any tournaments yet.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            <TournamentSection
              title="🔥 Current Tournament"
              tournaments={current}
            />

            <TournamentSection
              title="🚀 Upcoming Tournaments"
              tournaments={upcoming}
            />

            <TournamentSection
              title="🏆 Past Tournaments"
              tournaments={completed}
            />

            {otherTournaments.length > 0 && (
              <TournamentSection
                title="🎮 Other Tournaments"
                tournaments={otherTournaments}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}