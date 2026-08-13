import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { clearAdminSession } from "../utils/auth";

export default function Administration() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch Security Events
  const loadSecurityLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/administration");
      setSecurityEvents(response.data?.security_events || []);
    } catch (error) {
      console.error("Failed to load security logs:", error);
      if (error?.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
        clearAdminSession();
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    const fetchLogs = async () => {
      try {
        const response = await api.get("/administration");
        if (isMounted) {
          setSecurityEvents(response.data?.security_events || []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load security logs:", error);
        if (isMounted) {
          setLoading(false);
          if (error?.response?.status === 401) {
            alert("Your session has expired. Please log in again.");
            clearAdminSession();
            navigate("/admin/login");
          }
        }
      }
    };

    fetchLogs();

    return () => {
      isMounted = false;
    };
  }, [navigate]);


  // Filter logs based on search input
  const filteredEvents = securityEvents.filter((event) => {
    const term = search.toLowerCase();
    return (
      (event.event_type && event.event_type.toLowerCase().includes(term)) ||
      (event.username && event.username.toLowerCase().includes(term)) ||
      (event.details && event.details.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-8 text-white font-sans">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-4 shadow-xl">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
          <span className="font-semibold text-gray-300">
            Loading security audit log...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 text-white sm:p-8 font-sans selection:bg-blue-600 selection:text-white">
      {/* HEADER BAR */}
      <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl shadow-blue-600/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-400">
              Administration Audit
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-black">
              Security Audit Log
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-gray-400 leading-relaxed">
              Review system-wide security actions, logins, account updates, and administrative events in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadSecurityLogs}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:bg-zinc-800"
            >
              🔄 Refresh Logs
            </button>
          </div>
        </div>
      </div>

      {/* LOG SEARCH & METRICS */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="🔍 Search events by type, admin username, or details..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
        <span className="text-xs font-bold text-gray-400">
          Showing {filteredEvents.length} log events
        </span>
      </div>

      {/* SECURITY EVENT LOGS LIST */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            📋 No security events found matching "{search}".
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border border-zinc-800 bg-black p-5 transition hover:border-zinc-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-400">
                      {event.event_type}
                    </span>
                    <span className="text-xs font-semibold text-gray-400">
                      User: <strong className="text-white">{event.username || "System/Unknown"}</strong> (ID #{event.admin_id || "N/A"})
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                      🕒{" "}
                      {event.created_at
                        ? new Date(event.created_at).toLocaleString("en-LK", {
                            timeZone: "Asia/Colombo",
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : "Unknown"}
                    </span>
                </div>

                <div className="mt-3 text-sm text-gray-300">
                  <p className="font-mono text-xs leading-relaxed text-gray-400">
                    {event.details || "No additional event metadata logged."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}