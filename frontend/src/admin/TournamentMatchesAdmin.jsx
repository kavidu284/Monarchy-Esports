import { useState, useEffect } from "react";
import { useParams , Link } from "react-router-dom";
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
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, [tournamentId]);

  const resolveParticipant = (participant, depth = 0) => {
    if (!participant) return "-";

    const text = String(participant).trim();

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
    if (
      !matchNo ||
      !team1 ||
      !team2 ||
      !matchDate ||
      !matchTime
    ) {
      alert("Please fill all fields");
      return;
    }

    if (team1 === team2) {
      alert("Teams cannot be the same");
      return;
    }

    try {
      await api.post(
        `/tournaments/${tournamentId}/matches`,
        {
          match_no: Number(matchNo),
          stage: stage,
          bracket_round:
            stage === "Bracket" ? bracketRound : "Round Robin",
          team1: team1,
          team2: team2,
          match_date: matchDate,
          match_time: matchTime,
        }
      );

      alert("Match Created Successfully");

      setMatchNo("");
      setTeam1("");
      setTeam2("");
      setStage("Bracket");
      setBracketRound("Round 1");
      setMatchDate("");
      setMatchTime("");

      fetchMatches();
    } catch (error) {
      console.error(error);
      alert("Failed to create match");
    }
  };

  const handleUpdateWinner = async (matchId, winner) => {
    if (!winner) return;

    try {
      await api.put(
        `/matches/${matchId}/winner`,
        {
          winner: winner,
        }
      );

      fetchMatches();
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

  // If backend sends MySQL TIME as seconds: 85020
  if (/^\d+$/.test(value)) {
    const totalSeconds = Number(value);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  // If backend sends full datetime
  if (value.includes("T")) {
    return value.slice(11, 16);
  }

  // If backend sends normal time: 20:30:00
  return value.slice(0, 5);
};
const isFutureParticipant = (participant) => {
  if (!participant) return false;

  return /^(Winner|Loser)\s+of\s+Match\s+(\d+)$/i.test(
    String(participant).trim()
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

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Manage Matches
      </h1>

      <p className="text-gray-400 mb-6">
        Create and manage matches for the tournament.
      </p>

      <h1 className="text-4xl font-bold mb-2">
        {tournament?.title || tournament?.tournament_name}
      </h1>

      <div className="flex items-center justify-between mb-8">

  <p className="text-blue-400">
    Format: {tournament?.tournament_format || "Bracket Only"}
  </p>

  {tournament?.tournament_format === "Round Robin + Bracket" && (
    <Link
      to={`/admin/tournament/${tournamentId}/matches/round-robin`}
      className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg font-semibold"
    >
      Manage Round Robin Groups
    </Link>
  )}

</div>

      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 mb-8">
        <h2 className="text-2xl font-bold mb-6">
          Create Match
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-3 px-2">
                  Match No
                </th>

                <th className="text-left py-3 px-2">
                  Stage
                </th>

                <th className="text-left py-3 px-2">
                  Bracket Round
                </th>

                <th className="text-left py-3 px-2">
                  Team 1
                </th>

                <th className="text-left py-3 px-2">
                  Team 2
                </th>

                <th className="text-left py-3 px-2">
                  Date
                </th>

                <th className="text-left py-3 px-2">
                  Time
                </th>

                <th className="text-left py-3 px-2">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="py-3 px-2">
                  <input
                    type="number"
                    min="1"
                    value={matchNo}
                    onChange={(e) => setMatchNo(e.target.value)}
                    className="bg-zinc-800 p-2 rounded-lg w-full"
                    placeholder={`${matches.length + 1}`}
                  />
                </td>

                <td className="py-3 px-2">
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="bg-zinc-800 p-2 rounded-lg w-full"
                  >
                    <option value="Bracket">
                      Bracket
                    </option>

                    <option value="Round Robin">
                      Round Robin
                    </option>
                  </select>
                </td>

                <td className="py-3 px-2">
                  <select
                    value={bracketRound}
                    onChange={(e) =>
                      setBracketRound(e.target.value)
                    }
                    disabled={stage === "Round Robin"}
                    className="bg-zinc-800 p-2 rounded-lg w-full disabled:opacity-50"
                  >
                    {bracketRoundOptions.map((round) => (
                      <option key={round} value={round}>
                        {round}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="py-3 px-2">
                  <input
                    list="teamOptions"
                    value={team1}
                    onChange={(e) => setTeam1(e.target.value)}
                    className="bg-zinc-800 p-2 rounded-lg w-full"
                    placeholder="Team name / Winner of Match 1"
                  />
                </td>

                <td className="py-3 px-2">
                  <input
                    list="teamOptions"
                    value={team2}
                    onChange={(e) => setTeam2(e.target.value)}
                    className="bg-zinc-800 p-2 rounded-lg w-full"
                    placeholder="Team name / Loser of Match 3"
                  />
                </td>

                <td className="py-3 px-2">
                  <input
                    type="date"
                    value={matchDate}
                    onChange={(e) =>
                      setMatchDate(e.target.value)
                    }
                    className="bg-zinc-800 p-2 rounded-lg w-full"
                  />
                </td>

                <td className="py-3 px-2">
                  <input
                    type="time"
                    value={matchTime}
                    onChange={(e) =>
                      setMatchTime(e.target.value)
                    }
                    className="bg-zinc-800 p-2 rounded-lg w-full"
                  />
                </td>

                <td className="py-3 px-2">
                  <button
                    type="button"
                    onClick={handleCreateMatch}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
                  >
                    Create
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <datalist id="teamOptions">
          {teams.map((team) => (
            <option key={team.id} value={team.team_name} />
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

      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
        <h2 className="text-2xl font-bold mb-6">
          Match Schedule
        </h2>

        {matches.length === 0 ? (
          <p className="text-gray-400">
            No matches created yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-2">
                    Match No
                  </th>

                  <th className="text-left py-3 px-2">
                    Stage
                  </th>

                  <th className="text-left py-3 px-2">
                    Bracket Round
                  </th>

                  <th className="text-left py-3 px-2">
                    Team 1
                  </th>

                  <th className="text-left py-3 px-2">
                    Team 2
                  </th>

                  <th className="text-left py-3 px-2">
                    Date
                  </th>

                  <th className="text-left py-3 px-2">
                    Time
                  </th>

                  <th className="text-left py-3 px-2">
                    Result
                  </th>

                  <th className="text-left py-3 px-2">
                    Select Winner
                  </th>
                  <th className="text-left py-3 px-2">
                Action
                </th>
                </tr>
              </thead>

              <tbody>
                {matches.map((match, index) => (
                  <tr
                    key={match.id}
                    className="border-b border-zinc-800"
                  >
                    <td className="py-4 px-2">
                      {match.match_no || index + 1}
                    </td>

                    <td className="py-4 px-2">
                      {match.stage || "Bracket"}
                    </td>

                    <td className="py-4 px-2">
                      {match.stage === "Round Robin"
                        ? "-"
                        : match.bracket_round || "-"}
                    </td>

                    <td className="py-4 px-2">
                      {getTeam1(match)}
                    </td>

                    <td className="py-4 px-2">
                      {getTeam2(match)}
                    </td>

                    <td className="py-4 px-2">
                      {formatDate(match.match_date)}
                    </td>

                    <td className="py-4 px-2">
                      {formatTime(match.match_time)}
                    </td>

                    <td className="py-4 px-2">
                      {match.winner ? (
                        <span className="text-green-500 font-bold">
                          {match.winner} won
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Not played
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-2">
                     {canUpdateWinner(match) ? (
                        <select
                            onChange={(e) =>
                            handleUpdateWinner(
                                match.id,
                                e.target.value
                            )
                            }
                            className="bg-zinc-800 p-2 rounded-lg"
                            value={match.winner || ""}
                        >
                            <option value="">
                            Select Winner
                            </option>

                            <option value={getTeam1(match)}>
                            {getTeam1(match)}
                            </option>

                            <option value={getTeam2(match)}>
                            {getTeam2(match)}
                            </option>
                        </select>
                        ) : (
                        <span className="text-yellow-400 text-sm">
                            Waiting source match
                        </span> 
                    )}
                    </td>
                    <td className="py-4 px-2">
                      <button
                        onClick={() => handleDeleteMatch(match.id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
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