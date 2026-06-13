import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/login", {
        username,
        password,
      });

      if (response.data.success) {
        localStorage.setItem(
          "token",
          response.data.access_token
        );

        navigate("/admin/dashboard");
      } else {
        alert("Invalid Credentials");
      }
    } catch (error) {
      console.error(error);
      alert("Login Failed");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.08),transparent_35%)]" />

      <form
        onSubmit={handleLogin}
        className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl shadow-blue-600/10"
      >
        {/* LOGO */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-500/30 bg-blue-500/10 text-4xl shadow-lg shadow-blue-600/20">
            👑
          </div>

          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Monarchy Esports
          </p>

          <h1 className="mt-2 text-4xl font-black text-white">
            Admin Login
          </h1>

          <p className="mt-3 text-sm text-gray-400">
            Sign in to manage tournaments, registrations, matches,
            news, and gallery.
          </p>
        </div>

        {/* USERNAME */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-gray-300">
            Username
          </label>

          <input
            type="text"
            placeholder="Enter username"
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-gray-300">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter password"
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          Login
        </button>

        <p className="mt-6 text-center text-xs text-gray-500">
          Protected Admin Access
        </p>
      </form>
    </div>
  );
}