import { useState } from "react";
import api from "../services/api";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/contact", formData);

      setSuccess(true);

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to send message");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-12 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-400">
            Monarchy Esports
          </p>

          <h1 className="mt-4 text-5xl font-black md:text-6xl">
            Contact Us
          </h1>

          <p className="mt-4 text-gray-400">
            Get in touch with Monarchy Esports
          </p>
        </div>

        {success && (
          <div className="mb-8 rounded-2xl border border-green-500/40 bg-green-500/10 p-4 text-center font-semibold text-green-400">
            Message sent successfully.
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
            <h2 className="mb-6 text-3xl font-black text-blue-500">
              Contact Information
            </h2>

            <div className="space-y-4 text-gray-300">
              <p className="rounded-xl border border-zinc-800 bg-black p-4">
                📧 Email: monarchyesports@gmail.com
              </p>

              <p className="rounded-xl border border-zinc-800 bg-black p-4">
                🎮 Discord: Monarchy™
              </p>

              <p className="rounded-xl border border-zinc-800 bg-black p-4">
                📘 Facebook: Monarchy Esports
              </p>

              <p className="rounded-xl border border-zinc-800 bg-black p-4">
                📷 TikTok: monarchyesports
              </p>

              <p className="rounded-xl border border-zinc-800 bg-black p-4">
                📸 YouTube: monarhyesports
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
            <h2 className="mb-6 text-3xl font-black text-blue-500">
              Send Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                required
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

              <textarea
                rows="6"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Message"
                required
                className="w-full resize-none rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/40"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}