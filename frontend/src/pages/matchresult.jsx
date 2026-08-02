import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import getImageUrl from "../utils/getImageUrl";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export default function TournamentResultDetailPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/tournaments/${id}/results`);
        setTournament(res.data);
      } catch (err) {
        console.error("Error loading tournament details:", err);
        setError("Could not retrieve tournament match outcomes.");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  // --- 1. ANIMATED LOADING SKELETON ---
  if (loading) {
    return (
      <div className="relative min-h-screen bg-black text-white px-4 py-12 flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient Glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        
        <div className="mx-auto w-full max-w-5xl space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-3 animate-pulse">
            <div className="h-4 w-32 rounded-lg bg-zinc-800" />
            <div className="h-10 w-3/4 rounded-xl bg-zinc-800" />
            <div className="h-4 w-24 rounded-lg bg-zinc-900" />
          </div>

          {/* Champion Skeleton */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-8 shadow-2xl animate-pulse">
            <div className="h-64 sm:h-80 w-full rounded-2xl bg-zinc-900/80 mb-6" />
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-zinc-900 shrink-0" />
              <div className="space-y-3 w-full">
                <div className="h-4 w-28 rounded bg-blue-500/20" />
                <div className="h-8 w-1/2 rounded-lg bg-zinc-900" />
                <div className="flex gap-2 pt-2">
                  <div className="h-8 w-20 rounded-lg bg-zinc-900" />
                  <div className="h-8 w-20 rounded-lg bg-zinc-900" />
                  <div className="h-8 w-20 rounded-lg bg-zinc-900" />
                </div>
              </div>
            </div>
          </div>

          {/* Grid Skeletons */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-44 rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-6 animate-pulse" />
            <div className="h-44 rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-6 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // --- 2. ERROR / NOT FOUND UI ---
  if (error || !tournament) {
    return (
      <div className="relative min-h-screen bg-black text-white px-4 py-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full rounded-3xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl p-8 text-center shadow-2xl shadow-black/80"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-3xl">
            🏆
          </div>
          <h2 className="mt-5 text-2xl font-black text-white">Results Pending</h2>
          <p className="mt-2 text-sm text-gray-400">
            {error || "Match outcomes for this tournament have not been announced yet."}
          </p>
          <Link
            to={`/tournament/${id}`}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3 font-bold text-white transition shadow-lg shadow-blue-600/20"
          >
            ← Back to Tournament Details
          </Link>
        </motion.div>
      </div>
    );
  }

  const winnerTeam = tournament.champion_team;
  const winnerLogo = tournament.champion_logo;
  const gameName = tournament.game_name || tournament.game;

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white overflow-hidden px-4 py-12">
      
      {/* BACKGROUND AMBIENT GLOWS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-5xl space-y-10"
      >
        {/* HEADER */}
        <motion.div variants={cardVariants} className="space-y-2">
          <Link
            to={`/tournament/${id}`}
            className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition hover:underline"
          >
            ← Back to Tournament Details
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div>
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-400 backdrop-blur-md">
                Official Tournament Podium
              </span>
              <h1 className="mt-2 text-4xl sm:text-5xl font-black tracking-tight text-white">
                {tournament.title}
              </h1>
            </div>
            {gameName && (
              <span className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-bold text-gray-400 backdrop-blur-md">
                🎮 {gameName}
              </span>
            )}
          </div>
        </motion.div>

        {/* 👑 1ST PLACE CHAMPION DISPLAY */}
        {winnerTeam && (
          <motion.div
            variants={cardVariants}
            className="group relative overflow-hidden rounded-3xl border-2 border-blue-500/50 bg-gradient-to-b from-blue-600/20 via-zinc-950/90 to-zinc-950 p-1 shadow-2xl shadow-blue-600/10"
          >
            <div className="relative rounded-[22px] bg-zinc-950/80 backdrop-blur-xl overflow-hidden p-6 sm:p-8">
              
              {/* TEAM BRANDING & ROSTER */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                
                {winnerLogo ? (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-black/80 p-3 shadow-inner shadow-blue-500/10">
                    <img
                      src={getImageUrl(winnerLogo)}
                      alt={winnerTeam}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-3xl font-bold text-blue-400">
                    👑
                  </div>
                )}

                <div className="text-center sm:text-left flex-1 space-y-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">
                      Winner
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-white">
                      {winnerTeam}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 🥈 RUNNER UP & 🥉 3RD PLACE GRID */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* 🥈 RUNNER-UP */}
          {tournament.runner_up_team && (
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -4 }}
              className="group rounded-3xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl transition hover:border-zinc-700"
            >
              <div className="flex items-center gap-4 border-b border-zinc-800/80 pb-5">
                {tournament.runner_up_logo ? (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-zinc-700 bg-black/60 p-2 shadow-inner">
                    <img
                      src={getImageUrl(tournament.runner_up_logo)}
                      alt={tournament.runner_up_team}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-2xl">
                    🥈
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    🥈 2nd Place
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    {tournament.runner_up_team}
                  </h3>
                </div>
              </div>

            </motion.div>
          )}

          {/* 🥉 3RD PLACE */}
          {tournament.third_place_team && (
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -4 }}
              className="group rounded-3xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl transition hover:border-zinc-700"
            >
              <div className="flex items-center gap-4 border-b border-zinc-800/80 pb-5">
                {tournament.third_place_logo ? (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-zinc-700 bg-black/60 p-2 shadow-inner">
                    <img
                      src={getImageUrl(tournament.third_place_logo)}
                      alt={tournament.third_place_team}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-2xl">
                    🥉
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    🥉 3rd Place
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    {tournament.third_place_team}
                  </h3>
                </div>
              </div>

            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
}