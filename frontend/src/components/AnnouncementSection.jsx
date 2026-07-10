import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import getImageUrl from "../utils/getImageUrl";

export default function AnnouncementSection() {
  const [announcements, setAnnouncements] =
    useState([]);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const response = await api.get(
          "/announcements"
        );

        const items = Array.isArray(
          response.data
        )
          ? response.data
          : [];

        setAnnouncements(items.slice(0, 3));
      } catch (error) {
        console.error(error);
      }
    };

    void loadAnnouncements();
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{ duration: 0.8 }}
      className="bg-black px-6 py-20 text-white"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-400">
            Latest Updates
          </p>

          <h2 className="mt-3 text-4xl font-black md:text-5xl">
            Latest Announcements
          </h2>
        </div>

        {announcements.length > 0 ? (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {announcements.map(
              (item, index) => (
                <motion.article
                  key={item.id}
                  initial={{
                    opacity: 0,
                    y: 45,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.12,
                  }}
                  className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950"
                >
                  {item.image_url ? (
                    <div className="h-56 overflow-hidden">
                      <img
                        src={getImageUrl(
                          item.image_url
                        )}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-black text-6xl">
                      📰
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-black text-blue-400">
                      {item.title}
                    </h3>

                    <p className="mt-4 line-clamp-4 whitespace-pre-line text-gray-300">
                      {item.message}
                    </p>

                    <Link
                      to={`/news/${item.id}`}
                      className="mt-6 inline-flex font-bold text-blue-400"
                    >
                      Read More →
                    </Link>
                  </div>
                </motion.article>
              )
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
            <p className="text-gray-400">
              No announcements available.
            </p>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/news"
            className="inline-flex rounded-full bg-blue-600 px-7 py-4 font-bold"
          >
            View All News
          </Link>
        </div>
      </div>
    </motion.section>
  );
}