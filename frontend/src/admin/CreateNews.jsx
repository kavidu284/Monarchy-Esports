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
      alert("Please select a valid image");

      e.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(selectedImage);
    setImagePreview(
      URL.createObjectURL(selectedImage)
    );
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

      await api.post(
        "/announcements",
        submitData
      );

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
      <div className="mb-10 flex flex-col gap-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 md:flex-row md:items-center md:justify-between">
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
          className="rounded-xl border border-zinc-700 bg-black px-6 py-3 font-bold transition hover:border-blue-500"
        >
          ← Back to News
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-5xl space-y-8"
      >
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
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
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-bold file:text-white"
              />
            </div>

            {image && (
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                <p className="font-bold text-blue-400">
                  {image.name}
                </p>

                <button
                  type="button"
                  onClick={removeImage}
                  className="mt-3 rounded-xl bg-red-600 px-5 py-2 font-bold"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-blue-500/20 bg-blue-500/5">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="h-72 w-full object-cover"
            />
          )}

          <div className="p-8">
            <p className="text-sm font-bold uppercase text-blue-400">
              Preview
            </p>

            <h3 className="mt-3 text-2xl font-black">
              {formData.title ||
                "News title preview"}
            </h3>

            <p className="mt-4 whitespace-pre-line text-gray-300">
              {formData.message ||
                "News message preview"}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-blue-600 px-8 py-4 font-bold disabled:opacity-50"
        >
          {submitting
            ? "Publishing..."
            : "Publish News"}
        </button>
      </form>
    </div>
  );
}