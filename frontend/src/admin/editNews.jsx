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
  const [imagePreview, setImagePreview] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await api.get(
          `/announcements/${id}`
        );

        setFormData({
          title: response.data.title || "",
          message: response.data.message || "",
          image_url:
            response.data.image_url || "",
        });

        setImagePreview(
          response.data.image_url || ""
        );
      } catch (error) {
        console.error(error);
        alert("Failed to load announcement");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
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
      alert("Please select a valid image");

      e.target.value = "";
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setNewImage(selectedImage);

    setImagePreview(
      URL.createObjectURL(selectedImage)
    );
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

      submitData.append(
        "title",
        formData.title
      );

      submitData.append(
        "message",
        formData.message
      );

      submitData.append(
        "existing_image_url",
        formData.image_url || ""
      );

      if (newImage) {
        submitData.append("image", newImage);
      }

      await api.put(
        `/announcements/${id}`,
        submitData
      );

      alert(
        "Announcement Updated Successfully"
      );

      navigate("/admin/news");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Update Failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-blue-500";

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-10 text-center text-white">
        Loading announcement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mb-10 flex justify-between rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <div>
          <p className="font-bold uppercase text-blue-400">
            Admin Panel
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Edit Announcement
          </h1>
        </div>

        <Link
          to="/admin/news"
          className="rounded-xl border border-zinc-700 bg-black px-6 py-3 font-bold"
        >
          ← Back
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-5xl space-y-8"
      >
        <div className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <div>
            <label className="mb-2 block font-semibold">
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
            <label className="mb-2 block font-semibold">
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
            <label className="mb-2 block font-semibold">
              New Image (Optional)
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3"
            />
          </div>

          {newImage && (
            <button
              type="button"
              onClick={removeNewImage}
              className="rounded-xl bg-red-600 px-5 py-3 font-bold"
            >
              Cancel New Image
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-3xl border border-blue-500/20 bg-blue-500/5">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Announcement"
              className="h-72 w-full object-cover"
            />
          )}

          <div className="p-8">
            <h3 className="text-2xl font-black">
              {formData.title}
            </h3>

            <p className="mt-4 whitespace-pre-line text-gray-300">
              {formData.message}
            </p>

            {imagePreview && !newImage && (
              <button
                type="button"
                onClick={removeCurrentImage}
                className="mt-5 rounded-xl bg-red-600 px-5 py-3 font-bold"
              >
                Remove Current Image
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-blue-600 px-8 py-4 font-bold disabled:opacity-50"
        >
          {submitting
            ? "Updating..."
            : "Update Announcement"}
        </button>
      </form>
    </div>
  );
}