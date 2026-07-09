import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

export default function MatchAdmin() {
  const { tournamentId } = useParams();

  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);

  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");

  const [matchNo, setMatchNo] = useState("");
  const [stage, setStage] = useState("Bracket");
  const [bracketRound, setBracketRound] = useState("Round 1");

  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("");

  const [roundRobinGroups, setRoundRobinGroups] = useState([]);
  const [qualifiedPerGroup, setQualifiedPerGroup] = useState(2);

  const bracketRoundOptions = [
    "Round 1",
    "Round 2",
    "Quarter Final",
    "Semi Final",
    "Final",
    "Grand Final",
    "Upper Bracket Round 1",
    "Upper Bracket Round 2",
    "Upper Bracket Semi Final",
    "Upper Bracket Final",
    "Lower Bracket Round 1",
    "Lower Bracket Round 2",
    "Lower Bracket Semi Final",
    "Lower Bracket Final",
  ];

  const fetchRoundRobinGroups = async () => {
    try {
      const response = await api.get(
        `/tournaments/${tournamentId}/round-robin-groups`
      );

      setRoundRobinGroups(response.data || []);
    } catch (error) {
      console.error(error);
      setRoundRobinGroups([]);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await api.get(
        `/tournaments/${tournamentId}/matches`
      );

      const sortedMatches = [...response.data].sort(
        (a, b) => Number(a.match_no || 0) - Number(b.match_no || 0)
      );

      setMatches(sortedMatches);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteMatch = async (matchId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this match?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/matches/${matchId}`);

      alert("Match Deleted Successfully");

      fetchMatches();
    } catch (error) {
      console.error(error);
      alert("Failed to delete match");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const tournamentResponse = await api.get(
          `/tournaments/${tournamentId}`
        );
        setTournament(tournamentResponse.data);

        const teamsResponse = await api.get(
          `/tournaments/${tournamentId}/approved-teams`
        );
        setTeams(teamsResponse.data);

        const matchesResponse = await api.get(
          `/tournaments/${tournamentId}/matches`
        );

        const sortedMatches = [...matchesResponse.data].sort(
          (a, b) => Number(a.match_no || 0) - Number(b.match_no || 0)
        );

        setMatches(sortedMatches);

        const groupsResponse = await api.get(
          `/tournaments/${tournamentId}/round-robin-groups`
        );
        setRoundRobinGroups(groupsResponse.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, [tournamentId]);

  const getGroupCode = (groupName) => {
    const text = String(groupName || "").trim();

    return text
      .replace(/^group\s+/i, "")
      .trim();
  };

  const roundRobinSeedOptions = roundRobinGroups.flatMap((group) =>
    Array.from(
      { length: Number(qualifiedPerGroup) },
      (_, index) => {
        const rank = index + 1;
        const groupCode = getGroupCode(group.group_name);
        const value = `${groupCode}${rank}`;

        return {
          value,
          label: value,
          groupName: group.group_name,
          rank,
        };
      }
    )
  );

  const isRoundRobinSeedParticipant = (participant) => {
    if (!participant) return false;

    const text = String(participant).trim();

    const found = text.match(/^([A-Za-z0-9]+)(\d+)$/);

    if (!found) return false;

    const groupCode = found[1];

    return roundRobinGroups.some((group) => {
      const currentGroupCode = getGroupCode(group.group_name);

      return (
        String(currentGroupCode).toLowerCase() ===
        String(groupCode).toLowerCase()
      );
    });
  };

  const resolveRoundRobinSeed = (participant) => {
    if (!participant) return null;

    const text = String(participant).trim();

    const found = text.match(/^([A-Za-z0-9]+)(\d+)$/);

    if (!found) return null;

    const groupCode = found[1];
    const rank = Number(found[2]);

    const group = roundRobinGroups.find((item) => {
      const currentGroupCode = getGroupCode(item.group_name);

      return (
        String(currentGroupCode).toLowerCase() ===
        String(groupCode).toLowerCase()
      );
    });

    if (!group || !Array.isArray(group.teams)) return null;

    const sortedTeams = [...group.teams].sort((a, b) => {
      return (
        Number(b.points || 0) - Number(a.points || 0) ||
        Number(b.bp || 0) - Number(a.bp || 0) ||
        Number(b.won || 0) - Number(a.won || 0)
      );
    });

    return sortedTeams[rank - 1]?.team_name || null;
  };

  const resolveParticipant = (participant, depth = 0) => {
    if (!participant) return "-";

    const text = String(participant).trim();

    const roundRobinSeed = resolveRoundRobinSeed(text);

    if (roundRobinSeed) {
      return roundRobinSeed;
    }

    if (depth > 10) {
      return text;
    }

    const pattern = /^(Winner|Loser)\s+of\s+Match\s+(\d+)$/i;
    const found = text.match(pattern);

    if (!found) {
      return text;
    }

    const type = found[1].toLowerCase();
    const sourceMatchNo = Number(found[2]);

    const sourceMatch = matches.find(
      (match) => Number(match.match_no) === sourceMatchNo
    );

    if (!sourceMatch || !sourceMatch.winner) {
      return text;
    }

    const sourceTeam1 = resolveParticipant(sourceMatch.team1, depth + 1);
    const sourceTeam2 = resolveParticipant(sourceMatch.team2, depth + 1);

    if (type === "winner") {
      return sourceMatch.winner;
    }

    if (sourceMatch.winner === sourceTeam1) {
      return sourceTeam2;
    }

    if (sourceMatch.winner === sourceTeam2) {
      return sourceTeam1;
    }

    return text;
  };

  const getTeam1 = (match) => {
    return resolveParticipant(match.team1);
  };

  const getTeam2 = (match) => {
    return resolveParticipant(match.team2);
  };

  const handleCreateMatch = async () => {
    if (!matchNo || !team1 || !team2 || !matchDate || !matchTime) {
      alert("Please fill all fields");
      return;
    }

    if (team1 === team2) {
      alert("Teams cannot be the same");
      return;
    }

    try {
      await api.post(`/tournaments/${tournamentId}/matches`, {
        match_no: Number(matchNo),
        stage: stage,
        bracket_round:
          stage === "Bracket" ? bracketRound : "Round Robin",
        team1: team1,
        team2: team2,
        match_date: matchDate,
        match_time: matchTime,
      });

      alert("Match Created Successfully");

      setMatchNo("");
      setTeam1("");
      setTeam2("");
      setStage("Bracket");
      setBracketRound("Round 1");
      setMatchDate("");
      setMatchTime("");

      fetchMatches();
      fetchRoundRobinGroups();
    } catch (error) {
      console.error(error);
      alert("Failed to create match");
    }
  };

  const handleUpdateWinner = async (matchId, winner) => {
    if (!winner) return;

    try {
      await api.put(`/matches/${matchId}/winner`, {
        winner: winner,
      });

      fetchMatches();
      fetchRoundRobinGroups();
    } catch (error) {
      console.error(error);
      alert("Failed to update winner");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return String(date).slice(0, 10);
  };

  const formatTime = (time) => {
    if (!time) return "-";

    const value = String(time);

    if (/^\d+$/.test(value)) {
      const totalSeconds = Number(value);

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    }

    if (value.includes("T")) {
      return value.slice(11, 16);
    }

    return value.slice(0, 5);
  };

  const isFutureParticipant = (participant) => {
    if (!participant) return false;

    const text = String(participant).trim();

    return (
      /^(Winner|Loser)\s+of\s+Match\s+(\d+)$/i.test(text) ||
      isRoundRobinSeedParticipant(text)
    );
  };

  const isParticipantReady = (participant) => {
    const resolved = resolveParticipant(participant);

    if (!isFutureParticipant(participant)) {
      return true;
    }

    return resolved !== participant;
  };

  const canUpdateWinner = (match) => {
    return (
      isParticipantReady(match.team1) &&
      isParticipantReady(match.team2)
    );
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50";

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
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Admin Panel
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Manage Matches
            </h1>

            <p className="mt-2 max-w-2xl text-gray-400">
              Create bracket matches, manage match schedule, and update
              winners for this tournament.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                {tournament?.tournament_format || "Bracket Only"}
              </span>

              <span className="rounded-full border border-zinc-700 bg-black px-3 py-1 text-xs font-bold text-gray-300">
                Tournament #{tournamentId}
              </span>

              <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                {matches.length} Matches
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={fetchRoundRobinGroups}
              className="rounded-xl border border-blue-500/40 bg-black px-6 py-3 text-center font-bold text-blue-300 transition hover:bg-blue-500/10"
            >
              Refresh Groups
            </button>

            {tournament?.tournament_format === "Round Robin + Bracket" && (
              <Link
                to={`/admin/tournament/${tournamentId}/matches/round-robin`}
                className="rounded-xl bg-blue-600 px-6 py-3 text-center font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
              >
                Manage Round Robin Groups
              </Link>
            )}
          </div>
          <Link to="/admin/tournaments">
          <button className="rounded-xl border border-zinc-700 bg-black px-6 py-3 font-bold text-white transition hover:border-blue-500 hover:bg-blue-500/10">
            ← Back
          </button>
        </Link>
        </div>
      </div>

      {/* TOURNAMENT TITLE */}
      <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30">
        <p className="text-sm text-gray-500">
          Tournament
        </p>

        <h2 className="mt-2 text-3xl font-black text-white">
          {tournament?.title || tournament?.tournament_name || "Loading..."}
        </h2>
      </div>

      {/* CREATE MATCH */}
      <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
            Match Setup
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Create Match
          </h2>

          <p className="mt-2 text-gray-400">
            For Round Robin + Bracket, use slots like A1, B2, B1, A2.
            They will auto-resolve based on group standings.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
          <p className="font-bold text-blue-300">
            Example Bracket Flow
          </p>

          <p className="mt-2 text-sm text-gray-400">
            Match 1: A1 vs B2 | Match 2: B1 vs A2 | Final:
            Winner of Match 1 vs Winner of Match 2
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-300">
              Match No
            </label>

            <input
              type="number"
              min="1"
              value={matchNo}
              onChange={(e) => setMatchNo(e.target.value)}
              className={inputClass}
              placeholder={`${matches.length + 1}`}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-300">
              Stage
            </label>

            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className={inputClass}
            >
              <option value="Bracket">Bracket</option>
              <option value="Round Robin">Round Robin</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-300">
              Qualified Slots
            </label>

            <select
              value={qualifiedPerGroup}
              onChange={(e) =>
                setQualifiedPerGroup(Number(e.target.value))
              }
              className={inputClass}
            >
              <option value={1}>Top 1 from each group</option>
              <option value={2}>Top 2 from each group</option>
              <option value={3}>Top 3 from each group</option>
              <option value={4}>Top 4 from each group</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-300">
              Bracket Round
            </label>

            <select
              value={bracketRound}
              onChange={(e) => setBracketRound(e.target.value)}
              disabled={stage === "Round Robin"}
              className={inputClass}
            >
              {bracketRoundOptions.map((round) => (
                <option key={round} value={round}>
                  {round}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-300">
              Date
            </label>

            <input
              type="date"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-300">
              Team 1
            </label>

            <input
              list="teamOptions"
              value={team1}
              onChange={(e) => setTeam1(e.target.value)}
              className={inputClass}
              placeholder="A1 / Team name / Winner of Match 1"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-300">
              Team 2
            </label>

            <input
              list="teamOptions"
              value={team2}
              onChange={(e) => setTeam2(e.target.value)}
              className={inputClass}
              placeholder="B2 / Team name / Loser of Match 3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-300">
              Time
            </label>

            <input
              type="time"
              value={matchTime}
              onChange={(e) => setMatchTime(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleCreateMatch}
              className="w-full rounded-xl bg-green-600 px-6 py-3 font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700"
            >
              Create Match
            </button>
          </div>
        </div>

        <datalist id="teamOptions">
          {teams.map((team) => (
            <option
              key={team.id}
              value={team.team_name}
            />
          ))}

          {roundRobinSeedOptions.map((option) => (
            <option
              key={`rr-slot-${option.value}`}
              value={option.value}
            />
          ))}

          {matches
            .filter((match) => match.match_no)
            .map((match) => (
              <option
                key={`winner-${match.id}`}
                value={`Winner of Match ${match.match_no}`}
              />
            ))}

          {matches
            .filter((match) => match.match_no)
            .map((match) => (
              <option
                key={`loser-${match.id}`}
                value={`Loser of Match ${match.match_no}`}
              />
            ))}
        </datalist>
      </div>

      {/* QUALIFIED SLOT PREVIEW */}
      {roundRobinSeedOptions.length > 0 && (
        <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Round Robin Qualification
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Auto Bracket Slots
            </h2>

            <p className="mt-2 text-gray-400">
              These slots can be used as Team 1 or Team 2 in bracket matches.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {roundRobinSeedOptions.map((option) => {
              const resolvedTeam = resolveRoundRobinSeed(option.value);

              return (
                <div
                  key={`preview-${option.value}`}
                  className="rounded-2xl border border-zinc-800 bg-black p-5"
                >
                  <p className="text-2xl font-black text-blue-400">
                    {option.value}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    {option.groupName} Rank #{option.rank}
                  </p>

                  <p className="mt-3 font-bold text-white">
                    {resolvedTeam || "Waiting standings"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MATCH SCHEDULE */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Schedule
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Match Schedule
            </h2>
          </div>

          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-5 py-3">
            <p className="text-sm font-bold text-blue-400">
              {matches.length} Total Matches
            </p>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-black p-12 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-4xl">
              ⚔️
            </div>

            <h3 className="text-2xl font-bold text-white">
              No Matches Created
            </h3>

            <p className="mt-3 text-gray-400">
              Create your first match using the form above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full min-w-[1200px] bg-black">
              <thead className="bg-zinc-950">
                <tr className="border-b border-zinc-800">
                  <th className={tableHeadClass}>Match No</th>
                  <th className={tableHeadClass}>Stage</th>
                  <th className={tableHeadClass}>Bracket Round</th>
                  <th className={tableHeadClass}>Team 1</th>
                  <th className={tableHeadClass}>Team 2</th>
                  <th className={tableHeadClass}>Date</th>
                  <th className={tableHeadClass}>Time</th>
                  <th className={tableHeadClass}>Result</th>
                  <th className={tableHeadClass}>Select Winner</th>
                  <th className={tableHeadClass}>Action</th>
                </tr>
              </thead>

              <tbody>
                {matches.map((match, index) => (
                  <tr
                    key={match.id}
                    className="border-b border-zinc-800 transition hover:bg-blue-500/5"
                  >
                    <td className={tableCellClass}>
                      <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 font-bold text-blue-300">
                        #{match.match_no || index + 1}
                      </span>
                    </td>

                    <td className={tableCellClass}>
                      {match.stage || "Bracket"}
                    </td>

                    <td className={tableCellClass}>
                      {match.stage === "Round Robin"
                        ? "-"
                        : match.bracket_round || "-"}
                    </td>

                    <td className={tableCellClass}>
                      <div>
                        <span className="font-bold text-white">
                          {getTeam1(match)}
                        </span>

                        {isFutureParticipant(match.team1) &&
                          getTeam1(match) !== match.team1 && (
                            <p className="mt-1 text-xs text-blue-400">
                              Source: {match.team1}
                            </p>
                          )}
                      </div>
                    </td>

                    <td className={tableCellClass}>
                      <div>
                        <span className="font-bold text-white">
                          {getTeam2(match)}
                        </span>

                        {isFutureParticipant(match.team2) &&
                          getTeam2(match) !== match.team2 && (
                            <p className="mt-1 text-xs text-blue-400">
                              Source: {match.team2}
                            </p>
                          )}
                      </div>
                    </td>

                    <td className={tableCellClass}>
                      {formatDate(match.match_date)}
                    </td>

                    <td className={tableCellClass}>
                      {formatTime(match.match_time)}
                    </td>

                    <td className={tableCellClass}>
                      {match.winner ? (
                        <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                          {match.winner} won
                        </span>
                      ) : (
                        <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-bold text-gray-400">
                          Not played
                        </span>
                      )}
                    </td>

                    <td className={tableCellClass}>
                      {canUpdateWinner(match) ? (
                        <select
                          onChange={(e) =>
                            handleUpdateWinner(match.id, e.target.value)
                          }
                          className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-blue-500"
                          value={match.winner || ""}
                        >
                          <option value="">Select Winner</option>

                          <option value={getTeam1(match)}>
                            {getTeam1(match)}
                          </option>

                          <option value={getTeam2(match)}>
                            {getTeam2(match)}
                          </option>
                        </select>
                      ) : (
                        <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400">
                          Waiting source match
                        </span>
                      )}
                    </td>

                    <td className={tableCellClass}>
                      <button
                        onClick={() => handleDeleteMatch(match.id)}
                        className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}