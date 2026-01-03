import React, { useState, useEffect, useRef } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import { useGame } from '../../components/context/GameContext';
import { useAuth } from '../../components/context/AuthContext';
import '../../styles/ps5-theme.css';
import './BalloonGoesUpGame.css';

const BalloonGoesUpGame = () => {
  const { user } = useAuth();
  const { updateGameProgress } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  
  // Game objects
  const playerRef = useRef({
    x: 100,
    y: 300,
    width: 40,
    height: 40,
    speed: 5
  });
  
  const balloonsRef = useRef<any[]>([]);
  const obstaclesRef = useRef<any[]>([]);
  
  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = 800;
    canvas.height = 600;
    
    // Initialize balloons
    balloonsRef.current = [];
    for (let i = 0; i < 5; i++) {
      balloonsRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 15 + Math.random() * 10,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        speed: 1 + Math.random() * 2
      });
    }
    
    // Initialize obstacles
    obstaclesRef.current = [];
    for (let i = 0; i < 3; i++) {
      obstaclesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        width: 40 + Math.random() * 30,
        height: 40 + Math.random() * 30,
        speed: 1 + Math.random() * 1.5
      });
    }
    
    // Start game loop
    animationRef.current = requestAnimationFrame(gameLoop);
    
    // Update game progress
    if (user) {
      updateGameProgress(user.username, 'Balloon Goes Up', {
        score: 0,
        lastPlayed: new Date().toISOString(),
      });
    }
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActive || gameOver) return;
      
      const player = playerRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      if (e.key === 'ArrowLeft' && player.x > 0) {
        player.x -= player.speed;
      } else if (e.key === 'ArrowRight' && player.x < canvas.width - player.width) {
        player.x += player.speed;
      } else if (e.key === 'ArrowUp' && player.y > 0) {
        player.y -= player.speed;
      } else if (e.key === 'ArrowDown' && player.y < canvas.height - player.height) {
        player.y += player.speed;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameActive, gameOver]);
  
  // Mouse/touch controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!gameActive || gameOver) return;
      
      const rect = canvas.getBoundingClientRect();
      const player = playerRef.current;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Smooth movement towards mouse position
      const dx = mouseX - (player.x + player.width / 2);
      const dy = mouseY - (player.y + player.height / 2);
      
      player.x += dx * 0.1;
      player.y += dy * 0.1;
      
      // Keep player within bounds
      player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
      player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [gameActive, gameOver]);
  
  // Game loop
  const gameLoop = () => {
    if (!gameActive || gameOver) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw balloons
    balloonsRef.current.forEach((balloon, index) => {
      // Move balloon up
      balloon.y -= balloon.speed;
      
      // Reset balloon if it goes off screen
      if (balloon.y < -balloon.radius) {
        balloon.y = canvas.height + balloon.radius;
        balloon.x = Math.random() * canvas.width;
      }
      
      // Draw balloon
      ctx.beginPath();
      ctx.arc(balloon.x, balloon.y, balloon.radius, 0, Math.PI * 2);
      ctx.fillStyle = balloon.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw string
      ctx.beginPath();
      ctx.moveTo(balloon.x, balloon.y + balloon.radius);
      ctx.lineTo(balloon.x, balloon.y + balloon.radius + 20);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    
    // Update and draw obstacles
    obstaclesRef.current.forEach((obstacle, index) => {
      // Move obstacle down
      obstacle.y += obstacle.speed;
      
      // Reset obstacle if it goes off screen
      if (obstacle.y > canvas.height) {
        obstacle.y = -obstacle.height;
        obstacle.x = Math.random() * (canvas.width - obstacle.width);
      }
      
      // Draw obstacle
      ctx.fillStyle = '#e94560';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // Draw obstacle border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
    
    // Draw player
    const player = playerRef.current;
    ctx.fillStyle = '#00f7ff';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw player border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(player.x, player.y, player.width, player.height);
    
    // Collision detection
    balloonsRef.current.forEach((balloon, index) => {
      // Balloon collision with player
      const dx = (player.x + player.width / 2) - balloon.x;
      const dy = (player.y + player.height / 2) - balloon.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < balloon.radius + player.width / 2) {
        // Collect balloon
        balloonsRef.current[index] = {
          x: Math.random() * canvas.width,
          y: canvas.height + balloon.radius,
          radius: 15 + Math.random() * 10,
          color: `hsl(${Math.random() * 360}, 70%, 60%)`,
          speed: 1 + Math.random() * 2
        };
        setScore(prev => prev + 10);
        
        // Update game progress
        if (user) {
          updateGameProgress(user.username, 'Balloon Goes Up', {
            score: score + 10,
            lastPlayed: new Date().toISOString(),
          });
        }
      }
    });
    
    // Obstacle collision with player
    obstaclesRef.current.forEach((obstacle, index) => {
      if (
        player.x < obstacle.x + obstacle.width &&
        player.x + player.width > obstacle.x &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.height > obstacle.y
      ) {
        // Game over
        setGameOver(true);
        setGameActive(false);
      }
    });
    
    // Continue game loop
    animationRef.current = requestAnimationFrame(gameLoop);
  };
  
  const restartGame = () => {
    setScore(0);
    setGameOver(false);
    setGameActive(true);
    
    // Reset player position
    const player = playerRef.current;
    player.x = 100;
    player.y = 300;
    
    // Reset balloons and obstacles
    const canvas = canvasRef.current;
    if (canvas) {
      balloonsRef.current = [];
      for (let i = 0; i < 5; i++) {
        balloonsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 15 + Math.random() * 10,
          color: `hsl(${Math.random() * 360}, 70%, 60%)`,
          speed: 1 + Math.random() * 2
        });
      }
      
      obstaclesRef.current = [];
      for (let i = 0; i < 3; i++) {
        obstaclesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          width: 40 + Math.random() * 30,
          height: 40 + Math.random() * 30,
          speed: 1 + Math.random() * 1.5
        });
      }
    }
    
    // Restart game loop
    animationRef.current = requestAnimationFrame(gameLoop);
  };
  
  return (
    <PS5GameWrapper gameTitle="Balloon Goes Up" onBack={() => window.history.back()}>
      <div className="balloon-goes-up-container">
        <div className="game-header">
          <h2 className="score">Score: {score}</h2>
          <div className="controls-info">
            <p>🎮 Use arrow keys or mouse to move</p>
          </div>
        </div>
        
        <div className="game-canvas-container">
          <canvas 
            ref={canvasRef} 
            className="game-canvas"
          />
        </div>
        
        {gameOver && (
          <div className="game-over-overlay">
            <h2>Game Over!</h2>
            <p>Final Score: {score}</p>
            <button className="ps5-button" onClick={restartGame}>
              Play Again
            </button>
          </div>
        )}
        
        <div className="game-instructions">
          <p>🎯 Collect balloons to increase your score</p>
          <p>⚠️ Avoid the red obstacles</p>
        </div>
      </div>
    </PS5GameWrapper>
  );
};

export default BalloonGoesUpGame;