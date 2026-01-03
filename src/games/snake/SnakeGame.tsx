import React, { useState, useEffect, useRef, useCallback } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import { useGame } from '../../components/context/GameContext';
import { useAuth } from '../../components/context/AuthContext';
import '../../styles/ps5-theme.css';
import './SnakeGame.css';

const SnakeGame = () => {
  const { user } = useAuth();
  const { updateGameProgress } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  
  // Game State Refs (prevents re-renders from causing lag/vibration)
  const snakeRef = useRef([{ x: 10, y: 10 }]);
  const foodRef = useRef({ x: 5, y: 5 });
  const dirRef = useRef('RIGHT');
  const frameRef = useRef<number>();

  // Custom images
  const [snakeImage, setSnakeImage] = useState<string | null>(null);
  const [foodImage, setFoodImage] = useState<string | null>(null);
  
  // Image objects
  const snakeImgRef = useRef<HTMLImageElement | null>(null);
  const foodImgRef = useRef<HTMLImageElement | null>(null);

  const GRID_SIZE = 20;

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    const newSnake = [...snakeRef.current];
    const head = { ...newSnake[0] };

    if (dirRef.current === 'UP') head.y -= 1;
    if (dirRef.current === 'DOWN') head.y += 1;
    if (dirRef.current === 'LEFT') head.x -= 1;
    if (dirRef.current === 'RIGHT') head.x += 1;

    // Boundary check
    if (head.x < 0 || head.x >= 25 || head.y < 0 || head.y >= 20) {
      setGameOver(true);
      
      // Update game progress when game ends
      if (user) {
        updateGameProgress(user.username, 'Snake', {
          score: score,
          lastPlayed: new Date().toISOString(),
        });
      }
      
      return;
    }

    // Check for collision with self
    const collisionWithSelf = newSnake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    
    newSnake.unshift(head);

    let newScore = score;
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      newScore = score + 10;
      setScore(newScore);
      
      // Update game progress
      if (user) {
        updateGameProgress(user.username, 'Snake', {
          score: newScore,
          lastPlayed: new Date().toISOString(),
        });
      }
      
      foodRef.current = { 
        x: Math.floor(Math.random() * 25), 
        y: Math.floor(Math.random() * 20) 
      };
    } else {
      newSnake.pop();
    }
    
    // Check for win condition (reaching a high score)
    if (newScore >= 500) { // Win when reaching 500 points
      setGameWon(true);
      setGameOver(true);
      
      // Update game progress
      if (user) {
        updateGameProgress(user.username, 'Snake', {
          score: newScore,
          completed: true,
          lastPlayed: new Date().toISOString(),
        });
      }
    } else if (collisionWithSelf) {
      setGameOver(true);
      
      // Update game progress when game ends
      if (user) {
        updateGameProgress(user.username, 'Snake', {
          score: score,
          lastPlayed: new Date().toISOString(),
        });
      }
    }

    snakeRef.current = newSnake;
  }, [gameOver, gameWon]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && dirRef.current !== 'DOWN') dirRef.current = 'UP';
      if (e.key === 'ArrowDown' && dirRef.current !== 'UP') dirRef.current = 'DOWN';
      if (e.key === 'ArrowLeft' && dirRef.current !== 'RIGHT') dirRef.current = 'LEFT';
      if (e.key === 'ArrowRight' && dirRef.current !== 'LEFT') dirRef.current = 'RIGHT';
    };
    window.addEventListener('keydown', handleKey);
    
    const interval = setInterval(() => {
      moveSnake();
      draw();
    }, 120);

    return () => {
      window.removeEventListener('keydown', handleKey);
      clearInterval(interval);
    };
  }, [moveSnake]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Food
    if (foodImage && foodImgRef.current) {
      ctx.drawImage(foodImgRef.current, foodRef.current.x * 20, foodRef.current.y * 20, 20, 20);
    } else {
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(foodRef.current.x * 20 + 10, foodRef.current.y * 20 + 10, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Snake
    snakeRef.current.forEach((s, i) => {
      if (snakeImage && snakeImgRef.current) {
        ctx.drawImage(snakeImgRef.current, s.x * 20, s.y * 20, 20, 20);
      } else {
        ctx.fillStyle = i === 0 ? '#00d2ff' : '#0080ff';
        ctx.fillRect(s.x * 20 + 1, s.y * 20 + 1, 18, 18);
      }
    });
  };

  // Handle window resize to update canvas dimensions
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Set canvas dimensions
      canvas.width = 500;
      canvas.height = 400;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize canvas size
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'snake' | 'food') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (type === 'snake') {
          setSnakeImage(result);
          // Preload snake image
          const img = new Image();
          img.onload = () => {
            snakeImgRef.current = img;
          };
          img.src = result;
        } else {
          setFoodImage(result);
          // Preload food image
          const img = new Image();
          img.onload = () => {
            foodImgRef.current = img;
          };
          img.src = result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    foodRef.current = { x: 5, y: 5 };
    dirRef.current = 'RIGHT';
    setGameOver(false);
    setGameWon(false);
    setScore(0);
    
    // Update game progress when resetting
    if (user) {
      updateGameProgress(user.username, 'Snake', {
        score: 0,
        completed: false,
        lastPlayed: new Date().toISOString(),
      });
    }
    
    draw(); // Redraw the initial state
  };

  return (
    <PS5GameWrapper gameTitle="Neon Snake" onBack={() => window.history.back()}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <h2 style={{ color: 'white' }}>Score: {score}</h2>
        <canvas 
          ref={canvasRef} 
          width={500} 
          height={400} 
          style={{ border: '3px solid #00d2ff', borderRadius: '8px', boxShadow: '0 0 20px #00d2ff44' }} 
        />
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <label style={{ display: 'block', color: 'white', marginBottom: '5px' }}>Snake Image:</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, 'snake')} 
              style={{ color: 'white' }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <label style={{ display: 'block', color: 'white', marginBottom: '5px' }}>Food Image:</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, 'food')} 
              style={{ color: 'white' }}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: '10px', width: '150px', height: '150px', margin: '20px auto' }}>
          <div></div>
          <button 
            className="ps5-button" 
            onClick={() => {
              if (dirRef.current !== 'DOWN') dirRef.current = 'UP';
            }}
            style={{ gridColumn: '2', gridRow: '1', borderRadius: '8px' }}
            aria-label="Move Up"
          >
            ↑
          </button>
          <div></div>
          
          <button 
            className="ps5-button" 
            onClick={() => {
              if (dirRef.current !== 'RIGHT') dirRef.current = 'LEFT';
            }}
            style={{ gridColumn: '1', gridRow: '2', borderRadius: '8px' }}
            aria-label="Move Left"
          >
            ←
          </button>
          <div style={{ gridColumn: '2', gridRow: '2' }}></div>
          <button 
            className="ps5-button" 
            onClick={() => {
              if (dirRef.current !== 'LEFT') dirRef.current = 'RIGHT';
            }}
            style={{ gridColumn: '3', gridRow: '2', borderRadius: '8px' }}
            aria-label="Move Right"
          >
            →
          </button>
          
          <div></div>
          <button 
            className="ps5-button" 
            onClick={() => {
              if (dirRef.current !== 'UP') dirRef.current = 'DOWN';
            }}
            style={{ gridColumn: '2', gridRow: '3', borderRadius: '8px' }}
            aria-label="Move Down"
          >
            ↓
          </button>
          <div></div>
        </div>
        
        {gameOver && (
          <div style={{ textAlign: 'center' }}>
            {gameWon ? (
              <h2 style={{ color: 'var(--ps5-accent-yellow)', textShadow: '0 0 10px rgba(255, 255, 0, 0.7)', marginBottom: '15px' }}>🎉 Congratulations, You Won! 🎉</h2>
            ) : (
              <h2 style={{ color: 'var(--ps5-accent-red)', textShadow: '0 0 10px rgba(255, 0, 0, 0.7)', marginBottom: '15px' }}>Game Over</h2>
            )}
            <button className="ps5-button" onClick={resetGame}>Play Again</button>
          </div>
        )}
      </div>
    </PS5GameWrapper>
  );
};

export default SnakeGame;