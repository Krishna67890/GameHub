import React, { useState, useEffect, useCallback, useRef } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import PS5Animator from '../../utils/ps5-animator';
import '../../styles/ps5-theme.css';

const CandyCrushGame = () => {
  // Game configuration
  const config = {
    boardSize: 8,
    candyTypes: 6,
    initialMoves: 15,          
    scorePerCandy: 80,         
    levelTargetMultiplier: 1.5, 
    movesPerLevel: 3,          
    baseTargetScore: 1000,      
    scoreMultiplier: 1.05       
  };

  // Game state
  const [board, setBoard] = useState<any[][]>([]);
  const [selectedCandy, setSelectedCandy] = useState<{row: number, col: number} | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [movesLeft, setMovesLeft] = useState(0);
  const [targetScore, setTargetScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameActive, setGameActive] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  
  // Refs for timeouts to clear on unmount
  const timeoutRefs = useRef<number[]>([]);

  // Candy types
  const candies = [
    { color: '#ff7675', emoji: '🍎' },
    { color: '#74b9ff', emoji: '🍬' },
    { color: '#55efc4', emoji: '🍏' },
    { color: '#ffeaa7', emoji: '🍋' },
    { color: '#a29bfe', emoji: '🍇' },
    { color: '#fd79a8', emoji: '🍓' }
  ];

  const addTimeout = (callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay);
    timeoutRefs.current.push(id);
    return id;
  };

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // Initialize the game
  const initGame = useCallback(() => {
    const newLevel = 1;
    const newScore = 0;
    const newTargetScore = config.baseTargetScore;
    const newMovesLeft = config.initialMoves;
    
    setLevel(newLevel);
    setScore(newScore);
    setTargetScore(newTargetScore);
    setMovesLeft(newMovesLeft);
    setGameActive(true);
    setGameOver(false);
    setLevelComplete(false);
    
    createBoard();
  }, []);

  const createBoard = () => {
    const newBoard: any[][] = [];
    for (let row = 0; row < config.boardSize; row++) {
      newBoard[row] = [];
      for (let col = 0; col < config.boardSize; col++) {
        let type;
        do {
            type = Math.floor(Math.random() * config.candyTypes);
        } while (
            (row >= 2 && newBoard[row-1][col].type === type && newBoard[row-2][col].type === type) ||
            (col >= 2 && newBoard[row][col-1].type === type && newBoard[row][col-2].type === type)
        );
        
        newBoard[row][col] = {
          type,
          id: `${row}-${col}-${Date.now()}`, // Unique ID
          row,
          col
        };
      }
    }
    setBoard(newBoard);
  };

  // Initialize on component mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Check for matches on the board
  const findMatches = useCallback((currentBoard: any[][]) => {
    const matches: {row: number, col: number}[][] = [];
    
    // Check horizontal matches
    for (let row = 0; row < config.boardSize; row++) {
      let streak = 1;
      for (let col = 1; col < config.boardSize; col++) {
        const prev = currentBoard[row][col - 1]?.type;
        const curr = currentBoard[row][col]?.type;
        
        if (curr === prev && curr !== undefined) {
          streak++;
        } else {
          if (streak >= 3) {
            const match = [];
            for (let k = 0; k < streak; k++) {
              match.push({row, col: col - 1 - k});
            }
            matches.push(match);
          }
          streak = 1;
        }
      }
      
      if (streak >= 3) {
        const match = [];
        for (let k = 0; k < streak; k++) {
          match.push({row, col: config.boardSize - 1 - k});
        }
        matches.push(match);
      }
    }
    
    // Check vertical matches
    for (let col = 0; col < config.boardSize; col++) {
      let streak = 1;
      for (let row = 1; row < config.boardSize; row++) {
        const prev = currentBoard[row - 1][col]?.type;
        const curr = currentBoard[row][col]?.type;
        
        if (curr === prev && curr !== undefined) {
          streak++;
        } else {
          if (streak >= 3) {
            const match = [];
            for (let k = 0; k < streak; k++) {
              match.push({row: row - 1 - k, col});
            }
            matches.push(match);
          }
          streak = 1;
        }
      }
      
      if (streak >= 3) {
        const match = [];
        for (let k = 0; k < streak; k++) {
          match.push({row: config.boardSize - 1 - k, col});
        }
        matches.push(match);
      }
    }
    
    return matches;
  }, []);

  // Handle tile click
  const handleTileClick = (row: number, col: number) => {
    if (!gameActive || isAnimating) return;

    if (!selectedCandy) {
      setSelectedCandy({ row, col });
      return;
    }

    if (selectedCandy.row === row && selectedCandy.col === col) {
      setSelectedCandy(null);
      return;
    }

    // Check if adjacent
    const isAdjacent = 
      (Math.abs(row - selectedCandy.row) === 1 && col === selectedCandy.col) ||
      (Math.abs(col - selectedCandy.col) === 1 && row === selectedCandy.row);

    if (isAdjacent) {
      setIsAnimating(true);
      
      // Perform swap
      const tempBoard = board.map(r => [...r]);
      const temp = tempBoard[selectedCandy.row][selectedCandy.col];
      tempBoard[selectedCandy.row][selectedCandy.col] = tempBoard[row][col];
      tempBoard[row][col] = temp;
      
      addTimeout(() => {
        const matches = findMatches(tempBoard);
        
        if (matches.length > 0) {
            setBoard(tempBoard);
            processMatches(matches, tempBoard);
            setMovesLeft(prev => prev - 1);
            setSelectedCandy(null);
        } else {
            setIsAnimating(false);
            setSelectedCandy(null);
        }
      }, 300);
    } else {
      setSelectedCandy({ row, col });
    }
  };

  // Process matches on the board
  const processMatches = (matches: {row: number, col: number}[][], currentBoard: any[][]) => {
    const matchedCells = new Set<string>();
    matches.forEach(match => match.forEach(cell => matchedCells.add(`${cell.row},${cell.col}`)));
    
    setScore(prevScore => prevScore + (matchedCells.size * config.scorePerCandy));

    const boardAfterRemoval = currentBoard.map((row, rIndex) => 
        row.map((candy, cIndex) => matchedCells.has(`${rIndex},${cIndex}`) ? null : candy)
    );
    
    setBoard(boardAfterRemoval);
    
    addTimeout(() => {
        dropCandies(boardAfterRemoval);
    }, 300);
  };

  // Drop candies down to fill empty spaces
  const dropCandies = (currentBoard: any[][]) => {
    const newBoard = currentBoard.map(row => [...row]);

    for (let col = 0; col < config.boardSize; col++) {
      let emptyRow = -1;
      for (let row = config.boardSize - 1; row >= 0; row--) {
        if (newBoard[row][col] === null) {
          if (emptyRow === -1) emptyRow = row;
        } else if (emptyRow !== -1) {
          newBoard[emptyRow][col] = newBoard[row][col];
          newBoard[row][col] = null;
          emptyRow--;
        }
      }
    }

    for (let col = 0; col < config.boardSize; col++) {
        for (let row = 0; row < config.boardSize; row++) {
            if (newBoard[row][col] === null) {
                const type = Math.floor(Math.random() * config.candyTypes);
                newBoard[row][col] = {
                    type,
                    id: `${row}-${col}-${Date.now()}-${Math.random()}`,
                    row,
                    col
                };
            }
        }
    }

    setBoard(newBoard);

    addTimeout(() => {
        const matches = findMatches(newBoard);
        if (matches.length > 0) {
            processMatches(matches, newBoard);
        } else {
            setIsAnimating(false);
        }
    }, 300);
  };
  
  useEffect(() => {
      if (!isAnimating && gameActive) {
          if (score >= targetScore) {
              setGameActive(false);
              setLevelComplete(true);
              PS5Animator.createNotification("Level Complete! Great job!", "success");
          } else if (movesLeft === 0) {
              setGameActive(false);
              setGameOver(true);
              PS5Animator.createNotification("Game Over! Try again?", "error");
          }
      }
  }, [score, movesLeft, targetScore, isAnimating, gameActive]);

  const nextLevel = () => {
    const newLevel = level + 1;
    const newTargetScore = Math.floor(config.baseTargetScore * Math.pow(config.levelTargetMultiplier, newLevel - 1));
    const newMovesLeft = config.initialMoves + (newLevel - 1) * config.movesPerLevel;
    
    setLevel(newLevel);
    setTargetScore(newTargetScore);
    setMovesLeft(newMovesLeft);
    setGameActive(true);
    setGameOver(false);
    setLevelComplete(false);
    
    createBoard();
  };

  const restartGame = () => {
    initGame();
  };

  return (
    <PS5GameWrapper 
      gameTitle="Candy Crush" 
      onBack={() => window.history.back()}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '20px',
        height: '100%'
      }}>
        {/* Game Info Panel */}
        <div className="ps5-card" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '15px',
          width: '100%',
          maxWidth: '600px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="ps5-game-name" style={{ fontSize: '1rem', marginBottom: '5px' }}>Level</div>
            <div className="ps5-score-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--ps5-accent-blue)' }}>
              {level}
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div className="ps5-game-name" style={{ fontSize: '1rem', marginBottom: '5px' }}>Score</div>
            <div className="ps5-score-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--ps5-accent-blue)' }}>
              {score}
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div className="ps5-game-name" style={{ fontSize: '1rem', marginBottom: '5px' }}>Target</div>
            <div className="ps5-score-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--ps5-accent-blue)' }}>
              {targetScore}
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div className="ps5-game-name" style={{ fontSize: '1rem', marginBottom: '5px' }}>Moves</div>
            <div className="ps5-score-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--ps5-accent-blue)' }}>
              {movesLeft}
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="ps5-game-board" style={{ 
          display: 'grid',
          gridTemplateColumns: `repeat(${config.boardSize}, 1fr)`,
          width: 'min(80vw, 400px)',
          height: 'min(80vw, 400px)',
          gap: '4px',
          padding: '15px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '16px'
        }}>
          {board.map((row, rowIndex) => 
            row.map((candy, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`} 
                onClick={() => handleTileClick(rowIndex, colIndex)}
                style={{
                  backgroundColor: candy ? candies[candy.type].color : 'transparent',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.5s',
                  transform: selectedCandy?.row === rowIndex && selectedCandy?.col === colIndex 
                    ? 'scale(1.15) rotate(-4deg)' 
                    : 'scale(1)',
                  boxShadow: selectedCandy?.row === rowIndex && selectedCandy?.col === colIndex 
                    ? '0 0 15px 5px var(--ps5-accent-blue)' 
                    : '0 2px 4px rgba(0,0,0,0.2)',
                  opacity: candy ? 1 : 0
                }}
                className={isAnimating ? 'candy' : 'candy'}
              >
                {candy && candies[candy.type].emoji}
              </div>
            ))
          )}
        </div>

        {/* Level Complete Modal */}
        {levelComplete && (
          <div className="ps5-card ps5-pulse" style={{ 
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 100,
            backgroundColor: 'var(--ps5-gradient-success)',
            padding: '30px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <h2 style={{ margin: '0', color: 'white' }}>Level Complete!</h2>
            <p style={{ margin: '0', color: 'white' }}>Score: {score}</p>
            <button 
              className="ps5-button ps5-button--success"
              onClick={nextLevel}
            >
              Next Level
            </button>
          </div>
        )}

        {/* Game Over Modal */}
        {gameOver && (
          <div className="ps5-card" style={{ 
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 100,
            backgroundColor: 'var(--ps5-gradient-danger)',
            padding: '30px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <h2 style={{ margin: '0', color: 'white' }}>Game Over!</h2>
            <p style={{ margin: '0', color: 'white' }}>Final Score: {score}</p>
            <button 
              className="ps5-button ps5-button--danger"
              onClick={restartGame}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Game Instructions */}
        <div className="ps5-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <p>🎮 Click two adjacent candies to swap them</p>
          <p>⚡ Match 3 or more of the same candy to score points</p>
          <p>🎯 Reach the target score before running out of moves</p>
        </div>
      </div>
    </PS5GameWrapper>
  );
};

export default CandyCrushGame;