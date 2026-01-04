import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ps5-theme.css';

const GameMode = () => {
  const navigate = useNavigate();
  
  const handleGameModeClick = (path: string) => {
    navigate(path);
  };
  
  return (
    <div className="ps5-container">
      <div className="ps5-header">
        <h1 className="ps5-title">🎮 Game Modes</h1>
        <p className="ps5-subtitle">Choose your preferred gaming experience</p>
      </div>

      <div className="ps5-game-grid">
        <div className="ps5-game-card" style={{ cursor: 'pointer' }} onClick={() => handleGameModeClick('/games') /* This would lead to the games list */ }>
          <span className="ps5-game-icon">🎯</span>
          <div className="ps5-game-name">Single Player</div>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginTop: '10px' }}>
            Play against the computer
          </p>
        </div>

        <div className="ps5-game-card" style={{ cursor: 'pointer' }} onClick={() => handleGameModeClick('/games') /* This would lead to the games list */ }>
          <span className="ps5-game-icon">👥</span>
          <div className="ps5-game-name">Multiplayer</div>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginTop: '10px' }}>
            Challenge friends online
          </p>
        </div>

        <div className="ps5-game-card" style={{ cursor: 'pointer' }} onClick={() => handleGameModeClick('/external-games')}>
          <span className="ps5-game-icon">🌐</span>
          <div className="ps5-game-name">External Games</div>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginTop: '10px' }}>
            Play games from partner sites
          </p>
        </div>

        <div className="ps5-game-card" style={{ cursor: 'pointer' }} onClick={() => handleGameModeClick('/games') /* This would lead to the games list */ }>
          <span className="ps5-game-icon">🏆</span>
          <div className="ps5-game-name">Tournament</div>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginTop: '10px' }}>
            Compete in events
          </p>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "30px" }}>
        <button className="ps5-button" onClick={() => navigate('/games')}>
          Start Playing
        </button>
      </div>
    </div>
  );
};

export default GameMode;