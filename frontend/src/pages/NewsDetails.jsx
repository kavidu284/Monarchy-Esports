import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function NewsDetails() {
  const { id } = useParams();

  const [news, setNews] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get(`/announcements/${id}`);
        setNews(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    if (id) void fetchNews();
  }, [id]);

  if (!news) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 px-10 py-8 text-center shadow-xl shadow-blue-600/10">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />

          <p className="font-semibold text-gray-300">
            Loading announcement...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-900 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.22),transparent_35%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.08),transparent_35%)]" />

        <div className="relative mx-auto max-w-4xl px-6">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-400">
            Monarchy Esports
          </p>

          <h1 className="mt-4 text-5xl font-black leading-tight md:text-6xl">
            {news.title}
          </h1>

          <div className="mt-6 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
            {news.created_at
              ? new Date(news.created_at).toLocaleDateString()
              : "No Date"}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 md:p-10">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-3xl">
              📰
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                Announcement
              </p>

              <h2 className="text-2xl font-black">
                Official Update
              </h2>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-black p-6 md:p-8">
            <p className="whitespace-pre-line text-lg leading-9 text-gray-300">
              {news.message}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}