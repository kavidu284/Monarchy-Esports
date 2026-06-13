import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
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
      name: "Registrations",
      path: "/admin/registrations",
      icon: "📝",
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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="sticky top-0 h-screen w-72 border-r border-zinc-800 bg-zinc-950 p-6">
          {/* BRAND */}
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl">
                👑
              </div>

              <div>
                <h1 className="text-xl font-black text-white">
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
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-200 ${
                    isActive
                      ? "border border-blue-500/40 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "border border-transparent text-gray-300 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {item.icon}
                  </span>

                  <div>
                    <p className="font-semibold">
                      {item.name}
                    </p>

                    {item.note && (
                      <p className="text-xs text-gray-400 group-hover:text-blue-300">
                        {item.note}
                      </p>
                    )}
                  </div>
                </div>
              </NavLink>
            ))}
          </nav>

          {/* LOGOUT */}
          <div className="absolute bottom-6 left-6 right-6">
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
        </aside>

        {/* CONTENT */}
        <main className="flex-1 overflow-x-hidden bg-black">
          <div className="min-h-screen p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}