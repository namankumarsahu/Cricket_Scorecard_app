import React, { useState } from "react";
import axios from "axios";

// ✅ Deployed backend URL
const API_BASE = "https://cricket-score-api-q1rd.onrender.com";

export default function MatchForm({ onMatchAdded }) {
  const [matchData, setMatchData] = useState({
    teams: ["", ""],
    scores: [,],
    wickets: [,],
    overs: ["", ""],
    location: "",
    status: "upcoming",
    date: "",
  });

  const handleChange = (e, field, index) => {
    let value = e.target.value;

    // Parse numeric fields
    if (field === "scores" || field === "wickets") {
      value = value === "" ? "" : Number(value);
    }

    setMatchData((prev) => {
      if (Array.isArray(prev[field])) {
        const updatedArray = [...prev[field]];
        updatedArray[index] = value;
        return { ...prev, [field]: updatedArray };
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_BASE}/api/matches`, {
        ...matchData,
        startTime: new Date(matchData.date),
      });

      onMatchAdded(); // Refresh list
      setMatchData({
        teams: ["", ""],
        scores: [,],
        wickets: [,],
        overs: ["", ""],
        location: "",
        status: "upcoming",
        date: "",
      });
    } catch (err) {
      alert("Error adding match");
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow space-y-4 max-w-xl mx-auto mt-6">
      <h2 className="text-xl font-bold">Add New Match</h2>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Team A"
          value={matchData.teams[0]}
          onChange={(e) => handleChange(e, "teams", 0)}
          required
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Team B"
          value={matchData.teams[1]}
          onChange={(e) => handleChange(e, "teams", 1)}
          required
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Score A"
          value={matchData.scores[0]}
          onChange={(e) => handleChange(e, "scores", 0)}
          required
          className="border p-2 rounded w-full"
        />
        <input
          type="number"
          placeholder="Score B"
          value={matchData.scores[1]}
          onChange={(e) => handleChange(e, "scores", 1)}
          required
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Wickets A"
          value={matchData.wickets[0]}
          onChange={(e) => handleChange(e, "wickets", 0)}
          required
          className="border p-2 rounded w-full"
        />
        <input
          type="number"
          placeholder="Wickets B"
          value={matchData.wickets[1]}
          onChange={(e) => handleChange(e, "wickets", 1)}
          required
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Overs A"
          value={matchData.overs[0]}
          onChange={(e) => handleChange(e, "overs", 0)}
          required
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Overs B"
          value={matchData.overs[1]}
          onChange={(e) => handleChange(e, "overs", 1)}
          required
          className="border p-2 rounded w-full"
        />
      </div>

      <input
        type="text"
        placeholder="Location"
        value={matchData.location}
        onChange={(e) => handleChange(e, "location")}
        className="border p-2 rounded w-full"
        required
      />

      <select
        value={matchData.status}
        onChange={(e) => handleChange(e, "status")}
        className="border p-2 rounded w-full"
      >
        <option value="upcoming">Upcoming</option>
        <option value="live">Live</option>
        <option value="recent">Recent</option>
      </select>

      <input
        type="date"
        value={matchData.date}
        onChange={(e) => handleChange(e, "date")}
        className="border p-2 rounded w-full"
        required
      />

      <button
        type="submit"
        className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
      >
        Add New Match
      </button>
    </form>
  );
}
