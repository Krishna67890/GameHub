import React, { useState, useEffect, useCallback, useRef } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import PS5Animator from '../../utils/ps5-animator';
import '../../styles/ps5-theme.css';

const SudokuGame: React.FC = () => {
  const [grid, setGrid] = useState<(number | null)[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [fixedCells, setFixedCells] = useState<boolean[][]>([]);
  const [notes, setNotes] = useState<boolean[][][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(3);
  const [timer, setTimer] = useState(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('easy');
  const [completed, setCompleted] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  
  const timerIntervalRef = useRef<number | null>(null);

  const generateSolution = useCallback((): number[][] => {
    const board = Array(9).fill(null).map(() => Array(9).fill(0));
    
    const isValid = (row: number, col: number, num: number): boolean => {
      for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) return false;
      }
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[boxRow + i][boxCol + j] === num) return false;
        }
      }
      return true;
    };
    
    const shuffle = (array: number[]): number[] => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const solve = (): boolean => {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (const num of nums) {
                        if (isValid(row, col, num)) {
                            board[row][col] = num;
                            if (solve()) return true;
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    };
    
    solve();
    return board;
  }, []);

  const generatePuzzle = useCallback(() => {
    const fullSolution = generateSolution();
    const newGrid = fullSolution.map(row => [...row]);
    
    let cellsToRemove: number;
    switch (difficulty) {
      case 'easy': cellsToRemove = 40; break;
      case 'medium': cellsToRemove = 50; break;
      case 'hard': cellsToRemove = 55; break;
      case 'expert': cellsToRemove = 60; break;
      default: cellsToRemove = 40;
    }
    
    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (newGrid[row][col] !== 0) {
        (newGrid[row] as any)[col] = null;
        removed++;
      }
    }
    
    const newFixedCells = Array(9).fill(null).map(() => Array(9).fill(false));
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (newGrid[i][j] !== null) {
          newFixedCells[i][j] = true;
        }
      }
    }
    
    setGrid(newGrid);
    setSolution(fullSolution);
    setFixedCells(newFixedCells);
    setNotes(Array(9).fill(null).map(() => Array(9).fill(null).map(() => Array(9).fill(false))));
    setSelectedCell(null);
    setSelectedNumber(null);
    setMistakes(0);
    setHints(3);
    setCompleted(false);
    setShowWinModal(false);
    setShowGameOverModal(false);
    PS5Animator.createNotification(`New ${difficulty} Sudoku puzzle generated!`, "success");
    startTimer();
  }, [difficulty, generateSolution]);

  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimer(0);
    timerIntervalRef.current = window.setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  useEffect(() => {
    generatePuzzle();
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [difficulty]);

  const checkCompletion = useCallback(() => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] === null || grid[i][j] !== solution[i][j]) {
          return false;
        }
      }
    }
    return true;
  }, [grid, solution]);

  useEffect(() => {
      if (grid.length > 0 && checkCompletion()) {
          setCompleted(true);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          PS5Animator.createNotification("🎉 Congratulations! Puzzle solved!", "success");
      }
  }, [grid, checkCompletion]);
  
  const handleNumberClick = (number: number) => {
    if (!selectedCell || completed) return;
    
    const { row, col } = selectedCell;
    if (fixedCells[row][col]) return;

    const newGrid = grid.map(r => [...r]);
    
    if (notesMode) {
        const newNotes = notes.map(r => r.map(c => [...c]));
        newNotes[row][col][number - 1] = !newNotes[row][col][number - 1];
        setNotes(newNotes);
        if (newGrid[row][col] !== null) newGrid[row][col] = null;
    } else {
        newGrid[row][col] = newGrid[row][col] === number ? null : number;
        if (number !== solution[row][col]) {
            setMistakes(prev => {
                const newMistakes = prev + 1;
                if (newMistakes >= 3) {
                    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                }
                return newMistakes;
            });
            PS5Animator.animateGameElement(document.querySelector(`[data-row='${row}'][data-col='${col}']`), 'error');
        } 
    }
    setGrid(newGrid);
    setSelectedNumber(number);
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (grid.length === 0) {
    return <div>Loading...</div>; 
  }

  return (
    <PS5GameWrapper gameTitle="Sudoku" onBack={() => window.history.back()}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '15px',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '15px'
      }}>
        <div className="ps5-card" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', padding: '15px'}}>
          {['easy', 'medium', 'hard', 'expert'].map(d => (
            <button key={d} className={`ps5-button ${difficulty === d ? 'ps5-button--active' : ''}`} onClick={() => setDifficulty(d as any)} style={{ minWidth: '100px' }}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        <div className="ps5-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '15px'}}>
          <div style={{textAlign: 'center'}}><div style={{fontSize: '1.5rem', color: 'var(--ps5-accent-blue)'}}>{mistakes}</div><div style={{fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)'}}>Mistakes</div></div>
          <div style={{textAlign: 'center'}}><div style={{fontSize: '1.5rem', color: 'var(--ps5-accent-blue)'}}>{formatTime(timer)}</div><div style={{fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)'}}>Time</div></div>
          <div style={{textAlign: 'center'}}><div style={{fontSize: '1.5rem', color: 'var(--ps5-accent-blue)'}}>{hints}</div><div style={{fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)'}}>Hints</div></div>
        </div>

        <div className="ps5-sudoku-container ps5-card" style={{ padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(9, 40px)', gap: '2px', backgroundColor: 'rgba(0, 247, 255, 0.3)', border: '2px solid var(--ps5-accent-blue)'}}>
            {grid.map((row, rIndex) => 
                row.map((cell, cIndex) => {
                    const isFixed = fixedCells[rIndex]?.[cIndex];
                    const isSelected = selectedCell?.row === rIndex && selectedCell?.col === cIndex;
                    const hasError = !isFixed && cell !== null && cell !== solution[rIndex]?.[cIndex];
                    return (
                        <div key={`${rIndex}-${cIndex}`} 
                             className={`ps5-sudoku-cell ${isFixed ? 'fixed' : ''} ${isSelected ? 'selected' : ''} ${hasError ? 'error' : ''}`}
                             data-row={rIndex} data-col={cIndex}
                             onClick={() => setSelectedCell({row: rIndex, col: cIndex})}
                             style={{
                                 width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                 fontSize: '1.5rem', fontWeight: 'bold', cursor: isFixed ? 'default' : 'pointer',
                                 backgroundColor: isSelected ? 'rgba(0, 247, 255, 0.3)' : isFixed ? 'rgba(255,255,255,0.1)' : 'transparent',
                                 color: hasError ? 'var(--ps5-danger)' : 'white',
                                 borderRight: (cIndex + 1) % 3 === 0 && cIndex !== 8 ? '2px solid var(--ps5-accent-blue)' : '1px solid rgba(0, 247, 255, 0.3)',
                                 borderBottom: (rIndex + 1) % 3 === 0 && rIndex !== 8 ? '2px solid var(--ps5-accent-blue)' : '1px solid rgba(0, 247, 255, 0.3)',
                             }}>
                             {cell}
                        </div>
                    );
                })
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            <button className={`ps5-button ${notesMode ? 'ps5-button--active' : ''}`} onClick={() => setNotesMode(!notesMode)}>Notes</button>
            <button className="ps5-button ps5-button--danger" onClick={() => {if(selectedCell) handleNumberClick(null as any)}}>Erase</button>
            <button className="ps5-button ps5-button--success" onClick={() => {if(selectedCell && hints > 0 && grid[selectedCell.row][selectedCell.col] === null){ setHints(h => h-1); handleNumberClick(solution[selectedCell.row][selectedCell.col])}}} disabled={hints <= 0}>Hint ({hints})</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', width: '100%', maxWidth: '400px'}}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button key={num} className={`ps5-button ${selectedNumber === num ? 'ps5-button--active' : ''}`} onClick={() => handleNumberClick(num)} style={{ aspectRatio: '1' }}>
              {num}
            </button>
          ))}
          <button className="ps5-button ps5-button--danger" onClick={() => {if(selectedCell) handleNumberClick(null as any)}}>Clear</button>
        </div>

        <button className="ps5-button" onClick={generatePuzzle} style={{ width: '100%', maxWidth: '300px' }}>New Game</button>

        {completed && (
          <div className="ps5-card" style={{ padding: '20px', backgroundColor: 'var(--ps5-gradient-success)', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ margin: '0 0 15px', color: 'white' }}>🎉 Congratulations!</h2>
            <p style={{ margin: '0 0 15px', color: 'white' }}>You solved the puzzle in {formatTime(timer)} with {mistakes} mistakes!</p>
            <button className="ps5-button ps5-button--success" onClick={generatePuzzle}>Play Again</button>
          </div>
        )}

        {mistakes >= 3 && !completed && (
          <div className="ps5-card" style={{ padding: '20px', backgroundColor: 'var(--ps5-gradient-danger)', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ margin: '0 0 15px', color: 'white' }}>💀 Game Over</h2>
            <p style={{ margin: '0 0 15px', color: 'white' }}>You made too many mistakes. Try again!</p>
            <button className="ps5-button ps5-button--danger" onClick={generatePuzzle}>Try Again</button>
          </div>
        )}
      </div>
    </PS5GameWrapper>
  );
};

export default SudokuGame;