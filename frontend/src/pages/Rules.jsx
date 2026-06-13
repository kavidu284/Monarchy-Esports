import RulebookPDF from '../assets/monarchy_Rules_260609_141738.pdf';

export default function Rules() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.22),transparent_35%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.08),transparent_35%)]" />
      <div className="absolute left-10 top-28 h-52 w-52 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Hero Section */}
      <section className="relative py-24 text-center">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-500/30 bg-blue-500/10 text-4xl shadow-xl shadow-blue-600/20">
            📘
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-400">
            Monarchy Esports
          </p>

          <h1 className="mt-4 text-5xl font-black leading-tight md:text-7xl">
            Tournament{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Rules
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-400 md:text-xl">
            Official Rules and Regulations for all
            Monarchy Esports tournaments.
          </p>

          <div className="mx-auto mt-8 h-[2px] w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        </div>
      </section>

      {/* Rules Content */}
      <section className="relative mx-auto max-w-6xl space-y-8 px-6 pb-20">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-600/10">
          <h2 className="mb-4 text-3xl font-black text-blue-400">
            1. Eligibility
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li>• All players must provide accurate registration information.</li>
            <li>• Players may only participate for one team per tournament.</li>
            <li>• Multiple registrations may result in disqualification.</li>
            <li>• Players must comply with all tournament rules.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-600/10">
          <h2 className="mb-4 text-3xl font-black text-blue-400">
            2. Team Composition
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li>• 5 Main Players are required.</li>
            <li>• Up to 2 Substitute Players are allowed.</li>
            <li>• Maximum 7 registered players per team.</li>
            <li>• Only registered players may participate.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-600/10">
          <h2 className="mb-4 text-3xl font-black text-blue-400">
            3. Registration Rules
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li>• Teams must complete registration before the deadline.</li>
            <li>• Incomplete registrations may be rejected.</li>
            <li>• Tournament officials may verify player information.</li>
            <li>• False information may result in removal from the tournament.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-600/10">
          <h2 className="mb-4 text-3xl font-black text-blue-400">
            4. Tournament Format
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li>• Tournament formats vary depending on the event.</li>
            <li>• Matches may be BO1, BO3, BO5, or BO7.</li>
            <li>• Format details will be announced before the event.</li>
            <li>• Organizers may modify formats when necessary.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-600/10">
          <h2 className="mb-4 text-3xl font-black text-blue-400">
            5. Match Scheduling
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li>• Teams are responsible for checking schedules.</li>
            <li>• Match times announced by officials are final.</li>
            <li>• Teams must be available at scheduled times.</li>
            <li>• Late arrivals may result in penalties.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-600/10">
          <h2 className="mb-4 text-3xl font-black text-blue-400">
            6. Match Procedures
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li>• Teams must be ready before match start.</li>
            <li>• A grace period may be provided.</li>
            <li>• Failure to appear may result in a walkover loss.</li>
            <li>• Match lobbies must follow official instructions.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-600/10">
          <h2 className="mb-4 text-3xl font-black text-blue-400">
            7. Technical Issues & Pauses
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li>• Players are responsible for stable internet connections.</li>
            <li>• Technical pauses may only be used for genuine issues.</li>
            <li>• Abuse of pauses may result in penalties.</li>
            <li>• Officials may request evidence of technical issues.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-600/10">
          <h2 className="mb-4 text-3xl font-black text-blue-400">
            8. Communication Rules
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li>• Respect all players, officials, and staff.</li>
            <li>• No toxic or abusive behavior.</li>
            <li>• Follow tournament staff instructions.</li>
            <li>• Official channels are for tournament matters only.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-600/10">
          <h2 className="mb-4 text-3xl font-black text-blue-400">
            9. Fair Play & Competitive Integrity
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li>• No cheating or hacking.</li>
            <li>• No account sharing.</li>
            <li>• No exploiting bugs or glitches.</li>
            <li>• No unauthorized third-party software.</li>
            <li>• No match fixing or collusion.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-600/10">
          <h2 className="mb-4 text-3xl font-black text-blue-400">
            10. Player Verification
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li>• Officials may request player verification.</li>
            <li>• Hand-cam verification may be required.</li>
            <li>• Players may be asked for screenshots or account details.</li>
            <li>• Failure to comply may result in disqualification.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-600/10">
          <h2 className="mb-4 text-3xl font-black text-blue-400">
            11. Substitute Players
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li>• Registered substitutes may replace main players.</li>
            <li>• Substitute players must meet all eligibility requirements.</li>
            <li>• Unregistered players are not permitted.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-600/10">
          <h2 className="mb-4 text-3xl font-black text-blue-400">
            12. Prohibited Conduct
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li>• Toxic behavior.</li>
            <li>• Hate speech.</li>
            <li>• Personal attacks.</li>
            <li>• Threats or harassment.</li>
            <li>• False reporting.</li>
            <li>• Unsportsmanlike conduct.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-600/10">
          <h2 className="mb-4 text-3xl font-black text-blue-400">
            13. Dispute Resolution
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li>• Report disputes immediately.</li>
            <li>• Evidence must be submitted when requested.</li>
            <li>• Officials will review all available information.</li>
            <li>• Tournament decisions are final.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-600/10">
          <h2 className="mb-4 text-3xl font-black text-blue-400">
            14. Penalties
          </h2>
          <ul className="space-y-3 text-gray-300">
            <li>• Warning</li>
            <li>• Point Deduction</li>
            <li>• Match Loss</li>
            <li>• Disqualification</li>
            <li>• Temporary Suspension</li>
            <li>• Tournament Ban</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-600/10">
          <h2 className="mb-4 text-3xl font-black text-blue-400">
            15. Organizer Authority
          </h2>
          <p className="leading-8 text-gray-300">
            Monarchy Esports reserves the right to interpret,
            modify, and enforce tournament rules. All decisions
            made by tournament officials regarding disputes,
            penalties, technical issues, and tournament operations
            are final and binding.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-blue-600/10">
          <h2 className="mb-4 text-3xl font-black text-blue-400">
            16. Acceptance of Rules
          </h2>
          <p className="leading-8 text-gray-300">
            By participating in any Monarchy Esports tournament,
            all players and teams acknowledge that they have read,
            understood, and agreed to follow these rules and
            regulations.
          </p>
        </div>

        <div className="flex justify-center pt-6">
          <a
            href={RulebookPDF}
            download="MonarchyEsports_Rulebook.pdf"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>Download Rulebook</span>
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 4l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}