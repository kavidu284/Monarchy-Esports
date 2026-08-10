import { useEffect, useState, useCallback, useRef } from "react";
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

  // Toast State
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', title, message }

  // Security Re-Authentication Modal State for Refresh Groups Action
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
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
      showToast("error", "Load Failed", "Failed to load tournament data.");
    }
  }, [id, showToast]);

  const loadDataRef = useRef(loadData);
  useEffect(() => {
    loadDataRef.current = loadData;
  }, [loadData]);

  useEffect(() => {
    loadDataRef.current();
  }, []);

  // Trigger Security Modal for Refreshing Groups
  const triggerRefreshModal = () => {
    setReauth({ username: "", password: "" });
    setReauthMessage("");
    setSecurityModalOpen(true);
  };

  // Execute authenticated group refresh
  const executeRefreshGroups = async () => {
    try {
      await loadData();
      showToast("success", "Refreshed", "Round robin groups successfully refreshed.");
      setSecurityModalOpen(false);
    } catch (error) {
      console.error(error);
      showToast("error", "Refresh Failed", "Could not refresh round robin groups.");
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
        await executeRefreshGroups();
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

  const hasExplicitUpperOrLower = orderedRounds.some(
    (round) =>
      String(round).toLowerCase().includes("upper") ||
      String(round).toLowerCase().includes("lower")
  );

    let upperRounds;
  let lowerRounds = [];
  let finalRounds = [];

  if (hasExplicitUpperOrLower) {
    upperRounds = orderedRounds.filter(
      (round) =>
        String(round).toLowerCase().includes("upper") ||
        (!String(round).toLowerCase().includes("lower") &&
          (String(round).toLowerCase().includes("round 1") ||
            String(round).toLowerCase().includes("round 2") ||
            String(round).toLowerCase().includes("quarter") ||
            String(round).toLowerCase().includes("semi")))
    );

    lowerRounds = orderedRounds.filter((round) =>
      String(round).toLowerCase().includes("lower")
    );

    finalRounds = orderedRounds.filter(
      (round) =>
        String(round).toLowerCase().includes("final") &&
        !String(round).toLowerCase().includes("upper") &&
        !String(round).toLowerCase().includes("lower")
    );
  } else {
    upperRounds = orderedRounds;
  }

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
    "rounded-2xl border border-blue-900/40 bg-zinc-950 p-4 shadow-xl shadow-blue-950/20 sm:rounded-3xl sm:p-8";

  const tableWrapClass =
    "mt-6 overflow-x-auto rounded-xl border border-blue-900/40 sm:mt-8 sm:rounded-2xl";

  const scheduleTableClass =
    "w-full min-w-[540px] bg-black text-[10px] sm:min-w-[900px] sm:text-sm";

  const roundRobinTableClass =
    "w-full min-w-[650px] bg-black text-[10px] sm:min-w-[1000px] sm:text-sm";

  const smallThClass =
    "px-2 py-2 text-left text-[9px] font-bold uppercase tracking-wide text-blue-400 sm:px-4 sm:py-4 sm:text-xs sm:tracking-widest";

  const smallTdClass =
    "px-2 py-2 text-[10px] text-gray-300 sm:px-4 sm:py-4 sm:text-sm";

  const smallTdBoldClass =
    "px-2 py-2 text-[10px] font-bold text-white sm:px-4 sm:py-4 sm:text-sm";

  const tabClass = (tabName) =>
    `rounded-xl px-3 py-3 text-xs font-bold transition sm:rounded-2xl sm:px-6 sm:text-base ${
      activeTab === tabName
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40 ring-1 ring-blue-400/50"
        : "bg-black text-gray-300 hover:bg-blue-600/10 hover:text-white border border-blue-950/50"
    }`;

  const renderBracketMatchCard = (match, bracketType = "upper") => {
    const teamOne = getTeam1(match);
    const teamTwo = getTeam2(match);

    const rawTeamOne = match.team1;
    const rawTeamTwo = match.team2;

    const teamOneIsWinner =
      match.winner && match.winner === teamOne;

    const teamTwoIsWinner =
      match.winner && match.winner === teamTwo;

    const isLower = bracketType === "lower";
    const isFinal = bracketType === "final";

    const accentBorder = isFinal 
      ? "border-amber-500/50 shadow-amber-500/10" 
      : isLower 
        ? "border-cyan-500/40 shadow-cyan-950/30" 
        : "border-blue-500/50 shadow-blue-600/15";

    const badgeStyle = isFinal
      ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
      : isLower
        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
        : "border-blue-500/30 bg-blue-500/10 text-blue-300";

    const winnerBg = isFinal
      ? "bg-amber-600 text-white"
      : isLower
        ? "bg-cyan-600 text-white"
        : "bg-blue-600 text-white";

    return (
      <div className={`w-[320px] overflow-hidden rounded-2xl border ${accentBorder} bg-gradient-to-b from-zinc-900/90 to-zinc-950 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-blue-400 hover:shadow-blue-500/20`}>
        <div className="flex items-center justify-between border-b border-blue-900/40 bg-black/80 px-4 py-3">
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${badgeStyle}`}>
            Match {match.match_no || "-"}
          </span>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold ${
              match.winner
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-blue-900/40 bg-blue-950/30 text-blue-300"
            }`}
          >
            {match.winner ? "✓ Finished" : "• Live / Upcoming"}
          </span>
        </div>

        <div
          className={`border-b border-blue-900/30 px-4 py-3.5 transition-colors ${
            teamOneIsWinner
              ? `${winnerBg} shadow-inner`
              : "bg-zinc-950/60 text-gray-200 hover:bg-zinc-900/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="truncate font-black tracking-wide">
              {teamOne}
            </p>
            {teamOneIsWinner && (
              <span className="ml-2 rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-white">
                WIN
              </span>
            )}
          </div>

          {isFutureParticipant(rawTeamOne) &&
            rawTeamOne !== teamOne && (
              <p className="mt-1 text-[11px] font-medium text-blue-200/80">
                Slot: {rawTeamOne}
              </p>
            )}
        </div>

        <div
          className={`px-4 py-3.5 transition-colors ${
            teamTwoIsWinner
              ? `${winnerBg} shadow-inner`
              : "bg-zinc-950/60 text-gray-200 hover:bg-zinc-900/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="truncate font-black tracking-wide">
              {teamTwo}
            </p>
            {teamTwoIsWinner && (
              <span className="ml-2 rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-white">
                WIN
              </span>
            )}
          </div>

          {isFutureParticipant(rawTeamTwo) &&
            rawTeamTwo !== teamTwo && (
              <p className="mt-1 text-[11px] font-medium text-blue-200/80">
                Slot: {rawTeamTwo}
              </p>
            )}
        </div>

        <div className="border-t border-blue-900/40 bg-black/90 px-4 py-2.5 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Winner:{" "}
            {match.winner ? (
              <span className="font-bold text-blue-400">
                {match.winner}
              </span>
            ) : (
              <span className="text-gray-500 font-medium italic">
                Awaiting Result
              </span>
            )}
          </p>
          {(match.match_date || match.match_time) && (
            <span className="text-[10px] font-mono text-gray-500">
              {formatDate(match.match_date)} {formatTime(match.match_time)}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderConnectedBracketBoard = (
    title,
    titleColor,
    roundTitleColor,
    rounds,
    bracketType = "upper"
  ) => {
    const CARD_WIDTH = 320;
    const CARD_HEIGHT = 195;
    const COLUMN_GAP = 150;
    const ROW_GAP = 56;
    const HEADER_OFFSET = 75;

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
      100;

    const boardHeight =
      allNodes.length === 0
        ? 320
        : Math.max(
            ...allNodes.map(
              (node) => node.y + CARD_HEIGHT + HEADER_OFFSET
            )
          ) + 90;

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

    const lineStrokeColor = bracketType === "final" ? "#f59e0b" : bracketType === "lower" ? "#06b6d4" : "#3b82f6";

    let displayTitle = title;
    if (bracketType === "upper" && !hasExplicitUpperOrLower) {
      displayTitle = "Knockout Bracket";
    }

    return (
      <div className="relative rounded-3xl border border-blue-900/40 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 p-6 shadow-2xl shadow-blue-950/30">
        {displayTitle && (
          <div className="mb-8 flex items-center gap-3">
            <span className={`inline-block h-3 w-3 rounded-full ${bracketType === "lower" ? "bg-cyan-400 shadow-lg shadow-cyan-400" : "bg-blue-500 shadow-lg shadow-blue-500"}`} />
            <h3 className={`text-2xl font-black tracking-tight sm:text-3xl ${titleColor}`}>
              {displayTitle}
            </h3>
          </div>
        )}

        {rounds.length === 0 ? (
          <p className="text-gray-400">
            No matches available for {displayTitle || "Bracket"}.
          </p>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div
              className="relative"
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
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path
                      d="M0,0 L0,6 L8,3 z"
                      fill={lineStrokeColor}
                    />
                  </marker>
                </defs>

                {lines.map((line) => (
                  <path
                    key={line.key}
                    d={line.path}
                    fill="none"
                    stroke={lineStrokeColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="0.75"
                    markerEnd={`url(#${markerId})`}
                  />
                ))}
              </svg>

              {columns.map((column) => (
                <div
                  key={column.roundName}
                  className="absolute z-10 flex items-center justify-center"
                  style={{
                    left: `${column.x}px`,
                    top: "0px",
                    width: `${CARD_WIDTH}px`,
                  }}
                >
                  <span className="inline-flex items-center justify-center rounded-full border border-blue-900/50 bg-zinc-950 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-blue-950/50 backdrop-blur-md">
                    {column.roundName}
                  </span>
                </div>
              ))}

              {columns.map((column) =>
                column.nodes.map((node) => (
                  <div
                    key={node.match.id}
                    className="absolute z-10 transition-transform duration-300 hover:scale-[1.02]"
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y + HEADER_OFFSET}px`,
                    }}
                  >
                    {renderBracketMatchCard(node.match, bracketType)}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="rounded-3xl border border-blue-900/40 bg-zinc-950 px-8 py-7 text-center shadow-xl shadow-blue-600/20 sm:px-10 sm:py-8">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-blue-900 border-t-blue-500" />
          <p className="font-semibold text-gray-300">Loading tournament...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black font-sans text-white selection:bg-blue-600 selection:text-white">
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

      {/* SECURITY AUTHENTICATION REAUTH MODAL */}
      {securityModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-blue-500/30 bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-xl text-blue-400">
                🔒
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Authorization Required</h3>
                <p className="text-xs text-blue-400 font-semibold truncate max-w-[220px]">
                  Refresh Group Standings
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Please enter your admin credentials to verify authorization before refreshing groups.
            </p>

            <form onSubmit={handleConfirmReauth} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={reauth.username}
                  onChange={(e) => setReauth({ ...reauth, username: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Username"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={reauth.password}
                  onChange={(e) => setReauth({ ...reauth, password: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-white focus:border-blue-500 focus:outline-none"
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
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition disabled:opacity-50"
                >
                  {verifying ? "Verifying..." : "Confirm Refresh"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <section className="relative overflow-hidden border-b border-blue-950 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.25),transparent_40%)]">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400 sm:text-sm sm:tracking-[0.35em]">
              Tournament View
            </p>

            <h1 className="mt-3 text-3xl font-black leading-tight text-white md:text-5xl lg:text-6xl">
              {tournament.title}
            </h1>

            {tournament.subtitle && (
              <p className="mt-3 text-sm leading-6 text-gray-300 sm:text-lg sm:leading-8">
                {tournament.subtitle}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
              <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-[10px] font-bold text-blue-300 shadow-lg shadow-blue-950/20 sm:px-4 sm:py-2 sm:text-sm">
                Format: {tournamentFormat}
              </span>

              <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-[10px] font-bold text-blue-300 shadow-lg shadow-blue-950/20 sm:px-4 sm:py-2 sm:text-sm">
                {teams.length} Teams
              </span>

              <span className="rounded-full border border-blue-900/50 bg-zinc-900 px-3 py-1.5 text-[10px] font-bold text-gray-300 sm:px-4 sm:py-2 sm:text-sm">
                {matches.length} Matches
              </span>
            </div>
          </div>

          <div>
            <button
              onClick={triggerRefreshModal}
              className="rounded-xl border border-blue-500/40 bg-blue-600/10 px-6 py-3 font-bold text-blue-300 transition hover:bg-blue-600/20 shadow-lg shadow-blue-950/30"
            >
              🔄 Refresh Groups
            </button>
          </div>
        </div>
      </section>

      {/* SEPARATE PHOTO DISPLAY SECTION */}
      {tournament.banner_image ? (
        <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
          <div className="relative overflow-hidden rounded-3xl border border-blue-900/50 bg-zinc-950 shadow-2xl shadow-blue-950/30">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black sm:aspect-[21/9]">
              {/* Blurred Ambient Image Background */}
              <img
                src={getImageUrl(tournament.banner_image)}
                alt=""
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
              />

              {/* Sharp Main Banner Image */}
              <img
                src={getImageUrl(tournament.banner_image)}
                alt={tournament.title}
                className="relative h-full w-full object-contain object-center"
                loading="eager"
                decoding="async"
              />

              {/* Overlay Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />

              {/* Top Glass Badge */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-900/50 bg-black/60 px-3 py-1.5 text-xs font-semibold text-gray-300 backdrop-blur-md sm:px-4 sm:py-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500" />
                  Tournament Banner
                </span>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 sm:py-10">
        {/* TABS */}
        <div className="mb-8 grid grid-cols-2 gap-2 rounded-2xl border border-blue-900/40 bg-zinc-950 p-2 shadow-xl shadow-blue-950/20 sm:mb-10 sm:flex sm:flex-wrap sm:gap-4 sm:rounded-3xl sm:p-3">
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
              <div className="rounded-2xl border border-blue-900/40 bg-black p-5 sm:p-6 shadow-lg shadow-blue-950/10">
                <p className="text-xs text-gray-500 sm:text-sm">Game</p>
                <h3 className="mt-2 text-lg font-black sm:text-xl">
                  {tournament.game_name || "MLBB"}
                </h3>
              </div>

              <div className="rounded-2xl border border-blue-900/40 bg-black p-5 sm:p-6 shadow-lg shadow-blue-950/10">
                <p className="text-xs text-gray-500 sm:text-sm">Prize Pool</p>
                <h3 className="mt-2 text-lg font-black text-blue-400 sm:text-xl">
                  Rs. {Number(tournament.prize_pool || 0).toLocaleString()}
                </h3>
              </div>

              <div className="rounded-2xl border border-blue-900/40 bg-black p-5 sm:p-6 shadow-lg shadow-blue-950/10">
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
              <div className="mt-6 rounded-2xl border border-blue-900/40 bg-black p-8 text-center sm:mt-8 sm:rounded-3xl sm:p-12">
                <p className="text-gray-400">
                  No approved teams yet.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="rounded-2xl border border-blue-900/40 bg-black p-5 text-center shadow-xl shadow-blue-950/20 transition hover:border-blue-500/60 sm:rounded-3xl sm:p-6 sm:hover:-translate-y-1"
                  >
                    {team.team_logo ? (
                      <img
                        src={getImageUrl(team.team_logo)}
                        alt={team.team_name}
                        className="mx-auto mb-4 h-20 w-20 rounded-2xl border border-blue-500/40 object-cover shadow-lg shadow-blue-950/30 sm:h-24 sm:w-24"
                      />
                    ) : (
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-900/50 bg-zinc-900 text-sm text-gray-400 sm:h-24 sm:w-24">
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
              <div className="mt-6 rounded-2xl border border-blue-900/40 bg-black p-8 text-center sm:mt-8 sm:rounded-3xl sm:p-12">
                <p className="text-gray-400">
                  Schedule not released yet.
                </p>
              </div>
            ) : (
              <div className={tableWrapClass}>
                <table className={scheduleTableClass}>
                  <thead className="bg-zinc-950">
                    <tr className="border-b border-blue-900/40">
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
                        className="border-b border-blue-900/20 transition hover:bg-blue-600/10"
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
                            <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-2 py-1 text-[9px] font-bold text-blue-300 sm:px-3 sm:text-xs shadow-sm shadow-blue-950">
                              {match.winner}
                            </span>
                          ) : (
                            <span className="rounded-full border border-blue-900/40 bg-zinc-900 px-2 py-1 text-[9px] font-bold text-gray-400 sm:px-3 sm:text-xs">
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
                  <div className="mt-6 rounded-2xl border border-blue-900/40 bg-black p-8 text-center sm:mt-8 sm:rounded-3xl sm:p-12">
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
                          className="rounded-2xl border border-blue-900/40 bg-black p-4 shadow-lg shadow-blue-950/10 sm:rounded-3xl sm:p-6"
                        >
                          <h3 className="mb-4 text-xl font-black text-blue-400 sm:mb-5 sm:text-2xl">
                            {group.group_name}
                          </h3>

                          {(group.teams || []).length === 0 ? (
                            <p className="text-gray-400">
                              No teams added to this group yet.
                            </p>
                          ) : (
                            <div className="overflow-x-auto rounded-xl border border-blue-900/40 sm:rounded-2xl">
                              <table className={roundRobinTableClass}>
                                <thead className="bg-zinc-950">
                                  <tr className="border-b border-blue-900/40">
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
                                      className="border-b border-blue-900/20 transition hover:bg-blue-600/10"
                                    >
                                      <td className={smallTdClass}>
                                        #{index + 1}
                                      </td>

                                      <td className="px-2 py-2 sm:px-4 sm:py-4">
                                        <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-2 py-1 text-[9px] font-bold text-blue-300 sm:px-3 sm:text-xs">
                                          {getSlotCode(group, index)}
                                        </span>
                                      </td>

                                      <td className={smallTdBoldClass}>
                                        {team.team_name}
                                      </td>

                                      <td className="text-gray-300">
                                        {team.full_matches}
                                      </td>

                                      <td className="text-gray-300">
                                        {team.played}
                                      </td>

                                      <td className="px-2 py-2 text-[10px] font-bold text-blue-400 sm:px-4 sm:py-4 sm:text-sm">
                                        {team.won}
                                      </td>

                                      <td className="px-2 py-2 text-[10px] font-bold text-red-400 sm:px-4 sm:py-4 sm:text-sm">
                                        {team.lost}
                                      </td>

                                      <td className="px-2 py-2 text-[10px] font-bold text-blue-300 sm:px-4 sm:py-4 sm:text-sm">
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
            <div className="space-y-8 sm:space-y-12">
              {bracketMatches.length === 0 ? (
                <div className="rounded-2xl border border-blue-900/40 bg-zinc-950 p-8 text-center sm:rounded-3xl sm:p-12 shadow-xl shadow-blue-950/20">
                  <p className="text-gray-400">
                    Bracket not released yet.
                  </p>
                </div>
              ) : hasExplicitUpperOrLower ? (
                <div className="space-y-12 sm:space-y-16">
                  {upperRounds && upperRounds.length > 0 &&
                    renderConnectedBracketBoard(
                      "Upper Bracket",
                      "text-blue-400",
                      "text-blue-300",
                      upperRounds,
                      "upper"
                    )}

                  {lowerRounds && lowerRounds.length > 0 &&
                    renderConnectedBracketBoard(
                      "Lower Bracket",
                      "text-cyan-400",
                      "text-cyan-300",
                      lowerRounds,
                      "lower"
                    )}

                  {finalRounds && finalRounds.length > 0 &&
                    renderConnectedBracketBoard(
                      "Final Stage",
                      "text-amber-400",
                      "text-amber-300",
                      finalRounds,
                      "final"
                    )}
                </div>
              ) : (
                <div className="space-y-12 sm:space-y-16">
                  {upperRounds && upperRounds.length > 0 &&
                    renderConnectedBracketBoard(
                      "Knockout Bracket",
                      "text-blue-400",
                      "text-blue-300",
                      upperRounds,
                      "upper"
                    )}

                  {finalRounds && finalRounds.length > 0 &&
                    renderConnectedBracketBoard(
                      "Final Stage",
                      "text-amber-400",
                      "text-amber-300",
                      finalRounds,
                      "final"
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