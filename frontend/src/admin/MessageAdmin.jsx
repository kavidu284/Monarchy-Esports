import { useEffect, useState, useCallback } from "react";
import api from "../services/api";

export default function MessagesAdmin() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread' | 'read'

  // Toast State
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', title, message }

  // Security Re-Authentication Modal State for Deletion
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [targetMessage, setTargetArticle] = useState(null); // { id, name, subject }
  const [reauth, setReauth] = useState({ username: "", password: "" });
  const [reauthMessage, setReauthMessage] = useState("");
  const [verifying, setVerifying] = useState(false);

  const showToast = useCallback((type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      let response;
      try {
        response = await api.get("/messages");
      } catch {
        response = await api.get("/administration/contact-messages");
      }
      return response.data || [];
    } catch (error) {
      console.error("Failed to load contact messages:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await fetchMessages();
        if (isMounted) {
          setMessages(data);
        }
      } catch {
        if (isMounted) {
          showToast("error", "Loading Failed", "Unable to fetch contact messages.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchMessages, showToast]);

  // Toggle Message Status (Read / Unread)
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "read" ? "unread" : "read";
    try {
      try {
        await api.patch(`/messages/${id}`, { status: newStatus });
      } catch {
        await api.patch(`/administration/contact-messages/${id}/status`, { status: newStatus });
      }
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, status: newStatus } : msg))
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      showToast("error", "Update Failed", "Could not change message status.");
    }
  };

  // Open Security Modal for Deletion
  const triggerDeleteModal = (id, name, subject) => {
    setTargetArticle({ id, name, subject });
    setReauth({ username: "", password: "" });
    setReauthMessage("");
    setSecurityModalOpen(true);
  };

  // Perform actual API deletion call
  const executeDelete = async (id) => {
    try {
      try {
        await api.delete(`/messages/${id}`);
      } catch {
        await api.delete(`/administration/contact-messages/${id}`);
      }

      setMessages((prev) => prev.filter((item) => item.id !== id));
      showToast("success", "Message Deleted", "The message has been permanently removed.");
      setSecurityModalOpen(false);
      setTargetArticle(null);
    } catch (error) {
      console.error("Delete error:", error);
      showToast("error", "Delete Failed", error?.response?.data?.detail || "Could not delete message.");
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

      if (response.data?.success && targetMessage) {
        await executeDelete(targetMessage.id);
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

  const formatDate = (date) => {
    if (!date) return "N/A";
    return String(date).replace("T", " ").slice(0, 16);
  };

  const filteredMessages = messages.filter((msg) => {
    if (filter === "unread") return msg.status === "unread";
    if (filter === "read") return msg.status === "read";
    return true;
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-black font-sans text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-4 shadow-xl">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
          <span className="font-semibold text-gray-300">Loading messages...</span>
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
            <button
              onClick={() => setToast(null)}
              className="p-1 text-gray-400 hover:text-white text-xs font-bold"
            >
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
                  Delete message from: {targetMessage?.name || "User"}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              You are about to delete this contact inquiry. Please enter your credentials to verify authorization.
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
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Inquiries & Feedback
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              Contact Messages
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              View and manage messages submitted through the public contact form.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* STATUS FILTER BUTTONS */}
            <div className="flex items-center gap-1.5 rounded-2xl border border-zinc-800 bg-black p-1.5">
              {["all", "unread", "read"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition ${
                    filter === type
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Total</p>
              <p className="text-2xl font-black text-blue-400">{messages.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* EMPTY */}
      {filteredMessages.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-xl shadow-black/30">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-4xl">
            📩
          </div>

          <h2 className="text-3xl font-bold">No Messages Found</h2>

          <p className="mt-3 text-gray-400">
            {filter !== "all"
              ? `No messages matching filter "${filter}".`
              : "Contact messages will appear here after users submit the contact form."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredMessages.map((message) => {
            const isUnread = message.status === "unread";

            return (
              <div
                key={message.id}
                className={`rounded-3xl border p-6 shadow-xl shadow-black/30 transition hover:border-zinc-700 ${
                  isUnread ? "border-blue-500/40 bg-zinc-950" : "border-zinc-800 bg-zinc-950/60 opacity-80"
                }`}
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  {/* MESSAGE CONTENT */}
                  <div className="flex-1">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                        Message #{message.id}
                      </span>

                      {isUnread && (
                        <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-400">
                          NEW
                        </span>
                      )}

                      <span className="rounded-full border border-zinc-700 bg-black px-3 py-1 text-xs font-bold text-gray-400">
                        {formatDate(message.created_at)}
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-white">
                      {message.subject || "No Subject"}
                    </h2>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Name</p>
                        <p className="mt-1 font-bold text-white">{message.name || "-"}</p>
                      </div>

                      <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                        <a
                          href={`mailto:${message.email}`}
                          className="mt-1 block break-all font-bold text-blue-400 hover:underline"
                        >
                          {message.email || "-"}
                        </a>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-5">
                      <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Message
                      </p>

                      <p className="whitespace-pre-line leading-7 text-gray-300">
                        {message.message || "-"}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-3 lg:flex-col shrink-0">
                    <a
                      href={`mailto:${message.email}?subject=Reply: ${message.subject || "Contact Message"}`}
                      className="rounded-xl border border-blue-500/40 bg-black px-5 py-2.5 text-center text-xs font-bold text-white transition hover:bg-blue-500/10"
                    >
                      ✉️ Reply
                    </a>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(message.id, message.status)}
                      className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-xs font-bold text-gray-300 hover:text-white transition"
                    >
                      {isUnread ? "✓ Mark Read" : "✉️ Mark Unread"}
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerDeleteModal(message.id, message.name, message.subject)}
                      className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-red-700"
                    >
                      🗑️ Delete
                    </button>
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