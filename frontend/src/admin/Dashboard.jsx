import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    tournaments: 0,
    registrations: 0,
    approved: 0,
    pending: 0,
    announcements: 0,
    messages: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard");

        if (mounted) {
          setStats(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const statCards = [
    {
      title: "Tournaments",
      value: stats.tournaments,
      icon: "🏆",
      description: "Total tournaments created",
    },
    {
      title: "Registrations",
      value: stats.registrations,
      icon: "👥",
      description: "Total team registrations",
    },
    {
      title: "Approved Teams",
      value: stats.approved,
      icon: "✅",
      description: "Teams approved for events",
    },
    {
      title: "Pending Teams",
      value: stats.pending,
      icon: "⏳",
      description: "Waiting for approval",
    },
    {
      title: "Announcements",
      value: stats.announcements,
      icon: "📢",
      description: "Published announcements",
    },
    {
      title: "Messages",
      value: stats.messages,
      icon: "📩",
      description: "Contact form messages",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
          <p className="text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <div className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Admin Panel
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-gray-400">
              Overview of tournaments, registrations, approvals,
              announcements, and messages.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-6 py-4">
            <p className="text-sm text-gray-400">
              System Status
            </p>

            <p className="mt-1 font-bold text-blue-400">
              Online
            </p>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="group rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-blue-500/10"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-400">
                  {card.title}
                </p>

                <p className="mt-3 text-5xl font-black text-white">
                  {Number(card.value || 0).toLocaleString()}
                </p>

                <p className="mt-3 text-sm text-gray-500">
                  {card.description}
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl transition group-hover:bg-blue-600">
                {card.icon}
              </div>
            </div>

            <div className="mt-6 h-[2px] w-full overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-blue-600 to-blue-400" />
            </div>
          </div>
        ))}
      </div>

      {/* QUICK SUMMARY */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
          <h2 className="text-2xl font-bold">
            Registration Summary
          </h2>

          <p className="mt-2 text-gray-400">
            Current approval status of registered teams.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-gray-500">
                Approved
              </p>

              <p className="mt-2 text-3xl font-black text-blue-400">
                {Number(stats.approved || 0).toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-gray-500">
                Pending
              </p>

              <p className="mt-2 text-3xl font-black text-white">
                {Number(stats.pending || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-8 shadow-xl shadow-black/30">
          <h2 className="text-2xl font-bold">
            Admin Notes
          </h2>

          <p className="mt-2 text-gray-400">
            Use the sidebar to manage tournaments, registrations,
            matches, news, gallery, and contact messages.
          </p>

          <div className="mt-6 rounded-2xl border border-blue-500/20 bg-black p-5">
            <p className="font-semibold text-blue-400">
              Tip
            </p>

            <p className="mt-2 text-sm text-gray-400">
              Match management is available after setting a tournament
              status to Ongoing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}