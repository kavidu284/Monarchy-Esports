import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import logo from "../assets/footer.png";
import { setAdminSession } from "../utils/auth";

export default function AdministrationLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!username.trim() || !password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/superAdmin/login", {
        username: username.trim(),
        password,
      });

      if (response.data?.success && response.data?.admin?.is_super_admin) {
        // Save JWT token along with super admin role and permissions
        setAdminSession(
          response.data.access_token || response.data.token,
          response.data.admin
        );

        // Redirect directly to super admin user rights console
        navigate("/administration");
      } else {
        setErrorMessage(
          response.data?.message || "Only Super Admin accounts can log in here."
        );
      }
    } catch (error) {
      console.error("Super Admin Login Error:", error);
      setErrorMessage(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Authentication failed. Super Admin credentials required."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 text-white font-sans selection:bg-blue-600 selection:text-white">
      {/* GLOW BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.08),transparent_35%)] pointer-events-none" />

      <form
        onSubmit={handleLogin}
        className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl shadow-blue-600/10"
      >
        {/* LOGO & HEADER */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-500/30 bg-blue-500/10 text-xl shadow-lg shadow-blue-600/20">
            <img
              src={logo}
              alt="Monarchy Esports Logo"
              className="w-12 object-contain"
            />
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
            Monarchy Esports
          </p>

          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            Super Admin Console
          </h1>

          <p className="mt-3 text-sm text-gray-400">
            Sign in with your Super Admin credentials to manage staff roles and user permissions.
          </p>
        </div>

        {/* ERROR BANNER */}
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-center text-xs font-bold text-red-400">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* USERNAME */}
        <div className="mb-5">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">
            Super Admin Username
          </label>

          <input
            type="text"
            required
            placeholder="Enter username"
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-6">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">
            Password
          </label>

          <input
            type="password"
            required
            placeholder="Enter password"
            className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? "Authenticating..." : "Sign In to Super Admin Console"}
        </button>

        <p className="mt-6 text-center text-xs text-gray-500">
          Super Admin Rights & System Security Console
        </p>
      </form>
    </div>
  );
}