import React from 'react';
import '../styles/ps5-theme.css';

const GameMode = () => {
  return (
    <div className="ps5-container">
      <div className="ps5-header">
        <h1 className="ps5-title">🎮 Game Modes</h1>
        <p className="ps5-subtitle">Choose your preferred gaming experience</p>
      </div>

      <div className="ps5-game-grid">
        <div className="ps5-game-card">
          <span className="ps5-game-icon">🎯</span>
          <div className="ps5-game-name">Single Player</div>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginTop: '10px' }}>
            Play against the computer
          </p>
        </div>

        <div className="ps5-game-card">
          <span className="ps5-game-icon">👥</span>
          <div className="ps5-game-name">Multiplayer</div>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginTop: '10px' }}>
            Challenge friends online
          </p>
        </div>

        <div className="ps5-game-card">
          <span className="ps5-game-icon">⏱️</span>
          <div className="ps5-game-name">Time Trial</div>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginTop: '10px' }}>
            Beat the clock
          </p>
        </div>

        <div className="ps5-game-card">
          <span className="ps5-game-icon">🏆</span>
          <div className="ps5-game-name">Tournament</div>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginTop: '10px' }}>
            Compete in events
          </p>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "30px" }}>
        <button className="ps5-button">
          Start Playing
        </button>
      </div>
    </div>
  );
};

export default GameMode;