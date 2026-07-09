import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/footer.png";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-center text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.35),transparent_38%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.14),transparent_35%)]" />

      <motion.div
        animate={{ y: [0, -25, 0], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute left-10 top-20 h-44 w-44 rounded-full bg-blue-600/10 blur-3xl"
      />

      <motion.div
        animate={{ y: [0, 25, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute bottom-20 right-10 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="relative"
      >
        <motion.img
          src={logo}
          alt="Monarchy Esports Logo"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mx-auto mb-8 w-56 drop-shadow-[0_0_35px_rgba(59,130,246,0.9)] md:w-72"
        />

        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.4em] text-blue-400">
            Founded by gamers, for gamers
          </p>

          <h1 className="text-6xl font-black leading-none md:text-8xl">
            MONARCHY
            <span className="block bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent md:inline">
              {" "}ESPORTS
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-300 md:text-xl">
            Founded by gamers, for gamers. Building Sri Lanka&apos;s competitive
            community.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/tournaments"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/40"
            >
              View Tournament
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full border border-blue-400/30 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-blue-400 hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}