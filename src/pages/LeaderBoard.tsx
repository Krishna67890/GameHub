import React, { useState, useEffect } from 'react';
import '../styles/ps5-theme.css';

const LeaderBoard = () => {
  const [leaderboardData, setLeaderboardData] = useState([
    { id: 1, name: 'Player1', score: 98765, game: '2048' },
    { id: 2, name: 'ProGamer', score: 87654, game: 'Snake' },
    { id: 3, name: 'GameMaster', score: 76543, game: 'Tic Tac Toe' },
    { id: 4, name: 'Champion', score: 65432, game: 'Flappy Bird' },
    { id: 5, name: 'Winner', score: 54321, game: 'Memory Card' },
  ]);

  return (
    <div className="ps5-container">
      <div className="ps5-header">
        <h1 className="ps5-title">🏆 Leaderboard</h1>
        <p className="ps5-subtitle">Top players in the game hub</p>
      </div>

      <div className="ps5-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ width: "100%" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "white" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--ps5-accent-blue)" }}>
                <th style={{ padding: "15px", textAlign: "left" }}>Rank</th>
                <th style={{ padding: "15px", textAlign: "left" }}>Player</th>
                <th style={{ padding: "15px", textAlign: "left" }}>Score</th>
                <th style={{ padding: "15px", textAlign: "left" }}>Game</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((player, index) => (
                <tr 
                  key={player.id} 
                  style={{ 
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: index < 3 ? "rgba(0, 247, 255, 0.1)" : "transparent"
                  }}
                >
                  <td style={{ padding: "15px" }}>
                    <span style={{ 
                      display: "inline-block", 
                      width: "30px", 
                      height: "30px", 
                      borderRadius: "50%", 
                      backgroundColor: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "transparent",
                      textAlign: "center",
                      lineHeight: "30px"
                    }}>
                      {index + 1}
                    </span>
                  </td>
                  <td style={{ padding: "15px" }}>{player.name}</td>
                  <td style={{ padding: "15px", color: "var(--ps5-accent-blue)", fontWeight: "bold" }}>{player.score.toLocaleString()}</td>
                  <td style={{ padding: "15px" }}>{player.game}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "30px" }}>
        <button className="ps5-button">
          Refresh Leaderboard
        </button>
      </div>
    </div>
  );
};

export default LeaderBoard;