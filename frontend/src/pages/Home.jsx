import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import Hero from "../components/Hero";
import AboutSection from "../components/AboutSection";
import TournamentCard from "../components/TournamentCard";
import AnnouncementSection from "../components/AnnouncementSection";
import logo from "../assets/footer.png";

import api from "../services/api";

function LoadingScreen() {
  return (

      <section className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden bg-black px-4 text-white">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.35),transparent_45%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.15),transparent_45%)]" />

        {/* Glow */}
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-3xl" />

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="relative z-10 flex flex-col items-center"
        >
          <motion.img
            src={logo}
            alt="Monarchy Esports Logo"
            animate={{
              y: [0, -10, 0],
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mb-8 h-auto w-36 object-contain drop-shadow-[0_0_35px_rgba(37,99,235,0.8)] sm:w-48 md:w-60"
          />

          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-zinc-800">
            <motion.div
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-full w-full rounded-full bg-blue-500"
            />
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
            Loading Arena
          </p>
        </motion.div>
      </section>
    );
}

export default function Home() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadTournaments = async () => {
      try {
        const response = await api.get("/tournaments");

        if (mounted) {
          // FILTER OUT COMPLETED TOURNAMENTS
          // Only keep ongoing and upcoming events
          const activeTournaments = (response.data || []).filter((t) => {
            const status = t.status?.toLowerCase();
            return status === "ongoing" || status === "upcoming" || status === "open";
          });

          setTournaments(activeTournaments);
        }
      } catch (error) {
        console.error("Error loading tournaments:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadTournaments();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  // Grab the first active tournament (if any exist)
  const featuredTournament = tournaments.length > 0 ? tournaments[0] : null;

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

          {featuredTournament ? (
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-zinc-800/70 bg-zinc-950/70 p-3 shadow-xl shadow-blue-600/10 backdrop-blur md:p-4"
            >
              <TournamentCard tournament={featuredTournament} />
            </motion.div>
          ) : (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-xl shadow-black/30">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-4xl">
                🏆
              </div>

              <h3 className="text-2xl font-black text-white">
                No active tournaments available
              </h3>

              <p className="mt-3 text-gray-400">
                Check back soon! New upcoming and ongoing tournaments will appear here.
              </p>
            </div>
          )}
        </div>
      </motion.section>

      <AnnouncementSection />
    </>
  );
}