import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/context/AuthContext';
import '../styles/ps5-theme.css';

const LeaderBoard = () => {
  const { user } = useAuth();
  
  interface LeaderboardEntry {
    id: number | string;
    name: string;
    score: number;
    game: string;
  }
  
  // Initialize with empty array, will be populated from localStorage or demo accounts
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Load leaderboard data from localStorage if available
    const savedLeaderboard = localStorage.getItem('leaderboardData');
    
    // Also load demo accounts to show registered users
    const storedDemoAccounts = localStorage.getItem('demoAccounts');
    
    let allData: LeaderboardEntry[] = [];
    
    // Load existing leaderboard data if available
    if (savedLeaderboard) {
      try {
        const parsedData = JSON.parse(savedLeaderboard);
        allData = [...parsedData];
      } catch (error) {
        console.error('Error parsing leaderboard data:', error);
      }
    }
    
    // Add demo accounts that don't have scores yet
    if (storedDemoAccounts) {
      try {
        const demoAccounts = JSON.parse(storedDemoAccounts);
        
        // Add demo accounts that are not already in the leaderboard
        demoAccounts.forEach((account: { username: string }) => {
          const exists = allData.some(player => player.name === account.username);
          if (!exists) {
            // Add a default score for demo accounts without scores
            const demoScore = { 
              id: Date.now() + Math.random(), // Unique ID
              name: account.username, 
              score: Math.floor(Math.random() * 1000) + 100, // Random score between 100-1100 for demo
              game: 'Demo Account' 
            };
            allData.push(demoScore);
          }
        });
      } catch (error) {
        console.error('Error parsing demo accounts:', error);
      }
    }
    
    // If user is logged in and not in the data, add them
    if (user && user.username) {
      const userExists = allData.some(player => player.name === user.username);
      if (!userExists) {
        const userScore = { 
          id: Date.now(), 
          name: user.username, 
          score: Math.floor(Math.random() * 5000) + 1000, // Random score between 1000-6000 for demo
          game: 'Demo Account' 
        };
        allData.push(userScore);
      }
    }
    
    // Sort by score descending
    allData.sort((a, b) => b.score - a.score);
    
    // Limit to top 20
    const top20 = allData.slice(0, 20);
    
    setLeaderboardData(top20);
    
    // Save back to localStorage
    localStorage.setItem('leaderboardData', JSON.stringify(top20));
    
  }, [user]);

  const refreshLeaderboard = () => {
    // For demo purposes, we'll just reload the page to reset
    window.location.reload();
  };

  return (
    <div className="ps5-container">
      <div className="ps5-header">
        <h1 className="ps5-title">🏆 Leaderboard</h1>
        <p className="ps5-subtitle">Top players in the game hub</p>
        {user && (
          <div className="ps5-card" style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(0, 150, 255, 0.2)' }}>
            <p style={{ color: 'var(--ps5-accent-blue)', margin: 0 }}>
              <strong>Logged in as:</strong> {user.username} | <strong>Join Date:</strong> {new Date(user.joinDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {user && (
        <div className="ps5-card" style={{ maxWidth: "800px", margin: "20px auto", backgroundColor: 'rgba(0, 150, 255, 0.15)', border: '1px solid var(--ps5-accent-blue)' }}>
          <h3 style={{ color: 'var(--ps5-accent-blue)', margin: '0 0 15px 0', textAlign: 'center' }}>Your Progress</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <div style={{ fontSize: '2rem', color: 'var(--ps5-accent-blue)', fontWeight: 'bold' }}>
                {leaderboardData.findIndex(p => p.name === user.username) !== -1 ? leaderboardData.findIndex(p => p.name === user.username) + 1 : 'N/A'}
              </div>
              <div style={{ color: 'white' }}>Rank</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <div style={{ fontSize: '2rem', color: 'var(--ps5-accent-blue)', fontWeight: 'bold' }}>
                {leaderboardData.find(p => p.name === user.username) ? leaderboardData.find(p => p.name === user.username)?.score.toLocaleString() : 'N/A'}
              </div>
              <div style={{ color: 'white' }}>Best Score</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <div style={{ fontSize: '2rem', color: 'var(--ps5-accent-blue)', fontWeight: 'bold' }}>
                {leaderboardData.filter(p => p.name === user.username).length}
              </div>
              <div style={{ color: 'white' }}>Entries</div>
            </div>
          </div>
        </div>
      )}

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
              {leaderboardData.map((player, index) => {
                const isCurrentUser = user && player.name === user.username;
                return (
                  <tr 
                    key={player.id} 
                    style={{ 
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      backgroundColor: index < 3 ? "rgba(0, 247, 255, 0.1)" : isCurrentUser ? "rgba(0, 150, 255, 0.2)" : "transparent"
                    }}
                  >
                    <td style={{ padding: "15px" }}>
                      <span style={{ 
                        display: "inline-block", 
                        width: "30px", 
                        height: "30px", 
                        borderRadius: "50%", 
                        backgroundColor: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : isCurrentUser ? "#3498db" : "transparent",
                        textAlign: "center",
                        lineHeight: "30px"
                      }}>
                        {index + 1}
                      </span>
                    </td>
                    <td style={{ padding: "15px" }}>{player.name}{isCurrentUser && ' (You)'}</td>
                    <td style={{ padding: "15px", color: "var(--ps5-accent-blue)", fontWeight: "bold" }}>{player.score.toLocaleString()}</td>
                    <td style={{ padding: "15px" }}>{player.game}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "30px" }}>
        <button className="ps5-button" onClick={refreshLeaderboard}>
          Refresh Leaderboard
        </button>
      </div>
    </div>
  );
};

export default LeaderBoard;