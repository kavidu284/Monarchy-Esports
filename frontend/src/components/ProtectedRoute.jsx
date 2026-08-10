import { Navigate, Outlet } from "react-router-dom";
import { getValidAdminToken, canAccess } from "../utils/auth";

export default function ProtectedRoute({
  children,
  permissionKey,
  redirectTo = "/admin/login",
}) {
  const token = getValidAdminToken();

  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  if (permissionKey && !canAccess(permissionKey)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center text-white selection:bg-blue-600 selection:text-white font-sans">
        <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl shadow-red-500/5">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/30 bg-red-500/10 text-3xl shadow-lg shadow-red-500/20">
            🔒
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-red-400">
            Permission Restricted
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">Access Denied</h2>
          <p className="mt-3 text-sm text-gray-400 leading-relaxed">
            Your staff account does not have permission to view this section.
            Contact a Super Admin if you need this access enabled.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => window.history.back()}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-3 text-xs font-bold text-gray-300 transition hover:bg-zinc-800"
            >
              Go Back
            </button>
            <a
              href="/admin/dashboard"
              className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white text-center shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
}