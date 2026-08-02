import { motion } from "framer-motion";
import getImageUrl from "../utils/getImageUrl";

export default function ChampionPodium({ tournament }) {
  if (!tournament) return null;

  const {
    champion_team,
    runner_up_team,
    third_place_team,
    champion_photo,
    champion_logo,
    runner_up_logo,
    third_place_logo,
    title,
    prize_pool,
  } = tournament;

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-10 shadow-2xl shadow-black/50">
      
      {/* HEADER META */}
      <div className="mb-10 text-center border-b border-zinc-800/80 pb-6">
        <h2 className="text-3xl md:text-4xl font-black text-white">{title}</h2>
        {prize_pool && (
          <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
            Prize Pool: Rs. {Number(prize_pool).toLocaleString()}
          </p>
        )}
      </div>

      {/* PODIUM CARDS GRID */}
      <div className="grid gap-6 md:grid-cols-3 md:items-end">
        
        {/* 🥈 2ND PLACE (RUNNER UP) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="order-2 md:order-1 rounded-2xl border border-zinc-800 bg-black/60 p-6 text-center shadow-lg hover:border-zinc-700 transition"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900 text-2xl font-black text-gray-300">
            🥈
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Runner-Up
          </span>

          <div className="my-4 flex items-center justify-center min-h-[64px]">
            {runner_up_logo ? (
              <img
                src={getImageUrl(runner_up_logo)}
                alt={runner_up_team || "Runner Up"}
                className="h-16 w-16 object-contain rounded-xl"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-900 font-bold text-gray-500 text-xl">
                🛡️
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-white truncate">
            {runner_up_team || "TBD"}
          </h3>
        </motion.div>

        {/* 🏆 1ST PLACE (CHAMPION) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="order-1 md:order-2 rounded-3xl border-2 border-blue-500/60 bg-gradient-to-b from-blue-600/20 via-black to-black p-8 text-center shadow-2xl shadow-blue-600/20 md:-translate-y-4"
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-blue-500 bg-blue-500/20 text-4xl shadow-lg shadow-blue-500/30">
            🏆
          </div>
          
          <span className="rounded-full border border-blue-500/40 bg-blue-500/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-blue-400">
            1st Place Champion
          </span>

          {/* CHAMPION PHOTO (IF UPLOADED) */}
          {champion_photo && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-blue-500/30">
              <img
                src={getImageUrl(champion_photo)}
                alt={`${champion_team} Victory Photo`}
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          {/* LOGO & TEAM NAME */}
          <div className="my-4 flex items-center justify-center min-h-[72px]">
            {champion_logo ? (
              <img
                src={getImageUrl(champion_logo)}
                alt={champion_team || "Champion"}
                className="h-20 w-20 object-contain rounded-2xl"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/30 font-bold text-blue-400 text-2xl">
                👑
              </div>
            )}
          </div>

          <h3 className="text-2xl md:text-3xl font-black text-blue-400 truncate">
            {champion_team || "Champion"}
          </h3>
        </motion.div>

        {/* 🥉 3RD PLACE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="order-3 rounded-2xl border border-zinc-800 bg-black/60 p-6 text-center shadow-lg hover:border-zinc-700 transition"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-900/60 bg-blue-950/40 text-2xl font-black text-blue-400">
            🥉
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            3rd Place
          </span>

          <div className="my-4 flex items-center justify-center min-h-[64px]">
            {third_place_logo ? (
              <img
                src={getImageUrl(third_place_logo)}
                alt={third_place_team || "3rd Place"}
                className="h-16 w-16 object-contain rounded-xl"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-900 font-bold text-gray-500 text-xl">
                ⚔️
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-white truncate">
            {third_place_team || "TBD"}
          </h3>
        </motion.div>

      </div>
    </div>
  );
}