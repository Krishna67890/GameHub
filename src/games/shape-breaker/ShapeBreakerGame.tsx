import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaArrowLeft, FaArrowRight, FaArrowDown, FaRedo, FaPause, FaPlay, FaSync } from 'react-icons/fa';
import './ShapeBreakerGame.css';

// Game constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const SHAPES = [
  { name: 'I', color: 'shape-i', matrix: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]] },
  { name: 'J', color: 'shape-j', matrix: [[1,0,0], [1,1,1], [0,0,0]] },
  { name: 'L', color: 'shape-l', matrix: [[0,0,1], [1,1,1], [0,0,0]] },
  { name: 'O', color: 'shape-o', matrix: [[1,1], [1,1]] },
  { name: 'S', color: 'shape-s', matrix: [[0,1,1], [1,1,0], [0,0,0]] },
  { name: 'T', color: 'shape-t', matrix: [[0,1,0], [1,1,1], [0,0,0]] },
  { name: 'Z', color: 'shape-z', matrix: [[1,1,0], [0,1,1], [0,0,0]] }
];

const ShapeBreakerGame: React.FC = () => {
  // Game state
  const [board, setBoard] = useState<(string | null)[][]>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  );
  const [currentShape, setCurrentShape] = useState<any>(null);
  const [nextShape, setNextShape] = useState<any>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [rows, setRows] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  
  const gameLoopRef = useRef<number | null>(null);
  const dropIntervalRef = useRef(1000);

  // Initialize game
  useEffect(() => {
    const savedHighScore = localStorage.getItem('shapeBreakerHighScore');
    if (savedHighScore) setHighScore(parseInt(savedHighScore));
    
    initGame();
    
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);

  const initGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
    setScore(0);
    setLevel(1);
    setRows(0);
    setIsGameOver(false);
    setIsPaused(false);
    dropIntervalRef.current = 1000;
    
    const firstShape = getRandomShape();
    const secondShape = getRandomShape();
    setNextShape(secondShape);
    spawnShape(firstShape);
    
    startGameLoop();
  };

  const getRandomShape = () => {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return JSON.parse(JSON.stringify(shape));
  };

  const spawnShape = (shape: any) => {
    setCurrentShape(shape);
    const startX = Math.floor(BOARD_WIDTH / 2) - Math.floor(shape.matrix[0].length / 2);
    setPosition({ x: startX, y: 0 });
    
    if (!isValidMove(startX, 0, shape.matrix, board)) {
      setIsGameOver(true);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
  };

  const startGameLoop = () => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    gameLoopRef.current = window.setInterval(moveDown, dropIntervalRef.current);
  };

  const isValidMove = (x: number, y: number, matrix: number[][], currentBoard: (string | null)[][]) => {
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col]) {
          const boardX = x + col;
          const boardY = y + row;
          
          if (
            boardX < 0 || 
            boardX >= BOARD_WIDTH || 
            boardY >= BOARD_HEIGHT ||
            (boardY >= 0 && currentBoard[boardY][boardX] !== null)
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const moveDown = () => {
    if (isPaused || isGameOver) return;
    
    if (isValidMove(position.x, position.y + 1, currentShape.matrix, board)) {
      setPosition(prev => ({ ...prev, y: prev.y + 1 }));
    } else {
      lockShape();
    }
  };

  const moveHorizontal = (dir: number) => {
    if (isPaused || isGameOver) return;
    if (isValidMove(position.x + dir, position.y, currentShape.matrix, board)) {
      setPosition(prev => ({ ...prev, x: prev.x + dir }));
    }
  };

  const rotate = () => {
    if (isPaused || isGameOver) return;
    
    const matrix = currentShape.matrix;
    const rotatedMatrix = matrix[0].map((_: any, index: number) => 
      matrix.map((row: any[]) => row[index]).reverse()
    );
    
    if (isValidMove(position.x, position.y, rotatedMatrix, board)) {
      setCurrentShape((prev: any) => ({ ...prev, matrix: rotatedMatrix }));
    }
  };

  const drop = () => {
    if (isPaused || isGameOver) return;
    let dropY = position.y;
    while (isValidMove(position.x, dropY + 1, currentShape.matrix, board)) {
      dropY++;
    }
    setPosition(prev => ({ ...prev, y: dropY }));
    lockShape(dropY); // Pass the final Y position
  };

  const lockShape = (finalY?: number) => {
    const yPos = finalY !== undefined ? finalY : position.y;
    const newBoard = board.map(row => [...row]);
    
    // Place shape on board
    for (let row = 0; row < currentShape.matrix.length; row++) {
      for (let col = 0; col < currentShape.matrix[row].length; col++) {
        if (currentShape.matrix[row][col]) {
          const boardY = yPos + row;
          if (boardY >= 0) {
            newBoard[boardY][position.x + col] = currentShape.color;
          }
        }
      }
    }
    
    // Check for cleared rows
    let rowsCleared = 0;
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (newBoard[row].every(cell => cell !== null)) {
        newBoard.splice(row, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(null));
        rowsCleared++;
        row++; // Recheck same row index
      }
    }
    
    if (rowsCleared > 0) {
      const points = rowsCleared * 100 * level;
      const newScore = score + points;
      setScore(newScore);
      setRows(prev => prev + rowsCleared);
      
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('shapeBreakerHighScore', newScore.toString());
      }
      
      // Level up logic
      const newLevel = Math.floor((rows + rowsCleared) / 10) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        dropIntervalRef.current = Math.max(100, 1000 - (newLevel - 1) * 100);
        startGameLoop();
      }
    }
    
    setBoard(newBoard);
    
    // Next shape
    const newShape = nextShape;
    setNextShape(getRandomShape());
    spawnShape(newShape);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      
      switch(e.key) {
        case 'ArrowLeft': moveHorizontal(-1); break;
        case 'ArrowRight': moveHorizontal(1); break;
        case 'ArrowDown': moveDown(); break;
        case 'ArrowUp': rotate(); break;
        case ' ': drop(); break;
        case 'p': setIsPaused(prev => !prev); break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [position, currentShape, board, isPaused, isGameOver]);

  // Render board with current falling piece
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    if (currentShape && !isGameOver) {
      for (let row = 0; row < currentShape.matrix.length; row++) {
        for (let col = 0; col < currentShape.matrix[row].length; col++) {
          if (currentShape.matrix[row][col]) {
            const boardY = position.y + row;
            const boardX = position.x + col;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentShape.color;
            }
          }
        }
      }
    }
    
    return displayBoard;
  };

  return (
    <div className="shape-breaker-game">
      <div className="sb-container">
        <div className="sb-header">
          <h1 className="sb-title">Shape Breaker</h1>
          <div className="sb-info">
            <div className="sb-info-box">
              <div className="sb-label">SCORE</div>
              <div className="sb-value">{score}</div>
            </div>
            <div className="sb-info-box">
              <div className="sb-label">LEVEL</div>
              <div className="sb-value">{level}</div>
            </div>
            <div className="sb-info-box">
              <div className="sb-label">ROWS</div>
              <div className="sb-value">{rows}</div>
            </div>
          </div>
        </div>

        <div className="sb-content">
          <div className="sb-board-container">
            <div className="sb-board">
              {renderBoard().map((row, rIndex) => (
                row.map((cell, cIndex) => (
                  <div 
                    key={`${rIndex}-${cIndex}`} 
                    className={`sb-cell ${cell ? 'filled ' + cell : ''}`}
                  />
                ))
              ))}
            </div>
            {isGameOver && (
              <div className="sb-overlay">
                <h2>Game Over</h2>
                <p>Final Score: {score}</p>
                <button className="sb-action-btn" onClick={initGame}>Play Again</button>
              </div>
            )}
            {isPaused && !isGameOver && (
              <div className="sb-overlay">
                <h2>Paused</h2>
                <button className="sb-action-btn" onClick={() => setIsPaused(false)}>Resume</button>
              </div>
            )}
          </div>

          <div className="sb-sidebar">
            <div className="sb-panel">
              <h3 className="sb-panel-title">Next Shape</h3>
              <div className="sb-next-shape">
                {Array(4).fill(null).map((_, r) => (
                  Array(4).fill(null).map((_, c) => {
                    const filled = nextShape && nextShape.matrix[r] && nextShape.matrix[r][c];
                    return (
                      <div 
                        key={`next-${r}-${c}`}
                        className={`sb-cell ${filled ? 'filled ' + nextShape.color : ''}`}
                      />
                    );
                  })
                ))}
              </div>
            </div>

            <div className="sb-panel">
              <h3 className="sb-panel-title">Controls</h3>
              <div className="sb-controls-grid">
                <button className="sb-btn" onClick={() => rotate()}>↻</button>
                <button className="sb-btn" onClick={() => moveDown()}>↓</button>
                <button className="sb-btn" onClick={() => drop()}><span style={{fontWeight:'bold'}}>SPACE</span></button>
                <button className="sb-btn" onClick={() => moveHorizontal(-1)}>←</button>
                <button className="sb-btn" onClick={() => setIsPaused(!isPaused)}>{isPaused ? '▶' : '⏸'}</button>
                <button className="sb-btn" onClick={() => moveHorizontal(1)}>→</button>
                <button className="sb-btn sb-btn-wide" onClick={initGame}>↺ Restart</button>
              </div>
            </div>
            
            <div className="sb-panel">
               <h3 className="sb-panel-title">Stats</h3>
               <div style={{display:'flex', justifyContent:'space-between', padding:'5px'}}>
                 <span className="sb-label">High Score:</span>
                 <span className="sb-value" style={{fontSize:'16px'}}>{highScore}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShapeBreakerGame;