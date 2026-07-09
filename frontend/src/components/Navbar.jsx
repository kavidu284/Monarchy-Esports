import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/nav.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `relative px-1 py-2 text-sm font-bold uppercase tracking-wide transition duration-300 ${
      isActive
        ? "text-blue-400 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-blue-500"
        : "text-gray-300 hover:text-white"
    }`;

  const mobileNavClass = ({ isActive }) =>
    `block rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide transition ${
      isActive
        ? "border border-blue-500/40 bg-blue-500/10 text-blue-400"
        : "border border-zinc-800 bg-black text-gray-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-white"
    }`;

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:h-24 sm:px-6 lg:px-10">
        {/* LOGO */}
        <Link
          to="/"
          onClick={closeMenu}
          className="group flex min-w-0 items-center gap-3 sm:gap-4"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 shadow-lg shadow-blue-600/10 transition group-hover:border-blue-400/60 group-hover:shadow-blue-600/20 sm:h-16 sm:w-16">
            <img
              src={logo}
              alt="Monarchy Esports"
              className="h-9 w-9 object-contain sm:h-12 sm:w-12"
            />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-black leading-none tracking-wide sm:text-2xl md:text-3xl">
              <span className="text-blue-500">
                MONARCHY
              </span>
            </h1>

            <p className="mt-1 text-[9px] font-semibold tracking-[0.32em] text-gray-300 sm:text-xs sm:tracking-[0.42em]">
              ESPORTS
            </p>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden items-center gap-8 lg:flex">
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

        {/* DESKTOP CTA */}
        <Link
          to="/contact"
          className="hidden rounded-full border border-blue-500/40 bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/40 lg:inline-flex"
        >
          Get in Touch
        </Link>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-950 text-2xl font-black text-white transition hover:border-blue-500 hover:bg-blue-500/10 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="border-t border-zinc-800 bg-black px-4 py-5 shadow-2xl shadow-black/40 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-3">
            <NavLink
              to="/"
              onClick={closeMenu}
              className={mobileNavClass}
            >
              Home
            </NavLink>

            <NavLink
              to="/about"
              onClick={closeMenu}
              className={mobileNavClass}
            >
              About
            </NavLink>

            <NavLink
              to="/tournaments"
              onClick={closeMenu}
              className={mobileNavClass}
            >
              Tournaments
            </NavLink>

            <NavLink
              to="/gallery"
              onClick={closeMenu}
              className={mobileNavClass}
            >
              Gallery
            </NavLink>

            <NavLink
              to="/news"
              onClick={closeMenu}
              className={mobileNavClass}
            >
              News
            </NavLink>

            <NavLink
              to="/contact"
              onClick={closeMenu}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 text-center text-sm font-bold uppercase tracking-wide transition ${
                  isActive
                    ? "bg-blue-700 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`
              }
            >
              Get in Touch
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}