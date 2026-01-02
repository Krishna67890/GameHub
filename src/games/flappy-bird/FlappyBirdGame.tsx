import React, { useState, useEffect, useRef, useCallback } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import PS5Animator from '../../utils/ps5-animator';
import '../../styles/ps5-theme.css';

const FlappyBirdGame = () => {
  const [gameState, setGameState] = useState<'welcome' | 'playing' | 'gameOver'>('welcome');
  const [playerName, setPlayerName] = useState('');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Refs for game state to avoid stale closures in game loop
  const birdPositionRef = useRef(300);
  const birdVelocityRef = useRef(0);
  const pipesRef = useRef<any[]>([]);
  const gameSpeedRef = useRef(2);
  const scoreRef = useRef(0);

  const gameLoopRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const lastPipeTimeRef = useRef<number>(0);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const GRAVITY = 0.4;
  const JUMP_FORCE = -8;
  const PIPE_FREQUENCY = 1800;
  const BOARD_HEIGHT = 600;
  const BOARD_WIDTH = 400;
  const BIRD_SIZE = { width: 40, height: 30 };
  const PIPE_GAP = 150;

  useEffect(() => {
    const savedHighScore = localStorage.getItem('flappyBirdHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  const startGame = useCallback(() => {
    if (!playerName.trim()) return;

    setGameState('playing');
    setScore(0);
    scoreRef.current = 0;
    birdPositionRef.current = 300;
    birdVelocityRef.current = 0;
    pipesRef.current = [];
    gameSpeedRef.current = 2;
    lastPipeTimeRef.current = performance.now();

    lastFrameTimeRef.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [playerName]);

  const handleJump = useCallback(() => {
    if (gameState === 'playing') {
      birdVelocityRef.current = JUMP_FORCE;
    }
  }, [gameState]);

  const createPipe = useCallback(() => {
    const minHeight = 50;
    const maxHeight = BOARD_HEIGHT - PIPE_GAP - minHeight - 60;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    pipesRef.current = [
      ...pipesRef.current,
      { id: Date.now(), x: BOARD_WIDTH, topHeight, passed: false }
    ];
  }, [PIPE_GAP]);

  const checkCollisions = useCallback(() => {
    const birdY = birdPositionRef.current;
    if (birdY <= 0 || birdY >= BOARD_HEIGHT - 60 - BIRD_SIZE.height) {
      return true;
    }

    const birdRect = { x: 80, y: birdY, width: BIRD_SIZE.width, height: BIRD_SIZE.height };

    for (const pipe of pipesRef.current) {
      const topPipeRect = { x: pipe.x, y: 0, width: 80, height: pipe.topHeight };
      const bottomPipeRect = { x: pipe.x, y: pipe.topHeight + PIPE_GAP, width: 80, height: BOARD_HEIGHT - pipe.topHeight - PIPE_GAP - 60 };

      if (
        (birdRect.x < topPipeRect.x + topPipeRect.width &&
          birdRect.x + birdRect.width > topPipeRect.x &&
          birdRect.y < topPipeRect.y + topPipeRect.height) ||
        (birdRect.x < bottomPipeRect.x + bottomPipeRect.width &&
          birdRect.x + birdRect.width > bottomPipeRect.x &&
          birdRect.y + birdRect.height > bottomPipeRect.y)
      ) {
        return true;
      }
    }

    return false;
  }, [PIPE_GAP]);

  const gameLoop = useCallback((timestamp: number) => {
    const deltaTime = timestamp - lastFrameTimeRef.current;
    lastFrameTimeRef.current = timestamp;
    const timeScale = deltaTime / (1000/60); // Normalize to 60 FPS

    // Update bird physics
    birdVelocityRef.current += GRAVITY * timeScale;
    birdPositionRef.current += birdVelocityRef.current * timeScale;
    
    // Update UI elements from refs
    const birdElement = document.getElementById('flappy-bird');
    if (birdElement) {
      birdElement.style.top = `${birdPositionRef.current}px`;
      const rotation = Math.min(Math.max(birdVelocityRef.current * 3, -20), 90);
      birdElement.style.transform = `rotate(${rotation}deg)`;
    }

    // Update pipes
    let scoreGained = 0;
    pipesRef.current = pipesRef.current.map(pipe => {
      const newX = pipe.x - gameSpeedRef.current * timeScale;
      if (!pipe.passed && newX + 80 < 80) {
        scoreGained++;
        return { ...pipe, x: newX, passed: true };
      }
      return { ...pipe, x: newX };
    }).filter(pipe => pipe.x > -80);

    if (scoreGained > 0) {
        scoreRef.current += scoreGained;
        setScore(scoreRef.current);
        if (scoreRef.current % 5 === 0) {
            gameSpeedRef.current = Math.min(4, gameSpeedRef.current + 0.1);
        }
    }

    // Update pipe UI
    const pipeElements = document.querySelectorAll('.pipe');
    pipeElements.forEach((pipeEl, index) => {
        if (pipesRef.current[index]) {
           (pipeEl as HTMLElement).style.left = `${pipesRef.current[index].x}px`;
        }
    });

    // Generate new pipes
    if (timestamp - lastPipeTimeRef.current > PIPE_FREQUENCY) {
      createPipe();
      lastPipeTimeRef.current = timestamp;
    }

    // Check collisions
    if (checkCollisions()) {
      setGameState('gameOver');
      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current);
        localStorage.setItem('flappyBirdHighScore', scoreRef.current.toString());
        PS5Animator.createNotification(`New High Score: ${scoreRef.current}!`, "success");
      } else {
        PS5Animator.createNotification(`Game Over! Score: ${scoreRef.current}`, "error");
      }
      return;
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [createPipe, checkCollisions, highScore]);

  useEffect(() => {
    if (gameState === 'playing') {
      startGame();
    } else {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

  const restartGame = () => {
    setGameState('welcome');
    setTimeout(() => startGame(), 100); 
  };

  const DynamicPipes = React.memo(() => {
      return (
          <>{pipesRef.current.map(pipe => (
              <React.Fragment key={pipe.id}>
                <div className="pipe" style={{ left: `${pipe.x}px`, top: 0, height: `${pipe.topHeight}px`}} />
                <div className="pipe" style={{ left: `${pipe.x}px`, bottom: '60px', height: `${BOARD_HEIGHT - pipe.topHeight - PIPE_GAP - 60}px`}} />
              </React.Fragment>
            ))}</>
      )
  });
  
  if (gameState === 'welcome') {
    return (
      <PS5GameWrapper gameTitle="Flappy Bird" onBack={() => window.history.back()}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '30px' }}>
          <h1 style={{ fontSize: '3rem', color: 'var(--ps5-accent-blue)', textShadow: '0 0 20px var(--ps5-accent-blue)', margin: 0 }}>🐦 Flappy Bird</h1>
          <div className="ps5-card" style={{ padding: '30px', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Enter Your Name</h2>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Player Name"
              maxLength={15}
              className="ps5-button"
              style={{ padding: '12px', width: '100%', marginBottom: '20px', textAlign: 'center', fontSize: '1rem' }}
              onKeyPress={(e) => e.key === 'Enter' && startGame()}
            />
            <button className="ps5-button" onClick={startGame} disabled={!playerName.trim()} style={{ minWidth: '150px' }}>Start Game</button>
          </div>
          <div className="ps5-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
            <p>🎮 Press SPACE or tap to make the bird fly</p>
            <p>⚡ Avoid the pipes and try to get the highest score!</p>
            <p>🎯 The game gets harder as your score increases</p>
          </div>
        </div>
      </PS5GameWrapper>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <PS5GameWrapper gameTitle="Flappy Bird" onBack={() => window.history.back()}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '30px' }}>
          <div className="ps5-card" style={{ backgroundColor: 'var(--ps5-gradient-danger)', padding: '40px', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>💀 Game Over!</h2>
            <p style={{ color: 'white', fontSize: '1.2rem', margin: '10px 0' }}>Score: <span style={{ color: 'var(--ps5-accent-blue)', fontWeight: 'bold' }}>{score}</span></p>
            <p style={{ color: 'white', fontSize: '1rem', margin: '10px 0' }}>High Score: <span style={{ color: 'var(--ps5-accent-blue)', fontWeight: 'bold' }}>{highScore}</span></p>
            {score > highScore && <p style={{ color: '#00c853', fontWeight: 'bold', margin: '10px 0' }}>🎉 New High Score!</p>}
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px', justifyContent: 'center' }}>
              <button className="ps5-button ps5-button--success" onClick={restartGame}>Play Again</button>
              <button className="ps5-button ps5-button--danger" onClick={() => setGameState('welcome')}>Main Menu</button>
            </div>
          </div>
        </div>
      </PS5GameWrapper>
    );
  }

  return (
    <PS5GameWrapper gameTitle="Flappy Bird" onBack={() => window.history.back()}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', gap: '15px' }}>
        <div className="ps5-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '15px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--ps5-accent-blue)', textShadow: '0 0 10px var(--ps5-accent-blue)' }}>Score: {score}</div>
          <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)' }}>Player: {playerName || 'Player'}</div>
        </div>
        <div ref={gameContainerRef} onClick={handleJump} style={{ position: 'relative', width: `${BOARD_WIDTH}px`, height: `${BOARD_HEIGHT}px`, background: 'linear-gradient(to bottom, #70c5ce 0%, #4aa5cf 100%)', border: '4px solid var(--ps5-accent-blue)', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 0 30px rgba(0, 247, 255, 0.3)' }}>
          <div id="flappy-bird" style={{ position: 'absolute', left: '80px', top: `${birdPositionRef.current}px`, width: `${BIRD_SIZE.width}px`, height: `${BIRD_SIZE.height}px`, background: 'linear-gradient(45deg, #FFCC00, #FFA500)', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>🐦</div>
          <DynamicPipes />
          <div style={{ position: 'absolute', bottom: 0, width: '800px', height: '60px', background: 'linear-gradient(to right, #D9A441, #C8963E)', zIndex: 20, transform: `translateX(0px)` }} />
        </div>
      </div>
    </PS5GameWrapper>
  );
};

export default FlappyBirdGame;