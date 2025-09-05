import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton"; // Import Logout button component

// Helper to get tournament category for filtering
function getCategory(m) {
  const tn = m.tournament?.toLowerCase() || "";
  if (tn.includes("women")) return "Women";
  if (tn.includes("league")) return "League";
  if (tn.includes("cup") || tn.includes("trophy") || tn.includes("tour of")) return "International";
  return "Domestic"; // fallback category
}

export default function MatchList() {
  const [tab, setTab] = useState("live");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  function parseRuns(scoreStr) {
    if (!scoreStr || scoreStr === "-") return NaN;
    const match = scoreStr.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : NaN;
  }

  function getWinner(m) {
    if (m.status && m.status.toLowerCase().includes("complete")) {
      const team1Score = parseRuns(m.team1?.score);
      const team2Score = parseRuns(m.team2?.score);
      if (!isNaN(team1Score) && !isNaN(team2Score)) {
        if (team1Score > team2Score) return m.team1.name;
        if (team2Score > team1Score) return m.team2.name;
        return "Draw";
      }
    }
    return null;
  }

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const url = `http://localhost:5000/api/matches/${tab}`;
      const res = await axios.get(url);
      setMatches(res.data.matches || []);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab !== "add") {
      fetchMatches();
    }
    // eslint-disable-next-line
  }, [tab]);

  const handleAddMatch = () => {
    navigate("/add");
  };

  // Filter matches by selected category
  const filteredMatches = matches.filter((m) => {
    if (filter === "All") return true;
    return getCategory(m) === filter;
  });

  const filterTabs = ["All", "International", "League", "Domestic", "Women"];

  return (
    <div className="min-h-screen bg-gray-400 py-6">
      <div className="max-w-4xl mx-auto p-5 bg-white rounded shadow">
        {/* Logout button at the top right */}
        <div className="flex justify-end mb-4">
          <LogoutButton />
        </div>

        <div className="mb-4">
          <div className="flex items-center mb-3">
            <span className="font-bold text-2xl text-green-700 mr-1">cric</span>
            <span className="font-bold text-2xl text-white px-2 bg-green-700 rounded">bit</span>
          </div>
          <div className="font-bold mb-4 text-lg">Live Cricket Score</div>
        </div>

        {/* Main tabs: Live / Recent / Upcoming / Add */}
        <div className="mb-2 border-b border-gray-300">
          <div className="flex gap-6">
            <button
              className={`pb-2 text-sm font-medium ${
                tab === "live" ? "text-green-600 border-b-2 border-green-600" : "text-gray-600 hover:text-black"
              }`}
              onClick={() => setTab("live")}
            >
              Live
            </button>
            <button
              className={`pb-2 text-sm font-medium ${
                tab === "recent" ? "text-green-600 border-b-2 border-green-600" : "text-gray-600 hover:text-black"
              }`}
              onClick={() => setTab("recent")}
            >
              Recent
            </button>
            <button
              className={`pb-2 text-sm font-medium ${
                tab === "upcoming" ? "text-green-600 border-b-2 border-green-600" : "text-gray-600 hover:text-black"
              }`}
              onClick={() => setTab("upcoming")}
            >
              Upcoming
            </button>
            <button
              className={`pb-2 text-sm font-medium ${
                tab === "add" ? "text-green-600 border-b-2 border-green-600" : "text-gray-600 hover:text-black"
              }`}
              onClick={handleAddMatch}
            >
              Add Match
            </button>
          </div>
        </div>

        {/* Category filter bar */}
        <div className="flex gap-3 mb-4">
          {filterTabs.map((cat) => (
            <button
              key={cat}
              className={`px-3 py-1 rounded-full text-sm font-medium border ${
                filter === cat
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-gray-300 bg-white text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <div className="w-3/4">
            {tab === "add" ? (
              <div className="py-6 text-center text-gray-400 text-sm">
                Redirecting to Add Match...
              </div>
            ) : loading ? (
              <div className="text-gray-500 py-6 text-center text-sm">
                Loading matches...
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="text-gray-400 py-6 text-center text-sm">
                No matches available
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMatches.map((m, idx) => {
                  const winner = getWinner(m);
                  return (
                    <div
                      key={m.externalId || idx}
                      className="border rounded-md p-4 bg-gray-50 relative hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="font-semibold text-sm">
                          {m.team1?.name || "Team 1"} vs {m.team2?.name || "Team 2"}
                        </div>
                        <div className="flex flex-col items-end">
                          {m.isLive && (
                            <span className="bg-green-600 text-white text-xs px-1 py-0.5 rounded mb-1">
                              LIVE
                            </span>
                          )}
                          <span className="text-xs text-green-700 font-bold">{m.tournament}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center mb-0.5">
                        <div>
                          <span className="font-bold text-xs">{m.team1?.name || "Team 1"}:</span>{" "}
                          <span className="font-mono text-xs">
                            {m.team1?.score !== "-"
                              ? `${m.team1.score}/${m.team1.wickets} (${m.team1.overs})`
                              : "Yet to bat"}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-xs">{m.team2?.name || "Team 2"}:</span>{" "}
                          <span className="font-mono text-xs">
                            {m.team2?.score !== "-"
                              ? `${m.team2.score}/${m.team2.wickets} (${m.team2.overs})`
                              : "Yet to bat"}
                          </span>
                        </div>
                      </div>
                      {tab === "recent" && (
                        <div className="text-green-700 font-semibold mb-1">
                          {winner ? `${winner} Won` : m.status}
                        </div>
                      )}
                      <div className="text-xs text-gray-600">
                        <span>{m.status}</span>
                        <span>
                          {" "}
                          &middot;{" "}
                          {m.startTime
                            ? new Date(m.startTime).toLocaleString(undefined, {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </span>
                        <span> &middot; {m.venue}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



/* import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MatchList() {
  const [tab, setTab] = useState("live");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const url = `http://localhost:5000/api/matches/${tab}`;
      const res = await axios.get(url);
      setMatches(res.data.matches || []);
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab !== "add") {
      fetchMatches();
    }
    // eslint-disable-next-line
  }, [tab]);

  const handleAddMatch = () => {
    navigate("/add");
  };

  return (
    <div className="min-h-screen bg-gray-400 py-6">
      <div className="max-w-4xl mx-auto p-5 bg-white rounded shadow">
     
        <div className="mb-4">
          <div className="flex items-center mb-3">
            <span className="font-bold text-2xl text-green-700 mr-1">cric</span>
            <span className="font-bold text-2xl text-white px-2 bg-green-700 rounded">
              bit
            </span>
          </div>
          <div className="font-bold mb-4 text-lg">Live Cricket Score</div>
        </div>

      
        <div className="mb-4 border-b border-gray-300">
          <div className="flex gap-6">
            <button
              className={`pb-2 text-sm font-medium ${
                tab === "live"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-black"
              }`}
              onClick={() => setTab("live")}
            >
              Live
            </button>
            <button
              className={`pb-2 text-sm font-medium ${
                tab === "recent"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-black"
              }`}
              onClick={() => setTab("recent")}
            >
              Recent
            </button>
            <button
              className={`pb-2 text-sm font-medium ${
                tab === "upcoming"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-black"
              }`}
              onClick={() => setTab("upcoming")}
            >
              Upcoming
            </button>
            <button
              className={`pb-2 text-sm font-medium ${
                tab === "add"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-black"
              }`}
              onClick={handleAddMatch}
            >
              Add Match
            </button>
          </div>
        </div>

      
        <div className="flex justify-center">
          <div className="w-3/4">
            {tab === "add" ? (
              <div className="py-6 text-center text-gray-400 text-sm">
                Redirecting to Add Match...
              </div>
            ) : loading ? (
              <div className="text-gray-500 py-6 text-center text-sm">
                Loading matches...
              </div>
            ) : matches.length === 0 ? (
              <div className="text-gray-400 py-6 text-center text-sm">
                No matches available
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((m, idx) => (
                  <div
                    key={m.externalId || idx}
                    className="border rounded-md p-4 bg-gray-50 relative hover:shadow-sm"
                  >
                   
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="font-semibold text-sm">
                        {m.team1?.name || "Team 1"} vs{" "}
                        {m.team2?.name || "Team 2"}
                      </div>
                      <div className="flex flex-col items-end">
                        {m.isLive && (
                          <span className="bg-green-600 text-white text-xs px-1 py-0.5 rounded mb-1">
                            LIVE
                          </span>
                        )}
                        <span className="text-xs text-green-700 font-bold">
                          {m.tournament}
                        </span>
                      </div>
                    </div>
                   
                    <div className="flex gap-2 items-center mb-0.5">
                      <div>
                        <span className="font-bold text-xs">
                          {m.team1?.name || "Team 1"}:
                        </span>{" "}
                        <span className="font-mono text-xs">
                          {m.team1?.score !== "-"
                            ? `${m.team1.score}/${m.team1.wickets} (${m.team1.overs})`
                            : "Yet to bat"}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-xs">
                          {m.team2?.name || "Team 2"}:
                        </span>{" "}
                        <span className="font-mono text-xs">
                          {m.team2?.score !== "-"
                            ? `${m.team2.score}/${m.team2.wickets} (${m.team2.overs})`
                            : "Yet to bat"}
                        </span>
                      </div>
                    </div>
               
                    <div className="text-xs text-gray-600">
                      <span>{m.status}</span>
                      <span>
                        {" "}
                        &middot;{" "}
                        {m.startTime
                          ? new Date(m.startTime).toLocaleString(undefined, {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </span>
                      <span> &middot; {m.venue}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 */