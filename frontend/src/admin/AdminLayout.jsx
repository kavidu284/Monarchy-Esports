import { useCallback, useEffect, useState, useMemo } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/footer.png";
import {
  ADMIN_SESSION_EXPIRES_AT_KEY,
  clearAdminSession,
  canAccess,
  isSuperAdmin,
} from "../utils/auth";

// Defined outside component to prevent recreating on every render and satisfy useMemo ESLint rule
const RAW_NAV_ITEMS = [
  { name: "Dashboard", path: "/admin/dashboard", icon: "📊", permission: "can_view_dashboard" },
  { name: "Tournaments", path: "/admin/tournaments", icon: "🏆", permission: "can_view_tournaments" },
  { name: "News", path: "/admin/news", icon: "📰", permission: "can_manage_news" }, // UPDATED PERMISSION FLAG
  { name: "Gallery", path: "/admin/gallery", icon: "🖼️", permission: "can_manage_gallery" },
  { name: "Contact Messages", path: "/admin/messages", icon: "✉️", permission: "can_view_contact_messages" }, // UPDATED PERMISSION FLAG
  { name: "Staff & User Rights", path: "/administration", icon: "⚙️", permission: "can_manage_users" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = useCallback(() => {
    clearAdminSession();
    navigate("/admin/login");
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

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const visibleNavItems = useMemo(() => {
    return RAW_NAV_ITEMS.filter((item) => !item.permission || canAccess(item.permission));
  }, []);

  const navLinkClass = ({ isActive }) =>
    `group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-200 ${
      isActive
        ? "border border-blue-500/40 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
        : "border border-transparent text-gray-300 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white"
    }`;

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className={isMobile ? "mb-6" : "mb-10"}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl">
              <img src={logo} alt="Monarchy Logo" className="h-7 w-7 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Monarchy</h1>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
                {isSuperAdmin() ? "Super Admin" : "Staff Console"}
              </p>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeMenu}
              className={navLinkClass}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <p className="font-semibold">{item.name}</p>
              </div>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-800/80">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600/90 px-4 py-3 font-bold text-white transition hover:bg-red-600"
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
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-xl">
              <img src={logo} alt="Monarchy Logo" className="h-6 w-6 object-contain" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-black text-white">Monarchy</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                {isSuperAdmin() ? "Super Admin" : "Staff Console"}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-950 text-2xl font-black text-white transition hover:border-blue-500 hover:bg-blue-500/10"
            aria-label="Toggle admin menu"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>
      </header>

      <div className="min-h-screen md:flex">
        {/* DESKTOP SIDEBAR */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 p-5 md:block lg:w-72 lg:p-6">
          {renderSidebarContent(false)}
        </aside>

        {/* MOBILE SIDEBAR */}
        {menuOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <button
              type="button"
              onClick={closeMenu}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Close admin menu overlay"
            />
            <aside className="absolute left-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto border-r border-zinc-800 bg-zinc-950 p-5 shadow-2xl shadow-black">
              {renderSidebarContent(true)}
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