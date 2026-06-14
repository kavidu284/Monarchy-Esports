import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import getImageUrl from "../utils/getImageUrl";

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

        setRoundRobinGroups(groupsResponse.data || []);
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

  const getGroupCode = (groupName) => {
    const text = String(groupName || "").trim();

    return text
      .replace(/^group\s+/i, "")
      .trim();
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

    const sortedTeams = getSortedGroupTeams(group);

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

  const isFutureParticipant = (participant) => {
    if (!participant) return false;

    const text = String(participant).trim();

    return (
      /^(Winner|Loser)\s+of\s+Match\s+(\d+)$/i.test(text) ||
      isRoundRobinSeedParticipant(text)
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

  const pageSectionClass =
    "rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl shadow-black/30 sm:rounded-3xl sm:p-8";

  const tableWrapClass =
    "mt-6 overflow-x-auto rounded-xl border border-zinc-800 sm:mt-8 sm:rounded-2xl";

  const scheduleTableClass =
    "w-full min-w-[540px] bg-black text-[10px] sm:min-w-[900px] sm:text-sm";

  const roundRobinTableClass =
    "w-full min-w-[650px] bg-black text-[10px] sm:min-w-[1000px] sm:text-sm";

  const smallThClass =
    "px-2 py-2 text-left text-[9px] font-bold uppercase tracking-wide text-gray-400 sm:px-4 sm:py-4 sm:text-xs sm:tracking-widest";

  const smallTdClass =
    "px-2 py-2 text-[10px] text-gray-300 sm:px-4 sm:py-4 sm:text-sm";

  const smallTdBoldClass =
    "px-2 py-2 text-[10px] font-bold text-white sm:px-4 sm:py-4 sm:text-sm";

  const tabClass = (tabName) =>
    `rounded-xl px-3 py-3 text-xs font-bold transition sm:rounded-2xl sm:px-6 sm:text-base ${
      activeTab === tabName
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
        : "bg-black text-gray-300 hover:bg-blue-500/10 hover:text-white"
    }`;

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
              <p className="mt-1 text-xs text-blue-300">
                Source: {rawTeamOne}
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
              <p className="mt-1 text-xs text-blue-300">
                Source: {rawTeamTwo}
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
        <h3 className={`mb-6 text-2xl font-black sm:mb-8 sm:text-3xl ${titleColor}`}>
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
      <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 px-8 py-7 text-center shadow-xl shadow-blue-600/10 sm:px-10 sm:py-8">
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
      <div className="relative h-[320px] overflow-hidden border-b border-zinc-900 bg-zinc-950 sm:h-[420px]">
        {tournament.banner_image && (
          <img
            src={`http://127.0.0.1:8000/${tournament.banner_image}`}
            alt={tournament.title}
            className="h-full w-full object-cover opacity-45"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

        <div className="absolute bottom-6 left-0 right-0 sm:bottom-10">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
            <div className="max-w-5xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400 sm:text-sm sm:tracking-[0.35em]">
                Tournament View
              </p>

              <h1 className="mt-3 line-clamp-2 text-3xl font-black leading-tight sm:mt-4 sm:text-5xl md:text-7xl">
                {tournament.title}
              </h1>

              <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-gray-300 sm:mt-4 sm:text-lg sm:leading-8">
                {tournament.subtitle}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-[10px] font-bold text-blue-300 sm:px-4 sm:py-2 sm:text-sm">
                  Format: {tournamentFormat}
                </span>

                <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-[10px] font-bold text-green-400 sm:px-4 sm:py-2 sm:text-sm">
                  {teams.length} Teams
                </span>

                <span className="rounded-full border border-zinc-700 bg-black/70 px-3 py-1.5 text-[10px] font-bold text-gray-300 sm:px-4 sm:py-2 sm:text-sm">
                  {matches.length} Matches
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 sm:py-10">
        {/* TABS */}
        <div className="mb-8 grid grid-cols-2 gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-xl shadow-black/30 sm:mb-10 sm:flex sm:flex-wrap sm:gap-4 sm:rounded-3xl sm:p-3">
          <button
            onClick={() => setActiveTab("overview")}
            className={tabClass("overview")}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab("teams")}
            className={tabClass("teams")}
          >
            Teams
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={tabClass("schedule")}
          >
            Schedule
          </button>

          <button
            onClick={() => setActiveTab("bracket")}
            className={tabClass("bracket")}
          >
            Bracket
          </button>
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className={pageSectionClass}>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400 sm:text-sm">
              Overview
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Tournament Overview
            </h2>

            <p className="mt-5 text-sm leading-7 text-gray-300 sm:mt-6 sm:text-base sm:leading-8">
              {tournament.description}
            </p>

            <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-black p-5 sm:p-6">
                <p className="text-xs text-gray-500 sm:text-sm">Game</p>
                <h3 className="mt-2 text-lg font-black sm:text-xl">
                  {tournament.game_name || "MLBB"}
                </h3>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black p-5 sm:p-6">
                <p className="text-xs text-gray-500 sm:text-sm">Prize Pool</p>
                <h3 className="mt-2 text-lg font-black text-blue-400 sm:text-xl">
                  Rs. {Number(tournament.prize_pool || 0).toLocaleString()}
                </h3>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black p-5 sm:p-6">
                <p className="text-xs text-gray-500 sm:text-sm">Status</p>
                <h3 className="mt-2 text-lg font-black sm:text-xl">
                  {tournament.status}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* TEAMS */}
        {activeTab === "teams" && (
          <div className={pageSectionClass}>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400 sm:text-sm">
              Teams
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Approved Teams
            </h2>

            {teams.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-8 text-center sm:mt-8 sm:rounded-3xl sm:p-12">
                <p className="text-gray-400">
                  No approved teams yet.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="rounded-2xl border border-zinc-800 bg-black p-5 text-center shadow-xl shadow-black/30 transition hover:border-blue-500/60 sm:rounded-3xl sm:p-6 sm:hover:-translate-y-1"
                  >
                    {team.team_logo ? (
                      <img
                        src={getImageUrl(team.team_logo)}
                        alt={team.team_name}
                        className="mx-auto mb-4 h-20 w-20 rounded-2xl border border-blue-500/30 object-cover sm:h-24 sm:w-24"
                      />
                    ) : (
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900 text-sm text-gray-400 sm:h-24 sm:w-24">
                        Team
                      </div>
                    )}

                    <h3 className="text-base font-black sm:text-lg">
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
          <div className={pageSectionClass}>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400 sm:text-sm">
              Schedule
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Match Schedule
            </h2>

            {matches.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-8 text-center sm:mt-8 sm:rounded-3xl sm:p-12">
                <p className="text-gray-400">
                  Schedule not released yet.
                </p>
              </div>
            ) : (
              <div className={tableWrapClass}>
                <table className={scheduleTableClass}>
                  <thead className="bg-zinc-950">
                    <tr className="border-b border-zinc-800">
                      <th className={smallThClass}>No</th>
                      <th className={smallThClass}>Team 1</th>
                      <th className={smallThClass}>Team 2</th>
                      <th className={smallThClass}>Date</th>
                      <th className={smallThClass}>Time</th>
                      <th className={smallThClass}>Winner</th>
                    </tr>
                  </thead>

                  <tbody>
                    {matches.map((match, index) => (
                      <tr
                        key={match.id}
                        className="border-b border-zinc-800 transition hover:bg-blue-500/5"
                      >
                        <td className={smallTdClass}>
                          #{match.match_no || index + 1}
                        </td>

                        <td className={smallTdBoldClass}>
                          <div>
                            {getTeam1(match)}

                            {isFutureParticipant(match.team1) &&
                              getTeam1(match) !== match.team1 && (
                                <p className="mt-1 text-[9px] font-normal text-blue-400 sm:text-xs">
                                  Source: {match.team1}
                                </p>
                              )}
                          </div>
                        </td>

                        <td className={smallTdBoldClass}>
                          <div>
                            {getTeam2(match)}

                            {isFutureParticipant(match.team2) &&
                              getTeam2(match) !== match.team2 && (
                                <p className="mt-1 text-[9px] font-normal text-blue-400 sm:text-xs">
                                  Source: {match.team2}
                                </p>
                              )}
                          </div>
                        </td>

                        <td className={smallTdClass}>
                          {formatDate(match.match_date)}
                        </td>

                        <td className={smallTdClass}>
                          {formatTime(match.match_time)}
                        </td>

                        <td className="px-2 py-2 text-[10px] sm:px-4 sm:py-4 sm:text-sm">
                          {match.winner ? (
                            <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-[9px] font-bold text-green-400 sm:px-3 sm:text-xs">
                              {match.winner}
                            </span>
                          ) : (
                            <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 text-[9px] font-bold text-gray-400 sm:px-3 sm:text-xs">
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
          <div className="space-y-8 sm:space-y-10">
            {/* ROUND ROBIN GROUP TABLES */}
            {tournamentFormat === "Round Robin + Bracket" && (
              <div className={pageSectionClass}>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400 sm:text-sm">
                  Round Robin
                </p>

                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  Round Robin Groups
                </h2>

                {roundRobinGroups.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-8 text-center sm:mt-8 sm:rounded-3xl sm:p-12">
                    <p className="text-gray-400">
                      Group tables not released yet.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-6 sm:mt-8 sm:space-y-10">
                    {roundRobinGroups.map((group) => {
                      const sortedTeams = getSortedGroupTeams(group);

                      return (
                        <div
                          key={group.id}
                          className="rounded-2xl border border-zinc-800 bg-black p-4 sm:rounded-3xl sm:p-6"
                        >
                          <h3 className="mb-4 text-xl font-black text-blue-400 sm:mb-5 sm:text-2xl">
                            {group.group_name}
                          </h3>

                          {(group.teams || []).length === 0 ? (
                            <p className="text-gray-400">
                              No teams added to this group yet.
                            </p>
                          ) : (
                            <div className="overflow-x-auto rounded-xl border border-zinc-800 sm:rounded-2xl">
                              <table className={roundRobinTableClass}>
                                <thead className="bg-zinc-950">
                                  <tr className="border-b border-zinc-800">
                                    <th className={smallThClass}>Rank</th>
                                    <th className={smallThClass}>Slot</th>
                                    <th className={smallThClass}>Team</th>
                                    <th className={smallThClass}>Full</th>
                                    <th className={smallThClass}>Play</th>
                                    <th className={smallThClass}>Won</th>
                                    <th className={smallThClass}>Lost</th>
                                    <th className={smallThClass}>BP</th>
                                    <th className={smallThClass}>Pts</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {sortedTeams.map((team, index) => (
                                    <tr
                                      key={team.id}
                                      className="border-b border-zinc-800 transition hover:bg-blue-500/5"
                                    >
                                      <td className={smallTdClass}>
                                        #{index + 1}
                                      </td>

                                      <td className="px-2 py-2 sm:px-4 sm:py-4">
                                        <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-[9px] font-bold text-green-400 sm:px-3 sm:text-xs">
                                          {getSlotCode(group, index)}
                                        </span>
                                      </td>

                                      <td className={smallTdBoldClass}>
                                        {team.team_name}
                                      </td>

                                      <td className={smallTdClass}>
                                        {team.full_matches}
                                      </td>

                                      <td className={smallTdClass}>
                                        {team.played}
                                      </td>

                                      <td className="px-2 py-2 text-[10px] font-bold text-green-400 sm:px-4 sm:py-4 sm:text-sm">
                                        {team.won}
                                      </td>

                                      <td className="px-2 py-2 text-[10px] font-bold text-red-400 sm:px-4 sm:py-4 sm:text-sm">
                                        {team.lost}
                                      </td>

                                      <td className="px-2 py-2 text-[10px] font-bold text-yellow-400 sm:px-4 sm:py-4 sm:text-sm">
                                        {team.bp}
                                      </td>

                                      <td className="px-2 py-2 text-[10px] font-black text-blue-400 sm:px-4 sm:py-4 sm:text-sm">
                                        {team.points}
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
            )}

            {/* BRACKET SECTION */}
            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl shadow-black/30 sm:rounded-3xl sm:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400 sm:text-sm">
                Bracket
              </p>

              <h2 className="mb-8 mt-2 text-2xl font-black sm:mb-10 sm:text-3xl">
                Tournament Bracket
              </h2>

              {bracketMatches.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-black p-8 text-center sm:rounded-3xl sm:p-12">
                  <p className="text-gray-400">
                    Bracket not released yet.
                  </p>
                </div>
              ) : (
                <div className="min-w-[1050px] space-y-16 sm:min-w-[1200px] sm:space-y-20">
                  {upperRounds.length > 0 &&
                    renderConnectedBracketBoard(
                      "Upper Bracket",
                      "text-green-400",
                      "text-blue-400",
                      upperRounds
                    )}

                  {lowerRounds.length > 0 &&
                    renderConnectedBracketBoard(
                      "Lower Bracket",
                      "text-red-400",
                      "text-red-300",
                      lowerRounds
                    )}

                  {finalRounds.length > 0 &&
                    renderConnectedBracketBoard(
                      "Final Stage",
                      "text-yellow-400",
                      "text-yellow-300",
                      finalRounds
                    )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}