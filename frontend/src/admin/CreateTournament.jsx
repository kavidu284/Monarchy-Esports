import { useState } from "react";
import api from "../services/api";

export default function CreateTournament() {
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    game_name: "Mobile Legends: Bang Bang",
    prize_pool: "",
    status: "Upcoming",
    registration_start: "",
    registration_end: "",
    tournament_start: "",
    tournament_end: "",
    max_teams: 64,
    tournament_format: "Bracket Only",
  });

  const [bannerImage, setBannerImage] = useState(null);


  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const toBackendDateTime = (value) => {
    if (!value) return "";

    const dateValue = String(value).replace("T", " ");

    if (dateValue.length === 16) {
      return `${dateValue}:00`;
    }

    return dateValue;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("subtitle", form.subtitle);
      formData.append("description", form.description);
      formData.append("game_name", form.game_name);
      formData.append("prize_pool", form.prize_pool);
      formData.append("status", form.status);
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
      formData.append("max_teams", form.max_teams);
      formData.append("tournament_format", form.tournament_format);

      if (bannerImage) {
        formData.append("banner_image", bannerImage);
      }
      await api.post("/tournaments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Tournament Created Successfully");

      setForm({
        title: "",
        subtitle: "",
        description: "",
        game_name: "Mobile Legends: Bang Bang",
        prize_pool: "",
        status: "Upcoming",
        registration_start: "",
        registration_end: "",
        tournament_start: "",
        tournament_end: "",
        max_teams: 64,
        tournament_format: "Bracket Only",
      });

      setBannerImage(null);
      e.target.reset();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.detail ||
          "Failed To Create Tournament"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  const fileInputClass =
    "w-full rounded-xl border border-dashed border-zinc-700 bg-black px-4 py-4 text-sm text-gray-300 outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-bold file:text-white hover:border-blue-500/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  const labelClass =
    "mb-2 block text-sm font-semibold text-gray-300";

  const sectionClass =
    "rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl shadow-black/30 sm:p-8";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* HEADER */}
        <div className="mb-8 sm:mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 sm:text-sm">
            Admin Panel
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Create Tournament
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-gray-400 sm:text-base">
            Create a new Monarchy Esports tournament and configure
            registration, schedule, format, rules, and prize pool.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-5xl space-y-6 sm:space-y-8"
        >
          {/* BASIC DETAILS */}
          <div className={sectionClass}>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl">
                🏆
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400 sm:text-sm">
                  Step 01
                </p>

                <h2 className="text-xl font-bold sm:text-2xl">
                  Basic Tournament Details
                </h2>
              </div>
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
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  $
                </span>

                <input
                  type="number"
                  name="prize_pool"
                  value={form.prize_pool}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-zinc-700 bg-black py-3 pl-10 pr-4 text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
            </div>
          </div>

          {/* MEDIA AND RULES */}
          <div className={sectionClass}>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl">
                🖼️
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400 sm:text-sm">
                  Step 02
                </p>

                <h2 className="text-xl font-bold sm:text-2xl">
                  Media & Rules
                </h2>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Banner Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setBannerImage(e.target.files?.[0] || null)
                  }
                  className={fileInputClass}
                />

                {bannerImage && (
                  <p className="mt-2 truncate text-xs text-blue-400">
                    Selected: {bannerImage.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* STATUS AND FORMAT */}
          <div className={sectionClass}>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl">
                ⚙️
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400 sm:text-sm">
                  Step 03
                </p>

                <h2 className="text-xl font-bold sm:text-2xl">
                  Status & Format
                </h2>
              </div>
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

            <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
              <p className="text-sm text-gray-300">
                Selected Format:
                <span className="ml-2 font-bold text-blue-400">
                  {form.tournament_format}
                </span>
              </p>
            </div>
          </div>

          {/* DATES */}
          <div className={sectionClass}>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl">
                📅
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400 sm:text-sm">
                  Step 04
                </p>

                <h2 className="text-xl font-bold sm:text-2xl">
                  Registration & Tournament Dates
                </h2>
              </div>
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
          <div className="sticky bottom-4 rounded-3xl border border-zinc-800 bg-black/90 p-4 backdrop-blur sm:bottom-6 sm:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  Ready to create tournament?
                </h3>

                <p className="text-sm text-gray-500">
                  Check all details before submitting.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Creating..."
                  : "Create Tournament"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}