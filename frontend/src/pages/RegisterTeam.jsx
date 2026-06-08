import { useState } from "react";

const PlayerSection = ({ title }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
    <h3 className="text-2xl font-bold text-blue-400 mb-6">{title}</h3>

    <div className="grid md:grid-cols-2 gap-4">
      <input type="file" placeholder="Player Image" className="bg-zinc-800 p-3 rounded-lg" />

      <input
        type="text"
        placeholder="Real Name"
        className="bg-zinc-800 p-3 rounded-lg"
      />

      <input
        type="text"
        placeholder="IGN"
        className="bg-zinc-800 p-3 rounded-lg"
      />

      <input
        type="text"
        placeholder="MLBB ID"
        className="bg-zinc-800 p-3 rounded-lg"
      />

      <input
        type="text"
        placeholder="Server ID"
        className="bg-zinc-800 p-3 rounded-lg"
      />
    </div>
  </div>
);
// submit handler moved into component so we can access the form element

export default function RegisterTeam() {
  const [agree, setAgree] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    try {
      const res = await fetch('/register', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Network response was not ok');

      alert('Registration Submitted Successfully!');
      form.reset();
      setAgree(false);

    } catch (error) {
      console.error(error);
      alert('Registration Failed');
    }
  };

  return (
    <div className="bg-black min-h-screen text-white">

      <div className="max-w-6xl mx-auto px-6 py-12">

        <h1 className="text-5xl font-black text-center mb-3">
          MLBB Tournament Registration
        </h1>

        <p className="text-center text-gray-400 mb-12">
          Monarchy Esports Official Registration Form
        </p>

        <form className="space-y-8" onSubmit={handleSubmit}>

          {/* Team Information */}

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

            <h2 className="text-3xl font-bold text-blue-500 mb-6">
              Team Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              <input
                type="text"
                placeholder="Team Name"
                className="bg-zinc-800 p-3 rounded-lg"
              />

              <input
                type="file"
                placeholder="Team Logo"
                className="bg-zinc-800 p-3 rounded-lg"
              />

            </div>

          </div>

          {/* Captain */}

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

            <h2 className="text-3xl font-bold text-blue-500 mb-6">
              Captain Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              <input
                type="text"
                placeholder="Captain Name"
                className="bg-zinc-800 p-3 rounded-lg"
              />

              <input
                type="email"
                placeholder="Captain Email"
                className="bg-zinc-800 p-3 rounded-lg"
              />

              <input
                type="text"
                placeholder="Captain Phone"
                className="bg-zinc-800 p-3 rounded-lg"
              />

              <input
                type="text"
                placeholder="Discord Username"
                className="bg-zinc-800 p-3 rounded-lg"
              />

            </div>

          </div>

          {/* Main Players */}

          <h2 className="text-4xl font-bold text-center text-blue-500">
            Main Roster
          </h2>

          <PlayerSection title="Player 1 (Captain)" />
          <PlayerSection title="Player 2" />
          <PlayerSection title="Player 3" />
          <PlayerSection title="Player 4" />
          <PlayerSection title="Player 5" />

          {/* Subs */}

          <h2 className="text-4xl font-bold text-center text-blue-500">
            Substitute Players
          </h2>

          <PlayerSection title="Substitute 1" />
          <PlayerSection title="Substitute 2" />

          {/* Verification */}

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

            <h2 className="text-3xl font-bold text-blue-500 mb-6">
              Verification
            </h2>

            <label className="block mb-3 text-gray-300">
              Team Lobby Screenshot
            </label>

            <input
              type="file"
              className="bg-zinc-800 p-3 rounded-lg w-full"
            />

            <div className="mt-6 flex items-center gap-3">

              <input
                type="checkbox"
                checked={agree}
                onChange={() =>
                  setAgree(!agree)
                }
              />

              <label>
                I agree to the Monarchy Esports
                tournament rules and confirm
                all submitted information is correct.
              </label>

            </div>

          </div>

          {/* Submit */}

          <div className="text-center">

            <button
              type="submit"
              disabled={!agree}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 px-10 py-4 rounded-xl text-xl font-bold transition"
            >
              Submit Registration
            </button>

          </div>

        </form>
        

      </div>

    </div>
  );
}