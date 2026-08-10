import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CreateNews() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    message: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Toast State
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', title, message }

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files?.[0];

    if (!selectedImage) {
      setImage(null);
      setImagePreview("");
      return;
    }

    if (!selectedImage.type.startsWith("image/")) {
      showToast("error", "Invalid File", "Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(selectedImage);
    setImagePreview(URL.createObjectURL(selectedImage));
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(null);
    setImagePreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("message", formData.message);

      if (image) {
        submitData.append("image", image);
      }

      await api.post("/announcements", submitData);

      showToast("success", "News Created", "Announcement published successfully!");
      
      setTimeout(() => {
        navigate("/admin/news");
      }, 1200);
    } catch (error) {
      console.error(error);
      showToast(
        "error",
        "Publish Failed",
        error.response?.data?.detail || "Failed to create announcement."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className="relative min-h-screen bg-black font-sans text-white selection:bg-blue-600 selection:text-white">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 right-6 z-[200] w-full max-w-md animate-slide-in">
          <div
            className={`flex items-start gap-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
              toast.type === "success"
                ? "border-emerald-500/40 bg-zinc-950/95 text-emerald-400"
                : "border-red-500/40 bg-zinc-950/95 text-red-400"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-current/20 bg-current/10 text-xl font-bold">
              {toast.type === "success" ? "✓" : "⚠️"}
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-sm font-bold text-white">{toast.title}</h4>
              <p className="mt-0.5 text-xs text-gray-300">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 text-gray-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="mb-10 flex flex-col gap-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 md:flex-row md:items-center md:justify-between shadow-xl">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Admin Panel
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Create News
          </h1>

          <p className="mt-2 text-gray-400">
            Publish Monarchy Esports announcements.
          </p>
        </div>

        <Link
          to="/admin/news"
          className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-black px-6 py-3 font-bold transition hover:border-blue-500"
        >
          ← Back to News
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl space-y-8">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block font-semibold text-gray-300">
                News Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter news title"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-300">
                News Message
              </label>

              <textarea
                name="message"
                rows="10"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write announcement message..."
                required
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-300">
                Announcement Image (Optional)
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-bold file:text-white hover:file:bg-blue-700"
              />
            </div>

            {image && (
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 flex items-center justify-between">
                <p className="font-bold text-blue-400 truncate max-w-md">
                  {image.name}
                </p>

                <button
                  type="button"
                  onClick={removeImage}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-blue-500/20 bg-blue-500/5 shadow-xl">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="h-72 w-full object-cover"
            />
          )}

          <div className="p-8">
            <p className="text-sm font-bold uppercase tracking-wider text-blue-400">
              Preview
            </p>

            <h3 className="mt-3 text-2xl font-black text-white">
              {formData.title || "News title preview"}
            </h3>

            <p className="mt-4 whitespace-pre-line leading-relaxed text-gray-300">
              {formData.message || "News message preview"}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 disabled:opacity-50"
        >
          {submitting ? "Publishing..." : "Publish News"}
        </button>
      </form>
    </div>
  );
}