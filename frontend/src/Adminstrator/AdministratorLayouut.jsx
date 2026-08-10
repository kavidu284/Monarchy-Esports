import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/footer.png";
import {
  ADMIN_SESSION_EXPIRES_AT_KEY,
  clearAdminSession,
} from "../utils/auth";

const SUPER_ADMIN_NAV = [
  { name: "Overview", path: "/administration", icon: "📊" },
  { name: "User Rights & Staff", path: "/administration/users", icon: "👥" },
];

export default function AdministratorLayout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = useCallback(() => {
    clearAdminSession();
    navigate("/administration/login");
  }, [navigate]);

  useEffect(() => {
    const expiresAt = Number(localStorage.getItem(ADMIN_SESSION_EXPIRES_AT_KEY));

    if (!expiresAt || expiresAt - Date.now() <= 0) {
      handleLogout();
      return undefined;
    }

    const timeoutId = window.setTimeout(handleLogout, expiresAt - Date.now());
    return () => window.clearTimeout(timeoutId);
  }, [handleLogout]);

  const closeMenu = () => setMenuOpen(false);

  const navLinkClass = ({ isActive }) =>
    `group flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all duration-200 ${
      isActive
        ? "border border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-600/10"
        : "border border-transparent text-gray-300 hover:border-blue-500/30 hover:bg-zinc-900 hover:text-white"
    }`;

  const renderSidebar = () => (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* HEADER BRAND */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl shadow-lg shadow-blue-600/20">
            <img src={logo} alt="Monarchy Logo" className="h-7 w-7 object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Monarchy</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
              👑 Super Admin
            </p>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="space-y-2">
          {SUPER_ADMIN_NAV.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/administration"}
              onClick={closeMenu}
              className={navLinkClass}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </div>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* FOOTER & LOGOUT */}
      <div className="mt-6 border-t border-zinc-800/80 pt-4 space-y-3">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-2.5 text-xs font-bold text-gray-300 hover:bg-zinc-800 transition"
        >
          ⚙️ Switch to Staff Panel
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600/90 py-3 text-xs font-bold text-white transition hover:bg-red-600 shadow-lg shadow-red-600/20"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-600 selection:text-white">
      {/* MOBILE TOP BAR */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/95 px-4 py-4 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-lg">
              <img src={logo} alt="Monarchy Logo" className="h-5 w-5 object-contain" />
            </div>
            <div>
              <h1 className="text-base font-black text-white">Monarchy</h1>
              <p className="text-[9px] font-bold uppercase tracking-widest text-blue-400">
                👑 Super Admin Console
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-950 text-xl font-bold text-white"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>
      </header>

      <div className="min-h-screen md:flex">
        {/* DESKTOP SIDEBAR */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 p-5 md:block lg:w-72 lg:p-6">
          {renderSidebar()}
        </aside>

        {/* MOBILE SIDEBAR OVERLAY */}
        {menuOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <button
              type="button"
              onClick={closeMenu}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <aside className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto border-r border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
              {renderSidebar()}
            </aside>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="min-w-0 flex-1 bg-black p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}