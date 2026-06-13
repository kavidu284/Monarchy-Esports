import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function TournamentView() {
  const { id } = useParams();

  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [roundRobinGroups, setRoundRobinGroups] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const tournamentResponse = await api.get(`/tournaments/${id}`);
        setTournament(tournamentResponse.data);

        const teamsResponse = await api.get(
          `/tournaments/${id}/approved-teams`
        );
        setTeams(teamsResponse.data);

        const matchesResponse = await api.get(
          `/tournaments/${id}/matches`
        );

        const sortedMatches = [...matchesResponse.data].sort(
          (a, b) => Number(a.match_no || 0) - Number(b.match_no || 0)
        );
        const groupsResponse = await api.get(
          `/tournaments/${id}/round-robin-groups`
        );

        setRoundRobinGroups(groupsResponse.data);
        setMatches(sortedMatches);
      } catch (error) {
        console.error(error);
      }
    }

    loadData();
  }, [id]);

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

      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }

    if (value.includes("T")) {
      return value.slice(11, 16);
    }

    return value.slice(0, 5);
  };

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

  const isFutureParticipant = (participant) => {
    if (!participant) return false;

    return /^(Winner|Loser)\s+of\s+Match\s+(\d+)$/i.test(
      String(participant).trim()
    );
  };

  const tournamentFormat =
    tournament?.tournament_format || "Bracket Only";

  const bracketMatches = matches.filter(
    (match) => (match.stage || "Bracket") === "Bracket"
  );

  const groupedRounds = bracketMatches.reduce((groups, match) => {
    const round = match.bracket_round || "Round 1";

    if (!groups[round]) {
      groups[round] = [];
    }

    groups[round].push(match);

    return groups;
  }, {});

  const roundOrder = [
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

  const orderedRounds = [
    ...roundOrder.filter((round) => groupedRounds[round]),
    ...Object.keys(groupedRounds).filter(
      (round) => !roundOrder.includes(round)
    ),
  ];

  const getSortedMatches = (roundName) => {
    return [...(groupedRounds[roundName] || [])].sort(
      (a, b) => Number(a.match_no || 0) - Number(b.match_no || 0)
    );
  };

  const upperRounds = orderedRounds.filter(
    (round) =>
      round.includes("Upper") ||
      round === "Round 1" ||
      round === "Round 2" ||
      round === "Quarter Final" ||
      round === "Semi Final"
  );

  const lowerRounds = orderedRounds.filter((round) =>
    round.includes("Lower")
  );

  const finalRounds = orderedRounds.filter(
    (round) =>
      !round.includes("Upper") &&
      !round.includes("Lower") &&
      (round === "Final" ||
        round === "Grand Final" ||
        round.includes("Grand"))
  );

  const extractSourceMatchNos = (match) => {
    const sources = [];

    [match.team1, match.team2].forEach((participant) => {
      if (!participant) return;

      const found = String(participant)
        .trim()
        .match(/^(Winner|Loser)\s+of\s+Match\s+(\d+)$/i);

      if (found) {
        sources.push(Number(found[2]));
      }
    });

    return sources;
  };

  const renderBracketMatchCard = (match) => {
    const teamOne = getTeam1(match);
    const teamTwo = getTeam2(match);

    const rawTeamOne = match.team1;
    const rawTeamTwo = match.team2;

    const teamOneIsWinner =
      match.winner && match.winner === teamOne;

    const teamTwoIsWinner =
      match.winner && match.winner === teamTwo;

    return (
      <div className="w-[310px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-black px-4 py-3">
          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
            Match {match.match_no || "-"}
          </span>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold ${
              match.winner
                ? "border-green-500/40 bg-green-500/10 text-green-400"
                : "border-zinc-700 bg-zinc-900 text-gray-400"
            }`}
          >
            {match.winner ? "Completed" : "Pending"}
          </span>
        </div>

        <div
          className={`border-b border-zinc-800 px-4 py-4 transition ${
            teamOneIsWinner
              ? "bg-green-600 text-white"
              : "bg-zinc-950 text-gray-300"
          }`}
        >
          <p className="truncate font-black">
            {teamOne}
          </p>

          {isFutureParticipant(rawTeamOne) &&
            rawTeamOne !== teamOne && (
              <p className="mt-1 text-xs text-gray-300">
                {rawTeamOne}
              </p>
            )}
        </div>

        <div
          className={`px-4 py-4 transition ${
            teamTwoIsWinner
              ? "bg-green-600 text-white"
              : "bg-zinc-950 text-gray-300"
          }`}
        >
          <p className="truncate font-black">
            {teamTwo}
          </p>

          {isFutureParticipant(rawTeamTwo) &&
            rawTeamTwo !== teamTwo && (
              <p className="mt-1 text-xs text-gray-300">
                {rawTeamTwo}
              </p>
            )}
        </div>

        <div className="border-t border-zinc-800 bg-black px-4 py-3">
          <p className="text-sm text-gray-400">
            Winner:{" "}
            {match.winner ? (
              <span className="font-bold text-green-400">
                {match.winner}
              </span>
            ) : (
              <span className="text-gray-500">
                Pending
              </span>
            )}
          </p>
        </div>
      </div>
    );
  };

  const renderConnectedBracketBoard = (
    title,
    titleColor,
    roundTitleColor,
    rounds
  ) => {
    const CARD_WIDTH = 310;
    const CARD_HEIGHT = 190;
    const COLUMN_GAP = 140;
    const ROW_GAP = 48;
    const HEADER_OFFSET = 70;

    const markerId = `arrow-${title
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

    const roundData = rounds.map((roundName) => ({
      roundName,
      matches: getSortedMatches(roundName),
    }));

    const nodes = {};
    const columns = [];

    roundData.forEach((round, roundIndex) => {
      const x = roundIndex * (CARD_WIDTH + COLUMN_GAP);
      const columnNodes = [];

      round.matches.forEach((match, matchIndex) => {
        const sourceNos = extractSourceMatchNos(match);

        const sourceNodes = sourceNos
          .map((no) => nodes[no])
          .filter(Boolean);

        let y = matchIndex * (CARD_HEIGHT + ROW_GAP);

        if (sourceNodes.length > 0) {
          const averageSourceCenter =
            sourceNodes.reduce(
              (sum, node) => sum + node.y + CARD_HEIGHT / 2,
              0
            ) / sourceNodes.length;

          y = averageSourceCenter - CARD_HEIGHT / 2;
        }

        columnNodes.push({
          match,
          x,
          y,
        });
      });

      columnNodes
        .sort((a, b) => a.y - b.y)
        .forEach((node, index) => {
          if (index > 0) {
            const previousNode = columnNodes[index - 1];
            const minimumY =
              previousNode.y + CARD_HEIGHT + ROW_GAP;

            if (node.y < minimumY) {
              node.y = minimumY;
            }
          }

          nodes[Number(node.match.match_no)] = node;
        });

      columns.push({
        ...round,
        x,
        nodes: columnNodes,
      });
    });

    const allNodes = Object.values(nodes);

    const boardWidth =
      rounds.length * CARD_WIDTH +
      Math.max(rounds.length - 1, 0) * COLUMN_GAP +
      80;

    const boardHeight =
      allNodes.length === 0
        ? 300
        : Math.max(
            ...allNodes.map(
              (node) => node.y + CARD_HEIGHT + HEADER_OFFSET
            )
          ) + 80;

    const lines = [];

    allNodes.forEach((targetNode) => {
      const sources = extractSourceMatchNos(targetNode.match);

      sources.forEach((sourceNo) => {
        const sourceNode = nodes[sourceNo];

        if (!sourceNode) return;

        const x1 = sourceNode.x + CARD_WIDTH;
        const y1 =
          sourceNode.y + HEADER_OFFSET + CARD_HEIGHT / 2;

        const x2 = targetNode.x;
        const y2 =
          targetNode.y + HEADER_OFFSET + CARD_HEIGHT / 2;

        const midX = x1 + (x2 - x1) / 2;

        lines.push({
          key: `${sourceNo}-${targetNode.match.id}`,
          path: `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`,
        });
      });
    });

    return (
      <div>
        <h3 className={`mb-8 text-3xl font-black ${titleColor}`}>
          {title}
        </h3>

        {rounds.length === 0 ? (
          <p className="text-gray-400">
            No matches available.
          </p>
        ) : (
          <div
            className="relative rounded-3xl border border-zinc-800 bg-black/60 p-6"
            style={{
              width: `${boardWidth}px`,
              height: `${boardHeight}px`,
            }}
          >
            <svg
              className="pointer-events-none absolute inset-0 z-0"
              width={boardWidth}
              height={boardHeight}
            >
              <defs>
                <marker
                  id={markerId}
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path
                    d="M0,0 L0,6 L9,3 z"
                    fill="#3b82f6"
                  />
                </marker>
              </defs>

              {lines.map((line) => (
                <path
                  key={line.key}
                  d={line.path}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd={`url(#${markerId})`}
                />
              ))}
            </svg>

            {columns.map((column) => (
              <h4
                key={column.roundName}
                className={`absolute rounded-full border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-black ${roundTitleColor}`}
                style={{
                  left: `${column.x}px`,
                  top: "0px",
                }}
              >
                {column.roundName}
              </h4>
            ))}

            {columns.map((column) =>
              column.nodes.map((node) => (
                <div
                  key={node.match.id}
                  className="absolute z-10"
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y + HEADER_OFFSET}px`,
                  }}
                >
                  {renderBracketMatchCard(node.match)}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  if (!tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 px-10 py-8 text-center shadow-xl shadow-blue-600/10">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
          <p className="font-semibold text-gray-300">
            Loading tournament...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* BANNER */}
      <div className="relative h-[420px] overflow-hidden border-b border-zinc-900 bg-zinc-950">
        {tournament.banner_image && (
          <img
            src={`http://127.0.0.1:8000/${tournament.banner_image}`}
            alt={tournament.title}
            className="h-full w-full object-cover opacity-45"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

        <div className="absolute bottom-10 left-0 right-0">
          <div className="mx-auto max-w-[1600px] px-6">
            <div className="max-w-5xl">
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-400">
                Tournament View
              </p>

              <h1 className="mt-4 text-5xl font-black leading-tight md:text-7xl">
                {tournament.title}
              </h1>

              <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-300">
                {tournament.subtitle}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
                  Format: {tournamentFormat}
                </span>

                <span className="rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-400">
                  {teams.length} Teams
                </span>

                <span className="rounded-full border border-zinc-700 bg-black/70 px-4 py-2 text-sm font-bold text-gray-300">
                  {matches.length} Matches
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-6 py-10">
        {/* TABS */}
        <div className="mb-10 flex flex-wrap gap-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-3 shadow-xl shadow-black/30">
          <button
            onClick={() => setActiveTab("overview")}
            className={`rounded-2xl px-6 py-3 font-bold transition ${
              activeTab === "overview"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "bg-black text-gray-300 hover:bg-blue-500/10 hover:text-white"
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab("teams")}
            className={`rounded-2xl px-6 py-3 font-bold transition ${
              activeTab === "teams"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "bg-black text-gray-300 hover:bg-blue-500/10 hover:text-white"
            }`}
          >
            Teams
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`rounded-2xl px-6 py-3 font-bold transition ${
              activeTab === "schedule"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "bg-black text-gray-300 hover:bg-blue-500/10 hover:text-white"
            }`}
          >
            Schedule
          </button>

          <button
            onClick={() => setActiveTab("bracket")}
            className={`rounded-2xl px-6 py-3 font-bold transition ${
              activeTab === "bracket"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "bg-black text-gray-300 hover:bg-blue-500/10 hover:text-white"
            }`}
          >
            Bracket
          </button>
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Overview
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Tournament Overview
            </h2>

            <p className="mt-6 leading-8 text-gray-300">
              {tournament.description}
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-black p-6">
                <p className="text-sm text-gray-500">Game</p>
                <h3 className="mt-2 text-xl font-black">
                  {tournament.game_name || "MLBB"}
                </h3>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black p-6">
                <p className="text-sm text-gray-500">Prize Pool</p>
                <h3 className="mt-2 text-xl font-black text-blue-400">
                  Rs. {tournament.prize_pool || 0}
                </h3>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black p-6">
                <p className="text-sm text-gray-500">Status</p>
                <h3 className="mt-2 text-xl font-black">
                  {tournament.status}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* TEAMS */}
        {activeTab === "teams" && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Teams
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Approved Teams
            </h2>

            {teams.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-zinc-800 bg-black p-12 text-center">
                <p className="text-gray-400">
                  No approved teams yet.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="rounded-3xl border border-zinc-800 bg-black p-6 text-center shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-blue-500/60"
                  >
                    {team.team_logo ? (
                      <img
                        src={`http://127.0.0.1:8000/${team.team_logo}`}
                        alt={team.team_name}
                        className="mx-auto mb-4 h-24 w-24 rounded-2xl border border-blue-500/30 object-cover"
                      />
                    ) : (
                      <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900 text-sm text-gray-400">
                        Team
                      </div>
                    )}

                    <h3 className="text-lg font-black">
                      {team.team_name}
                    </h3>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SCHEDULE */}
        {activeTab === "schedule" && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Schedule
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Match Schedule
            </h2>

            {matches.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-zinc-800 bg-black p-12 text-center">
                <p className="text-gray-400">
                  Schedule not released yet.
                </p>
              </div>
            ) : (
              <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-800">
                <table className="w-full min-w-[900px] bg-black">
                  <thead className="bg-zinc-950">
                    <tr className="border-b border-zinc-800">
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Match No</th>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Team 1</th>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Team 2</th>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Date</th>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Time</th>
                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Winner</th>
                    </tr>
                  </thead>

                  <tbody>
                    {matches.map((match, index) => (
                      <tr
                        key={match.id}
                        className="border-b border-zinc-800 transition hover:bg-blue-500/5"
                      >
                        <td className="px-4 py-4 text-sm text-gray-300">
                          #{match.match_no || index + 1}
                        </td>

                        <td className="px-4 py-4 text-sm font-bold text-white">
                          {getTeam1(match)}
                        </td>

                        <td className="px-4 py-4 text-sm font-bold text-white">
                          {getTeam2(match)}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-300">
                          {formatDate(match.match_date)}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-300">
                          {formatTime(match.match_time)}
                        </td>

                        <td className="px-4 py-4 text-sm">
                          {match.winner ? (
                            <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                              {match.winner}
                            </span>
                          ) : (
                            <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-bold text-gray-400">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BRACKET */}
        {activeTab === "bracket" && (
          <div className="space-y-10">
            {/* ROUND ROBIN GROUP TABLES */}
            {tournamentFormat === "Round Robin + Bracket" && (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
                <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                  Round Robin
                </p>

                <h2 className="mt-2 text-3xl font-black">
                  Round Robin Groups
                </h2>

                {roundRobinGroups.length === 0 ? (
                  <div className="mt-8 rounded-3xl border border-zinc-800 bg-black p-12 text-center">
                    <p className="text-gray-400">
                      Group tables not released yet.
                    </p>
                  </div>
                ) : (
                  <div className="mt-8 space-y-10">
                    {roundRobinGroups.map((group) => (
                      <div
                        key={group.id}
                        className="rounded-3xl border border-zinc-800 bg-black p-6"
                      >
                        <h3 className="mb-5 text-2xl font-black text-blue-400">
                          {group.group_name}
                        </h3>

                        {(group.teams || []).length === 0 ? (
                          <p className="text-gray-400">
                            No teams added to this group yet.
                          </p>
                        ) : (
                          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
                            <table className="w-full min-w-[900px] bg-black">
                              <thead className="bg-zinc-950">
                                <tr className="border-b border-zinc-800">
                                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Rank</th>
                                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Team</th>
                                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Full Matches</th>
                                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Played</th>
                                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Won</th>
                                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Lost</th>
                                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">BP</th>
                                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Points</th>
                                </tr>
                              </thead>

                              <tbody>
                                {(group.teams || []).map((team, index) => (
                                  <tr
                                    key={team.id}
                                    className="border-b border-zinc-800 transition hover:bg-blue-500/5"
                                  >
                                    <td className="px-4 py-4 font-bold text-gray-300">
                                      #{index + 1}
                                    </td>

                                    <td className="px-4 py-4 font-bold text-white">
                                      {team.team_name}
                                    </td>

                                    <td className="px-4 py-4 text-gray-300">
                                      {team.full_matches}
                                    </td>

                                    <td className="px-4 py-4 text-gray-300">
                                      {team.played}
                                    </td>

                                    <td className="px-4 py-4 font-bold text-green-400">
                                      {team.won}
                                    </td>

                                    <td className="px-4 py-4 font-bold text-red-400">
                                      {team.lost}
                                    </td>

                                    <td className="px-4 py-4 font-bold text-yellow-400">
                                      {team.bp}
                                    </td>

                                    <td className="px-4 py-4 font-black text-blue-400">
                                      {team.points}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* BRACKET SECTION */}
            <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
              <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                Bracket
              </p>

              <h2 className="mt-2 mb-10 text-3xl font-black">
                Tournament Bracket
              </h2>

              {bracketMatches.length === 0 ? (
                <div className="rounded-3xl border border-zinc-800 bg-black p-12 text-center">
                  <p className="text-gray-400">
                    Bracket not released yet.
                  </p>
                </div>
              ) : (
                <div className="min-w-[1200px] space-y-20">
                  {/* UPPER BRACKET */}
                  {upperRounds.length > 0 &&
                    renderConnectedBracketBoard(
                      "Upper Bracket",
                      "text-green-400",
                      "text-blue-400",
                      upperRounds
                    )
                  }

                  {/* LOWER BRACKET */}
                  {lowerRounds.length > 0 &&
                    renderConnectedBracketBoard(
                      "Lower Bracket",
                      "text-red-400",
                      "text-red-300",
                      lowerRounds
                    )
                  }

                  {/* FINAL STAGE */}
                  {finalRounds.length > 0 &&
                    renderConnectedBracketBoard(
                      "Final Stage",
                      "text-yellow-400",
                      "text-yellow-300",
                      finalRounds
                    )
                  }
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}