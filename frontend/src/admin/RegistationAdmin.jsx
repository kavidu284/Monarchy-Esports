import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminRegistrations() {
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await api.get("/tournaments");
        setTournaments(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTournaments();
  }, []);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Registrations
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        {tournaments.map((tournament) => (
         <div
              key={tournament.id}
              className="bg-zinc-900 p-6 rounded-xl border border-zinc-800"
            >
              <h2 className="text-2xl font-bold mb-2">
                {tournament.title}
              </h2>

              <p className="text-gray-400 mb-4">
                {tournament.game_name}
              </p>

              <span className="inline-block bg-blue-600 px-3 py-1 rounded-full text-sm mb-4">
                {tournament.status}
              </span>

              <button
                onClick={() =>
                  navigate(
                    `/admin/registrationsteam/${tournament.id}`
                  )
                }
                className="block w-full bg-blue-600 px-4 py-2 rounded-lg"
              >
                Manage Teams
              </button>
            </div>
        ))}

      </div>
    </div>
  );
}
