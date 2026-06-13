export default function About() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden py-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.22),transparent_35%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.08),transparent_35%)]" />

        <div className="relative mx-auto max-w-5xl px-6">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-400">
            Monarchy Esports
          </p>

          <h1 className="mt-4 text-5xl font-black leading-tight md:text-7xl">
            About{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Monarchy Esports
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-400 md:text-xl">
            Building a competitive gaming community where passion, skill,
            and sportsmanship come together.
          </p>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 md:p-10">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Who We Are
          </p>

          <h2 className="mt-3 text-4xl font-black">
            Community Driven Esports
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-300">
            Monarchy Esports is a community-driven esports organization
            dedicated to creating exciting and professional competitive
            gaming experiences. We organize tournaments, community events,
            and competitive opportunities for players who want to challenge
            themselves and grow within the esports scene.
          </p>
        </div>
      </section>

      {/* MISSION / VISION */}
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-2">
        <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-8 shadow-xl shadow-black/30">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-3xl">
            🎯
          </div>

          <h2 className="text-3xl font-black">
            Our Mission
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-300">
            Our mission is to provide fair, organized, and engaging
            tournaments that bring players together while encouraging
            teamwork, competitiveness, and continuous improvement.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-3xl">
            👁️
          </div>

          <h2 className="text-3xl font-black">
            Our Vision
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-300">
            We aim to become one of the most respected esports communities
            by fostering talent, supporting players, and creating
            unforgettable competitive experiences for gamers at every level.
          </p>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            What We Do
          </p>

          <h2 className="mt-3 text-4xl font-black">
            Built For Competitive Players
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-blue-500/10">
            <div className="mb-5 text-4xl">🏆</div>

            <h3 className="text-2xl font-black">
              Tournaments
            </h3>

            <p className="mt-4 leading-7 text-gray-400">
              Organizing competitive tournaments with structured schedules,
              fair rules, and rewarding prize pools.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-blue-500/10">
            <div className="mb-5 text-4xl">👥</div>

            <h3 className="text-2xl font-black">
              Community
            </h3>

            <p className="mt-4 leading-7 text-gray-400">
              Building a welcoming environment where players can connect,
              compete, and grow.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-blue-500/10">
            <div className="mb-5 text-4xl">🚀</div>

            <h3 className="text-2xl font-black">
              Development
            </h3>

            <p className="mt-4 leading-7 text-gray-400">
              Encouraging player improvement through competitive
              experiences and community engagement.
            </p>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Core Values
          </p>

          <h2 className="mt-3 text-4xl font-black">
            What We Stand For
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30">
            <p className="text-3xl">⚖️</p>

            <h3 className="mt-4 text-xl font-black">
              Fair Play
            </h3>

            <p className="mt-3 text-gray-400">
              Integrity and sportsmanship in every match.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30">
            <p className="text-3xl">🤝</p>

            <h3 className="mt-4 text-xl font-black">
              Respect
            </h3>

            <p className="mt-3 text-gray-400">
              Respect for players, teams, and staff.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30">
            <p className="text-3xl">📈</p>

            <h3 className="mt-4 text-xl font-black">
              Growth
            </h3>

            <p className="mt-3 text-gray-400">
              Helping players improve and succeed.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30">
            <p className="text-3xl">⭐</p>

            <h3 className="mt-4 text-xl font-black">
              Excellence
            </h3>

            <p className="mt-3 text-gray-400">
              Delivering high-quality esports experiences.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-5xl rounded-3xl border border-blue-500/20 bg-blue-500/5 p-10 shadow-xl shadow-blue-600/10">
          <h2 className="text-4xl font-black">
            Join the Monarchy Esports Community
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-gray-400">
            Compete, improve, and become part of the next generation of
            esports talent.
          </p>
        </div>
      </section>
    </div>
  );
}