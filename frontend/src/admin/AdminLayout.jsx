import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/footer.png";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: "📊",
    },
    {
      name: "Tournaments",
      path: "/admin/tournaments",
      icon: "🏆",
    },
    {
      name: "News",
      path: "/admin/news",
      icon: "📰",
    },
    {
      name: "Gallery",
      path: "/admin/gallery",
      icon: "🖼️",
    },
    {
      name: "Contact Messages",
      path: "/admin/messages",
      icon: "✉️",
    },
  ];

  const navLinkClass = ({ isActive }) =>
    `group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-200 ${
      isActive
        ? "border border-blue-500/40 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
        : "border border-transparent text-gray-300 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white"
    }`;

  const renderSidebarContent = (isMobile = false) => {
    return (
      <>
        {/* BRAND */}
        <div className={isMobile ? "mb-6" : "mb-10"}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl">
              <img src={logo} alt="Monarchy Esports Logo" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-black text-white">
                Monarchy
              </h1>

              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeMenu}
              className={navLinkClass}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 text-lg">
                  {item.icon}
                </span>

                <p className="truncate font-semibold">
                  {item.name}
                </p>
              </div>
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className={isMobile ? "mt-6" : "absolute bottom-6 left-6 right-6"}>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700"
          >
            🚪 Logout
          </button>

          <p className="mt-4 text-center text-xs text-gray-500">
            Monarchy Esports Admin
          </p>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* MOBILE TOP BAR */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/95 px-4 py-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-xl">
              <img src={logo} alt="Monarchy Esports Logo" className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-black text-white">
                Monarchy
              </h1>

              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                Admin Panel
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

      <div className="flex min-h-screen">
        {/* DESKTOP SIDEBAR */}
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-zinc-800 bg-zinc-950 p-6 lg:block">
          {renderSidebarContent(false)}
        </aside>

        {/* MOBILE SIDEBAR */}
        {menuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <button
              type="button"
              onClick={closeMenu}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Close admin menu overlay"
            />

            <aside className="absolute left-0 top-0 h-full w-[82%] max-w-80 overflow-y-auto border-r border-zinc-800 bg-zinc-950 p-5 shadow-2xl shadow-black">
              {renderSidebarContent(true)}
            </aside>
          </div>
        )}

        {/* CONTENT */}
        <main className="min-w-0 flex-1 overflow-x-hidden bg-black">
          <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}