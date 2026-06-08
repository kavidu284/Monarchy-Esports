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
    <div className="bg-black min-h-screen text-white">

      <div className="max-w-7xl mx-auto px-6 py-12">

        <h1 className="text-5xl font-bold text-center mb-4">
          Gallery
        </h1>

        <p className="text-center text-gray-400 mb-12">
          Monarchy Esports Moments
        </p>

        {images.length > 0 ? (

          <div className="grid md:grid-cols-3 gap-6">

            {images.map((image) => (

              <div
                key={image.id}
                className="cursor-pointer"
                onClick={() =>
                  setSelected(image.image_url)
                }
              >
                <img
                  src={image.image_url}
                  alt={image.caption}
                  className="w-full h-64 object-cover rounded-xl hover:scale-105 transition"
                />

                <p className="mt-2 text-center text-gray-400">
                  {image.caption}
                </p>
              </div>

            ))}

          </div>

        ) : (

          <div className="text-center py-20">

            <h2 className="text-2xl text-gray-400">
              No Images Available
            </h2>

          </div>

        )}

      </div>

      {selected && (

        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >

          <img
            src={selected}
            alt="Gallery"
            className="max-w-5xl max-h-[90vh] rounded-xl"
          />

        </div>

      )}

    </div>
  );
}