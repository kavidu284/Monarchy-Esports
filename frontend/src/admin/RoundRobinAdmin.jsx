import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

export default function RoundRobinAdmin() {
  const { tournamentId } = useParams();

  const [tournament, setTournament] = useState(null);
  const [approvedTeams, setApprovedTeams] = useState([]);
  const [groups, setGroups] = useState([]);

  const [groupName, setGroupName] = useState("");
  const [selectedTeams, setSelectedTeams] = useState({});

  // Shuffle Modal State
  const [shuffleModalOpen, setShuffleModalOpen] = useState(false);
  const [numGroups, setNumGroups] = useState(4);
  const [teamsPerGroup, setTeamsPerGroup] = useState(4);
  const [shuffledGroups, setShuffledGroups] = useState({});
  const [shuffling, setShuffling] = useState(false);

  // Toast State
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', title, message }

  // Security Re-Authentication Modal State for Deletion
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [deleteActionType, setDeleteActionType] = useState(null); // 'group' | 'team'
  const [targetId, setTargetId] = useState(null);
  const [targetName, setTargetName] = useState("");
  const [reauth, setReauth] = useState({ username: "", password: "" });
  const [reauthMessage, setReauthMessage] = useState("");
  const [verifying, setVerifying] = useState(false);

  const showToast = useCallback((type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

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
      showToast("error", "Load Failed", "Failed to load round robin data");
    }
  }, [tournamentId, showToast]);

  useEffect(() => {
    const fetchData = async () => {
      await loadData();
    };

    fetchData();
  }, [loadData]);

  const createGroup = async () => {
    if (!groupName.trim()) {
      showToast("error", "Input Missing", "Enter group name");
      return;
    }

    try {
      await api.post(
        `/tournaments/${tournamentId}/round-robin-groups`,
        {
          group_name: groupName.trim(),
        }
      );

      showToast("success", "Group Created", "Group Created Successfully");
      setGroupName("");
      loadData();
    } catch (error) {
      console.error(error);
      showToast("error", "Creation Failed", error.response?.data?.detail || "Failed to create group");
    }
  };

  // Automated Shuffle Execution
  const handlePerformShuffle = () => {
    const totalTeamsNeeded = numGroups * teamsPerGroup;
    if (approvedTeams.length < totalTeamsNeeded) {
      showToast(
        "error",
        "Insufficient Teams",
        `Need ${totalTeamsNeeded} teams (${numGroups} groups × ${teamsPerGroup} teams), but only ${approvedTeams.length} approved.`
      );
      return;
    }

    let shuffled = [...approvedTeams];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const newGroups = {};
    for (let i = 0; i < numGroups; i++) {
      const groupLetter = String.fromCharCode(65 + i);
      const groupNameKey = `Group ${groupLetter}`;
      const sliceStart = i * teamsPerGroup;
      const sliceEnd = sliceStart + teamsPerGroup;
      newGroups[groupNameKey] = shuffled.slice(sliceStart, sliceEnd);
    }

    setShuffledGroups(newGroups);
  };

  const handleSaveShuffledGroups = async () => {
    if (Object.keys(shuffledGroups).length === 0) {
      showToast("error", "Shuffle Required", "Please shuffle teams first.");
      return;
    }

    try {
      setShuffling(true);
      await api.post(`/team-shuffle/${tournamentId}/save`, {
        groups: shuffledGroups,
      });

      showToast("success", "Groups Saved", "Shuffled groups successfully saved to database!");
      setShuffleModalOpen(false);
      setShuffledGroups({});
      loadData();
    } catch (error) {
      console.error(error);
      showToast("error", "Save Failed", error.response?.data?.detail || "Failed to save shuffled groups.");
    } finally {
      setShuffling(false);
    }
  };

  // Trigger Security Modal for Deleting Group or Removing Team
  const triggerDeleteModal = (type, id, name) => {
    setDeleteActionType(type);
    setTargetId(id);
    setTargetName(name);
    setReauth({ username: "", password: "" });
    setReauthMessage("");
    setSecurityModalOpen(true);
  };

  // Execute actual API calls after re-authentication
  const executeConfirmedDelete = async () => {
    try {
      if (deleteActionType === "group") {
        await api.delete(`/round-robin-groups/${targetId}`);
        showToast("success", "Group Deleted", "Group and its teams have been removed.");
      } else if (deleteActionType === "team") {
        await api.delete(`/round-robin-group-teams/${targetId}`);
        showToast("success", "Team Removed", "Team removed from group successfully.");
      }

      setSecurityModalOpen(false);
      setTargetId(null);
      loadData();
    } catch (error) {
      console.error(error);
      showToast("error", "Action Failed", error.response?.data?.detail || "Operation failed");
    }
  };

  // Handle Re-Authentication Submit
  const handleConfirmReauth = async (e) => {
    e.preventDefault();
    if (!reauth.username.trim() || !reauth.password.trim()) {
      setReauthMessage("Username and password are required.");
      return;
    }

    try {
      setVerifying(true);
      setReauthMessage("");
      const response = await api.post("/administration/verify-credentials", {
        username: reauth.username.trim(),
        password: reauth.password.trim(),
      });

      if (response.data?.success) {
        await executeConfirmedDelete();
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setReauthMessage(
        error?.response?.data?.detail || "Invalid credentials or unauthorized action."
      );
    } finally {
      setVerifying(false);
    }
  };

  const addTeamToGroup = async (groupId) => {
    const registrationId = selectedTeams[groupId];

    if (!registrationId) {
      showToast("error", "Selection Missing", "Select a team");
      return;
    }

    try {
      await api.post(`/round-robin-groups/${groupId}/teams`, {
        registration_id: Number(registrationId),
      });

      showToast("success", "Team Added", "Team Added Successfully");

      setSelectedTeams((prev) => ({
        ...prev,
        [groupId]: "",
      }));

      loadData();
    } catch (error) {
      console.error(error);
      showToast("error", "Add Failed", error.response?.data?.detail || "Failed to add team");
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

      showToast("success", "Updated", "Stats Updated Successfully");
      loadData();
    } catch (error) {
      console.error(error);
      showToast("error", "Update Failed", error.response?.data?.detail || "Failed to update stats");
    }
  };

  const getGroupCode = (groupName) => {
    const text = String(groupName || "").trim();
    return text.replace(/^group\s+/i, "").trim();
  };

  const getSortedGroupTeams = (group) => {
    return [...(group.teams || [])].sort((a, b) => {
      return (
        Number(b.points || 0) - Number(a.points || 0) ||
        Number(b.bp || 0) - Number(a.bp || 0) ||
        Number(b.won || 0) - Number(a.won || 0)
      );
    });
  };

  const getSlotCode = (group, index) => {
    const groupCode = getGroupCode(group.group_name);
    return `${groupCode}${index + 1}`;
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
    <div className="relative min-h-screen bg-black font-sans text-white selection:bg-blue-600 selection:text-white p-4 md:p-8">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 right-6 z-[200] w-full max-w-md animate-slide-in">
          <div
            className={`flex items-start gap-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
              toast.type === "success"
                ? "border-emerald-500/40 bg-zinc-950/95 text-emerald-400"
                : "border-red-500/40 bg-zinc-950/95 text-red-400"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-current/20 bg-current/10 text-xl font-bold">
              {toast.type === "success" ? "✓" : "⚠️"}
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-sm font-bold text-white">{toast.title}</h4>
              <p className="mt-0.5 text-xs text-gray-300">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 text-gray-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* AUTOMATED SHUFFLE MODAL */}
      {shuffleModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md overflow-y-auto py-10">
          <div className="w-full max-w-4xl rounded-3xl border border-blue-500/30 bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white">Automated Team Shuffle</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Approved Teams Available: <span className="text-blue-400 font-bold">{approvedTeams.length}</span>
                </p>
              </div>
              <button
                onClick={() => setShuffleModalOpen(false)}
                className="text-gray-400 hover:text-white text-sm font-bold bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800"
              >
                ✕ Close
              </button>
            </div>

            {/* Inputs Config */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black p-5 rounded-2xl border border-zinc-800">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">Number of Groups</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={numGroups}
                  onChange={(e) => setNumGroups(parseInt(e.target.value) || 1)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">Teams Per Group</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={teamsPerGroup}
                  onChange={(e) => setTeamsPerGroup(parseInt(e.target.value) || 1)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2 pt-2">
                <button
                  onClick={handlePerformShuffle}
                  className="w-full rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
                >
                  🎲 Run Random Shuffle
                </button>
              </div>
            </div>

            {/* Preview Results Grid */}
            {Object.keys(shuffledGroups).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-400">Preview Layout</h4>
                  <button
                    onClick={handlePerformShuffle}
                    className="text-xs font-semibold text-gray-300 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg"
                  >
                    Shuffle Again
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[350px] overflow-y-auto pr-1">
                  {Object.entries(shuffledGroups).map(([gName, teamsList]) => (
                    <div key={gName} className="rounded-2xl border border-zinc-800 bg-black p-4">
                      <div className="font-bold text-blue-400 border-b border-zinc-800 pb-2 mb-3 flex justify-between items-center">
                        <span>{gName}</span>
                        <span className="text-xs bg-zinc-900 px-2 py-0.5 rounded text-gray-400">{teamsList.length}</span>
                      </div>
                      <ul className="space-y-1.5 text-xs">
                        {teamsList.map((t, idx) => (
                          <li key={t.id || idx} className="text-gray-300 truncate">
                            <span className="text-gray-500 font-mono mr-1.5">#{idx + 1}</span>
                            {t.team_name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    onClick={handleSaveShuffledGroups}
                    disabled={shuffling}
                    className="rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition disabled:opacity-50"
                  >
                    {shuffling ? "Saving to Database..." : "💾 Save Shuffled Groups"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECURITY AUTHENTICATION DELETE MODAL */}
      {securityModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-xl text-red-400">
                🔒
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Authorization Required</h3>
                <p className="text-xs text-red-400 font-semibold truncate max-w-[220px]">
                  Delete {deleteActionType}: {targetName}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              You are about to delete this item. Please enter your credentials to verify authorization.
            </p>

            <form onSubmit={handleConfirmReauth} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">Username</label>
                <input
                  type="text"
                  required
                  value={reauth.username}
                  onChange={(e) => setReauth({ ...reauth, username: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-red-500 focus:outline-none"
                  placeholder="Username"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">Password</label>
                <input
                  type="password"
                  required
                  value={reauth.password}
                  onChange={(e) => setReauth({ ...reauth, password: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-red-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              {reauthMessage && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-400">
                  ⚠️ {reauthMessage}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSecurityModalOpen(false)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-zinc-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-500 transition disabled:opacity-50"
                >
                  {verifying ? "Verifying..." : "Confirm Delete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <Link
              to={`/admin/tournament/${tournamentId}/matches`}
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
              Create groups, auto-shuffle approved teams, update standings, and generate bracket slots.
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

          {/* Quick Action: Open Shuffle Wizard */}
          <div>
            <button
              onClick={() => {
                setShuffleModalOpen(true);
                setShuffledGroups({});
              }}
              className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 font-bold text-white shadow-xl shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 transition"
            >
              🎲 Automated Team Shuffle
            </button>
          </div>
        </div>
      </div>

      {/* CREATE GROUP MANUALLY */}
      <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Manual Setup
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Create Group
          </h2>

          <p className="mt-2 text-gray-400">
            Create round robin groups individually such as Group A, Group B, Group C.
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

      {/* GROUPS LIST & TABLES */}
      {groups.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-xl shadow-black/30">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-4xl">
            🧩
          </div>

          <h2 className="text-3xl font-bold">
            No Groups Created
          </h2>

          <p className="mt-3 text-gray-400">
            Create your first group manually or use the Automated Team Shuffle button above.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => {
            const teams = group.teams || [];
            const sortedTeams = getSortedGroupTeams(group);

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
                    onClick={() => triggerDeleteModal("group", group.id, group.group_name)}
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
                    <table className="w-full min-w-[1150px] bg-black">
                      <thead className="bg-zinc-950">
                        <tr className="border-b border-zinc-800">
                          <th className={tableHeadClass}>Rank</th>
                          <th className={tableHeadClass}>Bracket Slot</th>
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
                        {sortedTeams.map((team, index) => (
                          <tr
                            key={team.id}
                            className="border-b border-zinc-800 transition hover:bg-blue-500/5"
                          >
                            <td className={tableCellClass}>
                              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 font-bold text-blue-300">
                                #{index + 1}
                              </span>
                            </td>

                            <td className={tableCellClass}>
                              <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 font-bold text-green-400">
                                {getSlotCode(group, index)}
                              </span>
                            </td>

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
                                  onClick={() => triggerDeleteModal("team", team.id, team.team_name)}
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