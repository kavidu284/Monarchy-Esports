import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import api from "../services/api";
import getImageUrl from "../utils/getImageUrl";
import logo from "../assets/footer.png";

export default function Hero() {
  const [tournaments, setTournaments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // FETCH UPCOMING + ONGOING TOURNAMENTS ONLY
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const fetchTournaments = async () => {
      try {
        const response = await api.get("/tournaments");

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.tournaments || [];

        const activeTournaments = data.filter((tournament) => {
          const status = String(tournament?.status || "").toLowerCase();

          return (
            tournament?.banner_image &&
            (status === "upcoming" || status === "ongoing")
          );
        });

        if (mounted) {
          setTournaments(activeTournaments);
        }
      } catch (error) {
        console.error("Failed to load tournaments:", error);

        if (mounted) {
          setTournaments([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void fetchTournaments();

    return () => {
      mounted = false;
    };
  }, []);

  // =====================================================
  // AUTOMATIC CAROUSEL
  //
  // -1 = MONARCHY HERO
  //  0 = TOURNAMENT 1
  //  1 = TOURNAMENT 2
  //  2 = TOURNAMENT 3
  //  -1 = MONARCHY HERO
  // =====================================================

  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      setCurrentIndex((previousIndex) => {
        if (tournaments.length === 0) {
          return -1;
        }

        if (previousIndex === -1) {
          return 0;
        }

        if (previousIndex === tournaments.length - 1) {
          return -1;
        }

        return previousIndex + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [loading, tournaments.length]);

  const showingMainHero = currentIndex === -1;

  const currentTournament =
    !showingMainHero && tournaments.length > 0
      ? tournaments[currentIndex]
      : null;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden bg-black px-4 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.30),transparent_45%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.12),transparent_45%)]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <motion.img
            src={logo}
            alt="Monarchy Esports Logo"
            animate={{
              y: [0, -8, 0],
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
              animate={{ x: ["-100%", "100%"] }}
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

  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden bg-black text-white">
      {/* =================================================
          GLOBAL BACKGROUND
      ================================================= */}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.28),transparent_42%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.10),transparent_45%)]" />

      <motion.div
        animate={{
          y: [0, -15, 0],
          opacity: [0.25, 0.55, 0.25],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl"
      />

      <motion.div
        animate={{
          y: [0, 15, 0],
          opacity: [0.15, 0.45, 0.15],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"
      />

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="relative z-10 flex min-h-[90vh] items-center justify-center px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <AnimatePresence mode="wait">

            {/* =================================================
                MAIN MONARCHY HERO
            ================================================= */}

            {showingMainHero ? (
              <motion.div
                key="main-hero"
                initial={{
                  opacity: 0,
                  y: 30,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -30,
                  scale: 0.97,
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut",
                }}
                className="mx-auto flex min-h-[75vh] w-full max-w-5xl flex-col items-center justify-center text-center"
              >
                {/* LOGO */}

                <motion.img
                  src={logo}
                  alt="Monarchy Esports Logo"
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mx-auto mb-6 h-auto w-32 max-w-full object-contain drop-shadow-[0_0_30px_rgba(37,99,235,0.8)] sm:w-48 md:mb-8 md:w-64"
                />

                {/* BADGE */}

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                  </span>

                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400 sm:text-xs sm:tracking-[0.3em]">
                    Monarchy Arena
                  </span>
                </div>

                {/* =================================================
                    MAIN HEADING
                ================================================= */}

                <h1 className="w-full break-words text-4xl font-black leading-tight tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                  MONARCHY{" "}
                  <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    ESPORTS
                  </span>
                </h1>

                {/* SUBTITLE */}

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:mt-6 sm:text-base md:text-lg">
                  Founded by gamers, for gamers. Building Sri Lanka&apos;s
                  premier competitive community and elite tournament stage.
                </p>

                {/* BUTTONS */}

                <div className="mt-8 flex w-full flex-col items-center justify-center gap-3.5 sm:w-auto sm:flex-row sm:gap-5">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto"
                  >
                    <Link
                      to="/tournaments"
                      className="flex w-full items-center justify-center rounded-full border border-blue-500/50 bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 sm:w-auto sm:px-8 sm:py-4 sm:text-base"
                    >
                      View Tournaments
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto"
                  >
                    <Link
                      to="/contact"
                      className="flex w-full items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/80 px-7 py-3.5 text-sm font-bold text-zinc-200 backdrop-blur-md transition-all hover:border-blue-500/50 hover:bg-zinc-900 hover:text-white sm:w-auto sm:px-8 sm:py-4 sm:text-base"
                    >
                      Get in Touch
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ) : (

              /* =================================================
                  PROFESSIONAL TOURNAMENT BANNER
              ================================================= */

              <motion.div
                key={`tournament-${currentTournament?.id}`}
                initial={{
                  opacity: 0,
                  y: 35,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -35,
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut",
                }}
                className="w-full"
              >
                {currentTournament && (
                  <div className="relative mx-auto w-full overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl shadow-black/60">

                    {/* =================================================
                        FULL BANNER
                    ================================================= */}

                    <div className="relative aspect-[16/9] min-h-[520px] w-full overflow-hidden sm:min-h-[580px] lg:min-h-[650px]">

                      <img
                        src={getImageUrl(
                          currentTournament.banner_image
                        )}
                        alt={currentTournament.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />

                      {/* Cinematic overlay */}

                      <div className="absolute inset-0 bg-black/20" />

                      {/* Bottom readability */}

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                      {/* Left readability */}

                      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent" />

                      {/* Subtle brand tint */}

                      <div className="absolute inset-0 bg-blue-950/10 mix-blend-multiply" />

                      {/* =================================================
                          TOURNAMENT CONTENT
                      ================================================= */}

                      <div className="absolute inset-x-0 bottom-0 z-10">
                        <div className="max-w-7xl px-6 pb-8 sm:px-10 sm:pb-10 md:px-14 md:pb-14 lg:px-16 lg:pb-16">

                          {/* STATUS + GAME */}

                          <div className="mb-4 flex flex-wrap items-center gap-2.5">
                            <span
                              className={`rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md sm:text-xs ${
                                String(
                                  currentTournament.status
                                ).toLowerCase() === "ongoing"
                                  ? "border-green-400/40 bg-green-500/15 text-green-300"
                                  : "border-blue-400/40 bg-blue-500/15 text-blue-300"
                              }`}
                            >
                              {currentTournament.status}
                            </span>

                            <span className="rounded-full border border-white/15 bg-black/40 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md sm:text-xs">
                              {currentTournament.game_name ||
                                "MLBB"}
                            </span>
                          </div>

                          {/* TITLE */}

                          <h1 className="max-w-5xl text-4xl font-black leading-[0.95] tracking-tight text-white drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-8xl">
                            {currentTournament.title}
                          </h1>

                          {/* SUBTITLE */}

                          {currentTournament.subtitle && (
                            <p className="mt-4 max-w-2xl text-sm font-semibold leading-relaxed text-white/85 drop-shadow-lg sm:text-lg md:text-xl">
                              {currentTournament.subtitle}
                            </p>
                          )}

                          {/* INFO */}

                          <div className="mt-5 flex flex-wrap items-center gap-3">

                            {currentTournament.prize_pool !==
                              undefined && (
                              <div className="rounded-xl border border-white/10 bg-black/45 px-4 py-2.5 backdrop-blur-md">
                                <span className="mr-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
                                  Prize Pool
                                </span>

                                <span className="text-sm font-black text-white sm:text-base">
                                  Rs.{" "}
                                  {Number(
                                    currentTournament.prize_pool || 0
                                  ).toLocaleString()}
                                </span>
                              </div>
                            )}

                            {currentTournament.max_teams && (
                              <div className="rounded-xl border border-white/10 bg-black/45 px-4 py-2.5 backdrop-blur-md">
                                <span className="mr-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
                                  Teams
                                </span>

                                <span className="text-sm font-black text-white sm:text-base">
                                  {currentTournament.max_teams}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* BUTTONS */}

                          <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">

                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full sm:w-auto"
                            >
                              <Link
                                to={`/tournament/${currentTournament.id}`}
                                className="inline-flex min-h-[50px] w-full items-center justify-center rounded-xl bg-blue-600 px-7 py-3 text-sm font-black text-white shadow-xl shadow-blue-900/30 transition-all duration-300 hover:bg-blue-500 hover:shadow-blue-500/30 sm:w-auto sm:px-8 sm:text-base"
                              >
                                View Tournament
                                <span className="ml-2">
                                  →
                                </span>
                              </Link>
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full sm:w-auto"
                            >
                              <Link
                                to="/tournaments"
                                className="inline-flex min-h-[50px] w-full items-center justify-center rounded-xl border border-white/20 bg-black/40 px-7 py-3 text-sm font-black text-white backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/10 sm:w-auto sm:px-8 sm:text-base"
                              >
                                All Tournaments
                              </Link>
                            </motion.div>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* =================================================
              CAROUSEL INDICATORS
          ================================================= */}

          {tournaments.length > 0 && (
            <div className="mt-6 flex items-center justify-center gap-2">

              {/* Main Hero */}

              <button
                type="button"
                onClick={() => setCurrentIndex(-1)}
                aria-label="Show Monarchy Esports"
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  showingMainHero
                    ? "w-8 bg-blue-500"
                    : "w-2 bg-white/25 hover:bg-white/50"
                }`}
              />

              {/* Tournaments */}

              {tournaments.map((tournament, index) => (
                <button
                  key={tournament.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Show ${tournament.title}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    currentIndex === index
                      ? "w-8 bg-blue-500"
                      : "w-2 bg-white/25 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}