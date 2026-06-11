import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function RegistrationsAdmin() {
  const [registrations, setRegistrations] = useState([]);
  const navigate = useNavigate();

  const fetchRegistrations = async () => {
    try {
      const response = await api.get("/registrationsadmin");
      setRegistrations(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchRegistrations();
    })();
  }, []);

  const approveTeam = async (id) => {
    try {
      await api.put(`/registrations/${id}/approve`);
      fetchRegistrations();
    } catch (error) {
      console.error(error);
    }
  };

  const rejectTeam = async (id) => {
    try {
      await api.put(`/registrations/${id}/reject`);
      fetchRegistrations();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Registrations
      </h1>

      <div className="space-y-4">

        {registrations.map((team) => (

          <div
            key={team.id}
            className="bg-zinc-900 p-6 rounded-xl"
          >
            <div className="flex justify-between items-center">

    <div className="flex items-center gap-4">

      <img
        src={`${api.defaults.baseURL}/${team.team_logo}`}
        alt={team.team_name}
        className="w-20 h-20 rounded-lg object-cover"
      />
      <div>
        <h2 className="text-2xl font-bold">
          {team.team_name}
        </h2>

        <p>
          Captain: {team.captain_name}
        </p>

        <p>
          Email: {team.captain_email}
        </p>

        <p>
          Status: {team.status}
        </p>
      </div>

    </div>

    <div className="flex gap-3">

      <button
        onClick={() =>
          navigate(`/admin/registrations/${team.id}`)
        }
        className="bg-blue-600 px-4 py-2 rounded-lg"
      >
        View
      </button>

      <button
        onClick={() => approveTeam(team.id)}
        className="bg-green-600 px-4 py-2 rounded-lg"
      >
        Approve
      </button>

      <button
        onClick={() => rejectTeam(team.id)}
        className="bg-red-600 px-4 py-2 rounded-lg"
      >
        Reject
      </button>

    </div>

  </div>
</div>
        ) )}

      </div>
    </div>

  );
}

