import React, { useState, useEffect, useCallback, useRef } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import '../../styles/ps5-theme.css';
import './KhoKhoGame.css';

const KhoKhoGame = () => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'completed' | 'tutorial'>('idle');
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [powerUps, setPowerUps] = useState(true);
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [runners, setRunners] = useState([
    { id: 1, x: 3, y: 3, active: true },
    { id: 2, x: 5, y: 5, active: true },
    { id: 3, x: 7, y: 7, active: true },
    { id: 4, x: 2, y: 6, active: true },
    { id: 5, x: 6, y: 2, active: true },
    { id: 6, x: 4, y: 1, active: true },
    { id: 7, x: 1, y: 4, active: true },
  ]);
  
  const gameBoardRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number>();
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  // Add runner movement logic
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const moveRunners = () => {
      setRunners(prevRunners => 
        prevRunners.map(runner => {
          if (!runner.active) return runner; // Don't move caught runners
          
          // Random movement: 0: up, 1: right, 2: down, 3: left
          const direction = Math.floor(Math.random() * 4);
          let newX = runner.x;
          let newY = runner.y;
          
          switch (direction) {
            case 0: // up
              newY = Math.max(0, runner.y - 1);
              break;
            case 1: // right
              newX = Math.min(7, runner.x + 1);
              break;
            case 2: // down
              newY = Math.min(7, runner.y + 1);
              break;
            case 3: // left
              newX = Math.max(0, runner.x - 1);
              break;
          }
          
          return { ...runner, x: newX, y: newY };
        })
      );
    };
    
    // Move runners every 1.5 seconds
    const runnerMovementInterval = setInterval(moveRunners, 1500);
    
    return () => clearInterval(runnerMovementInterval);
  }, [gameState]);

  // Timer for the game
  useEffect(() => {
    let timer: number;
    if (gameState === 'playing') {
      timer = window.setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTime(0);
    setPlayerPosition({ x: 1, y: 1 });
    setRunners([
      { id: 1, x: 3, y: 3, active: true },
      { id: 2, x: 5, y: 5, active: true },
      { id: 3, x: 7, y: 7, active: true },
      { id: 4, x: 2, y: 6, active: true },
      { id: 5, x: 6, y: 2, active: true },
      { id: 6, x: 4, y: 1, active: true },
      { id: 7, x: 1, y: 4, active: true },
    ]);
  };

  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    setTime(0);
    setPlayerPosition({ x: 1, y: 1 });
    setRunners([
      { id: 1, x: 3, y: 3, active: true },
      { id: 2, x: 5, y: 5, active: true },
      { id: 3, x: 7, y: 7, active: true },
      { id: 4, x: 2, y: 6, active: true },
      { id: 5, x: 6, y: 2, active: true },
      { id: 6, x: 4, y: 1, active: true },
      { id: 7, x: 1, y: 4, active: true },
    ]);
  };
  
  const pauseGame = () => {
    setGameState('paused');
  };
  
  const resumeGame = () => {
    setGameState('playing');
  };

  const togglePowerUps = () => {
    setPowerUps(!powerUps);
  };

  const showTutorial = () => {
    // Show tutorial in the game status area instead of alert
    setGameState('tutorial');
    setTimeout(() => {
      setGameState('idle');
    }, 5000);
  };

  const movePlayer = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState !== 'playing') return;
    
    setPlayerPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;
      
      switch (direction) {
        case 'up':
          newY = Math.max(0, prev.y - 1);
          break;
        case 'down':
          newY = Math.min(7, prev.y + 1);
          break;
        case 'left':
          newX = Math.max(0, prev.x - 1);
          break;
        case 'right':
          newX = Math.min(7, prev.x + 1);
          break;
      }
      
      return { x: newX, y: newY };
    });
  };

  // Check for catches
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    setRunners(prevRunners => {
      const updatedRunners = [...prevRunners];
      let caughtRunner = false;
      
      for (let i = 0; i < updatedRunners.length; i++) {
        const runner = updatedRunners[i];
        if (runner.active && 
            runner.x === playerPosition.x && 
            runner.y === playerPosition.y) {
          updatedRunners[i] = { ...runner, active: false };
          caughtRunner = true;
        }
      }
      
      if (caughtRunner) {
        setScore(prev => prev + 100);
        
        // Check if all runners are caught
        if (updatedRunners.every(r => !r.active)) {
          setGameState('completed');
        }
      }
      
      return updatedRunners;
    });
  }, [playerPosition, gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          movePlayer('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePlayer('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          movePlayer('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePlayer('right');
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState]);

  // Touch controls for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || gameState !== 'playing') return;

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <PS5GameWrapper gameTitle="Ultimate Kho Kho Pro" onBack={() => window.history.back()}>
        <div className="game-container" style={{color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', gap: '20px'}}>
            <div className="game-header" style={{width: '100%', maxWidth: '500px'}}>
                <h1 className="game-title" style={{color: 'var(--ps5-accent-blue)', textShadow: '0 0 10px var(--ps5-accent-blue)', textAlign: 'center'}}>Ultimate Kho Kho Pro</h1>
                <div className="game-stats" style={{display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap'}}>
                    <div className="stat-item" style={{color: 'white'}}>🏃 <span id="runnerCount">{runners.filter(r => r.active).length}</span> Runners Left</div>
                    <div className="stat-item" style={{color: 'white'}}>⏱️ <span id="gameTimer">{formatTime(time)}</span></div>
                    <div className="stat-item" style={{color: 'white'}}>🌟 <span id="gameScore">{score}</span> Points</div>
                </div>
            </div>

            <div 
              className="game-board-container" 
              style={{ width: 'min(90vw, 400px)', height: 'min(90vw, 400px)', position: 'relative', border: '3px solid var(--ps5-accent-blue)', borderRadius: '10px', overflow: 'hidden' }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
                <div className="game-board" style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(8, 1fr)', width: '100%', height: '100%' }}>
                  {Array.from({ length: 64 }).map((_, index) => {
                    const x = index % 8;
                    const y = Math.floor(index / 8);
                    
                    const isPlayer = playerPosition.x === x && playerPosition.y === y;
                    const runner = runners.find(r => r.x === x && r.y === y && r.active);
                    
                    return (
                      <div 
                        key={index} 
                        className="cell" 
                        style={{
                          border: '1px solid rgba(255,255,255,0.1)',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: isPlayer ? 'var(--ps5-accent-blue)' : (runner ? '#FF5722' : 'rgba(255,255,255,0.05)'),
                        }}
                      >
                        {isPlayer && '🏃‍♂️'}
                        {runner && !isPlayer && '🏃'}
                      </div>
                    );
                  })}
                </div>
            </div>

            <div className="controls" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '100%', maxWidth: '500px'}}>
                <div className="action-buttons" style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px'}}>
                    {gameState === 'idle' && (
                      <button className="ps5-button" onClick={startGame}>Start Game</button>
                    )}
                    {gameState === 'playing' && (
                      <button className="ps5-button" onClick={pauseGame}>Pause</button>
                    )}
                    {gameState === 'paused' && (
                      <button className="ps5-button" onClick={resumeGame}>Resume</button>
                    )}
                    {gameState === 'completed' && (
                      <button className="ps5-button" onClick={resetGame}>Play Again</button>
                    )}
                    <button className="ps5-button" onClick={resetGame}>Reset</button>
                    <button className="ps5-button" onClick={togglePowerUps}>Power-Ups: {powerUps ? 'On' : 'Off'}</button>
                    <button className="ps5-button" onClick={showTutorial}>How to Play</button>
                </div>
                
                {/* Mobile Controls */}
                {gameState === 'playing' && (
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

            <div id="gameStatus" className="ps5-card" style={{padding: '15px', textAlign: 'center'}}>
              {gameState === 'idle' 
                ? 'Welcome to Ultimate Kho Kho Pro! Click Start to begin.'
                : gameState === 'tutorial'
                ? 'Kho Kho Game Instructions: Use arrow keys or swipe to move the chaser. Catch all runners to win!'
                : gameState === 'completed'
                ? `🎉 Congratulations! You caught all runners in ${formatTime(time)} with ${score} points!`
                : gameState === 'paused'
                ? 'Game Paused - Click Resume to continue.'
                : `Catch the runners! ${runners.filter(r => r.active).length} remaining.`}
            </div>
        </div>
    </PS5GameWrapper>
  );
};

export default KhoKhoGame;
