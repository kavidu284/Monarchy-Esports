export default function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-800 bg-black text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.16),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-12 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl shadow-lg shadow-blue-600/10">
            <img src="./logo.PNG" alt="Monarchy Esports Logo" />
          </div>

          <h3 className="text-3xl font-black tracking-wide text-blue-500">
            MONARCHY ESPORTS
          </h3>

          <p className="mt-3 text-gray-400">
            Building the Future of Esports
          </p>

          <div className="mx-auto mt-8 h-px max-w-md bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

          <p className="mt-6 text-sm text-gray-500">
            © 2026 Monarchy Esports
          </p>
        </div>
      </div>
    </footer>
  );
}