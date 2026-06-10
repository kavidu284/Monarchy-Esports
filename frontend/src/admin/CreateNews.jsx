import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CreateNews(){
    
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        });
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/announcements", formData);
            alert("News Created Successfully");
            navigate("/admin/news");
        } catch (error) {
            console.error(error);
            alert("Failed To Create News");
        }
    };
    return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Create News
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <input
          type="text"
          name="title"
          placeholder="News Title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full bg-zinc-900 p-4 rounded-lg"
        />
        <textarea
          name="message"
          placeholder="News Message"
          rows="10"
          value={formData.message}
          onChange={handleChange}
          required
          className="w-full bg-zinc-900 p-4 rounded-lg"
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
        >
          Publish News
        </button>
      </form>
    </div>
  );
}
