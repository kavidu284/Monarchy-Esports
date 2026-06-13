import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section className="bg-black px-6 py-24 text-white">
      <motion.div
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-6xl"
      >
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-400">
            Who We Are
          </p>

          <h2 className="mt-3 text-4xl font-black md:text-5xl">
            About Monarchy Esports
          </h2>

          <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-gray-300">
            Monarchy Esports is a non-profit esports organization founded by
            gamers, for gamers, with the vision of building a dynamic and
            inclusive competitive gaming community.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-4">
          {[
            ["⚔️", "Competitive", "Professional tournaments.", "90%"],
            ["👥", "Community", "Growing MLBB ecosystem.", "85%"],
            ["🚀", "Development", "Player improvement.", "80%"],
            ["👑", "Leadership", "Future esports leaders.", "75%"],
          ].map(([icon, title, text, width], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30 transition hover:border-blue-500/50"
            >
              <div className="mb-4 text-4xl">
                {icon}
              </div>

              <h3 className="text-xl font-black text-blue-400">
                {title}
              </h3>

              <p className="mt-3 text-gray-400">
                {text}
              </p>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}