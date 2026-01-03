import React, { useState, useEffect } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import { useGame } from '../../components/context/GameContext';
import { useAuth } from '../../components/context/AuthContext';
import '../../styles/ps5-theme.css';

const Game2048 = () => {
  const { user } = useAuth();
  const { updateGameProgress } = useGame();
  const [board, setBoard] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Initialize the game board
  useEffect(() => {
    initializeBoard();
  }, []);

  const initializeBoard = () => {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
  };

  const addRandomTile = (board: number[][]) => {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }

    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const moveLeft = (board: number[][]) => {
    const newBoard = board.map(row => [...row]);
    let moved = false;
    let newScore = score;

    for (let i = 0; i < 4; i++) {
      // Remove zeros and merge
      const row = newBoard[i].filter(val => val !== 0);
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          newScore += row[j];
          row.splice(j + 1, 1);
          
          // Check for win
          if (row[j] === 2048) {
            setGameWon(true);
            
            // Update game progress when 2048 is reached
            if (user) {
              updateGameProgress(user.username, '2048', {
                completed: true,
                score: newScore,
                lastPlayed: new Date().toISOString(),
              });
            }
          }
        }
      }
      
      // Pad with zeros
      while (row.length < 4) {
        row.push(0);
      }
      
      // Check if row changed
      for (let j = 0; j < 4; j++) {
        if (newBoard[i][j] !== row[j]) {
          moved = true;
        }
        newBoard[i][j] = row[j];
      }
    }
    
    if (moved) {
      addRandomTile(newBoard);
      setScore(newScore);
            
      // Update game progress
      if (user) {
        updateGameProgress(user.username, '2048', {
          score: newScore,
          lastPlayed: new Date().toISOString(),
        });
      }
    }
    
    return newBoard;
  };

  const moveRight = (board: number[][]) => {
    const newBoard = board.map(row => [...row].reverse());
    const movedBoard = moveLeft(newBoard);
    return movedBoard.map(row => row.reverse());
  };

  const moveUp = (board: number[][]) => {
    const transposed = transpose(board);
    const movedBoard = moveLeft(transposed);
    return transpose(movedBoard);
  };

  const moveDown = (board: number[][]) => {
    const transposed = transpose(board);
    const movedBoard = moveRight(transposed);
    return transpose(movedBoard);
  };

  const transpose = (board: number[][]) => {
    return board[0].map((_, colIndex) => board.map(row => row[colIndex]));
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (gameOver) return;

    let newBoard: number[][] = [];
    switch (event.key) {
      case 'ArrowLeft':
        newBoard = moveLeft(board);
        break;
      case 'ArrowRight':
        newBoard = moveRight(board);
        break;
      case 'ArrowUp':
        newBoard = moveUp(board);
        break;
      case 'ArrowDown':
        newBoard = moveDown(board);
        break;
      default:
        return;
    }

    setBoard(newBoard);
    
    // Check for game over
    if (isGameOver(newBoard)) {
      handleGameOver(score); // Use current score instead of newScore
    }
  };

  const handleGameOver = (finalScore: number) => {
    setGameOver(true);
    
    // Update game progress when game ends
    if (user) {
      updateGameProgress(user.username, '2048', {
        completed: false, // Game ended without reaching 2048
        score: finalScore,
        lastPlayed: new Date().toISOString(),
      });
    }
  };

  const isGameOver = (board: number[][]) => {
    // Check for empty cells
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          return false;
        }
      }
    }

    // Check for possible merges
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === board[i][j + 1]) {
          return false;
        }
      }
    }

    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 3; i++) {
        if (board[i][j] === board[i + 1][j]) {
          return false;
        }
      }
    }

    return true;
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [board, gameOver]);

  const getTileColor = (value: number) => {
    const colors: Record<number, string> = {
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e',
    };
    return colors[value] || '#3c3a32';
  };

  const getTileTextColor = (value: number) => {
    return value > 4 ? '#f9f6f2' : '#776e65';
  };

  return (
    <PS5GameWrapper 
      gameTitle="2048" 
      onBack={() => window.history.back()}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '20px'
      }}>
        {/* Game Info Panel */}
        <div className="ps5-card" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          width: '100%',
          maxWidth: '500px'
        }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--ps5-accent-blue)' }}>SCORE</h3>
            <div className="ps5-score-value" style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold',
              color: 'white'
            }}>
              {score}
            </div>
          </div>
          
          <button 
            className="ps5-button"
            onClick={initializeBoard}
            style={{ minWidth: '140px' }}
          >
            New Game
          </button>
        </div>

        {/* Win Message */}
        {gameWon && (
          <div className="ps5-card ps5-pulse" style={{ 
            background: 'linear-gradient(135deg, #00c853, #007e33)',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <h2 style={{ margin: '0 0 15px 0' }}>🎉 You Win!</h2>
            <p style={{ margin: '0 0 15px 0' }}>Reached 2048! Incredible achievement!</p>
            <button 
              className="ps5-button ps5-button--success"
              onClick={initializeBoard}
            >
              Continue Playing
            </button>
          </div>
        )}

        {/* Game Over Message */}
        {gameOver && (
          <div className="ps5-card" style={{ 
            background: 'linear-gradient(135deg, #ff5252, #d32f2f)',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <h2 style={{ margin: '0 0 15px 0' }}>💀 Game Over</h2>
            <p style={{ margin: '0 0 15px 0' }}>No more moves available!</p>
            <button 
              className="ps5-button ps5-button--danger"
              onClick={initializeBoard}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Game Board */}
        <div className="ps5-game-board" style={{ 
          display: 'inline-block',
          background: 'rgba(0, 0, 0, 0.4)'
        }}>
          {board.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: 'flex' }}>
              {row.map((cell, cellIndex) => (
                <div
                  key={cellIndex}
                  className="ps5-game-cell"
                  style={{
                    backgroundColor: getTileColor(cell),
                    color: getTileTextColor(cell),
                    fontWeight: 'bold',
                    fontSize: cell > 100 ? '1.2rem' : '1.5rem'
                  }}
                >
                  {cell !== 0 ? cell : ''}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Mobile Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: '5px', width: '150px', height: '150px' }}>
          <div></div>
          <button 
            className="ps5-button" 
            onClick={() => {
              if (!gameOver) {
                const newBoard = moveUp(board);
                setBoard(newBoard);
                if (isGameOver(newBoard)) {
                  setGameOver(true);
                }
              }
            }}
            style={{ gridColumn: '2', gridRow: '1', borderRadius: '5px' }}
            aria-label="Move Up"
          >
            ↑
          </button>
          <div></div>
          
          <button 
            className="ps5-button" 
            onClick={() => {
              if (!gameOver) {
                const newBoard = moveLeft(board);
                setBoard(newBoard);
                if (isGameOver(newBoard)) {
                  setGameOver(true);
                }
              }
            }}
            style={{ gridColumn: '1', gridRow: '2', borderRadius: '5px' }}
            aria-label="Move Left"
          >
            ←
          </button>
          <div style={{ gridColumn: '2', gridRow: '2' }}></div>
          <button 
            className="ps5-button" 
            onClick={() => {
              if (!gameOver) {
                const newBoard = moveRight(board);
                setBoard(newBoard);
                if (isGameOver(newBoard)) {
                  setGameOver(true);
                }
              }
            }}
            style={{ gridColumn: '3', gridRow: '2', borderRadius: '5px' }}
            aria-label="Move Right"
          >
            →
          </button>
          
          <div></div>
          <button 
            className="ps5-button" 
            onClick={() => {
              if (!gameOver) {
                const newBoard = moveDown(board);
                setBoard(newBoard);
                if (isGameOver(newBoard)) {
                  setGameOver(true);
                }
              }
            }}
            style={{ gridColumn: '2', gridRow: '3', borderRadius: '5px' }}
            aria-label="Move Down"
          >
            ↓
          </button>
          <div></div>
        </div>

        {/* Instructions */}
        <div className="ps5-card" style={{ 
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <p>🎮 Use arrow keys to move the tiles</p>
          <p>⚡ When two tiles with the same number touch, they merge into one!</p>
          <p>🎯 Reach 2048 to win the game</p>
        </div>
      </div>
    </PS5GameWrapper>
  );
};

export default Game2048;