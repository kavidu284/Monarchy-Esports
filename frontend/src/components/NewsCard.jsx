import { Link } from "react-router-dom";
import getImageUrl from "../utils/getImageUrl";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getShortMessage(message, length = 180) {
  if (!message) return "";
  return message.length > length
    ? message.substring(0, length) + "..."
    : message;
}

export default function NewsCard({ news }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/30 transition hover:border-blue-500/60 hover:shadow-blue-500/10">
      <div className="flex flex-col lg:flex-row">
        {/* IMAGE */}

        {news.image_url ? (
          <div className="h-64 w-full shrink-0 overflow-hidden bg-black lg:h-auto lg:w-80">
            <img
              src={getImageUrl(news.image_url)}
              alt={news.title}
              className="h-full w-full object-cover transition duration-500 hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex h-48 w-full shrink-0 items-center justify-center bg-black text-6xl text-zinc-700 lg:h-auto lg:w-80">
            📰
          </div>
        )}

        {/* CONTENT */}

        <div className="flex flex-1 flex-col justify-between p-6">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                Announcement #{news.id}
              </span>

              <span className="rounded-full border border-zinc-700 bg-black px-3 py-1 text-xs font-bold text-gray-400">
                {formatDate(news.created_at)}
              </span>

              {news.image_url && (
                <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                  Image Added
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black text-white">
              {news.title}
            </h2>

            <p className="mt-3 max-w-4xl whitespace-pre-line leading-7 text-gray-400">
              {getShortMessage(news.message)}
            </p>
          </div>

          <div className="mt-6">
            <Link
              to={`/news/${news.id}`}
              className="inline-flex items-center rounded-xl bg-white px-6 py-3 font-bold text-black transition hover:bg-blue-100"
            >
              Read More →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}