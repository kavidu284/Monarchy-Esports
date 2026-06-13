import { useEffect, useState } from "react";
import api from "../services/api";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchGallery = async () => {
      try {
        const response = await api.get("/gallery");
        if (mounted) setImages(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchGallery();

    return () => {
      mounted = false;
    };
  }, []);

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
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelected(image.image_url)}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-blue-500/10"
              >
                <div className="relative h-72 overflow-hidden bg-zinc-900">
                  <img
                    src={image.image_url}
                    alt={image.caption}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80" />

                  <div className="absolute left-4 top-4 rounded-full border border-blue-500/30 bg-black/80 px-3 py-1 text-xs font-bold text-blue-300 backdrop-blur">
                    Moment #{image.id}
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-center font-semibold text-gray-300">
                    {image.caption || "Monarchy Esports Moment"}
                  </p>
                </div>
              </div>
            ))}
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
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-6 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute right-6 top-6 rounded-full border border-zinc-700 bg-zinc-950 px-5 py-3 font-bold text-white transition hover:border-blue-500 hover:bg-blue-500/10"
          >
            ✕
          </button>

          <img
            src={selected}
            alt="Gallery"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-6xl rounded-3xl border border-zinc-800 object-contain shadow-2xl shadow-blue-600/10"
          />
        </div>
      )}
    </div>
  );
}