import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function NewsAdmin() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get("/announcements");
        setNews(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const deleteNews = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this news?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/announcements/${id}`);

      setNews(news.filter((item) => item.id !== id));

      alert("News Deleted");
    } catch (error) {
      console.error(error);
      alert("Delete Failed");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString();
  };

  const getShortMessage = (message) => {
    if (!message) return "No message content";

    if (message.length > 140) {
      return `${message.slice(0, 140)}...`;
    }

    return message;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
          <p className="text-gray-400">
            Loading news...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <div className="mb-10 flex flex-col gap-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Admin Panel
          </p>

          <h1 className="mt-2 text-4xl font-black">
            News Management
          </h1>

          <p className="mt-2 max-w-2xl text-gray-400">
            Create, edit, and delete public Monarchy Esports
            announcements.
          </p>
        </div>

        <Link to="/admin/news/create">
          <button className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-700">
            + Create Announcement
          </button>
        </Link>
      </div>

      {/* SUMMARY */}
      <div className="mb-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30">
          <p className="text-sm text-gray-500">
            Total Announcements
          </p>

          <p className="mt-2 text-4xl font-black text-blue-400">
            {news.length}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30">
          <p className="text-sm text-gray-500">
            Latest News
          </p>

          <p className="mt-2 font-bold text-white">
            {news[0]?.title || "No news yet"}
          </p>
        </div>

        <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6 shadow-xl shadow-black/30">
          <p className="text-sm text-gray-500">
            Status
          </p>

          <p className="mt-2 font-bold text-blue-400">
            News system active
          </p>
        </div>
      </div>

      {/* EMPTY */}
      {news.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-xl shadow-black/30">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-4xl">
            📰
          </div>

          <h2 className="text-3xl font-bold">
            No News Found
          </h2>

          <p className="mt-3 text-gray-400">
            Create your first announcement for players and visitors.
          </p>

          <Link to="/admin/news/create">
            <button className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700">
              Create Announcement
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {news.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30 transition hover:border-blue-500/60 hover:shadow-blue-500/10"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                {/* LEFT */}
                <div className="flex-1">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                      Announcement #{item.id}
                    </span>

                    <span className="rounded-full border border-zinc-700 bg-black px-3 py-1 text-xs font-bold text-gray-400">
                      {formatDate(item.created_at)}
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-white">
                    {item.title}
                  </h2>

                  <p className="mt-3 max-w-4xl leading-7 text-gray-400">
                    {getShortMessage(item.message)}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-wrap gap-3 lg:flex-col">
                  <Link to={`/admin/news/edit/${item.id}`}>
                    <button className="w-full rounded-xl bg-white px-5 py-3 font-bold text-black transition hover:bg-blue-100">
                      Edit
                    </button>
                  </Link>

                  <button
                    onClick={() => deleteNews(item.id)}
                    className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}