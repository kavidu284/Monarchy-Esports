import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import Hero from "../components/Hero";
import AboutSection from "../components/AboutSection";
import TournamentCard from "../components/TournamentCard";
import AnnouncementSection from "../components/AnnouncementSection";

import api from "../services/api";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10">
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
          <div className="absolute h-24 w-24 animate-spin rounded-full border-4 border-zinc-800 border-t-blue-500" />
          <span className="relative text-4xl">GO</span>
        </div>

        <h1 className="text-4xl font-black text-blue-500">
          MONARCHY ESPORTS
        </h1>

        <p className="mt-3 animate-pulse text-gray-400">
          Loading gaming arena...
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const response =
          await api.get("/tournaments");

        setTournaments(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void loadTournaments();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Hero />

      <AboutSection />

      <motion.section
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
        className="bg-black px-6 py-20 text-white"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-400">
              Featured Event
            </p>

            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Featured Tournament
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-400">
              Join the latest Monarchy Esports competitive tournament and
              prove your skills.
            </p>
          </div>

          {tournaments.length > 0 ? (
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-zinc-800/70 bg-zinc-950/70 p-3 shadow-xl shadow-blue-600/10 backdrop-blur md:p-4"
            >
              <TournamentCard
                tournament={tournaments[0]}
              />
            </motion.div>
          ) : (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-xl shadow-black/30">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-4xl">
                🏆
              </div>

              <h3 className="text-2xl font-black text-white">
                No tournaments available
              </h3>

              <p className="mt-3 text-gray-400">
                Featured tournaments will appear here soon.
              </p>
            </div>
          )}
        </div>
      </motion.section>

      <AnnouncementSection />
    </>
  );
}