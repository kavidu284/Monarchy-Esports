import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import getImageUrl from "../utils/getImageUrl";

// Individual Gallery Card with Image Skeleton & Hover Polish
function GalleryCard({ image, index, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const imageUrl = getImageUrl(image.image_url);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className="
        group relative mb-6 cursor-pointer break-inside-avoid overflow-hidden 
        rounded-3xl border border-zinc-800/80 bg-zinc-950/80 shadow-xl 
        transition-all duration-500 ease-out 
        hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-600/20 
        focus:outline-none focus:ring-2 focus:ring-blue-500
      "
    >
      {/* IMAGE WRAPPER WITH INNER RING GLOW */}
      <div className="relative overflow-hidden bg-zinc-900 ring-1 ring-inset ring-white/10">
        
        {/* SKELETON SHIMMER PLACEHOLDER */}
        {!loaded && (
          <div className="absolute inset-0 z-10 animate-pulse bg-zinc-900/90">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-zinc-800/40 to-transparent animate-shimmer" />
          </div>
        )}

        {/* MAIN IMAGE */}
        <img
          src={imageUrl}
          alt={image.caption || "Monarchy Esports Gallery"}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`
            h-auto w-full object-cover transition-transform duration-700 ease-out
            group-hover:scale-105
            ${loaded ? "opacity-100" : "opacity-0"}
          `}
        />

        {/* GRADIENT OVERLAY FOR TEXT READABILITY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-85" />

        {/* INDEX BADGE */}
        <div className="absolute right-3.5 top-3.5 z-20 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-extrabold tracking-wider text-zinc-300 backdrop-blur-md transition group-hover:border-blue-500/40 group-hover:text-blue-400">
          #{index + 1}
        </div>

        {/* HOVER MAGNIFY BUTTON */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded-full border border-white/20 bg-blue-600/80 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
          <span>🔍</span> View
        </div>
      </div>

      {/* CAPTION AREA */}
      <div className="p-4 bg-gradient-to-b from-zinc-950 to-black">
        <p className="line-clamp-2 text-center text-sm font-bold text-zinc-200 transition group-hover:text-white sm:text-base">
          {image.caption || "Monarchy Esports Moment"}
        </p>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchGallery = async () => {
      try {
        const res = await api.get("/gallery");
        if (mounted) setImages(res.data);
      } catch (err) {
        console.error("Failed to fetch gallery:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchGallery();
    return () => {
      mounted = false;
    };
  }, []);

  const closeImage = () => setSelectedIndex(null);

  const nextImage = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setSelectedIndex((prev) => (prev === null ? null : (prev + 1) % images.length));
    },
    [images.length]
  );

  const previousImage = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setSelectedIndex((prev) =>
        prev === null ? null : prev === 0 ? images.length - 1 : prev - 1
      );
    },
    [images.length]
  );

  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeImage();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") previousImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, nextImage, previousImage]);

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;
  const selectedImageUrl = selectedImage ? getImageUrl(selectedImage.image_url) : null;

  // --- ORIGINAL SPINNER LOADING CARD ---
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 px-10 py-8 text-center shadow-xl shadow-blue-600/10">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />

          <p className="font-semibold text-gray-300">
            Loading gallery...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-zinc-900 py-20 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,.22),transparent_40%),radial-gradient(circle_at_bottom,rgba(59,130,246,.08),transparent_40%)]" />
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-blue-400 sm:text-sm">
            Monarchy Esports
          </p>
          <h1 className="mt-4 text-4xl font-black md:text-6xl lg:text-7xl">
            Gallery
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-zinc-400 sm:text-lg">
            Explore tournament highlights, championship moments, team celebrations,
            and memories from Monarchy Esports.
          </p>
        </div>
      </section>

      {/* MASONRY GRID */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {images.length > 0 ? (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
            {images.map((image, index) => (
              <GalleryCard
                key={image.id || index}
                image={image}
                index={index}
                onClick={() => setSelectedIndex(index)}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-xl">
            <div className="text-6xl">🖼️</div>
            <h2 className="mt-5 text-2xl font-black text-white">No Images Available</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Gallery highlights will appear here once uploaded by the admin.
            </p>
          </div>
        )}
      </section>

      {/* LIGHTBOX MODAL WITH AMBIENT GLOW */}
      {selectedImage && selectedImageUrl && (
        <div
          onClick={closeImage}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl animate-in fade-in duration-200"
        >
          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={closeImage}
            className="absolute right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-xl text-white backdrop-blur-xl transition hover:border-red-500/80 hover:bg-red-500/20 sm:right-6 sm:top-6 sm:h-12 sm:w-12"
          >
            ✕
          </button>

          {/* COUNTER */}
          <div className="absolute top-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/20 bg-black/60 px-5 py-2 text-xs font-bold text-white backdrop-blur-xl sm:top-6 sm:text-sm">
            {selectedIndex + 1} / {images.length}
          </div>

          {/* PREVIOUS / NEXT */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={previousImage}
                className="absolute left-3 top-1/2 z-50 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3 text-lg text-white backdrop-blur-xl transition hover:border-blue-500 hover:bg-blue-500/20 sm:left-6 sm:px-5 sm:py-3 sm:text-2xl"
              >
                ←
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-3 top-1/2 z-50 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3 text-lg text-white backdrop-blur-xl transition hover:border-blue-500 hover:bg-blue-500/20 sm:right-6 sm:px-5 sm:py-3 sm:text-2xl"
              >
                →
              </button>
            </>
          )}

          {/* LIGHTBOX CONTAINER WITH BLUE AMBIENT BACKDROP */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[85vh] max-w-[90vw] flex-col items-center justify-center"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 p-2 shadow-[0_0_80px_rgba(37,99,235,0.25)] sm:rounded-3xl">
              <img
                src={selectedImageUrl}
                alt={selectedImage.caption || "Gallery detail"}
                className="max-h-[72vh] max-w-full rounded-xl object-contain sm:rounded-2xl"
              />
            </div>

            {/* CAPTION FOOTER */}
            <div className="mt-4 flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:gap-6">
              <div className="rounded-xl border border-white/10 bg-black/80 px-5 py-2.5 backdrop-blur-xl">
                <h3 className="text-sm font-bold text-white sm:text-base">
                  {selectedImage.caption || "Monarchy Esports Moment"}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}