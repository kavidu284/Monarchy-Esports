import { useState } from "react";
import { useParams } from "react-router-dom";
import PlayerSection from "../components/PlayerSection";
import api from "../services/api";

export default function RegisterTeam() {
  const { id } = useParams();

  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const inputClass =
    "w-full rounded-2xl border border-zinc-700 bg-black px-4 py-4 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  const fileClass =
    "w-full rounded-2xl border border-zinc-700 bg-black px-4 py-4 text-gray-300 outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-bold file:text-white hover:file:bg-blue-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  const sectionClass =
    "rounded-3xl border border-zinc-800 bg-zinc-950/95 p-8 shadow-2xl shadow-black/40 transition hover:border-blue-500/40";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agree) {
      alert("Please agree to the tournament rules");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.append("tournament_id", id);

    try {
      setSubmitting(true);

      const response = await api.post(
        "/registrations/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(response.data.message || "Registration Submitted Successfully");

      form.reset();
      setAgree(false);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Registration Failed. Please check your details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.25),transparent_35%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.1),transparent_35%)]" />
      <div className="absolute left-10 top-20 h-48 w-48 animate-pulse rounded-full bg-blue-600/10 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-60 w-60 animate-pulse rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        {/* HEADER */}
        <div className="mb-14 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-blue-500/30 bg-blue-500/10 shadow-xl shadow-blue-600/20">
            <span className="text-5xl">🎮</span>
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-400">
            Monarchy Esports
          </p>

          <h1 className="mt-4 text-5xl font-black leading-tight md:text-6xl">
            MLBB Tournament Registration
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Monarchy Esports Official Registration Form
          </p>

          <div className="mx-auto mt-8 h-[2px] w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-10"
          encType="multipart/form-data"
        >
          {/* TEAM INFORMATION */}
          <div className={sectionClass}>
            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl">
                🛡️
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                  Step 01
                </p>

                <h2 className="mt-1 text-3xl font-black">
                  Team Information
                </h2>

                <p className="mt-2 text-gray-400">
                  Enter your official team details.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Team Name
                </label>

                <input
                  type="text"
                  name="team_name"
                  placeholder="Enter team name"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Clan Name
                </label>

                <input
                  type="text"
                  name="clan_name"
                  placeholder="Enter clan name"
                  required
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Team Logo
                </label>

                <input
                  type="file"
                  name="team_logo"
                  accept="image/*"
                  required
                  className={fileClass}
                />
              </div>
            </div>
          </div>

          {/* CAPTAIN INFORMATION */}
          <div className={sectionClass}>
            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl">
                👑
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                  Step 02
                </p>

                <h2 className="mt-1 text-3xl font-black">
                  Captain Information
                </h2>

                <p className="mt-2 text-gray-400">
                  Captain will be contacted for match updates.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Captain Name
                </label>

                <input
                  type="text"
                  name="captain_name"
                  placeholder="Captain name"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Captain Email
                </label>

                <input
                  type="email"
                  name="captain_email"
                  placeholder="Captain email"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Captain Phone
                </label>

                <input
                  type="text"
                  name="captain_phone"
                  placeholder="Captain phone"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Discord Username
                </label>

                <input
                  type="text"
                  name="discord_username"
                  placeholder="Discord username"
                  required
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* MAIN PLAYERS */}
          <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-8 text-center shadow-xl shadow-blue-600/10">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Step 03
            </p>

            <h2 className="mt-2 text-4xl font-black">
              Main Roster
            </h2>

            <p className="mt-3 text-gray-400">
              Add 5 main players including the captain.
            </p>
          </div>

          <PlayerSection
            title="Player 1 (Captain)"
            prefix="player1"
          />

          <PlayerSection
            title="Player 2"
            prefix="player2"
          />

          <PlayerSection
            title="Player 3"
            prefix="player3"
          />

          <PlayerSection
            title="Player 4"
            prefix="player4"
          />

          <PlayerSection
            title="Player 5"
            prefix="player5"
          />

          {/* SUBSTITUTES */}
          <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-8 text-center shadow-xl shadow-blue-600/10">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Step 04
            </p>

            <h2 className="mt-2 text-4xl font-black">
              Substitute Players
            </h2>

            <p className="mt-3 text-gray-400">
              Optional substitute players.
            </p>
          </div>

          <PlayerSection
            title="Substitute 1"
            prefix="sub1"
            required={false}
          />

          <PlayerSection
            title="Substitute 2"
            prefix="sub2"
            required={false}
          />

          {/* VERIFICATION */}
          <div className={sectionClass}>
            <div className="mb-8 flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl">
                ✅
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                  Step 05
                </p>

                <h2 className="mt-1 text-3xl font-black">
                  Verification
                </h2>

                <p className="mt-2 text-gray-400">
                  Upload proof and confirm your registration details.
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Team Lobby Screenshot
              </label>

              <input
                type="file"
                name="lobby_screenshot"
                accept="image/*"
                required
                className={fileClass}
              />
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-4 rounded-2xl border border-zinc-800 bg-black p-5 transition hover:border-blue-500/40 hover:bg-blue-500/5">
              <input
                type="checkbox"
                checked={agree}
                onChange={() => setAgree(!agree)}
                className="mt-1 h-5 w-5 accent-blue-600"
              />

              <span className="text-gray-300">
                I agree to the{" "}
                <span className="font-semibold text-blue-400">
                  Monarchy Esports tournament rules
                </span>{" "}
                and confirm all submitted information is correct.
              </span>
            </label>
          </div>

          {/* SUBMIT */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-2xl shadow-black/40">
            <button
              type="submit"
              disabled={!agree || submitting}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-12 py-4 text-xl font-black text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Registration"}
            </button>

            <p className="mt-4 text-sm text-gray-500">
              Please double-check all player details before submitting.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}