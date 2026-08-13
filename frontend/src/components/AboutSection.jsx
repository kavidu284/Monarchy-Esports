import { motion } from "framer-motion";

export default function AboutSection() {

  return (
    <section className="bg-black px-4 py-16 text-white sm:px-6 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-6xl"
      >
        {/* HEADER SECTION */}
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400 sm:text-sm sm:tracking-[0.35em]">
            Who We Are
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            About Monarchy Esports
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-gray-300 sm:mt-6 sm:text-lg sm:leading-8">
            Monarchy Esports is a non-profit esports organization founded by
            gamers, for gamers, with the vision of building a dynamic and
            inclusive competitive gaming community.
          </p>
        </div>
      </motion.div>
    </section>
  );
}