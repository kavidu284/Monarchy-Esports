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
      className="relative overflow-hidden bg-black px-6 py-20 text-white"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(30,64,175,0.22),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(14,116,144,0.16),transparent_34%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-400">
            Latest Updates
          </p>

          <h2 className="mt-3 text-4xl font-black md:text-5xl">
            Latest Announcements
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Fresh updates, event alerts, and competitive news from Monarchy.
          </p>
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
                  className="group relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-950/95 shadow-xl shadow-black/30 transition duration-300 hover:-translate-y-1.5 hover:border-blue-500/60 hover:shadow-blue-600/15"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_40%)] opacity-0 transition duration-300 group-hover:opacity-100" />

                  {item.image_url ? (
                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900 ring-1 ring-white/10">
                      <img
                        src={getImageUrl(
                          item.image_url
                        )}
                        alt={item.title}
                        className="h-full w-full object-cover object-center contrast-110 brightness-110 saturate-110 transition duration-700 group-hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

                      <div className="absolute left-4 top-4 rounded-full border border-blue-500/30 bg-black/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-300 backdrop-blur">
                        Update
                      </div>

                      <div className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur">
                        Latest Announcement
                      </div>
                    </div>
                  ) : (
                    <div className="flex aspect-[16/10] items-center justify-center bg-zinc-900 text-6xl">
                      📰
                    </div>
                  )}

                  <div className="relative p-6">
                    <h3 className="line-clamp-2 text-xl font-black text-blue-300">
                      {item.title}
                    </h3>

                    <p className="mt-4 line-clamp-3 whitespace-pre-line leading-7 text-gray-300">
                      {item.message}
                    </p>

                    <Link
                      to={`/news/${item.id}`}
                      className="mt-6 inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2.5 text-sm font-bold text-blue-300 transition hover:border-blue-400 hover:bg-blue-500/20"
                    >
                      Read Full Update →
                    </Link>
                  </div>
                </motion.article>
              )
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center shadow-xl shadow-black/30">
            <p className="text-gray-400">
              No announcements available.
            </p>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/news"
            className="inline-flex rounded-full border border-blue-500/30 bg-blue-600 px-7 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
          >
            View All News
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
