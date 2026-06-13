import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-black px-6 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.25),transparent_35%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.1),transparent_35%)]" />
      <div className="absolute left-10 top-20 h-52 w-52 animate-pulse rounded-full bg-blue-600/10 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-64 w-64 animate-pulse rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative max-w-2xl text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-blue-500/30 bg-blue-500/10 text-5xl shadow-xl shadow-blue-600/20">
          👑
        </div>

        <p className="mb-5 text-sm font-black uppercase tracking-[0.5em] text-blue-400">
          404 Error
        </p>

        <h1 className="text-5xl font-black leading-tight md:text-7xl">
          Page{" "}
          <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            not found
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-400">
          The page you are looking for does not exist or has moved.
        </p>

        <div className="mx-auto mt-8 h-[2px] w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

        <div className="mt-10">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black"
          >
            <span>Back to Home</span>
            <span className="transition duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}