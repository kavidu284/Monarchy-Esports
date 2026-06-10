import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-black text-white">

      {/* Sidebar */}
      <aside className="w-72 bg-zinc-900 p-6">

        <h1 className="text-2xl font-bold mb-10">
          Monarchy Admin
        </h1>

        <nav className="space-y-3">

          <Link
            to="/admin/dashboard"
            className="block p-3 rounded-lg hover:bg-zinc-800"
          >
            Dashboard
          </Link>

          <Link
            to="/admin/tournaments"
            className="block p-3 rounded-lg hover:bg-zinc-800"
          >
            Tournaments
          </Link>

          <Link
            to="/admin/registrations"
            className="block p-3 rounded-lg hover:bg-zinc-800"
          >
            Registrations
          </Link>

          <Link
            to="/admin/news"
            className="block p-3 rounded-lg hover:bg-zinc-800"
          >
            News
          </Link>

          <Link
            to="/admin/gallery"
            className="block p-3 rounded-lg hover:bg-zinc-800"
          >
            Gallery
          </Link>

          <Link
            to="/admin/contacts"
            className="block p-3 rounded-lg hover:bg-zinc-800"
          >
            Contact Messages
          </Link>

        </nav>

      </aside>

      {/* Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>

    </div>
  );
}