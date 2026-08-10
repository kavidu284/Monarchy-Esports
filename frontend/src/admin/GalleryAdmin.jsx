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

  // Toast State
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', title, message }

  // Security Re-Authentication Modal State for Deletion
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [targetImage, setTargetImage] = useState(null); // { id, caption }
  const [reauth, setReauth] = useState({ username: "", password: "" });
  const [reauthMessage, setReauthMessage] = useState("");
  const [verifying, setVerifying] = useState(false);

  const showToast = useCallback((type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const fetchGallery = useCallback(async () => {
    try {
      const response = await api.get("/gallery");
      setImages(response.data || []);
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [galleryResponse, tournamentsResponse] = await Promise.all([
          api.get("/gallery"),
          api.get("/tournaments"),
        ]);

        if (isMounted) {
          setImages(galleryResponse.data || []);
          setTournaments(tournamentsResponse.data || []);
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
        if (isMounted) {
          showToast("error", "Loading Failed", "Unable to load gallery and tournaments.");
        }
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
  }, [showToast]);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!image) {
      showToast("error", "Missing Image", "Please select an image file to upload.");
      return;
    }

    const formData = new FormData();
    if (tournamentId) {
      formData.append("tournament_id", tournamentId);
    }
    formData.append("caption", caption);
    formData.append("image", image);

    try {
      setUploading(true);

      await api.post("/gallery", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showToast("success", "Upload Complete", "New gallery photo uploaded successfully!");

      setCaption("");
      setImage(null);
      setTournamentId("");
      setFileKey((prev) => prev + 1);

      fetchGallery();
    } catch (error) {
      console.error("Upload failed:", error);
      showToast("error", "Upload Failed", error?.response?.data?.detail || "Could not upload image.");
    } finally {
      setUploading(false);
    }
  };

  // Open Security Modal for Deletion
  const triggerDeleteModal = (id, captionText) => {
    setTargetImage({ id, caption: captionText || `Image #${id}` });
    setReauth({ username: "", password: "" });
    setReauthMessage("");
    setSecurityModalOpen(true);
  };

  // Perform actual API deletion call
  const executeDelete = async (id) => {
    try {
      await api.delete(`/gallery/${id}`);
      setImages((prev) => prev.filter((item) => item.id !== id));
      showToast("success", "Image Deleted", "The photo has been permanently removed.");
      setSecurityModalOpen(false);
      setTargetImage(null);
    } catch (error) {
      console.error("Delete error:", error);
      showToast("error", "Delete Failed", error?.response?.data?.detail || "Could not delete image.");
    }
  };

  // Handle Re-Authentication Submit
  const handleConfirmReauth = async (e) => {
    e.preventDefault();
    if (!reauth.username.trim() || !reauth.password.trim()) {
      setReauthMessage("Username and password are required.");
      return;
    }

    try {
      setVerifying(true);
      setReauthMessage("");
      const response = await api.post("/administration/verify-credentials", {
        username: reauth.username.trim(),
        password: reauth.password.trim(),
      });

      if (response.data?.success && targetImage) {
        await executeDelete(targetImage.id);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setReauthMessage(
        error?.response?.data?.detail || "Invalid credentials or unauthorized action."
      );
    } finally {
      setVerifying(false);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (String(imageUrl).startsWith("http")) {
      return imageUrl;
    }
    const baseURL = String(api.defaults.baseURL || "").replace(/\/+$/, "");
    return `${baseURL}/${String(imageUrl).replace(/^\/+/, "")}`;
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-black font-sans text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-6 py-4 shadow-xl">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
          <span className="font-semibold text-gray-300">Loading gallery...</span>
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

      {/* SECURITY AUTHENTICATION DELETE MODAL */}
      {securityModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-xl text-red-400">
                🔒
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Authorization Required</h3>
                <p className="text-xs text-red-400 font-semibold truncate max-w-[220px]">
                  Delete item: {targetImage?.caption}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              You are about to delete this gallery photo. Please enter your credentials to verify authorization.
            </p>

            <form onSubmit={handleConfirmReauth} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={reauth.username}
                  onChange={(e) => setReauth({ ...reauth, username: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-red-500 focus:outline-none"
                  placeholder="Username"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={reauth.password}
                  onChange={(e) => setReauth({ ...reauth, password: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-red-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              {reauthMessage && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-400">
                  ⚠️ {reauthMessage}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSecurityModalOpen(false)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-zinc-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-500 transition disabled:opacity-50"
                >
                  {verifying ? "Verifying..." : "Confirm Delete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            Upload and manage tournament gallery images for public event memories.
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
            Upload tournament images to show them on the public gallery page.
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
                    onClick={() => triggerDeleteModal(item.id, item.caption)}
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