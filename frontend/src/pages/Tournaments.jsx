import { useEffect, useState } from "react";
import api from "../services/api";
import TournamentSection from "../components/TournamentSection";
import { Link } from "react-router-dom";

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const response = await api.get("/tournaments");
        setTournaments(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    void loadTournaments();
  }, []);

  const current = tournaments.filter(
    (t) => t.status === "Ongoing"
  );

  const upcoming = tournaments.filter(
    (t) => t.status === "Upcoming"
  );

  const completed = tournaments.filter(
    (t) => t.status === "Completed"
  );

  return (
    <div className="min-h-screen bg-black text-white">

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-zinc-900 rounded-2xl p-8 mb-10">

          <h2 className="text-4xl font-bold mb-4">
            Tournament Rules
          </h2>

          <p className="text-gray-400 mb-6">
            All participants must read and agree to the official
            Monarchy Esports tournament rules before registering.
          </p>

          <div className="grid md:grid-cols-2 gap-4">

            <div className="bg-black p-4 rounded-xl">
              <h3 className="font-bold mb-2">
                Eligibility & Registration
              </h3>
              <p className="text-gray-400">
                Accurate information required. One team per player.
              </p>
            </div>

            <div className="bg-black p-4 rounded-xl">
              <h3 className="font-bold mb-2">
                Team Requirements
              </h3>
              <p className="text-gray-400">
                5 Main Players + Up to 2 Substitutes.
              </p>
            </div>

            <div className="bg-black p-4 rounded-xl">
              <h3 className="font-bold mb-2">
                Match Rules
              </h3>
              <p className="text-gray-400">
                Be ready on time. Walkovers apply.
              </p>
            </div>

            <div className="bg-black p-4 rounded-xl">
              <h3 className="font-bold mb-2">
                Fair Play
              </h3>
              <p className="text-gray-400">
                No cheating, hacks, exploits or account sharing.
              </p>
            </div>

          </div>

          <div className="mt-8 flex justify-center">

            <Link
              to="/rules"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              View Full Tournament Rules
            </Link>

          </div>

</div>
        <h1 className="text-5xl font-bold text-center mb-16">
          Tournaments
        </h1>

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

      </div>

    </div>
  );
}