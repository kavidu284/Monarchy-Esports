import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";
import api from "../services/api";
import getImageUrl from "../utils/getImageUrl";

export default function NewsDetails() {
  const { id } = useParams();

  const [news, setNews] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get(
          `/announcements/${id}`
        );

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
        Loading announcement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-zinc-900 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.2),transparent_35%)]">
        <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-16">
          <Link
            to="/news"
            className="inline-flex rounded-full border border-zinc-700 bg-zinc-950/80 px-4 py-2 font-bold text-white transition hover:border-blue-500/60 hover:bg-blue-500/10"
          >
            ← Back to News
          </Link>

          <h1 className="mt-7 text-4xl font-black leading-tight md:text-6xl">
            {news.title}
          </h1>

          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
            {news.created_at
              ? new Date(
                  news.created_at
                ).toLocaleDateString()
              : "No Date"}
          </p>
        </div>
      </section>

      {news.image_url ? (
        <section className="mx-auto max-w-6xl px-6 pt-10 md:pt-12">
          <div className="overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-950 p-3 shadow-2xl shadow-black/40">
            <div className="mb-3 flex items-center justify-between rounded-2xl border border-zinc-800 bg-black/60 px-4 py-2">
              <p className="text-sm font-semibold text-gray-400">
                {news.created_at
                  ? new Date(
                      news.created_at
                    ).toLocaleDateString()
                  : "No Date"}
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-black">
              <img
                src={getImageUrl(news.image_url)}
                alt={news.title}
                className="h-[320px] w-full object-contain object-center contrast-110 brightness-110 saturate-110 md:h-[560px]"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="rounded-3xl border border-zinc-800/90 bg-zinc-950/95 p-8 shadow-2xl shadow-black/35 backdrop-blur md:p-10">
          <p className="whitespace-pre-line text-lg leading-9 text-gray-300">
            {news.message}
          </p>
        </div>
      </section>
    </div>
  );
}