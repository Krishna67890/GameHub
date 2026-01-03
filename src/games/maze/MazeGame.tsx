import React, { useState, useEffect } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import '../../styles/ps5-theme.css';

const MazeGame = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [maze, setMaze] = useState<number[][]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [totalLevels, setTotalLevels] = useState(10);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // Generate a simple maze
  const generateMaze = (currentLevel = level) => {
    // Different mazes for each level
    const mazes = [
      // Level 1 - Easy
      [
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
      ],
      // Level 2
      [
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
        [0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
        [0, 1, 1, 1, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
        [1, 1, 0, 1, 1, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 1, 1, 0, 1, 0],
        [0, 1, 1, 1, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0, 0, 1, 0]
      ],
      // Level 3
      [
        [0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 1, 0, 1, 1, 0, 0, 1, 0, 1],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 1, 1, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [0, 1, 1, 1, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 1, 1, 0],
        [1, 1, 0, 1, 1, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0, 0, 1, 1, 0]
      ],
      // Level 4
      [
        [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 1, 0, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
        [1, 1, 1, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
      ],
      // Level 5
      [
        [0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 1, 0, 1, 0, 1, 0, 1, 1, 0],
        [0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
        [1, 1, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 1, 0],
        [1, 1, 0, 0, 0, 0, 1, 0, 1, 0],
        [0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 0]
      ],
      // Level 6
      [
        [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
        [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 0, 1, 1, 0],
        [0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
        [0, 1, 1, 1, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 1, 0],
        [1, 1, 0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0, 1, 0]
      ],
      // Level 7
      [
        [0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
        [0, 1, 0, 1, 1, 0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        [1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 1, 1, 1, 1, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 1, 1, 0, 1, 0],
        [1, 1, 1, 1, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0, 1, 0],
        [1, 1, 0, 0, 0, 0, 1, 0, 0, 0]
      ],
      // Level 8
      [
        [0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
        [0, 1, 1, 1, 0, 1, 1, 0, 1, 0],
        [0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
        [1, 1, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 1, 1, 1, 0],
        [0, 1, 1, 1, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 1, 0],
        [1, 1, 0, 0, 0, 0, 1, 0, 1, 0],
        [0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 0]
      ],
      // Level 9
      [
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        [1, 1, 1, 0, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 1, 1, 1, 0, 1, 0],
        [1, 1, 0, 0, 0, 0, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 1, 1, 1, 0, 0, 0]
      ],
      // Level 10 - Hardest
      [
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 1, 1, 0],
        [0, 1, 0, 1, 1, 1, 0, 0, 1, 0],
        [0, 1, 0, 0, 0, 1, 1, 0, 1, 0],
        [0, 1, 1, 1, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0, 1, 0],
        [1, 1, 0, 0, 0, 0, 1, 0, 0, 0]
      ]
    ];
    
    const selectedMaze = mazes[(currentLevel - 1) % mazes.length];
    setMaze(selectedMaze);
    setPlayerPosition({ x: 0, y: 0 });
    setGameCompleted(false);
    setMoves(0);
    setTime(0);
    setGameStarted(true);
    setLevel(currentLevel);
  };
  
  const movePlayer = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameStarted !== true || gameCompleted) return;
    
    const { x, y } = playerPosition;
    let newX = x;
    let newY = y;

    switch (direction) {
      case 'up':
        newY = Math.max(0, y - 1);
        break;
      case 'down':
        newY = Math.min(9, y + 1);
        break;
      case 'left':
        newX = Math.max(0, x - 1);
        break;
      case 'right':
        newX = Math.min(9, x + 1);
        break;
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

  // Handle keyboard and touch input
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

    const handleTouchStart = (e: TouchEvent) => {
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return;

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      };

      const diffX = touchEnd.x - touchStart.x;
      const diffY = touchEnd.y - touchStart.y;

      // Determine swipe direction based on greatest movement
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 20) {
          // Right swipe
          movePlayer('right');
        } else if (diffX < -20) {
          // Left swipe
          movePlayer('left');
        }
      } else {
        // Vertical swipe
        if (diffY > 20) {
          // Down swipe
          movePlayer('down');
        } else if (diffY < -20) {
          // Up swipe
          movePlayer('up');
        }
      }

      setTouchStart(null);
    };

    const movePlayer = (direction: 'up' | 'down' | 'left' | 'right') => {
      const { x, y } = playerPosition;
      let newX = x;
      let newY = y;

      switch (direction) {
        case 'up':
          newY = Math.max(0, y - 1);
          break;
        case 'down':
          newY = Math.min(9, y + 1);
          break;
        case 'left':
          newX = Math.max(0, x - 1);
          break;
        case 'right':
          newX = Math.min(9, x + 1);
          break;
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
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [playerPosition, maze, gameStarted, gameCompleted, touchStart]);

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
    <PS5GameWrapper gameTitle="Advanced Maze" onBack={() => window.history.back()}>
      <div className="maze-game" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <h2 style={{ color: 'var(--ps5-accent-blue)', textShadow: '0 0 10px var(--ps5-accent-blue)' }}>Maze Game</h2>
        <div className="game-info" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '500px' }}>
          <div className="stats" style={{ display: 'flex', gap: '20px', fontSize: '1.2rem' }}>
            <div style={{ color: 'white' }}>Moves: <span style={{ color: 'var(--ps5-accent-blue)' }}>{moves}</span></div>
            <div style={{ color: 'white' }}>Time: <span style={{ color: 'var(--ps5-accent-blue)' }}>{formatTime(time)}</span></div>
          </div>
          <button className="ps5-button" onClick={() => generateMaze(1)}>New Game</button>
        </div>
      
      {gameCompleted && (
        <div className="ps5-card" style={{ padding: '20px', backgroundColor: 'var(--ps5-gradient-success)', textAlign: 'center' }}>
          <p>Congratulations! You solved Level {level}!</p>
          <p>Moves: {moves}, Time: {formatTime(time)}</p>
          {level < totalLevels ? (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="ps5-button" onClick={() => generateMaze(level + 1)}>Next Level</button>
              <button className="ps5-button" onClick={() => generateMaze(level)}>Replay</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <p style={{ color: 'white' }}>🎉 You completed all levels! 🎉</p>
              <button className="ps5-button" onClick={() => generateMaze(1)}>Play Again</button>
            </div>
          )}
        </div>
      )}
      
      <div className="maze-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '500px' }}>
        {maze.map((row, rowIndex) => (
          <div key={rowIndex} className="maze-row" style={{ display: 'flex' }}>
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`maze-cell 
                  ${cell === 1 ? 'wall' : 'path'}
                  ${playerPosition.x === colIndex && playerPosition.y === rowIndex ? 'player' : ''}
                  ${colIndex === 9 && rowIndex === 9 ? 'exit' : ''}
                `}
                style={{
                  width: '30px',
                  height: '30px',
                  border: '1px solid #333',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: cell === 1 ? '#333' : '#f0f0f0',
                  color: 'black',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  boxSizing: 'border-box',
                  ...(playerPosition.x === colIndex && playerPosition.y === rowIndex ? { backgroundColor: '#4CAF50', color: 'white' } : {}),
                  ...(colIndex === 9 && rowIndex === 9 ? { backgroundColor: '#FFC107' } : {})
                }}
              >
                {playerPosition.x === colIndex && playerPosition.y === rowIndex && '🚶'}
                {colIndex === 9 && rowIndex === 9 && '🏁'}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="instructions ps5-card" style={{ maxWidth: '500px', padding: '15px', textAlign: 'center' }}>
        <p>Use arrow keys to move the player (🚶) to the exit (🏁).</p>
        <p>Black cells are walls you cannot pass through.</p>
      </div>
              
      {/* Mobile Controls */}
      {gameStarted && !gameCompleted && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: '5px', width: '150px', height: '150px' }}>
          <div></div>
          <button 
            className="ps5-button" 
            onClick={() => movePlayer('up')}
            style={{ gridColumn: '2', gridRow: '1', borderRadius: '5px' }}
            aria-label="Move Up"
          >
            ↑
          </button>
          <div></div>
                  
          <button 
            className="ps5-button" 
            onClick={() => movePlayer('left')}
            style={{ gridColumn: '1', gridRow: '2', borderRadius: '5px' }}
            aria-label="Move Left"
          >
            ←
          </button>
          <div style={{ gridColumn: '2', gridRow: '2' }}></div>
          <button 
            className="ps5-button" 
            onClick={() => movePlayer('right')}
            style={{ gridColumn: '3', gridRow: '2', borderRadius: '5px' }}
            aria-label="Move Right"
          >
            →
          </button>
                  
          <div></div>
          <button 
            className="ps5-button" 
            onClick={() => movePlayer('down')}
            style={{ gridColumn: '2', gridRow: '3', borderRadius: '5px' }}
            aria-label="Move Down"
          >
            ↓
          </button>
          <div></div>
        </div>
      )}
    </div>
    </PS5GameWrapper>
  );
};

export default MazeGame;