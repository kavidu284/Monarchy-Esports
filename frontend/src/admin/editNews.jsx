import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import api from "../services/api";

export default function EditAnnouncement() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    image_url: "",
  });

  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Toast / Popup Message State
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', title, message }

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAnnouncement = async () => {
      try {
        const response = await api.get(`/announcements/${id}`);

        if (isMounted) {
          setFormData({
            title: response.data.title || "",
            message: response.data.message || "",
            image_url: response.data.image_url || "",
          });

          setImagePreview(response.data.image_url || "");
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          showToast("error", "Load Failed", "Failed to load announcement");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnnouncement();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files?.[0];

    if (!selectedImage) return;

    if (!selectedImage.type.startsWith("image/")) {
      showToast("error", "Invalid File", "Please select a valid image");
      e.target.value = "";
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setNewImage(selectedImage);
    setImagePreview(URL.createObjectURL(selectedImage));
  };

  const removeNewImage = () => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setNewImage(null);
    setImagePreview(formData.image_url || "");
  };

  const removeCurrentImage = () => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setNewImage(null);
    setImagePreview("");

    setFormData({
      ...formData,
      image_url: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("message", formData.message);
      submitData.append("existing_image_url", formData.image_url || "");

      if (newImage) {
        submitData.append("image", newImage);
      }

      await api.put(`/announcements/${id}`, submitData);

      showToast("success", "Updated", "Announcement Updated Successfully");

      setTimeout(() => {
        navigate("/admin/news");
      }, 1200);
    } catch (error) {
      console.error(error);
      showToast(
        "error",
        "Update Failed",
        error.response?.data?.detail || "Update Failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-blue-500";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-black font-sans text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-4 shadow-xl">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
          <span className="font-semibold text-gray-300">Loading announcement...</span>
        </div>
      </div>
    );
  }

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

      <div className="mb-10 flex justify-between rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl">
        <div>
          <p className="font-bold uppercase tracking-widest text-blue-400 text-xs">
            Admin Panel
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Edit Announcement
          </h1>
        </div>

        <Link
          to="/admin/news"
          className="inline-flex items-center rounded-xl border border-zinc-700 bg-black px-6 py-3 font-bold transition hover:border-blue-500"
        >
          ← Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl space-y-8">
        <div className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl">
          <div>
            <label className="mb-2 block font-semibold text-gray-300">
              Announcement Title
            </label>

            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-300">
              Announcement Message
            </label>

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="10"
              required
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-300">
              New Image (Optional)
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-bold file:text-white hover:file:bg-blue-700"
            />
          </div>

          {newImage && (
            <button
              type="button"
              onClick={removeNewImage}
              className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
            >
              Cancel New Image
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-3xl border border-blue-500/20 bg-blue-500/5 shadow-xl">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Announcement"
              className="h-72 w-full object-cover"
            />
          )}

          <div className="p-8">
            <h3 className="text-2xl font-black text-white">
              {formData.title || "Title preview"}
            </h3>

            <p className="mt-4 whitespace-pre-line text-gray-300 leading-relaxed">
              {formData.message || "Message preview"}
            </p>

            {imagePreview && !newImage && (
              <button
                type="button"
                onClick={removeCurrentImage}
                className="mt-5 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
              >
                Remove Current Image
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 disabled:opacity-50"
        >
          {submitting ? "Updating..." : "Update Announcement"}
        </button>
      </form>
    </div>
  );
}