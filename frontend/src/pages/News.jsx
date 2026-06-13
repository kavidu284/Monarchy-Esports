import { useEffect, useState } from "react";
import api from "../services/api";
import NewsCard from "../components/NewsCard";

export default function News() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get("/announcements");
        setNews(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    void fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-900 py-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.22),transparent_35%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.08),transparent_35%)]" />

        <div className="relative mx-auto max-w-5xl px-6">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-400">
            Monarchy Esports
          </p>

          <h1 className="mt-4 text-5xl font-black leading-tight md:text-7xl">
            News &{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Announcements
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-400 md:text-xl">
            Stay updated with official tournament news, announcements,
            schedules, and Monarchy Esports updates.
          </p>
        </div>
      </section>

      {/* NEWS LIST */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        {news.length > 0 ? (
          <>
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                  Latest Updates
                </p>

                <h2 className="mt-2 text-4xl font-black">
                  Official News
                </h2>
              </div>

              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-6 py-4">
                <p className="text-sm text-gray-400">
                  Total Announcements
                </p>

                <p className="mt-1 text-3xl font-black text-blue-400">
                  {news.length}
                </p>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-zinc-800 bg-zinc-950 p-1 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-blue-500/10"
                >
                  <NewsCard news={item} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-xl shadow-black/30">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-4xl">
              📰
            </div>

            <h2 className="text-3xl font-black text-white">
              No Announcements Available
            </h2>

            <p className="mt-3 text-gray-400">
              Official Monarchy Esports news will appear here soon.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}