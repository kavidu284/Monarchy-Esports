import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import getImageUrl from "../utils/getImageUrl";

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
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 px-8 py-7 text-center shadow-xl shadow-blue-600/10 sm:px-10 sm:py-8">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
          <p className="font-semibold text-gray-300">Loading announcement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER SECTION */}
      <section className="relative overflow-hidden border-b border-zinc-900 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.2),transparent_35%)]">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 md:py-14">
          <Link
            to="/news"
            className="inline-flex rounded-full border border-zinc-700 bg-zinc-950/80 px-4 py-2 font-bold text-white transition hover:border-blue-500/60 hover:bg-blue-500/10"
          >
            ← Back to News
          </Link>

          <h1 className="mt-6 text-3xl font-black leading-tight text-white md:text-5xl lg:text-6xl">
            {news.title}
          </h1>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-blue-300 sm:text-sm">
            {news.created_at
              ? new Date(news.created_at).toLocaleDateString()
              : "No Date"}
          </p>
        </div>
      </section>

      {/* SEPARATE HERO IMAGE DISPLAY */}
      {news.image_url ? (
        <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950 shadow-2xl shadow-blue-950/20">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black sm:aspect-[21/9]">
              {/* Blurred Ambient Image Backdrop */}
              <img
                src={getImageUrl(news.image_url)}
                alt=""
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
              />

              {/* Sharp Main Image */}
              <img
                src={getImageUrl(news.image_url)}
                alt={news.title}
                className="relative h-full w-full object-contain object-center"
                loading="eager"
                decoding="async"
              />

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />

              {/* Top Glass Badge */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-black/60 px-3 py-1.5 text-xs font-semibold text-gray-300 backdrop-blur-md sm:px-4 sm:py-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Announcement Media
                </span>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ARTICLE CONTENT */}
      <section className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <div className="rounded-3xl border border-zinc-800/90 bg-zinc-950/95 p-6 shadow-2xl shadow-black/35 backdrop-blur sm:p-8 md:p-10">
          <p className="whitespace-pre-line text-base leading-8 text-gray-300 sm:text-lg sm:leading-9">
            {news.message}
          </p>
        </div>
      </section>
    </div>
  );
}