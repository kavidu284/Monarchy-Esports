import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/footer.png";

export default function Hero() {
  return (
    <section className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden bg-black px-4 py-12 text-center text-white sm:px-6 md:py-20 lg:py-24">
      {/* BACKGROUND GRADIENT GLOWS */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.35),transparent_45%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.15),transparent_45%)]" />

      {/* AMBIENT FLOATING BLURS - CLAMPED SIZES TO PREVENT OVERFLOW */}
      <motion.div
        animate={{ y: [0, -15, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-2 top-10 h-32 w-32 rounded-full bg-blue-600/20 blur-3xl sm:left-10 sm:top-20 sm:h-56 sm:w-56"
      />

      <motion.div
        animate={{ y: [0, 15, 0], opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-10 right-2 h-36 w-36 rounded-full bg-cyan-500/20 blur-3xl sm:bottom-20 sm:right-10 sm:h-64 sm:w-64"
      />

      {/* HERO CONTENT CONTAINER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-2"
      >
        {/* RESPONSIVE LOGO */}
        <motion.img
          src={logo}
          alt="Monarchy Esports Logo"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto mb-6 h-auto w-32 max-w-full object-contain drop-shadow-[0_0_30px_rgba(37,99,235,0.8)] sm:w-48 md:mb-8 md:w-64"
        />

        {/* EYEBROW BADGE */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400 sm:text-xs sm:tracking-[0.3em]">
            Monarchy Arena
          </span>
        </div>

        {/* FLUID HEADING - PREVENTS HORIZONTAL OVERFLOW */}
        <h1 className="w-full text-4xl font-black leading-tight tracking-tight break-words sm:text-6xl md:text-7xl lg:text-8xl">
          MONARCHY{" "}
          <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-400 bg-clip-text text-transparent sm:inline-block">
            ESPORTS
          </span>
        </h1>

        {/* SUBTITLE */}
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 sm:mt-6 sm:text-base md:text-lg">
          Founded by gamers, for gamers. Building Sri Lanka&apos;s premier competitive community and elite tournament stage.
        </p>

        {/* ACTION BUTTONS - STACK ON MOBILE, ROW ON SM+ */}
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3.5 sm:w-auto sm:flex-row sm:gap-5">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Link
              to="/tournaments"
              className="flex w-full items-center justify-center rounded-full border border-blue-500/50 bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 sm:w-auto sm:px-8 sm:py-4 sm:text-base"
            >
              View Tournaments
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Link
              to="/contact"
              className="flex w-full items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/80 px-7 py-3.5 text-sm font-bold text-zinc-200 backdrop-blur-md transition-all hover:border-blue-500/50 hover:bg-zinc-900 hover:text-white sm:w-auto sm:px-8 sm:py-4 sm:text-base"
            >
              Get in Touch
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}