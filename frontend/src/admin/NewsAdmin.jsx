import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function NewsAdmin() {
  const navigate = useNavigate();

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Toast State
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', title, message }

  // Security Re-Authentication Modal State for Deletion
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [targetArticle, setTargetArticle] = useState(null); // { id, title }
  const [reauth, setReauth] = useState({ username: "", password: "" });
  const [reauthMessage, setReauthMessage] = useState("");
  const [verifying, setVerifying] = useState(false);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    let isMounted = true;

    const loadNewsData = async () => {
      try {
        setLoading(true);
        let response;
        try {
          response = await api.get("/news");
        } catch {
          response = await api.get("/announcements");
        }

        if (isMounted) {
          setNews(response.data || []);
        }
      } catch (error) {
        console.error("Failed to load news:", error);
        if (isMounted) {
          showToast("error", "Loading Failed", "Unable to fetch news articles.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadNewsData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Open Security Modal for Deletion
  const triggerDeleteModal = (id, title) => {
    setTargetArticle({ id, title });
    setReauth({ username: "", password: "" });
    setReauthMessage("");
    setSecurityModalOpen(true);
  };

  // Perform actual API deletion call
  const executeDelete = async (id) => {
    try {
      try {
        await api.delete(`/news/${id}`);
      } catch {
        await api.delete(`/announcements/${id}`);
      }

      setNews((prev) => prev.filter((item) => item.id !== id));
      showToast("success", "Article Deleted", "The announcement has been permanently removed.");
      setSecurityModalOpen(false);
      setTargetArticle(null);
    } catch (error) {
      console.error("Delete error:", error);
      showToast("error", "Delete Failed", error?.response?.data?.detail || "Could not delete article.");
    }
  };

  // Handle Re-Authentication Submit
  const handleConfirmReauth = async (e) => {
    e.preventDefault();
    if (!reauth.username.trim() || !reauth.password.trim()) {
      setReauthMessage("Username and password are required.");
      return;
    }

    try {
      setVerifying(true);
      setReauthMessage("");
      const response = await api.post("/administration/verify-credentials", {
        username: reauth.username.trim(),
        password: reauth.password.trim(),
      });

      if (response.data?.success && targetArticle) {
        await executeDelete(targetArticle.id);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setReauthMessage(
        error?.response?.data?.detail || "Invalid credentials or unauthorized action."
      );
    } finally {
      setVerifying(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getShortContent = (text) => {
    if (!text) return "No description provided.";
    const cleanText = String(text).replace(/<[^>]*>?/gm, "").trim();
    return cleanText.length > 150 ? `${cleanText.slice(0, 150)}...` : cleanText;
  };

  const getImageUrl = (filePath) => {
    if (!filePath) return "";
    const path = String(filePath).trim().replace(/\\/g, "/");
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const baseURL = String(api.defaults.baseURL || "").replace(/\/+$/, "");
    return `${baseURL}/${path.replace(/^\/+/, "")}`;
  };

  const filteredNews = news.filter((item) => {
    const term = search.toLowerCase();
    const title = (item.title || "").toLowerCase();
    const content = (item.content || item.message || "").toLowerCase();
    return title.includes(term) || content.includes(term);
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-black font-sans text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-4 shadow-xl">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
          <span className="font-semibold text-gray-300">Loading announcements...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative font-sans text-white selection:bg-blue-600 selection:text-white">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 right-6 z-[200] w-full max-w-md animate-slide-in">
          <div
            className={`flex items-start gap-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
              toast.type === "success"
                ? "border-emerald-500/40 bg-zinc-950/95 text-emerald-400"
                : "border-red-500/40 bg-zinc-950/95 text-red-400"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-current/20 bg-current/10 text-xl font-bold">
              {toast.type === "success" ? "✓" : "⚠️"}
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-sm font-bold text-white">{toast.title}</h4>
              <p className="mt-0.5 text-xs text-gray-300">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="p-1 text-gray-400 hover:text-white text-xs font-bold">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* SECURITY AUTHENTICATION DELETE MODAL */}
      {securityModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-xl text-red-400">
                🔒
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Authorization Required</h3>
                <p className="text-xs text-red-400 font-semibold truncate max-w-[220px]">
                  Delete target: {targetArticle?.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              You are about to delete this news article. Please enter your credentials to verify authorization.
            </p>

            <form onSubmit={handleConfirmReauth} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={reauth.username}
                  onChange={(e) => setReauth({ ...reauth, username: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-red-500 focus:outline-none"
                  placeholder="Username"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={reauth.password}
                  onChange={(e) => setReauth({ ...reauth, password: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-red-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              {reauthMessage && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-400">
                  ⚠️ {reauthMessage}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSecurityModalOpen(false)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-zinc-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-500 transition disabled:opacity-50"
                >
                  {verifying ? "Verifying..." : "Confirm Delete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-blue-600/5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Content Management
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              News & Announcements
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Publish official news updates, tournament press releases, and esports announcements.
            </p>
          </div>

          <Link
            to="/admin/news/create"
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-500"
          >
            ➕ Create Announcement
          </Link>
        </div>
      </div>

      {/* SEARCH & METRICS BAR */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="🔍 Search news by title or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <span className="text-xs font-bold text-gray-400">
          Total Published: <strong className="text-blue-400">{news.length}</strong>
        </span>
      </div>

      {/* ARTICLES LIST */}
      {filteredNews.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center text-gray-400">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-3xl">
            📰
          </div>
          <h3 className="text-xl font-bold text-white">No News Found</h3>
          <p className="mt-1 text-xs text-gray-500">
            {search ? `No results matching "${search}".` : "Create your first news article for visitors."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredNews.map((item) => {
            const image = item.cover_image || item.image_url;
            const message = item.content || item.message;

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-xl transition hover:border-zinc-700"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* COVER IMAGE */}
                  {image ? (
                    <div className="h-56 w-full shrink-0 overflow-hidden bg-black lg:h-auto lg:w-80">
                      <img
                        src={getImageUrl(image)}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-48 w-full shrink-0 items-center justify-center bg-black text-5xl text-zinc-700 lg:h-auto lg:w-80">
                      📰
                    </div>
                  )}

                  {/* ARTICLE METADATA & CONTENT */}
                  <div className="flex flex-1 flex-col justify-between gap-6 p-6 lg:flex-row lg:items-start">
                    <div className="flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                          ID #{item.id}
                        </span>
                        <span className="rounded-lg border border-zinc-800 bg-black px-3 py-1 text-xs font-semibold text-gray-400">
                          🕒 {formatDate(item.created_at)}
                        </span>
                      </div>

                      <h2 className="text-2xl font-bold text-white">{item.title}</h2>

                      <p className="mt-2 text-sm leading-relaxed text-gray-400">
                        {getShortContent(message)}
                      </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2 pt-2 lg:flex-col lg:pt-0">
                      <button
                        onClick={() => navigate(`/admin/news/edit/${item.id}`)}
                        className="flex-1 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-2.5 text-xs font-bold text-blue-400 shadow-lg shadow-blue-600/10 transition hover:bg-blue-600 hover:text-white"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() => triggerDeleteModal(item.id, item.title)}
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-600 hover:text-white transition"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}