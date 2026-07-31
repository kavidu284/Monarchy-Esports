import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/nav.png";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Simple handler to close mobile drawer on link selection
  const closeMenu = () => setMenuOpen(false);

  // Lock scroll only when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Tournaments", path: "/tournaments" },
    { name: "Gallery", path: "/gallery" },
    { name: "News", path: "/news" },
  ];

  const desktopLinkClass = ({ isActive }) =>
    `relative px-1 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-200 ${
      isActive
        ? "text-blue-400 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-blue-500"
        : "text-zinc-400 hover:text-white"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block rounded-xl px-4 py-3.5 text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
      isActive
        ? "border border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-sm shadow-blue-500/10"
        : "border border-zinc-800/80 bg-zinc-950 text-zinc-300 hover:border-zinc-700 hover:text-white"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800/80 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LOGO */}
        <Link
          to="/"
          onClick={closeMenu}
          className="group flex items-center gap-3 transition"
          aria-label="Monarchy Esports Home"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 shadow-md shadow-blue-600/10 transition duration-300 group-hover:border-blue-400/60 group-hover:shadow-blue-500/20 sm:h-12 sm:w-12">
            <img
              src={logo}
              alt=""
              className="h-8 w-8 object-contain sm:h-9 sm:w-9"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-lg font-black leading-none tracking-wider text-white sm:text-xl">
              MONARCHY
            </span>
            <span className="mt-0.5 text-[10px] font-bold tracking-[0.35em] text-blue-400 sm:text-[11px]">
              ESPORTS
            </span>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION LINKS */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <NavLink key={link.path} to={link.path} className={desktopLinkClass}>
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* DESKTOP CTA BUTTON */}
        <div className="hidden items-center lg:flex">
          <Link
            to="/contact"
            className="rounded-full border border-blue-500/40 bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-600/40 active:translate-y-0"
          >
            Get in Touch
          </Link>
        </div>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 transition hover:border-zinc-700 hover:text-white lg:hidden"
          aria-expanded={menuOpen}
          aria-label="Toggle Navigation Menu"
        >
          {menuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {menuOpen && (
        <div className="border-b border-zinc-800 bg-black/95 px-4 pb-6 pt-2 backdrop-blur-2xl lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2.5">
            {navLinks.map((link) => (
              <NavLink 
                key={link.path} 
                to={link.path} 
                onClick={closeMenu} 
                className={mobileLinkClass}
              >
                {link.name}
              </NavLink>
            ))}

            <div className="pt-2">
              <Link
                to="/contact"
                onClick={closeMenu}
                className="block w-full rounded-xl bg-blue-600 px-4 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 active:scale-[0.98]"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}