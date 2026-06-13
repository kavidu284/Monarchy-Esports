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

  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  const statInputClass =
    "w-20 rounded-lg border border-zinc-700 bg-black px-3 py-2 text-center text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  const tableHeadClass =
    "whitespace-nowrap px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400";

  const tableCellClass =
    "whitespace-nowrap px-4 py-4 text-sm text-gray-300";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <div className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <Link
              to={`/admin/matches/${tournamentId}`}
              className="inline-flex items-center rounded-xl border border-zinc-700 bg-black px-5 py-3 font-bold text-white transition hover:border-blue-500 hover:bg-blue-500/10"
            >
              ← Back to Matches
            </Link>

            <p className="mt-6 text-sm font-bold uppercase tracking-widest text-blue-400">
              Admin Panel
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Round Robin Groups
            </h1>

            <p className="mt-2 max-w-2xl text-gray-400">
              Create groups, add approved teams, and update round robin
              standings.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                {tournament?.title || "Loading tournament..."}
              </span>

              <span className="rounded-full border border-zinc-700 bg-black px-3 py-1 text-xs font-bold text-gray-300">
                Format: {tournament?.tournament_format || "Bracket Only"}
              </span>

              <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                {groups.length} Groups
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE GROUP */}
      <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Group Setup
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Create Group
          </h2>

          <p className="mt-2 text-gray-400">
            Create round robin groups such as Group A, Group B, Group C.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className={inputClass}
            placeholder="Group A"
          />

          <button
            onClick={createGroup}
            className="rounded-xl bg-green-600 px-8 py-3 font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700"
          >
            Create
          </button>
        </div>
      </div>

      {/* GROUPS */}
      {groups.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-xl shadow-black/30">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-4xl">
            🧩
          </div>

          <h2 className="text-3xl font-bold">
            No Groups Created
          </h2>

          <p className="mt-3 text-gray-400">
            Create your first round robin group using the form above.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => {
            const teams = group.teams || [];

            return (
              <div
                key={group.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30 transition hover:border-blue-500/40"
              >
                {/* GROUP HEADER */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                      Round Robin Group
                    </p>

                    <h2 className="mt-2 text-3xl font-black">
                      {group.group_name}
                    </h2>

                    <p className="mt-1 text-gray-400">
                      {teams.length} team(s) added
                    </p>
                  </div>

                  <button
                    onClick={() => deleteGroup(group.id)}
                    className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
                  >
                    Delete Group
                  </button>
                </div>

                {/* ADD TEAM */}
                <div className="mb-6 rounded-2xl border border-zinc-800 bg-black p-5">
                  <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <select
                      value={selectedTeams[group.id] || ""}
                      onChange={(e) =>
                        setSelectedTeams((prev) => ({
                          ...prev,
                          [group.id]: e.target.value,
                        }))
                      }
                      className={inputClass}
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
                      className="rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                    >
                      Add Team
                    </button>
                  </div>
                </div>

                {/* TABLE */}
                {teams.length === 0 ? (
                  <div className="rounded-2xl border border-zinc-800 bg-black p-8 text-center">
                    <p className="text-gray-400">
                      No teams added to this group.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-zinc-800">
                    <table className="w-full min-w-[1000px] bg-black">
                      <thead className="bg-zinc-950">
                        <tr className="border-b border-zinc-800">
                          <th className={tableHeadClass}>Team</th>
                          <th className={tableHeadClass}>Full Matches</th>
                          <th className={tableHeadClass}>Played</th>
                          <th className={tableHeadClass}>Won</th>
                          <th className={tableHeadClass}>Lost</th>
                          <th className={tableHeadClass}>BP</th>
                          <th className={tableHeadClass}>Points</th>
                          <th className={tableHeadClass}>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {teams.map((team) => (
                          <tr
                            key={team.id}
                            className="border-b border-zinc-800 transition hover:bg-blue-500/5"
                          >
                            <td className={tableCellClass}>
                              <span className="font-bold text-white">
                                {team.team_name}
                              </span>
                            </td>

                            <td className={tableCellClass}>
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
                                className={statInputClass}
                              />
                            </td>

                            <td className={tableCellClass}>
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
                                className={statInputClass}
                              />
                            </td>

                            <td className={tableCellClass}>
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
                                className={statInputClass}
                              />
                            </td>

                            <td className={tableCellClass}>
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
                                className={statInputClass}
                              />
                            </td>

                            <td className={tableCellClass}>
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
                                className={statInputClass}
                              />
                            </td>

                            <td className={tableCellClass}>
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
                                className={statInputClass}
                              />
                            </td>

                            <td className={tableCellClass}>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveTeamStats(team)}
                                  className="rounded-xl bg-green-600 px-4 py-2 font-bold text-white transition hover:bg-green-700"
                                >
                                  Save
                                </button>

                                <button
                                  onClick={() => removeTeam(team.id)}
                                  className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-700"
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