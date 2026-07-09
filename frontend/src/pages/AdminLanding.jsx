import { Link } from "react-router-dom";
import logo from "../assets/footer.png";

export default function AdminLanding() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.22),transparent_35%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.08),transparent_35%)]" />

      <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Card */}
      <div className="relative w-full max-w-4xl rounded-3xl border border-zinc-800 bg-zinc-950/90 p-10 text-center shadow-2xl shadow-blue-600/10 backdrop-blur md:p-14">
        <div className="mx-auto mb-8 flex h-36 w-36 items-center justify-center rounded-3xl border border-blue-500/30 bg-black shadow-xl shadow-blue-600/20">
          <img
            src={logo}
            alt="Monarchy Esports"
            className="w-28 object-contain"
          />
        </div>

        <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-400">
          Administration Portal
        </p>

        <h1 className="mt-4 text-5xl font-black leading-tight text-white md:text-7xl">
          Monarchy Esports
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-400">
          Secure admin access for managing tournaments, team registrations,
          matches, news, gallery, and contact messages.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/admin/login"
            className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            Enter Admin Panel
          </Link>

          <Link
            to="/"
            className="rounded-xl border border-zinc-700 bg-black px-8 py-4 text-lg font-bold text-white transition hover:border-blue-500 hover:bg-blue-500/10"
          >
            Back to Website
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-black p-5">
            <p className="text-3xl">🏆</p>
            <p className="mt-3 font-bold text-white">
              Tournaments
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage events
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black p-5">
            <p className="text-3xl">👥</p>
            <p className="mt-3 font-bold text-white">
              Teams
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Review registrations
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black p-5">
            <p className="text-3xl">⚔️</p>
            <p className="mt-3 font-bold text-white">
              Matches
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Schedule and results
            </p>
          </div>
        </div>

        <p className="mt-10 text-xs text-gray-600">
          Monarchy Esports Admin Access
        </p>
      </div>
    </div>
  );
}