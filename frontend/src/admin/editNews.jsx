import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function EditAnnouncement() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    message: "",
  });

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await api.get(`/announcements/${id}`);

        setFormData({
          title: response.data.title,
          message: response.data.message,
        });
      } catch (error) {
        console.error(error);
        alert("Failed to load announcement");
      }
    };

    fetchAnnouncement();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(
        `/announcements/${id}`,
        formData
      );

      alert("Announcement Updated Successfully");

      navigate("/admin/news");
    } catch (error) {
      console.error(error);
      alert("Update Failed");
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Edit Announcement
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <input
          type="text"
          name="title"
          placeholder="Announcement Title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full bg-zinc-900 p-4 rounded-lg"
        />

        <textarea
          name="message"
          placeholder="Announcement Message"
          rows="8"
          value={formData.message}
          onChange={handleChange}
          required
          className="w-full bg-zinc-900 p-4 rounded-lg"
        />

        <button
          type="submit"
          className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg"
        >
          Update Announcement
        </button>
      </form>
    </div>
  );
}
