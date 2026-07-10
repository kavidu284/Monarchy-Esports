import { Link } from "react-router-dom";
import getImageUrl from "../utils/getImageUrl";

export default function NewsCard({ news }) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-xl">
      {news.image_url ? (
        <div className="h-60 overflow-hidden bg-black">
          <img
            src={getImageUrl(news.image_url)}
            alt={news.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        </div>
      ) : (
        <div className="flex h-44 items-center justify-center bg-black text-6xl">
          📰
        </div>
      )}

      <div className="p-6">
        <h3 className="text-2xl font-black">
          {news.title}
        </h3>

        <p className="mt-4 line-clamp-3 whitespace-pre-line text-gray-400">
          {news.message}
        </p>

        <Link
          to={`/news/${news.id}`}
          className="mt-6 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-bold text-blue-400"
        >
          Read More →
        </Link>
      </div>
    </div>
  );
}