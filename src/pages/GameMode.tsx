import React from 'react';
import './GameMode.css';

const GameMode = () => {
  const games = [
    { id: 'tic-tac-toe', name: 'Tic Tac Toe', description: 'Classic X and O game' },
    { id: 'snake', name: 'Snake', description: 'Classic snake game' },
    { id: 'memory-card', name: 'Memory Card', description: 'Match pairs of cards' },
    { id: 'flappy-bird', name: 'Flappy Bird', description: 'Navigate through pipes' },
    { id: 'candy-crush', name: 'Candy Crush', description: 'Match candies to score' },
    { id: 'sudoku', name: 'Sudoku', description: 'Number placement puzzle' },
    { id: 'stick-hero', name: 'Stick Hero', description: 'Bridge building challenge' },
    { id: 'maze', name: 'Maze', description: 'Find your way out' },
    { id: 'kho-kho', name: 'Kho Kho', description: 'Tag team game' },
    { id: 'cricket', name: 'Cricket', description: 'Bat and ball game' },
    { id: 'wack-a-mole', name: 'Wack a Mole', description: 'Hit the moles' },
    { id: 'wordle', name: 'Wordle', description: 'Guess the word' },
  ];

  return (
    <div className="game-mode-page">
      <h1>Choose a Game</h1>
      <div className="games-grid">
        {games.map(game => (
          <div 
            key={game.id} 
            className="game-card"
            onClick={() => window.location.href = `/game/${game.id}`}
          >
            <h3>{game.name}</h3>
            <p>{game.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameMode;