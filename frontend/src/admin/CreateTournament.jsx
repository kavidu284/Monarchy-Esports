import { useState } from "react";
import api from "../services/api";

export default function CreateTournament() {
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    game_name: "Mobile Legends: Bang Bang",
    banner_image: "",
    rulebook_url: "",
    prize_pool: "",
    status: "Upcoming",
    registration_start: "",
    registration_end: "",
    tournament_start: "",
    tournament_end: "",
    max_teams: 64,
    tournament_format: "Bracket Only",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      await api.post("/tournaments", form);

      alert("Tournament Created Successfully");
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

  const labelClass =
    "mb-2 block text-sm font-semibold text-gray-300";

  const sectionClass =
    "rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl px-6 py-10">
        {/* HEADER */}
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Admin Panel
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Create Tournament
          </h1>

          <p className="mt-3 max-w-2xl text-gray-400">
            Create a new Monarchy Esports tournament and configure
            registration, schedule, format, rules, and prize pool.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 max-w-5xl"
        >
          {/* BASIC DETAILS */}
          <div className={sectionClass}>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl">
                🏆
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                  Step 01
                </p>

                <h2 className="text-2xl font-bold">
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

          {/* MEDIA AND RULES */}
          <div className={sectionClass}>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl">
                🖼️
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                  Step 02
                </p>

                <h2 className="text-2xl font-bold">
                  Media & Rules
                </h2>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Banner Image URL
                </label>

                <input
                  name="banner_image"
                  value={form.banner_image}
                  placeholder="Banner Image URL"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Rulebook URL
                </label>

                <input
                  name="rulebook_url"
                  value={form.rulebook_url}
                  placeholder="Rulebook URL"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* STATUS AND FORMAT */}
          <div className={sectionClass}>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl">
                ⚙️
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                  Step 03
                </p>

                <h2 className="text-2xl font-bold">
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
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl">
                📅
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                  Step 04
                </p>

                <h2 className="text-2xl font-bold">
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
          <div className="sticky bottom-6 rounded-3xl border border-zinc-800 bg-black/90 p-5 backdrop-blur">
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