import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function EditTournament() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const toDateTimeLocal = (value) => {
    if (!value) return "";

    return String(value)
      .replace(" ", "T")
      .slice(0, 16);
  };

  const toBackendDateTime = (value) => {
    if (!value) return null;

    const dateValue = String(value).replace("T", " ");

    if (dateValue.length === 16) {
      return `${dateValue}:00`;
    }

    return dateValue;
  };

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await api.get(`/tournaments/${id}`);

        const tournament = response.data;

        setForm({
          ...tournament,
          title: tournament.title || "",
          subtitle: tournament.subtitle || "",
          description: tournament.description || "",
          game_name:
            tournament.game_name ||
            "Mobile Legends: Bang Bang",
          banner_image: tournament.banner_image || "",
          rulebook_url: tournament.rulebook_url || "",
          prize_pool: tournament.prize_pool || "",
          status: tournament.status || "Upcoming",
          registration_start: toDateTimeLocal(
            tournament.registration_start
          ),
          registration_end: toDateTimeLocal(
            tournament.registration_end
          ),
          tournament_start: toDateTimeLocal(
            tournament.tournament_start
          ),
          tournament_end: toDateTimeLocal(
            tournament.tournament_end
          ),
          max_teams: tournament.max_teams || 64,
          tournament_format:
            tournament.tournament_format ||
            "Bracket Only",
        });
      } catch (error) {
        console.error(error);
        alert("Failed to load tournament");
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("title", form.title || "");
      formData.append("subtitle", form.subtitle || "");
      formData.append("description", form.description || "");
      formData.append("game_name", form.game_name || "Mobile Legends: Bang Bang");
      formData.append("prize_pool", form.prize_pool || 0);
      formData.append("status", form.status || "Upcoming");
      formData.append(
        "registration_start",
        toBackendDateTime(form.registration_start)
      );
      formData.append(
        "registration_end",
        toBackendDateTime(form.registration_end)
      );
      formData.append(
        "tournament_start",
        toBackendDateTime(form.tournament_start)
      );
      formData.append(
        "tournament_end",
        toBackendDateTime(form.tournament_end)
      );
      formData.append("max_teams", form.max_teams || 64);
      formData.append(
        "tournament_format",
        form.tournament_format || "Bracket Only"
      );
      formData.append("rulebook_url", form.rulebook_url || "");

      if (form.banner_image instanceof File) {
        formData.append("banner_image_file", form.banner_image);
      } else {
        formData.append("banner_image", form.banner_image || "");
      }

      await api.put(`/tournaments/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Tournament Updated Successfully");

      navigate("/admin/tournaments");
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.detail ||
          "Failed To Update Tournament"
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  const labelClass =
    "mb-2 block text-sm font-semibold text-gray-300";

  const sectionClass =
    "rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30";

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
          <p className="text-gray-400">
            Loading tournament...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl px-6 py-10">
        {/* HEADER */}
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Admin Panel
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Edit Tournament
            </h1>

            <p className="mt-3 max-w-2xl text-gray-400">
              Update tournament details, registration dates,
              tournament dates, status, and format.
            </p>
          </div>

          <Link to="/admin/tournaments">
            <button className="rounded-xl border border-zinc-700 bg-black px-6 py-3 font-bold text-white transition hover:border-blue-500 hover:bg-blue-500/10">
              ← Back
            </button>
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 max-w-5xl"
        >
          {/* BASIC DETAILS */}
          <div className={sectionClass}>
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                Section 01
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Basic Details
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Tournament Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  placeholder="Tournament Title"
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Subtitle
                </label>

                <input
                  name="subtitle"
                  value={form.subtitle}
                  placeholder="Subtitle"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  placeholder="Description"
                  rows="5"
                  onChange={handleChange}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Game Name
                </label>

                <input
                  name="game_name"
                  value={form.game_name}
                  placeholder="Game Name"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Prize Pool
                </label>

                <input
                  type="number"
                  name="prize_pool"
                  value={form.prize_pool}
                  placeholder="Prize Pool"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* MEDIA */}
          <div className={sectionClass}>
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                Section 02
              </p>

              <h2 className="mt-2 text-2xl font-bold">
               Tournament Logo
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Banner Image 
                </label>

                <input
                    type="file"
                    name="banner_image"
                    accept="image/*"
                    onChange={(e) =>
                      setForm({
                        ...form,
                        banner_image: e.target.files[0],
                      })
                    }
                    className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white"
                  />
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div className={sectionClass}>
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                Section 03
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Status & Format
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className={labelClass}>
                  Tournament Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Tournament Format
                </label>

                <select
                  name="tournament_format"
                  value={form.tournament_format}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Bracket Only">
                    Bracket Only
                  </option>

                  <option value="Round Robin + Bracket">
                    Round Robin + Bracket
                  </option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Max Teams
                </label>

                <input
                  type="number"
                  name="max_teams"
                  value={form.max_teams}
                  placeholder="Max Teams"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* DATES */}
          <div className={sectionClass}>
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                Section 04
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Registration Dates
              </h2>

              <p className="mt-2 text-gray-400">
                These dates control registration countdown and
                register button visibility.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Registration Start
                </label>

                <input
                  type="datetime-local"
                  name="registration_start"
                  value={form.registration_start}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Registration End
                </label>

                <input
                  type="datetime-local"
                  name="registration_end"
                  value={form.registration_end}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                Section 05
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Tournament Dates
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Tournament Start
                </label>

                <input
                  type="datetime-local"
                  name="tournament_start"
                  value={form.tournament_start}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Tournament End
                </label>

                <input
                  type="datetime-local"
                  name="tournament_end"
                  value={form.tournament_end}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* SUBMIT */}
          <div className="sticky bottom-6 rounded-3xl border border-zinc-800 bg-black/90 p-5 backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  Save tournament changes?
                </h3>

                <p className="text-sm text-gray-500">
                  Dates and details will update on public pages.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}