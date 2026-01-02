import React, { useState, useEffect } from 'react';

const MazeGame = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [maze, setMaze] = useState<number[][]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Generate a simple maze
  const generateMaze = () => {
    // Simple 10x10 maze (0 = path, 1 = wall)
    const newMaze = [
      [0, 1, 0, 0, 0, 1, 0, 1, 0, 0],
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
      [0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      [1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 0, 0, 0]
    ];
    
    setMaze(newMaze);
    setPlayerPosition({ x: 0, y: 0 });
    setGameCompleted(false);
    setMoves(0);
    setTime(0);
    setGameStarted(true);
  };

  // Handle keyboard input
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const { x, y } = playerPosition;
      let newX = x;
      let newY = y;

      switch (e.key) {
        case 'ArrowUp':
          newY = Math.max(0, y - 1);
          break;
        case 'ArrowDown':
          newY = Math.min(9, y + 1);
          break;
        case 'ArrowLeft':
          newX = Math.max(0, x - 1);
          break;
        case 'ArrowRight':
          newX = Math.min(9, x + 1);
          break;
        default:
          return;
      }

      // Check if move is valid (not a wall)
      if (maze[newY] && maze[newY][newX] === 0) {
        setPlayerPosition({ x: newX, y: newY });
        setMoves(prev => prev + 1);
        
        // Check if player reached the exit (bottom-right corner)
        if (newX === 9 && newY === 9) {
          setGameCompleted(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [playerPosition, maze, gameStarted, gameCompleted]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;

    const timer = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [gameStarted, gameCompleted]);

  // Initialize game on mount
  useEffect(() => {
    generateMaze();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="maze-game">
      <h2>Maze Game</h2>
      <div className="game-info">
        <div className="stats">
          <div>Moves: {moves}</div>
          <div>Time: {formatTime(time)}</div>
        </div>
        <button onClick={generateMaze}>New Game</button>
      </div>
      
      {gameCompleted && (
        <div className="game-completed">
          <p>Congratulations! You solved the maze!</p>
          <p>Moves: {moves}, Time: {formatTime(time)}</p>
          <button onClick={generateMaze}>Play Again</button>
        </div>
      )}
      
      <div className="maze-container">
        {maze.map((row, rowIndex) => (
          <div key={rowIndex} className="maze-row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`maze-cell 
                  ${cell === 1 ? 'wall' : 'path'}
                  ${playerPosition.x === colIndex && playerPosition.y === rowIndex ? 'player' : ''}
                  ${colIndex === 9 && rowIndex === 9 ? 'exit' : ''}
                `}
              >
                {playerPosition.x === colIndex && playerPosition.y === rowIndex && '🚶'}
                {colIndex === 9 && rowIndex === 9 && '🏁'}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="instructions">
        <p>Use arrow keys to move the player (🚶) to the exit (🏁).</p>
        <p>Black cells are walls you cannot pass through.</p>
      </div>
    </div>
  );
};

export default MazeGame;