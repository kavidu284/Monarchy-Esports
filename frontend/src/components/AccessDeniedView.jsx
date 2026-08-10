import { useNavigate } from "react-router-dom";

export default function AccessDeniedView({
  title = "Access Restricted",
  message = "Your staff account does not have permission to access this portal section.",
  redirectTo = "/admin/dashboard",
  buttonText = "Back to Dashboard",
}) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[65vh] items-center justify-center font-sans text-white p-6 selection:bg-blue-600 selection:text-white">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-2xl shadow-blue-600/10">
        {/* BLUE GLOW ACCENT */}
        <div className="absolute -top-12 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

        {/* BLUE ICON CONTAINER */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-500/30 bg-blue-500/10 text-3xl shadow-lg shadow-blue-600/20">
          🔒
        </div>

        {/* TITLE */}
        <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
          Security Enforcement
        </p>
        <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
          {title}
        </h2>

        {/* MESSAGE */}
        <p className="mt-3 text-sm text-gray-400 leading-relaxed">
          {message}
        </p>

        {/* BLUE BUTTON */}
        <button
          type="button"
          onClick={() => navigate(redirectTo)}
          className="mt-8 w-full rounded-2xl bg-blue-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-600/40"
        >
          {buttonText}
        </button>

        <p className="mt-5 text-[11px] text-gray-500">
          Monarchy Esports Access Control Systems
        </p>
      </div>
    </div>
  );
}