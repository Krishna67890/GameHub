import React from 'react';
import './LeaderBoard.css';

const LeaderBoard = () => {
  // Mock leaderboard data
  const leaderboardData = [
    { id: 1, name: 'Player1', score: 1500 },
    { id: 2, name: 'Player2', score: 1450 },
    { id: 3, name: 'Player3', score: 1400 },
    { id: 4, name: 'Player4', score: 1350 },
    { id: 5, name: 'Player5', score: 1300 },
  ];

  return (
    <div className="leaderboard-page">
      <h1>Leaderboard</h1>
      <div className="leaderboard-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((player, index) => (
              <tr key={player.id} className={index === 0 ? 'first-place' : index === 1 ? 'second-place' : index === 2 ? 'third-place' : ''}>
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>{player.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderBoard;