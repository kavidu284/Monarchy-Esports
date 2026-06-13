import { Link, NavLink } from "react-router-dom";
import logo from "../assets/Monarchy.png";

export default function Navbar() {
  const navClass = ({ isActive }) =>
    `relative px-1 py-2 text-sm font-bold uppercase tracking-wide transition duration-300 ${
      isActive
        ? "text-blue-400 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-blue-500"
        : "text-gray-300 hover:text-white"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/90 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* LOGO */}
        <Link
          to="/"
          className="group flex items-center gap-4"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 shadow-lg shadow-blue-600/10 transition group-hover:border-blue-400/60 group-hover:shadow-blue-600/20">
            <img
              src={logo}
              alt="Monarchy Esports"
              className="h-12 w-12 object-contain"
            />
          </div>

          <div>
            <h1 className="text-2xl font-black leading-none tracking-wide md:text-3xl">
              <span className="text-blue-500">
                MONARCHY
              </span>
            </h1>

            <p className="mt-1 text-xs font-semibold tracking-[0.42em] text-gray-300">
              ESPORTS
            </p>
          </div>
        </Link>

        {/* NAVIGATION */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>

          <NavLink to="/about" className={navClass}>
            About
          </NavLink>

          <NavLink to="/tournaments" className={navClass}>
            Tournaments
          </NavLink>

          <NavLink to="/gallery" className={navClass}>
            Gallery
          </NavLink>

          <NavLink to="/news" className={navClass}>
            News
          </NavLink>
        </div>

        {/* CTA */}
        <Link
          to="/contact"
          className="hidden rounded-full border border-blue-500/40 bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/40 sm:inline-flex"
        >
          Get in Touch
        </Link>
      </div>
    </nav>
  );
}