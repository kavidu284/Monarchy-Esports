import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

export default function GalleryAdmin() {
  const [images, setImages] = useState([]);
  const [tournaments, setTournaments] = useState([]);

  const [tournamentId, setTournamentId] = useState("");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileKey, setFileKey] = useState(0);

  const fetchGallery = useCallback(async () => {
    try {
      const response = await api.get("/gallery");
      setImages(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [galleryResponse, tournamentsResponse] =
          await Promise.all([
            api.get("/gallery"),
            api.get("/tournaments"),
          ]);

        if (isMounted) {
          setImages(galleryResponse.data);
          setTournaments(tournamentsResponse.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!image || !tournamentId) {
      alert("Select tournament and image");
      return;
    }

    const formData = new FormData();

    formData.append("tournament_id", tournamentId);
    formData.append("caption", caption);
    formData.append("image", image);

    try {
      setUploading(true);

      await api.post("/gallery", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Image Uploaded");

      setCaption("");
      setImage(null);
      setTournamentId("");
      setFileKey((prev) => prev + 1);

      fetchGallery();
    } catch (error) {
      console.error(error);
      alert("Upload Failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (id) => {
    if (!window.confirm("Delete this image?")) return;

    try {
      await api.delete(`/gallery/${id}`);
      fetchGallery();
    } catch (error) {
      console.error(error);
      alert("Delete Failed");
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";

    if (String(imageUrl).startsWith("http")) {
      return imageUrl;
    }

    return `${api.defaults.baseURL}/${String(imageUrl).replace(
      /^\/+/,
      ""
    )}`;
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
          <p className="text-gray-400">Loading gallery...</p>
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
            Gallery Management
          </h1>

          <p className="mt-2 max-w-2xl text-gray-400">
            Upload and manage tournament gallery images for public
            event memories.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-6 py-4">
          <p className="text-sm text-gray-400">Total Images</p>

          <p className="mt-1 text-3xl font-black text-blue-400">
            {images.length}
          </p>
        </div>
      </div>

      {/* UPLOAD FORM */}
      <form
        onSubmit={handleUpload}
        className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30"
      >
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-3xl">
            🖼️
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Upload Image
            </p>

            <h2 className="text-2xl font-bold">
              Add New Gallery Photo
            </h2>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-300">
              Select Tournament
            </label>

            <select
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Select Tournament</option>

              {tournaments.map((tournament) => (
                <option
                  key={tournament.id}
                  value={tournament.id}
                >
                  {tournament.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-300">
              Caption
            </label>

            <input
              type="text"
              placeholder="Image caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-300">
              Image File
            </label>

            <input
              key={fileKey}
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-bold file:text-white hover:file:bg-blue-700"
              required
            />
          </div>
        </div>

        {image && (
          <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
            <p className="text-sm text-gray-400">
              Selected Image
            </p>

            <p className="mt-1 font-bold text-blue-400">
              {image.name}
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={uploading}
            className="rounded-xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
        </div>
      </form>

      {/* EMPTY */}
      {images.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-xl shadow-black/30">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-4xl">
            🖼️
          </div>

          <h2 className="text-3xl font-bold">
            No Gallery Images Found
          </h2>

          <p className="mt-3 text-gray-400">
            Upload tournament images to show them on the public gallery
            page.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {images.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/30 transition hover:border-blue-500/60 hover:shadow-blue-500/10"
            >
              <div className="relative h-64 overflow-hidden bg-black">
                <img
                  src={getImageUrl(item.image_url)}
                  alt={item.caption || "Gallery image"}
                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                />

                <div className="absolute left-4 top-4 rounded-full border border-blue-500/30 bg-black/80 px-3 py-1 text-xs font-bold text-blue-300 backdrop-blur">
                  Image #{item.id}
                </div>
              </div>

              <div className="p-5">
                <p className="min-h-[48px] whitespace-pre-line text-gray-300">
                  {item.caption || "No caption"}
                </p>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    Tournament ID: {item.tournament_id || "-"}
                  </p>

                  <button
                    onClick={() => deleteImage(item.id)}
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