import { Link } from "react-router-dom";

export default function NewsCard({ news }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-blue-600/10">
      {/* Glow Effect */}
      <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-blue-600/10 blur-3xl transition duration-300 group-hover:bg-blue-500/20" />

      <div className="relative">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl shadow-lg shadow-blue-600/10">
          📰
        </div>

        <h3 className="text-2xl font-black leading-snug text-white transition duration-300 group-hover:text-blue-400">
          {news.title}
        </h3>

        <p className="mt-4 line-clamp-3 leading-7 text-gray-400">
          {news.message}
        </p>

        <Link
          to={`/news/${news.id}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-bold text-blue-400 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/30"
        >
          Read More
          <span className="transition duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}