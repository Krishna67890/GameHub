import React, { useState, useEffect, useRef, useCallback } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import { useGame } from '../../components/context/GameContext';
import { useAuth } from '../../components/context/AuthContext';
import '../../styles/ps5-theme.css';
import './BubbleShooterGame.css';

const COLORS = ['#FF5252', '#448AFF', '#69F0AE', '#FFD740', '#FF4081'];
const GRID_ROWS = 10;
const GRID_COLS = 12;
const BUBBLE_RADIUS = 20;

const BubbleShooterGame = () => {
  const { user } = useAuth();
  const { updateGameProgress } = useGame();
  const [score, setScore] = useState(0);
  const [fixedBubbles, setFixedBubbles] = useState<any[]>([]);
  const [movingBubble, setMovingBubble] = useState<any>(null);
  const [shooterAngle, setShooterAngle] = useState(0);
  const [nextColor, setNextColor] = useState(COLORS[0]);
  const [gameState, setGameState] = useState<'playing' | 'gameOver'>('playing');
  const [level, setLevel] = useState(1);
  
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Initialize Level
  useEffect(() => {
    const initial = [];
    // For level 1, start with 4 rows; increase rows with each level, max 10 rows
    const rowsForLevel = 4 + Math.min(level - 1, 6); // Level 1: 4 rows, Level 2: 5 rows, ..., Level 10: 10 rows
    
    for (let r = 0; r < rowsForLevel; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        initial.push({
          id: `init-${r}-${c}`,
          x: c * 40 + 30 + (r % 2 === 0 ? 0 : 20),
          y: r * 35 + 30,
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        });
      }
    }
    setFixedBubbles(initial);
    setNextColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  }, [level]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height - 40;
    const angle = Math.atan2(e.clientY - rect.top - centerY, e.clientX - rect.left - centerX);
    setShooterAngle(angle);
  };

  const shootBubble = () => {
    if (movingBubble) return;
    setMovingBubble({
      x: 400,
      y: 560,
      vx: Math.cos(shooterAngle) * 8,
      vy: Math.sin(shooterAngle) * 8,
      color: nextColor
    });
    setNextColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  };

  // Game Loop
  useEffect(() => {
    if (!movingBubble) return;

    const interval = setInterval(() => {
      setMovingBubble((prev: any) => {
        if (!prev) return null;
        let newX = prev.x + prev.vx;
        let newY = prev.y + prev.vy;
        let newVx = prev.vx;

        // Wall Bounce
        if (newX < 20 || newX > 780) newVx *= -1;

        // Collision Check
        const hitTop = newY < 25;
        const hitBubble = fixedBubbles.some(b => 
          Math.sqrt(Math.pow(b.x - newX, 2) + Math.pow(b.y - newY, 2)) < 35
        );

        if (hitTop || hitBubble) {
          clearInterval(interval);
          handleCollision(newX, newY, prev.color);
          return null;
        }

        return { ...prev, x: newX, y: newY, vx: newVx };
      });
    }, 16);
    
    return () => clearInterval(interval);
  }, [movingBubble, fixedBubbles]);

  // Function to find adjacent bubbles of the same color using BFS
  const findAdjacentBubbles = (bubbles: any[], targetBubble: any): any[] => {
    const visited = new Set();
    const queue: any[] = [targetBubble];
    const adjacentBubbles: any[] = [];
    
    while (queue.length > 0) {
      const currentBubble = queue.shift();
      
      if (visited.has(currentBubble.id)) continue;
      visited.add(currentBubble.id);
      adjacentBubbles.push(currentBubble);
      
      // Find all bubbles of the same color that are adjacent
      bubbles.forEach(bubble => {
        if (visited.has(bubble.id) || bubble.id === currentBubble.id) return;
        if (bubble.color !== currentBubble.color) return;
        
        // Check if bubbles are adjacent (distance < 45 pixels)
        const distance = Math.sqrt(Math.pow(bubble.x - currentBubble.x, 2) + Math.pow(bubble.y - currentBubble.y, 2));
        if (distance < 45) {
          queue.push(bubble);
        }
      });
    }
    
    return adjacentBubbles;
  };
  
  const handleCollision = (x: number, y: number, color: string) => {
    const newBubble = { id: Date.now(), x, y, color };
    const newSet = [...fixedBubbles, newBubble];
    
    // Find adjacent bubbles of the same color
    const adjacentBubbles = findAdjacentBubbles(newSet, newBubble);
    
    if (adjacentBubbles.length >= 3) {
      // Remove all adjacent bubbles of the same color
      const bubbleIdsToRemove = adjacentBubbles.map(b => b.id);
      const updatedBubbles = newSet.filter(b => !bubbleIdsToRemove.includes(b.id));
      
      setFixedBubbles(updatedBubbles);
      const newScore = score + (adjacentBubbles.length * 10);
      setScore(newScore);
      
      // Update game progress
      if (user) {
        updateGameProgress(user.username, 'Bubble Shooter', {
          score: newScore,
          level: level,
          lastPlayed: new Date().toISOString(),
        });
      }
    } else {
      setFixedBubbles(newSet);
    }
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setGameState('playing');
    setMovingBubble(null);
    
    // Update game progress when resetting
    if (user) {
      updateGameProgress(user.username, 'Bubble Shooter', {
        score: 0,
        level: 1,
        lastPlayed: new Date().toISOString(),
      });
    }
    
    const initial = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        initial.push({
          id: `init-${r}-${c}`,
          x: c * 40 + 30 + (r % 2 === 0 ? 0 : 20),
          y: r * 35 + 30,
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        });
      }
    }
    setFixedBubbles(initial);
    setNextColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  };
  
  // Check for game over conditions
  useEffect(() => {
    // Check if any fixed bubbles have reached too low
    const hasBubblesReachedBottom = fixedBubbles.some(bubble => bubble.y > 500);
    
    if (hasBubblesReachedBottom) {
      setGameState('gameOver');
      
      // Update game progress when game over
      if (user) {
        updateGameProgress(user.username, 'Bubble Shooter', {
          score: score,
          level: level,
          lastPlayed: new Date().toISOString(),
        });
      }
    }
    
    // Check if all bubbles are cleared (win condition)
    if (fixedBubbles.length === 0 && level < 10) {
      const newScore = score + 1000;
      setScore(newScore);
      const newLevel = level + 1;
      setLevel(newLevel);
      
      // Update game progress when level completed
      if (user) {
        updateGameProgress(user.username, 'Bubble Shooter', {
          score: newScore,
          level: newLevel,
          completed: true,
          lastPlayed: new Date().toISOString(),
        });
      }
      
      // Reset the level with more bubbles
      const initial = [];
      for (let r = 0; r < 4 + Math.min(level, 6); r++) {  // Add more rows as level increases, max 10 rows
        for (let c = 0; c < GRID_COLS; c++) {
          initial.push({
            id: `init-${r}-${c}`,
            x: c * 40 + 30 + (r % 2 === 0 ? 0 : 20),
            y: r * 35 + 30,
            color: COLORS[Math.floor(Math.random() * COLORS.length)]
          });
        }
      }
      setFixedBubbles(initial);
    } else if (fixedBubbles.length === 0 && level >= 10) {
      // Game completed after level 10
      const newScore = score + 2000; // Extra bonus for completing game
      setScore(newScore);
      setGameState('gameOver');
      
      // Update game progress when game completed
      if (user) {
        updateGameProgress(user.username, 'Bubble Shooter', {
          score: newScore,
          level: level,
          completed: true,
          lastPlayed: new Date().toISOString(),
        });
      }
    }
  }, [fixedBubbles, level]);

  return (
    <PS5GameWrapper gameTitle="Bubble Shooter" onBack={() => window.history.back()}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '20px',
        height: '100%',
        padding: '20px'
      }}>
        {/* Score and Level Display */}
        <div className="ps5-card" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          width: '100%',
          maxWidth: '600px',
          padding: '15px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="ps5-game-name" style={{ fontSize: '1rem', marginBottom: '5px' }}>Score</div>
            <div className="ps5-score-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--ps5-accent-blue)' }}>
              {score}
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div className="ps5-game-name" style={{ fontSize: '1rem', marginBottom: '5px' }}>Level</div>
            <div className="ps5-score-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--ps5-accent-purple)' }}>
              {level}
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div className="ps5-game-name" style={{ fontSize: '1rem', marginBottom: '5px' }}>Next</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '40px', height: '40px', backgroundColor: nextColor, borderRadius: '50%', margin: '0 auto', border: '2px solid white' }}></div>
          </div>
        </div>

        {/* Game Board */}
        <div 
          ref={boardRef}
          onMouseMove={handleMouseMove}
          onClick={shootBubble}
          style={{ 
            width: '800px', 
            height: '600px', 
            backgroundColor: '#1A237E',
            position: 'relative',
            border: '4px solid var(--ps5-accent-blue)',
            borderRadius: '10px',
            overflow: 'hidden',
            cursor: 'crosshair'
          }}
        >
          {/* Background pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(100, 150, 255, 0.1) 0%, transparent 20%)',
            zIndex: 0
          }}></div>
          
          {/* Fixed bubbles */}
          {fixedBubbles.map(bubble => (
            <div key={bubble.id} style={{
              position: 'absolute', 
              left: bubble.x - 20, 
              top: bubble.y - 20, 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: bubble.color, 
              border: '2px solid white'
            }} />
          ))}
          
          {/* Moving bubble */}
          {movingBubble && (
            <div style={{
              position: 'absolute', 
              left: movingBubble.x - 20, 
              top: movingBubble.y - 20, 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: movingBubble.color, 
              border: '2px solid white'
            }} />
          )}
          
          {/* Shooter */}
          <div style={{
            position: 'absolute', 
            bottom: 10, 
            left: 380, 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            background: nextColor, 
            border: '2px solid gold'
          }} />
        </div>

        {/* Game Over Screen */}
        {gameState === 'gameOver' && (
          <div className="ps5-card" style={{ 
            padding: '30px', 
            textAlign: 'center',
            backgroundColor: 'var(--ps5-gradient-danger)',
            width: '100%',
            maxWidth: '500px'
          }}>
            <h2 style={{ color: 'white', marginBottom: '15px' }}>Game Over!</h2>
            <p style={{ color: 'white', marginBottom: '20px' }}>Final Score: {score}</p>
            <button 
              className="ps5-button ps5-button--danger"
              onClick={resetGame}
            >
              Play Again
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="ps5-card" style={{ 
          maxWidth: '600px',
          textAlign: 'center',
          padding: '15px'
        }}>
          <p>🎯 Move mouse to aim, click to shoot bubbles</p>
          <p>💥 Match 3 or more bubbles of the same color to pop them</p>
          <p>🏆 Clear all bubbles to advance to the next level</p>
        </div>
      </div>
    </PS5GameWrapper>
  );
};

export default BubbleShooterGame;