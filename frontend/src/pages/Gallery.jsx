import { useEffect, useState } from "react";
import api from "../services/api";
import getImageUrl from "../utils/getImageUrl";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  const aspectClasses = [
    "aspect-[4/3]",
    "aspect-[3/4]",
    "aspect-[1/1]",
    "aspect-[16/10]",
    "aspect-[5/4]",
    "aspect-[4/5]",
  ];

  useEffect(() => {
    let mounted = true;

    const fetchGallery = async () => {
      try {
        const response = await api.get("/gallery");

        if (mounted) {
          setImages(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchGallery();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedIndex(null);
      }

      if (event.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev + 1) % images.length);
      }

      if (event.key === "ArrowLeft") {
        setSelectedIndex((prev) =>
          prev === 0 ? images.length - 1 : prev - 1
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedIndex, images.length]);

  const selectedImage =
    selectedIndex !== null ? images[selectedIndex] : null;
  const selectedImageUrl = selectedImage
    ? getImageUrl(selectedImage.image_url)
    : null;

  const openImage = (index) => {
    setSelectedIndex(index);
  };

  const closeImage = () => {
    setSelectedIndex(null);
  };

  const showNextImage = (event) => {
    event.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const showPreviousImage = (event) => {
    event.stopPropagation();
    setSelectedIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

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
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-900 py-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.22),transparent_35%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.08),transparent_35%)]" />

        <div className="relative mx-auto max-w-5xl px-6">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-400">
            Monarchy Esports
          </p>

          <h1 className="mt-4 text-5xl font-black leading-tight md:text-7xl">
            Gallery
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400 md:text-xl">
            Monarchy Esports moments, highlights, and tournament memories.
          </p>
        </div>
      </section>

      {/* GALLERY */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        {images.length > 0 ? (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
            {images.map((image, index) => {
              const imageUrl = getImageUrl(image.image_url);
              const aspectClass =
                aspectClasses[index % aspectClasses.length];

              return (
                <div
                  key={image.id}
                  onClick={() => openImage(index)}
                  className="group mb-6 cursor-pointer break-inside-avoid overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950 shadow-xl shadow-black/30 transition duration-300 hover:-translate-y-1.5 hover:border-blue-500/60 hover:shadow-blue-500/20"
                >
                  <div
                    className={`relative ${aspectClass} overflow-hidden bg-zinc-900`}
                  >
                    <img
                      src={imageUrl}
                      alt={image.caption || "Gallery image"}
                      className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_40%)] opacity-0 transition duration-300 group-hover:opacity-100" />

                    <div className="absolute left-4 top-4 rounded-full border border-blue-500/30 bg-black/80 px-3 py-1 text-xs font-bold text-blue-300 backdrop-blur">
                      Moment #{image.id}
                    </div>

                    <div className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-xs font-semibold text-white/90 opacity-0 backdrop-blur transition duration-300 group-hover:opacity-100">
                      View
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="line-clamp-2 text-center font-semibold text-gray-200">
                      {image.caption || "Monarchy Esports Moment"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-xl shadow-black/30">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-4xl">
              🖼️
            </div>

            <h2 className="text-3xl font-black text-white">
              No Images Available
            </h2>

            <p className="mt-3 text-gray-400">
              Gallery images will appear here after admin uploads them.
            </p>
          </div>
        )}
      </section>

      {/* IMAGE MODAL */}
      {selectedImage && selectedImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-6 backdrop-blur-sm"
          onClick={closeImage}
        >
          <button
            onClick={closeImage}
            className="absolute right-6 top-6 rounded-full border border-zinc-700 bg-zinc-950 px-5 py-3 font-bold text-white transition hover:border-blue-500 hover:bg-blue-500/10"
          >
            ✕
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={showPreviousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-zinc-700 bg-zinc-950/90 px-4 py-3 text-lg font-bold text-white transition hover:border-blue-500 hover:bg-blue-500/10"
                aria-label="Previous image"
              >
                ←
              </button>

              <button
                onClick={showNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-zinc-700 bg-zinc-950/90 px-4 py-3 text-lg font-bold text-white transition hover:border-blue-500 hover:bg-blue-500/10"
                aria-label="Next image"
              >
                →
              </button>
            </>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-6xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-blue-600/10"
          >
            <img
              src={selectedImageUrl}
              alt={selectedImage.caption || "Gallery"}
              className="max-h-[78vh] w-full object-contain"
            />

            <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-4">
              <p className="pr-4 text-sm font-medium text-gray-200 md:text-base">
                {selectedImage.caption || "Monarchy Esports Moment"}
              </p>

              <p className="shrink-0 text-xs font-semibold tracking-wide text-blue-300 md:text-sm">
                {selectedIndex + 1} / {images.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}