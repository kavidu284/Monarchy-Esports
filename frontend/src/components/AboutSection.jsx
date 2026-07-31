import { motion } from "framer-motion";

export default function AboutSection() {
  const features = [
    ["⚔️", "Competitive", "Professional tournaments.", "90%"],
    ["👥", "Community", "Growing MLBB ecosystem.", "85%"],
    ["🚀", "Development", "Player improvement.", "80%"],
    ["👑", "Leadership", "Future esports leaders.", "75%"],
  ];

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

        {/* RESPONSIVE GRID: 1 COL MOBILE, 2 COL TABLET, 4 COL DESKTOP */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 md:mt-16">
          {features.map(([icon, title, text, width], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="flex flex-col justify-between rounded-3xl border border-zinc-800/80 bg-zinc-950 p-6 shadow-xl shadow-black/40 transition-colors duration-300 hover:border-blue-500/50"
            >
              <div>
                <div className="mb-4 text-3xl sm:text-4xl">
                  {icon}
                </div>

                <h3 className="text-lg font-black text-blue-400 sm:text-xl">
                  {title}
                </h3>

                <p className="mt-2 text-sm text-gray-400 sm:text-base">
                  {text}
                </p>
              </div>

              {/* PROGRESS BAR */}
              <div className="mt-6">
                <div className="mb-1.5 flex items-center justify-end">
                  <span className="text-xs font-semibold text-zinc-500">
                    {width}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-900">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.2 + index * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}