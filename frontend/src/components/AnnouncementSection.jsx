import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";

export default function AnnouncementSection() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const response = await api.get("/announcements");
        const items = Array.isArray(response.data) ? response.data : [];
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
      viewport={{ once: true, amount: 0.2 }}
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

          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Stay updated with tournament news, schedules, and official
            Monarchy Esports announcements.
          </p>
        </div>

        <div className="space-y-6">
          {announcements.length > 0 ? (
            announcements.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.12 }}
                whileHover={{ scale: 1.02 }}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30 transition hover:border-blue-500/50"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl">
                    📰
                  </div>

                  <h3 className="text-xl font-black text-blue-400">
                    {item.title}
                  </h3>
                </div>

                <p className="leading-7 text-gray-300">
                  {item.message}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center shadow-xl shadow-black/30">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-3xl">
                📰
              </div>

              <p className="font-semibold text-gray-400">
                No new announcements available right now.
              </p>
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/news"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-7 py-4 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/40"
          >
            View All News
          </Link>
        </div>
      </div>
    </motion.section>
  );
}