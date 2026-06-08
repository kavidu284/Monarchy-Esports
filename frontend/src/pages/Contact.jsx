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
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-5xl font-bold text-center mb-4">
          Contact Us
        </h1>

        <p className="text-center text-gray-400 mb-10">
          Get in touch with Monarchy Esports
        </p>

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-xl mb-6">
            Message sent successfully.
          </div>
        )}
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
            <h2 className="text-3xl font-bold text-blue-500 mb-6">
              Contact Information
            </h2>

            <div className="space-y-4">
              <p>📧 Email: monarchyesports@gmail.com</p>
              <p>🎮 Discord: Monarchy™</p>
              <p>📘 Facebook: Monarchy Esports</p>
              <p>📷 TikTok: monarchyesports</p>
              <p>📸 YouTube: monarhyesports</p>
            </div>
          </div>

          <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
            <h2 className="text-3xl font-bold text-blue-500 mb-6">
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
                className="w-full bg-zinc-800 p-3 rounded-lg"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="w-full bg-zinc-800 p-3 rounded-lg"
              />

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                required
                className="w-full bg-zinc-800 p-3 rounded-lg"
              />

              <textarea
                rows="6"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Message"
                required
                className="w-full bg-zinc-800 p-3 rounded-lg"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold"
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