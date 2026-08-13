import { Link } from "react-router-dom";
export default function About() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.25),transparent_40%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.1),transparent_40%)]" />

        <div className="relative mx-auto max-w-5xl px-6">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-blue-400">
            Monarchy Esports
          </p>

          <h1 className="mt-4 text-5xl font-black leading-tight tracking-tight md:text-7xl">
            About{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Monarchy Esports
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-gray-300 md:text-xl font-medium">
            Building an elite competitive gaming community where passion, tactical skill,
            and absolute sportsmanship converge into greatness.
          </p>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="relative overflow-hidden rounded-3xl border border-blue-900/40 bg-zinc-950 p-8 shadow-2xl shadow-blue-950/20 md:p-12 backdrop-blur-md">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
          
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
            Who We Are
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Community Driven Esports Organization
          </h2>

          <p className="mt-6 text-base leading-8 text-gray-300 sm:text-lg">
            Monarchy Esports is a premier, community-driven esports organization founded in Sri Lanka,
            dedicated to crafting immersive, highly structured, and professional competitive gaming experiences.
            We organize high-stakes tournaments, community events, and structured developmental pathways for players
            who aspire to push their limits and dominate the competitive scene.
          </p>
        </div>
      </section>

      {/* MISSION / VISION */}
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-2">
        <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-950/20 to-zinc-950 p-8 shadow-xl shadow-black/40 backdrop-blur-md transition hover:border-blue-500/50">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-3xl shadow-lg shadow-blue-500/20">
            🎯
          </div>

          <h2 className="text-3xl font-black">
            Our Mission
          </h2>

          <p className="mt-5 text-base leading-7 text-gray-300 sm:text-lg">
            To provide fair, transparent, highly organized, and engaging competitive tournaments that unite teams
            while cultivating teamwork, unyielding competitive grit, and continuous skill refinement.
          </p>
        </div>

        <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-zinc-950 p-8 shadow-xl shadow-black/40 backdrop-blur-md transition hover:border-cyan-500/50">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-3xl shadow-lg shadow-cyan-500/20">
            👁️
          </div>

          <h2 className="text-3xl font-black">
            Our Vision
          </h2>

          <p className="mt-5 text-base leading-7 text-gray-300 sm:text-lg">
            To establish ourselves as one of the most trusted and elite esports ecosystems in the region,
            actively elevating raw grassroots talent into professional champions and delivering unforgettable arena experiences.
          </p>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
            What We Do
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Built For Competitive Players
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="group rounded-3xl border border-blue-900/40 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-500 hover:shadow-blue-500/15">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-3xl transition-transform group-hover:scale-110">
              🏆
            </div>

            <h3 className="text-2xl font-black">
              Tournaments
            </h3>

            <p className="mt-4 leading-7 text-gray-400 text-sm sm:text-base">
              Executing professionally broadcasted tournaments complete with precise double-elimination and round-robin structures, strict rule enforcement, and lucrative prize pools.
            </p>
          </div>

          <div className="group rounded-3xl border border-blue-900/40 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-500 hover:shadow-blue-500/15">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-3xl transition-transform group-hover:scale-110">
              👥
            </div>

            <h3 className="text-2xl font-black">
              Community
            </h3>

            <p className="mt-4 leading-7 text-gray-400 text-sm sm:text-base">
              Cultivating a robust, friendly, and competitive ecosystem where captains, squads, and solo players can network, recruit, and forge lasting bonds.
            </p>
          </div>

          <div className="group rounded-3xl border border-blue-900/40 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-500 hover:shadow-blue-500/15">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-3xl transition-transform group-hover:scale-110">
              🚀
            </div>

            <h3 className="text-2xl font-black">
              Skill Development
            </h3>

            <p className="mt-4 leading-7 text-gray-400 text-sm sm:text-base">
              Providing competitive stage exposure, detailed leaderboards, and organized match analytics to accelerate player advancement and strategic mastery.
            </p>
          </div>
        </div>
      </section>

      {/* CORE VALUES - UPGRADED SKILL & PILLAR CARDS */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
            Core Values
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            What We Stand For
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-3xl border border-blue-900/40 bg-zinc-950 p-7 shadow-xl transition-all duration-300 hover:border-blue-500 hover:shadow-blue-600/20">
            <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-125" />
            <span className="text-4xl block mb-4">⚖️</span>
            <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">
              Fair Play
            </h3>
            <p className="mt-3 text-xs sm:text-sm text-gray-400 leading-relaxed">
              Uncompromising integrity, anti-cheat enforcement, and absolute competitive parity in every single match.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-blue-900/40 bg-zinc-950 p-7 shadow-xl transition-all duration-300 hover:border-cyan-500 hover:shadow-cyan-600/20">
            <div className="absolute top-0 right-0 h-24 w-24 bg-cyan-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-125" />
            <span className="text-4xl block mb-4">🤝</span>
            <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors">
              Respect
            </h3>
            <p className="mt-3 text-xs sm:text-sm text-gray-400 leading-relaxed">
              Fostering mutual respect among players, organizations, broadcast staff, and community members across all ranks.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-blue-900/40 bg-zinc-950 p-7 shadow-xl transition-all duration-300 hover:border-emerald-500 hover:shadow-emerald-600/20">
            <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-125" />
            <span className="text-4xl block mb-4">📈</span>
            <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">
              Growth
            </h3>
            <p className="mt-3 text-xs sm:text-sm text-gray-400 leading-relaxed">
              Constantly evolving our tournament infrastructure and providing pathways for upcoming rosters to shine globally.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-blue-900/40 bg-zinc-950 p-7 shadow-xl transition-all duration-300 hover:border-amber-500 hover:shadow-amber-600/20">
            <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-125" />
            <span className="text-4xl block mb-4">⭐</span>
            <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
              Excellence
            </h3>
            <p className="mt-3 text-xs sm:text-sm text-gray-400 leading-relaxed">
              Delivering top-tier production quality, seamless bracket tracking, and world-class event execution.
            </p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-5xl rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-950/30 via-zinc-950 to-zinc-950 p-10 sm:p-14 shadow-2xl shadow-blue-600/10 backdrop-blur-md">
          <h2 className="text-3xl font-black sm:text-5xl">
            Join the Monarchy Esports Community
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
            Compete in our upcoming tournaments, prove your squad&apos;s dominance, and become part of the next generation of esports legends.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/tournaments"
              className="rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
            >
              Explore Tournaments
            </Link>
            <Link
              to="/contact"
              className="rounded-full border border-zinc-700 bg-black px-8 py-4 text-sm font-bold text-white transition hover:border-blue-500 hover:bg-zinc-900"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}