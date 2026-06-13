import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

export default function RoundRobinAdmin() {
  const { tournamentId } = useParams();

  const [tournament, setTournament] = useState(null);
  const [approvedTeams, setApprovedTeams] = useState([]);
  const [groups, setGroups] = useState([]);

  const [groupName, setGroupName] = useState("");
  const [selectedTeams, setSelectedTeams] = useState({});

  // FIX: loadData must be outside useEffect
  const loadData = useCallback(async () => {
    try {
      const tournamentResponse = await api.get(
        `/tournaments/${tournamentId}`
      );
      setTournament(tournamentResponse.data);

      const teamsResponse = await api.get(
        `/tournaments/${tournamentId}/approved-teams`
      );
      setApprovedTeams(teamsResponse.data || []);

      const groupsResponse = await api.get(
        `/tournaments/${tournamentId}/round-robin-groups`
      );
      setGroups(groupsResponse.data || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load round robin data");
    }
  }, [tournamentId]);

  useEffect(() => {
    const fetchData = async () => {
        await loadData();
    };

    fetchData();
    }, [loadData]);

  const createGroup = async () => {
    if (!groupName.trim()) {
      alert("Enter group name");
      return;
    }

    try {
      await api.post(
        `/tournaments/${tournamentId}/round-robin-groups`,
        {
          group_name: groupName.trim(),
        }
      );

      alert("Group Created Successfully");
      setGroupName("");
      loadData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Failed to create group");
    }
  };

  const deleteGroup = async (groupId) => {
    const confirmDelete = window.confirm(
      "Delete this group? All teams in this group will be removed."
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/round-robin-groups/${groupId}`);

      alert("Group Deleted Successfully");
      loadData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Failed to delete group");
    }
  };

  const addTeamToGroup = async (groupId) => {
    const registrationId = selectedTeams[groupId];

    if (!registrationId) {
      alert("Select a team");
      return;
    }

    try {
      await api.post(`/round-robin-groups/${groupId}/teams`, {
        registration_id: Number(registrationId),
      });

      alert("Team Added Successfully");

      setSelectedTeams((prev) => ({
        ...prev,
        [groupId]: "",
      }));

      loadData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Failed to add team");
    }
  };

  const updateLocalTeam = (groupId, teamId, field, value) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id !== groupId) return group;

        return {
          ...group,
          teams: (group.teams || []).map((team) => {
            if (team.id !== teamId) return team;

            return {
              ...team,
              [field]: value === "" ? "" : Number(value),
            };
          }),
        };
      })
    );
  };

  const saveTeamStats = async (team) => {
    try {
      await api.put(`/round-robin-group-teams/${team.id}`, {
        full_matches: Number(team.full_matches || 0),
        played: Number(team.played || 0),
        won: Number(team.won || 0),
        lost: Number(team.lost || 0),
        bp: Number(team.bp || 0),
        points: Number(team.points || 0),
      });

      alert("Stats Updated Successfully");
      loadData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Failed to update stats");
    }
  };

  const removeTeam = async (teamId) => {
    const confirmDelete = window.confirm("Remove this team from group?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/round-robin-group-teams/${teamId}`);

      alert("Team Removed Successfully");
      loadData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Failed to remove team");
    }
  };

  return (
    <div className="p-8 text-white">
      <div className="mb-8">
        <Link
          to={`/admin/matches/${tournamentId}`}
          className="text-blue-400 hover:underline"
        >
          ← Back to Matches
        </Link>

        <h1 className="text-4xl font-bold mt-4">
          Round Robin Groups
        </h1>

        <p className="text-gray-400 mt-2">
          {tournament?.title || "Loading tournament..."}
        </p>

        <p className="text-blue-400 mt-1">
          Format: {tournament?.tournament_format || "Bracket Only"}
        </p>
      </div>

      {/* CREATE GROUP */}
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Create Group
        </h2>

        <div className="flex gap-4">
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="bg-zinc-800 p-3 rounded-lg w-full outline-none"
            placeholder="Group A"
          />

          <button
            onClick={createGroup}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold"
          >
            Create
          </button>
        </div>
      </div>

      {/* GROUPS */}
      {groups.length === 0 ? (
        <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800">
          <p className="text-gray-400">
            No groups created yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => {
            const teams = group.teams || [];

            return (
              <div
                key={group.id}
                className="bg-zinc-900 p-6 rounded-xl border border-zinc-800"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {group.group_name}
                  </h2>

                  <button
                    onClick={() => deleteGroup(group.id)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                  >
                    Delete Group
                  </button>
                </div>

                {/* ADD TEAM */}
                <div className="flex gap-4 mb-6">
                  <select
                    value={selectedTeams[group.id] || ""}
                    onChange={(e) =>
                      setSelectedTeams((prev) => ({
                        ...prev,
                        [group.id]: e.target.value,
                      }))
                    }
                    className="bg-zinc-800 p-3 rounded-lg w-full outline-none"
                  >
                    <option value="">Select Approved Team</option>

                    {approvedTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.team_name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => addTeamToGroup(group.id)}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
                  >
                    Add Team
                  </button>
                </div>

                {/* TABLE */}
                {teams.length === 0 ? (
                  <p className="text-gray-400">
                    No teams added to this group.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                      <thead>
                        <tr className="border-b border-zinc-700 text-gray-400">
                          <th className="text-left py-3 px-3">Team</th>
                          <th className="text-left py-3 px-3">Full Matches</th>
                          <th className="text-left py-3 px-3">Played</th>
                          <th className="text-left py-3 px-3">Won</th>
                          <th className="text-left py-3 px-3">Lost</th>
                          <th className="text-left py-3 px-3">BP</th>
                          <th className="text-left py-3 px-3">Points</th>
                          <th className="text-left py-3 px-3">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {teams.map((team) => (
                          <tr
                            key={team.id}
                            className="border-b border-zinc-800"
                          >
                            <td className="py-4 px-3 font-bold">
                              {team.team_name}
                            </td>

                            <td className="py-4 px-3">
                              <input
                                type="number"
                                value={team.full_matches ?? 0}
                                onChange={(e) =>
                                  updateLocalTeam(
                                    group.id,
                                    team.id,
                                    "full_matches",
                                    e.target.value
                                  )
                                }
                                className="bg-zinc-800 p-2 rounded-lg w-20 outline-none"
                              />
                            </td>

                            <td className="py-4 px-3">
                              <input
                                type="number"
                                value={team.played ?? 0}
                                onChange={(e) =>
                                  updateLocalTeam(
                                    group.id,
                                    team.id,
                                    "played",
                                    e.target.value
                                  )
                                }
                                className="bg-zinc-800 p-2 rounded-lg w-20 outline-none"
                              />
                            </td>

                            <td className="py-4 px-3">
                              <input
                                type="number"
                                value={team.won ?? 0}
                                onChange={(e) =>
                                  updateLocalTeam(
                                    group.id,
                                    team.id,
                                    "won",
                                    e.target.value
                                  )
                                }
                                className="bg-zinc-800 p-2 rounded-lg w-20 outline-none"
                              />
                            </td>

                            <td className="py-4 px-3">
                              <input
                                type="number"
                                value={team.lost ?? 0}
                                onChange={(e) =>
                                  updateLocalTeam(
                                    group.id,
                                    team.id,
                                    "lost",
                                    e.target.value
                                  )
                                }
                                className="bg-zinc-800 p-2 rounded-lg w-20 outline-none"
                              />
                            </td>

                            <td className="py-4 px-3">
                              <input
                                type="number"
                                value={team.bp ?? 0}
                                onChange={(e) =>
                                  updateLocalTeam(
                                    group.id,
                                    team.id,
                                    "bp",
                                    e.target.value
                                  )
                                }
                                className="bg-zinc-800 p-2 rounded-lg w-20 outline-none"
                              />
                            </td>

                            <td className="py-4 px-3">
                              <input
                                type="number"
                                value={team.points ?? 0}
                                onChange={(e) =>
                                  updateLocalTeam(
                                    group.id,
                                    team.id,
                                    "points",
                                    e.target.value
                                  )
                                }
                                className="bg-zinc-800 p-2 rounded-lg w-20 outline-none"
                              />
                            </td>

                            <td className="py-4 px-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveTeamStats(team)}
                                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
                                >
                                  Save
                                </button>

                                <button
                                  onClick={() => removeTeam(team.id)}
                                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                                >
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}