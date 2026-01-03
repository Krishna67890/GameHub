import React, { useState, useEffect, useRef } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import { useGame } from '../../components/context/GameContext';
import { useAuth } from '../../components/context/AuthContext';
import '../../styles/ps5-theme.css';
import './PongGame.css';

const PongGame = () => {
  const { user } = useAuth();
  const { updateGameProgress } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game state
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [gameState, setGameState] = useState({
    paused: false,
    gameOver: false,
    winner: '',
    gameStarted: false
  });
  
  // Game objects refs
  const netRef = useRef({
    x: 0,
    y: 0,
    width: 2,
    height: 0,
    color: '#ffffff'
  });
  
  const player1Ref = useRef({
    x: 10,
    y: 0,
    width: 10,
    height: 100,
    color: '#e94560',
    score: 0,
    speed: 8
  });
  
  const player2Ref = useRef({
    x: 0,
    y: 0,
    width: 10,
    height: 100,
    color: '#0f3460',
    score: 0,
    speed: 8
  });
  
  const ballRef = useRef({
    x: 0,
    y: 0,
    radius: 10,
    speed: 5,
    velocityX: 5,
    velocityY: 5,
    color: '#ffffff'
  });
  
  const controlsRef = useRef({
    wPressed: false,
    sPressed: false,
    upArrowPressed: false,
    downArrowPressed: false
  });
  
  // Animation frame ref
  const animationFrameRef = useRef<number>();
  
  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = 600;
    canvas.height = 400;
    
    // Initialize positions
    netRef.current.x = canvas.width / 2 - 1;
    netRef.current.y = 0;
    netRef.current.height = canvas.height;
    
    player1Ref.current.y = canvas.height / 2 - 50;
    player2Ref.current.x = canvas.width - 20;
    player2Ref.current.y = canvas.height / 2 - 50;
    
    ballRef.current.x = canvas.width / 2;
    ballRef.current.y = canvas.height / 2;
    
    // Update game progress
    if (user) {
      updateGameProgress(user.username, 'Pong', {
        score: 0,
        lastPlayed: new Date().toISOString(),
      });
    }
  }, []);
  
  // Drawing functions
  const drawRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };
  
  const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
  };
  
  const drawText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string = '#ffffff') => {
    ctx.fillStyle = color;
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
  };
  
  const drawNet = (ctx: CanvasRenderingContext2D) => {
    const net = netRef.current;
    for (let i = 0; i <= net.height; i += 15) {
      drawRect(ctx, net.x, i, net.width, 10, net.color);
    }
  };
  
  // Game logic functions
  const resetBall = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ball = ballRef.current;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
    ball.velocityX = -ball.velocityX;
    ball.velocityY = Math.random() * 5 - 2.5;
  };
  
  const collision = (b: any, p: any) => {
    return (
      b.x + b.radius > p.x &&
      b.x - b.radius < p.x + p.width &&
      b.y + b.radius > p.y &&
      b.y - b.radius < p.y + p.height
    );
  };
  
  const movePaddles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const controls = controlsRef.current;
    const player1 = player1Ref.current;
    const player2 = player2Ref.current;
    
    // Player 1 Movement (W/S keys)
    if (controls.wPressed && player1.y > 0) {
      player1.y -= player1.speed;
    }
    if (controls.sPressed && player1.y < canvas.height - player1.height) {
      player1.y += player1.speed;
    }
    
    // Player 2 Movement (Arrow keys)
    if (controls.upArrowPressed && player2.y > 0) {
      player2.y -= player2.speed;
    }
    if (controls.downArrowPressed && player2.y < canvas.height - player2.height) {
      player2.y += player2.speed;
    }
  };
  
  const update = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ball = ballRef.current;
    const player1 = player1Ref.current;
    const player2 = player2Ref.current;
    
    // Move Ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    // Wall Collision (Top and Bottom)
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
      ball.velocityY = -ball.velocityY;
    }
    
    // Determine which player to check
    let player = ball.x < canvas.width / 2 ? player1 : player2;
    
    // Paddle Collision
    if (collision(ball, player)) {
      // Where the ball hit the paddle
      let collidePoint = ball.y - (player.y + player.height / 2);
      collidePoint = collidePoint / (player.height / 2);
      
      // Calculate angle
      let angleRad = collidePoint * Math.PI / 4;
      
      // Change velocity direction
      let direction = player === player1 ? 1 : -1;
      ball.velocityX = direction * ball.speed * Math.cos(angleRad);
      ball.velocityY = ball.speed * Math.sin(angleRad);
      
      // Increase ball speed slightly
      ball.speed += 0.5;
    }
    
    // Scoring
    if (ball.x - ball.radius < 0) {
      player2.score++;
      resetBall();
      
      // Update game progress
      if (user) {
        updateGameProgress(user.username, 'Pong', {
          score: player2.score,
          lastPlayed: new Date().toISOString(),
        });
      }
      
      // Check for win condition (first to 10)
      if (player2.score >= 10) {
        setGameState(prev => ({
          ...prev,
          gameOver: true,
          winner: player2Name
        }));
      }
    } else if (ball.x + ball.radius > canvas.width) {
      player1.score++;
      resetBall();
      
      // Update game progress
      if (user) {
        updateGameProgress(user.username, 'Pong', {
          score: player1.score,
          lastPlayed: new Date().toISOString(),
        });
      }
      
      // Check for win condition (first to 10)
      if (player1.score >= 10) {
        setGameState(prev => ({
          ...prev,
          gameOver: true,
          winner: player1Name
        }));
      }
    }
  };
  
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    drawRect(ctx, 0, 0, canvas.width, canvas.height, '#1a1a2e');
    
    // Draw net
    drawNet(ctx);
    
    // Draw paddles
    const player1 = player1Ref.current;
    const player2 = player2Ref.current;
    drawRect(ctx, player1.x, player1.y, player1.width, player1.height, player1.color);
    drawRect(ctx, player2.x, player2.y, player2.width, player2.height, player2.color);
    
    // Draw ball
    const ball = ballRef.current;
    drawCircle(ctx, ball.x, ball.y, ball.radius, ball.color);
    
    // Draw scores
    drawText(ctx, `${player1Name}: ${player1.score}`, canvas.width / 4, 50, '#e94560');
    drawText(ctx, `${player2Name}: ${player2.score}`, 3 * canvas.width / 4, 50, '#0f3460');
    
    // Draw game over message
    if (gameState.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      drawText(ctx, 'GAME OVER', canvas.width / 2, canvas.height / 2 - 30, '#ffffff');
      drawText(ctx, `${gameState.winner} Wins!`, canvas.width / 2, canvas.height / 2 + 20, '#e94560');
    }
    
    // Draw pause message
    if (gameState.paused && !gameState.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawText(ctx, 'PAUSED', canvas.width / 2, canvas.height / 2, '#ffffff');
    }
  };
  
  const gameLoop = () => {
    if (!gameState.paused && !gameState.gameOver && gameState.gameStarted) {
      movePaddles();
      update();
      render();
    }
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };
  
  // Start game loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.paused, gameState.gameOver, gameState.gameStarted]);
  
  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const controls = controlsRef.current;
      if (e.key === 'w' || e.key === 'W') controls.wPressed = true;
      if (e.key === 's' || e.key === 'S') controls.sPressed = true;
      if (e.key === 'ArrowUp') controls.upArrowPressed = true;
      if (e.key === 'ArrowDown') controls.downArrowPressed = true;
      if (e.key === ' ') {
        e.preventDefault();
        if (gameState.gameOver) {
          restartGame();
        } else {
          setGameState(prev => ({ ...prev, paused: !prev.paused }));
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const controls = controlsRef.current;
      if (e.key === 'w' || e.key === 'W') controls.wPressed = false;
      if (e.key === 's' || e.key === 'S') controls.sPressed = false;
      if (e.key === 'ArrowUp') controls.upArrowPressed = false;
      if (e.key === 'ArrowDown') controls.downArrowPressed = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.gameOver]);
  
  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      gameOver: false,
      paused: false,
      winner: ''
    }));
    
    // Reset scores
    player1Ref.current.score = 0;
    player2Ref.current.score = 0;
    
    // Reset ball
    resetBall();
  };
  
  const restartGame = () => {
    startGame();
  };
  
  const pauseGame = () => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
  };

  return (
    <PS5GameWrapper gameTitle="Multiplayer Pong" onBack={() => window.history.back()}>
      <div className="pong-game-container">
        <div className="player-names">
          <input
            type="text"
            value={player1Name}
            onChange={(e) => setPlayer1Name(e.target.value)}
            placeholder="Player 1 Name"
            className="player-name-input"
            maxLength={15}
          />
          <input
            type="text"
            value={player2Name}
            onChange={(e) => setPlayer2Name(e.target.value)}
            placeholder="Player 2 Name"
            className="player-name-input"
            maxLength={15}
          />
        </div>
        
        <canvas
          ref={canvasRef}
          id="pongCanvas"
          width={600}
          height={400}
          className="pong-canvas"
        />
        
        <div className="game-controls">
          <div className="player-controls-section">
            <div className="controls-title">Player 1 Controls</div>
            <div className="button-row">
              <button 
                className="ps5-button control-button"
                onMouseDown={() => controlsRef.current.wPressed = true}
                onMouseUp={() => controlsRef.current.wPressed = false}
                onMouseLeave={() => controlsRef.current.wPressed = false}
                onTouchStart={(e) => {
                  e.preventDefault();
                  controlsRef.current.wPressed = true;
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  controlsRef.current.wPressed = false;
                }}
              >
                W (Up)
              </button>
            </div>
            <div className="button-row">
              <button 
                className="ps5-button control-button"
                onMouseDown={() => controlsRef.current.sPressed = true}
                onMouseUp={() => controlsRef.current.sPressed = false}
                onMouseLeave={() => controlsRef.current.sPressed = false}
                onTouchStart={(e) => {
                  e.preventDefault();
                  controlsRef.current.sPressed = true;
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  controlsRef.current.sPressed = false;
                }}
              >
                S (Down)
              </button>
            </div>
          </div>
          
          <div className="game-action-buttons">
            {!gameState.gameStarted ? (
              <button 
                className="ps5-button primary-button"
                onClick={startGame}
              >
                Start Game
              </button>
            ) : (
              <>
                <button 
                  className="ps5-button secondary-button"
                  onClick={pauseGame}
                  disabled={gameState.gameOver}
                >
                  {gameState.paused ? 'Resume' : 'Pause'}
                </button>
                {gameState.gameOver && (
                  <button 
                    className="ps5-button success-button"
                    onClick={restartGame}
                  >
                    Play Again
                  </button>
                )}
              </>
            )}
          </div>
          
          <div className="player-controls-section">
            <div className="controls-title">Player 2 Controls</div>
            <div className="button-row">
              <button 
                className="ps5-button control-button"
                onMouseDown={() => controlsRef.current.upArrowPressed = true}
                onMouseUp={() => controlsRef.current.upArrowPressed = false}
                onMouseLeave={() => controlsRef.current.upArrowPressed = false}
                onTouchStart={(e) => {
                  e.preventDefault();
                  controlsRef.current.upArrowPressed = true;
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  controlsRef.current.upArrowPressed = false;
                }}
              >
                ▲ (Up)
              </button>
            </div>
            <div className="button-row">
              <button 
                className="ps5-button control-button"
                onMouseDown={() => controlsRef.current.downArrowPressed = true}
                onMouseUp={() => controlsRef.current.downArrowPressed = false}
                onMouseLeave={() => controlsRef.current.downArrowPressed = false}
                onTouchStart={(e) => {
                  e.preventDefault();
                  controlsRef.current.downArrowPressed = true;
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  controlsRef.current.downArrowPressed = false;
                }}
              >
                ▼ (Down)
              </button>
            </div>
          </div>
        </div>
        
        <div className="game-instructions">
          <p>🎮 <strong>Controls:</strong> Player 1: W/S keys | Player 2: Arrow Keys</p>
          <p>⏸️ <strong>Pause:</strong> Spacebar</p>
          <p>🏆 <strong>Win Condition:</strong> First to 10 points</p>
        </div>
      </div>
    </PS5GameWrapper>
  );
};

export default PongGame;