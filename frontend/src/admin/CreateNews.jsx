import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CreateNews() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      await api.post("/announcements", formData);

      alert("News Created Successfully");
      navigate("/admin/news");
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.detail ||
          "Failed To Create News"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <div className="mb-10 flex flex-col gap-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Admin Panel
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Create News
          </h1>

          <p className="mt-2 max-w-2xl text-gray-400">
            Publish official Monarchy Esports announcements and news
            updates for players.
          </p>
        </div>

        <Link to="/admin/news">
          <button className="rounded-xl border border-zinc-700 bg-black px-6 py-3 font-bold text-white transition hover:border-blue-500 hover:bg-blue-500/10">
            ← Back to News
          </button>
        </Link>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl space-y-8"
      >
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-3xl">
              📰
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                News Details
              </p>

              <h2 className="text-2xl font-bold">
                Announcement Content
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                News Title
              </label>

              <input
                type="text"
                name="title"
                placeholder="Enter news title"
                value={formData.title}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                News Message
              </label>

              <textarea
                name="message"
                placeholder="Write announcement message..."
                rows="10"
                value={formData.message}
                onChange={handleChange}
                required
                className={`${inputClass} resize-none leading-7`}
              />
            </div>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Preview
          </p>

          <h3 className="mt-3 text-2xl font-black text-white">
            {formData.title || "News title preview"}
          </h3>

          <p className="mt-4 whitespace-pre-line leading-7 text-gray-300">
            {formData.message ||
              "News message preview will appear here while typing."}
          </p>
        </div>

        {/* SUBMIT */}
        <div className="sticky bottom-6 rounded-3xl border border-zinc-800 bg-black/90 p-5 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold">
                Ready to publish?
              </h3>

              <p className="text-sm text-gray-500">
                This news will be visible to public users.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish News"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}