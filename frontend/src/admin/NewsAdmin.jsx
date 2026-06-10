
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function NewsAdmin() {

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

    fetchNews();
  }, []);

  const deleteNews = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this news?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/announcements/${id}`);

      setNews(
        news.filter((item) => item.id !== id)
      );

      alert("News Deleted");
    } catch (error) {
      console.error(error);
      alert("Delete Failed");
    }
  };

  return (
    <div>

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
          News Management
        </h1>

        <Link to="/admin/announcements/create">
          <button className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg">
            + Create Announcement
          </button>
        </Link>

      </div>

      <div className="space-y-4">

        {news.map((item) => (

          <div
            key={item.id}
            className="bg-zinc-900 p-6 rounded-xl flex justify-between items-center"
          >

            <div>

              <h2 className="text-2xl font-bold">
                {item.title}
              </h2>

              <p className="text-gray-400">
                {new Date(
                  item.created_at
                ).toLocaleDateString()}
              </p>

            </div>

            <div className="flex gap-3">

              <Link
                to={`/admin/news/edit/${item.id}`}
              >
                <button className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg">
                  Edit
                </button>
              </Link>

              <button
                onClick={() => deleteNews(item.id)}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}
