import { useEffect, useState } from "react";
import api from "../services/api";
import getImageUrl from "../utils/getImageUrl";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchGallery = async () => {
      try {
        const res = await api.get("/gallery");

        if (mounted) {
          setImages(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchGallery();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedIndex(null);

      if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev + 1) % images.length);
      }

      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) =>
          prev === 0 ? images.length - 1 : prev - 1
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, images.length]);

  const openImage = (index) => setSelectedIndex(index);

  const closeImage = () => setSelectedIndex(null);

  const nextImage = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const selectedImage =
    selectedIndex !== null ? images[selectedIndex] : null;

  const selectedImageUrl = selectedImage
    ? getImageUrl(selectedImage.image_url)
    : null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 px-10 py-8 shadow-xl shadow-blue-500/10">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />

          <p className="font-semibold text-gray-300">
            Loading Gallery...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HERO */}

      <section className="relative overflow-hidden border-b border-zinc-900 py-24">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,.22),transparent_35%),radial-gradient(circle_at_bottom,rgba(59,130,246,.08),transparent_35%)]" />

        <div className="relative mx-auto max-w-6xl px-6 text-center">

          <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-400">
            Monarchy Esports
          </p>

          <h1 className="mt-5 text-5xl font-black md:text-7xl">
            Gallery
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-400">
            Explore tournament highlights, championship moments,
            unforgettable victories, team celebrations,
            and memories from Monarchy Esports.
          </p>

        </div>

      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
              {images.length > 0 ? (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">

          {images.map((image, index) => {
            const imageUrl = getImageUrl(image.image_url);

            return (
              <div
                key={image.id}
                onClick={() => openImage(index)}
                className="
                  group
                  mb-6
                  cursor-pointer
                  break-inside-avoid
                  overflow-hidden
                  rounded-3xl
                  border
                  border-zinc-800
                  bg-zinc-950
                  shadow-xl
                  shadow-black/40
                  transition-all
                  duration-500
                  hover:-translate-y-2
                  hover:border-blue-500/70
                  hover:shadow-blue-500/20
                "
              >

                {/* IMAGE */}

                <div className="relative overflow-hidden bg-zinc-900">

                  <img
                    src={imageUrl}
                    alt={image.caption || "Gallery image"}
                    loading="lazy"
                    className="
                      h-auto
                      w-full
                      object-cover
                      transition
                      duration-700
                      group-hover:scale-[1.06]
                    "
                  />


                  {/* DARK OVERLAY */}

                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/80
                      via-transparent
                      to-transparent
                      opacity-80
                    "
                  />


                  {/* NUMBER BADGE */}

                  <div
                    className="
                      absolute
                      right-4
                      top-4
                      rounded-full
                      border
                      border-white/10
                      bg-black/60
                      px-3
                      py-1
                      text-xs
                      font-bold
                      backdrop-blur-xl
                    "
                  >
                    #{index + 1}
                  </div>


                  {/* VIEW BUTTON */}

                  <div
                    className="
                      absolute
                      bottom-5
                      right-5
                      rounded-full
                      border
                      border-white/20
                      bg-black/50
                      px-4
                      py-2
                      text-sm
                      font-bold
                      text-white
                      backdrop-blur-xl
                      opacity-0
                      transition-all
                      duration-300
                      group-hover:opacity-100
                    "
                  >
                    🔍 View
                  </div>


                </div>


                {/* CAPTION */}

                <div className="p-5">

                  <p
                    className="
                      line-clamp-2
                      text-center
                      text-lg
                      font-bold
                      text-gray-200
                    "
                  >
                    {image.caption || "Monarchy Esports Moment"}
                  </p>

                </div>

              </div>
            );
          })}

        </div>

      ) : (

        <div
          className="
            rounded-3xl
            border
            border-zinc-800
            bg-zinc-950
            p-16
            text-center
            shadow-xl
          "
        >

          <div className="text-7xl">
            🖼️
          </div>

          <h2 className="mt-6 text-3xl font-black">
            No Images Available
          </h2>

          <p className="mt-3 text-gray-400">
            Gallery images will appear after admin uploads them.
          </p>

        </div>

      )}

    </section>
      {/* IMAGE VIEWER MODAL */}

      {selectedImage && selectedImageUrl && (
        <div
          onClick={closeImage}
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/95
            backdrop-blur-md
            animate-in
            fade-in
            duration-300
          "
        >

          {/* CLOSE BUTTON */}

          <button
            onClick={closeImage}
            className="
              absolute
              right-6
              top-6
              z-50
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              border
              border-white/20
              bg-black/50
              text-3xl
              text-white
              backdrop-blur-xl
              transition
              hover:border-red-500
              hover:bg-red-500/20
            "
          >
            ×
          </button>


          {/* IMAGE COUNTER */}

          <div
            className="
              absolute
              top-6
              left-1/2
              z-50
              -translate-x-1/2
              rounded-full
              border
              border-white/20
              bg-black/50
              px-5
              py-2
              text-sm
              font-bold
              text-white
              backdrop-blur-xl
            "
          >
            {selectedIndex + 1} / {images.length}
          </div>


          {/* PREVIOUS BUTTON */}

          {images.length > 1 && (
            <button
              onClick={previousImage}
              className="
                absolute
                left-5
                top-1/2
                z-50
                -translate-y-1/2
                rounded-full
                border
                border-white/20
                bg-black/50
                px-5
                py-3
                text-2xl
                text-white
                backdrop-blur-xl
                transition
                hover:border-blue-500
                hover:bg-blue-500/20
              "
            >
              ←
            </button>
          )}


          {/* NEXT BUTTON */}

          {images.length > 1 && (
            <button
              onClick={nextImage}
              className="
                absolute
                right-5
                top-1/2
                z-50
                -translate-y-1/2
                rounded-full
                border
                border-white/20
                bg-black/50
                px-5
                py-3
                text-2xl
                text-white
                backdrop-blur-xl
                transition
                hover:border-blue-500
                hover:bg-blue-500/20
              "
            >
              →
            </button>
          )}



          {/* MAIN IMAGE */}

          <div
            onClick={(e) => e.stopPropagation()}
            className="
              relative
              flex
              max-h-[90vh]
              max-w-[92vw]
              items-center
              justify-center
            "
          >

            <img
              src={selectedImageUrl}
              alt={selectedImage.caption || "Gallery"}
              className="
                max-h-[88vh]
                max-w-full
                rounded-3xl
                object-contain
                shadow-[0_0_80px_rgba(37,99,235,.25)]
                animate-in
                zoom-in-95
                duration-300
              "
            />



            {/* CAPTION CARD */}

            <div
              className="
                absolute
                bottom-6
                left-6
                max-w-md
                rounded-2xl
                border
                border-white/10
                bg-black/50
                px-6
                py-4
                backdrop-blur-xl
              "
            >

              <h3 className="text-lg font-black text-white">
                {selectedImage.caption || "Monarchy Esports Moment"}
              </h3>

              <p className="mt-2 text-sm text-gray-300">
                Monarchy Esports Gallery
              </p>

            </div>



            {/* KEYBOARD HELP */}

            <div
              className="
                absolute
                bottom-6
                right-6
                rounded-2xl
                border
                border-white/10
                bg-black/50
                px-5
                py-3
                text-xs
                text-gray-300
                backdrop-blur-xl
              "
            >
              <p>← Previous</p>
              <p>→ Next</p>
              <p>ESC Close</p>
            </div>


          </div>

        </div>
      )}

    </div>
  );
}