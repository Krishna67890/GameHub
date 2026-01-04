import React from 'react';
import '../styles/ps5-theme.css';

const ExternalGames = () => {
  const externalGames = [
    { name: 'Bricks Adder', icon: '🧱', url: 'https://krishnablogy.blogspot.com/2025/12/bricks-adder.html' },
    { name: 'Bow and Arrow Game', icon: '🏹', url: 'https://krishnablogy.blogspot.com/2025/11/bow-and-arrow-game.html' },
    { name: 'Troll Game', icon: '👹', url: 'https://krishnablogy.blogspot.com/2025/11/troll-game.html' },
    { name: 'Wack a Hole and Wordle', icon: '🎯', url: 'https://krishnablogy.blogspot.com/2025/06/wack-whole-and-wordle.html' },
    { name: 'Stick Hero Launcher', icon: '🦸', url: 'https://krishnablogy.blogspot.com/2025/05/stick-hero-launcher.html' },
    { name: 'Sudoku Game', icon: '🧩', url: 'https://krishnablogy.blogspot.com/2025/05/air-force-game.html' },
    { name: 'Candy Crush', icon: '🍬', url: 'https://krishnablogy.blogspot.com/2025/05/pac-man-game.html' },
    { name: 'Flappy Bird', icon: '🐦', url: 'https://krishnablogy.blogspot.com/2025/05/flappy-bird.html' },
    { name: 'Bubble Shooter Game', icon: '🔫', url: 'https://krishnablogy.blogspot.com/2025/01/bubble-shooter-game.html' },
    { name: 'Snake Ladder Game', icon: '🐍', url: 'https://krishnablogy.blogspot.com/2024/09/snake-and-ladder-game.html' },
    { name: 'Kho Kho Game', icon: '🏃', url: 'https://krishnablogy.blogspot.com/2024/09/kho-kho-game.html' },
    { name: 'Balloon Goes Up Game', icon: '🎈', url: 'https://krishnablogy.blogspot.com/2024/09/boll-goes-up-game.html' },
    { name: 'Brick Breaker Game', icon: '🧱', url: 'https://krishnablogy.blogspot.com/2024/09/brick-breaker-game.html' },
    { name: 'Word Search Game', icon: '🔍', url: 'https://krishnablogy.blogspot.com/2024/09/word-search-game.html' },
    { name: 'Pong Game', icon: '🏓', url: 'https://krishnablogy.blogspot.com/2024/09/pong-game.html' },
    { name: 'Cricket Game', icon: '🏏', url: 'https://krishnablogy.blogspot.com/2024/09/cricket-game.html' },
    { name: 'Memory Card Game', icon: '🧠', url: 'https://krishnablogy.blogspot.com/2024/09/memory-card-game.html' },
    { name: 'Maze Game', icon: '🌀', url: 'https://krishnablogy.blogspot.com/2024/08/maze-game.html' },
    { name: 'Hangman Game', icon: '💀', url: 'https://krishnablogy.blogspot.com/2024/08/hangman-game.html' },
    { name: 'Tic Tac Toe', icon: '❌', url: 'https://krishnablogy.blogspot.com/2024/08/tic-tac-toe-game.html' },
    { name: '2048 Game', icon: '🔢', url: 'https://krishnablogy.blogspot.com/2024/08/2048-body-font-family-arial-helvetica.html' },
    { name: 'Snake Game', icon: '🐍', url: 'https://krishnablogy.blogspot.com/2024/05/snake-game-with-pycharm.html' },
    { name: 'Shooting Game', icon: '🔫', url: 'https://krishnablogy.blogspot.com/2024/01/trial.html' },
  ];

  const openGame = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="ps5-container">
      <div className="ps5-header">
        <h1 className="ps5-title">🎮 External Games</h1>
        <p className="ps5-subtitle">Play games from our partner websites</p>
      </div>

      <div className="ps5-game-grid">
        {externalGames.map((game, index) => (
          <div 
            key={index}
            className="ps5-game-card"
            onClick={() => openGame(game.url)}
            style={{ cursor: 'pointer' }}
          >
            <span className="ps5-game-icon">{game.icon}</span>
            <div className="ps5-game-name">{game.name}</div>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', marginTop: '8px' }}>
              Click to play
            </p>
          </div>
        ))}
      </div>

      <div style={{ 
        textAlign: 'center', 
        padding: '30px', 
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '14px'
      }}>
        <p>⚠️ Note: These games open in a new tab</p>
        <p>Some games may require external websites to function properly</p>
      </div>
    </div>
  );
};

export default ExternalGames;