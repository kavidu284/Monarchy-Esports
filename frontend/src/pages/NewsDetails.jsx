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
      <section className="relative overflow-hidden border-b border-zinc-900">
        {news.image_url ? (
          <div className="h-[520px]">
            <img
              src={getImageUrl(
                news.image_url
              )}
              alt={news.title}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
          </div>
        ) : (
          <div className="h-80 bg-blue-950/20" />
        )}

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-5xl px-6 pb-16">
            <Link
              to="/news"
              className="mb-6 inline-flex rounded-full border border-zinc-700 bg-black/60 px-4 py-2 font-bold"
            >
              ← Back to News
            </Link>

            <h1 className="text-4xl font-black md:text-6xl">
              {news.title}
            </h1>

            <p className="mt-5 text-blue-300">
              {news.created_at
                ? new Date(
                    news.created_at
                  ).toLocaleDateString()
                : "No Date"}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <p className="whitespace-pre-line text-lg leading-9 text-gray-300">
            {news.message}
          </p>
        </div>
      </section>
    </div>
  );
}