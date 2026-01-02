import React, { useState, useEffect, useRef } from 'react';
import { FaSync, FaArrowUp, FaBullseye, FaWind } from 'react-icons/fa';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import '../../styles/ps5-theme.css';

interface Target {
  x: number;
  y: number;
  radius: number;
  points: number;
  hit: boolean;
  moving: boolean;
  speedX: number;
  speedY: number;
  type: 'normal' | 'bonus';
}

interface Arrow {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ArcheryGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  
  const [gameState, setGameState] = useState({
    level: 1,
    score: 0,
    arrows: 10,
    shotsFired: 0,
    shotsHit: 0,
    bowPower: 1.0,
    maxArrows: 10,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragCurrent: { x: 0, y: 0 },
    isPaused: false,
    isGameOver: false,
    isGameStarted: false,
    highScore: 0,
    multiplier: 1,
    streak: 0
  });

  const [wind, setWind] = useState({ x: 0, y: 0, speed: 0, angle: 0 });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [achievement, setAchievement] = useState<{title: string, text: string} | null>(null);

  // Game objects refs to avoid re-renders
  const targetsRef = useRef<Target[]>([]);
  const arrowsRef = useRef<Arrow[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const bowPosRef = useRef({ x: 80, y: 0 });
  const animationFrameRef = useRef<number>();
  
  // Initialize game
  useEffect(() => {
    const savedHighScore = localStorage.getItem('archeryMasterHighScore');
    if (savedHighScore) {
      setGameState(prev => ({ ...prev, highScore: parseInt(savedHighScore) }));
    }
    
    // Initial setup
    const setupGame = () => {
      if (containerRef.current) {
        bowPosRef.current.y = containerRef.current.clientHeight / 2;
        // Set canvas dimensions
        if (canvasRef.current) {
          canvasRef.current.width = containerRef.current.clientWidth;
          canvasRef.current.height = containerRef.current.clientHeight;
        }
      }
    };
    
    // Use setTimeout to ensure DOM is ready
    setTimeout(setupGame, 100);
    
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        bowPosRef.current.y = containerRef.current.clientHeight / 2;
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial resize after DOM is ready
    setTimeout(handleResize, 100);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Generate level
  const generateLevel = (level: number) => {
    if (!canvasRef.current) return;
    
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    targetsRef.current = [];
    obstaclesRef.current = [];
    arrowsRef.current = [];
    
    // Targets
    const numTargets = Math.min(5 + Math.floor(level / 2), 15);
    for (let i = 0; i < numTargets; i++) {
      targetsRef.current.push({
        x: 300 + Math.random() * (width - 400),
        y: 50 + Math.random() * (height - 150),
        radius: 15 + Math.random() * 10,
        points: 10,
        hit: false,
        moving: level > 2 && Math.random() > 0.5,
        speedX: level > 2 ? (Math.random() - 0.5) * 2 : 0,
        speedY: level > 2 ? (Math.random() - 0.5) * 2 : 0,
        type: Math.random() > 0.8 ? 'bonus' : 'normal'
      });
    }
    
    // Obstacles
    if (level > 3) {
      const numObstacles = Math.min(Math.floor(level / 3), 8);
      for (let i = 0; i < numObstacles; i++) {
        obstaclesRef.current.push({
          x: 250 + Math.random() * (width - 350),
          y: 80 + Math.random() * (height - 180),
          width: 20 + Math.random() * 40,
          height: 20 + Math.random() * 40
        });
      }
    }
    
    // Wind
    const windStrength = Math.min(0.5 + level * 0.05, 2.0);
    const windAngle = Math.random() * Math.PI * 2;
    const windX = Math.cos(windAngle) * windStrength;
    const windY = Math.sin(windAngle) * windStrength;
    
    setWind({
      x: windX,
      y: windY,
      speed: parseFloat(windStrength.toFixed(1)),
      angle: windAngle * (180 / Math.PI)
    });
  };

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isGameStarted: true,
      isGameOver: false,
      level: 1,
      score: 0,
      arrows: 10,
      shotsFired: 0,
      shotsHit: 0,
      streak: 0,
      multiplier: 1
    }));
    generateLevel(1);
    gameLoop();
  };

  const gameLoop = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background elements (distance markers)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      const x = 200 * i;
      if (x < width) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px Arial';
        ctx.fillText(`${i * 10}m`, x + 5, 20);
      }
    }
    
    // Update and draw targets
    targetsRef.current.forEach(target => {
      if (target.hit) return;
      
      // Move target
      if (target.moving) {
        target.x += target.speedX;
        target.y += target.speedY;
        
        // Bounce
        if (target.x - target.radius < 200 || target.x + target.radius > width) target.speedX *= -1;
        if (target.y - target.radius < 50 || target.y + target.radius > height - 50) target.speedY *= -1;
      }
      
      // Draw target
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
      ctx.fillStyle = target.type === 'bonus' ? '#FFD700' : '#FF0000';
      ctx.fill();
      
      // Target rings
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(target.x, target.y, target.radius * 0.7, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(target.x, target.y, target.radius * 0.4, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(target.x, target.y, target.radius * 0.1, 0, Math.PI * 2); 
      ctx.fillStyle = '#FFFFFF'; ctx.fill();
    });
    
    // Draw obstacles
    ctx.fillStyle = '#8B4513';
    obstaclesRef.current.forEach(obs => {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 1;
      for (let i = 0; i < obs.width; i += 5) {
        ctx.beginPath();
        ctx.moveTo(obs.x + i, obs.y);
        ctx.lineTo(obs.x + i, obs.y + obs.height);
        ctx.stroke();
      }
    });
    
    // Update and draw arrows
    for (let i = arrowsRef.current.length - 1; i >= 0; i--) {
      const arrow = arrowsRef.current[i];
      
      // Physics
      arrow.speedX += wind.x * 0.05;
      arrow.speedY += wind.y * 0.05 + 0.1; // Wind + Gravity
      arrow.x += arrow.speedX;
      arrow.y += arrow.speedY;
      
      // Draw Arrow
      ctx.save();
      ctx.translate(arrow.x, arrow.y);
      ctx.rotate(Math.atan2(arrow.speedY, arrow.speedX));
      
      // Shaft
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-20, 0);
      ctx.strokeStyle = '#8B4513'; ctx.lineWidth = 3; ctx.stroke();
      // Head
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-5, -3); ctx.lineTo(-5, 3); ctx.closePath();
      ctx.fillStyle = '#C0C0C0'; ctx.fill();
      // Fletching
      ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-25, -5); ctx.lineTo(-25, 5); ctx.closePath();
      ctx.fillStyle = '#FFFFFF'; ctx.fill();
      ctx.restore();
      
      // Collision detection
      let hit = false;
      
      // Targets
      targetsRef.current.forEach(target => {
        if (!target.hit && !hit) {
          const dx = arrow.x - target.x;
          const dy = arrow.y - target.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < target.radius) {
            target.hit = true;
            hit = true;
            
            // Score calculation
            let points = target.points;
            if (target.type === 'bonus') {
              points *= 2;
              showAchievement('Bonus Target!', `+${points} Points`);
            }
            
            // Multiplier
            setGameState(prev => {
              const newStreak = prev.streak + 1;
              let newMult = 1;
              if (newStreak >= 5) newMult = 3;
              else if (newStreak >= 3) newMult = 2;
              
              const totalPoints = points * newMult;
              
              // Check Bullseye
              if (dist < target.radius * 0.2) {
                 showAchievement('Bullseye!', `+${10 * newMult} Bonus`);
                 return {
                   ...prev,
                   score: prev.score + totalPoints + (10 * newMult),
                   shotsHit: prev.shotsHit + 1,
                   streak: newStreak,
                   multiplier: newMult
                 };
              }
              
              return {
                ...prev,
                score: prev.score + totalPoints,
                shotsHit: prev.shotsHit + 1,
                streak: newStreak,
                multiplier: newMult
              };
            });
            
            createHitEffect(target.x, target.y);
          }
        }
      });
      
      // Obstacles
      if (!hit) {
        obstaclesRef.current.forEach(obs => {
          if (arrow.x > obs.x && arrow.x < obs.x + obs.width &&
              arrow.y > obs.y && arrow.y < obs.y + obs.height) {
            hit = true;
            createHitEffect(arrow.x, arrow.y);
            setGameState(prev => ({ ...prev, streak: 0, multiplier: 1 }));
          }
        });
      }
      
      // Bounds
      if (arrow.x < 0 || arrow.x > width || arrow.y < 0 || arrow.y > height || hit) {
        arrowsRef.current.splice(i, 1);
      }
    }
    
    // Draw Bow
    const bowX = bowPosRef.current.x;
    const bowY = bowPosRef.current.y;
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(bowX - 5, bowY - 40, 10, 80);
    ctx.beginPath(); ctx.arc(bowX, bowY, 40, 0, Math.PI, true);
    ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 8; ctx.stroke();
    
    // Bowstring
    ctx.beginPath();
    if (gameState.isDragging) {
      ctx.moveTo(bowX - 30, bowY);
      ctx.lineTo(gameState.dragCurrent.x, gameState.dragCurrent.y);
      ctx.lineTo(bowX + 30, bowY);
    } else {
      ctx.moveTo(bowX - 30, bowY);
      ctx.lineTo(bowX + 30, bowY);
    }
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2; ctx.stroke();
    
    // Trajectory
    if (gameState.isDragging) {
      const dx = gameState.dragCurrent.x - bowX;
      const dy = gameState.dragCurrent.y - bowY;
      const pull = Math.min(Math.sqrt(dx*dx + dy*dy) / 100, 1);
      const speed = 15 * pull * gameState.bowPower;
      const angle = Math.atan2(dy, dx);
      
      let tx = bowX, ty = bowY;
      let vx = Math.cos(angle) * speed;
      let vy = Math.sin(angle) * speed;
      
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      for(let i=0; i<30; i++) {
        vx += wind.x * 0.05;
        vy += wind.y * 0.05 + 0.1;
        tx += vx;
        ty += vy;
        ctx.lineTo(tx, ty);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Check level complete
    if (targetsRef.current.every(t => t.hit) && targetsRef.current.length > 0) {
      // Avoid spamming level up
      if (!showLevelUp) {
        handleLevelComplete();
      }
    } else if (gameState.arrows <= 0 && arrowsRef.current.length === 0 && !gameState.isGameOver) {
      if (!targetsRef.current.every(t => t.hit)) {
        setGameState(prev => ({ ...prev, isGameOver: true }));
        if (gameState.score > gameState.highScore) {
          localStorage.setItem('archeryMasterHighScore', gameState.score.toString());
        }
      }
    }
    
    if (!gameState.isGameOver && !gameState.isPaused) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  };

  const handleLevelComplete = () => {
    setShowLevelUp(true);
    setGameState(prev => ({ 
      ...prev, 
      score: prev.score + (prev.level * 25) 
    }));
    
    setTimeout(() => {
      setShowLevelUp(false);
      setGameState(prev => {
        const nextLevel = prev.level + 1;
        generateLevel(nextLevel);
        return { ...prev, level: nextLevel, arrows: prev.arrows + 3 }; // Bonus arrows
      });
      // Need to restart loop as it might have paused? Actually loop continues unless game over
    }, 2000);
  };

  const createHitEffect = (x: number, y: number) => {
    const effect = document.createElement('div');
    effect.className = 'ag-hit-effect';
    effect.style.left = `${x - 30}px`;
    effect.style.top = `${y - 30}px`;
    containerRef.current?.appendChild(effect);
    setTimeout(() => effect.remove(), 500);
  };

  const showAchievement = (title: string, text: string) => {
    setAchievement({ title, text });
    setTimeout(() => setAchievement(null), 2000);
  };

  // Input handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState.arrows <= 0) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    // Adjust for container offset
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setGameState(prev => ({
      ...prev,
      isDragging: true,
      dragStart: { x: clientX, y: clientY },
      dragCurrent: { x: bowPosRef.current.x, y: bowPosRef.current.y } // Start visually at bow
    }));
  };

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    if (!gameState.isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate relative mouse position
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    // Constrain drag
    const bowX = bowPosRef.current.x;
    const bowY = bowPosRef.current.y;
    const dx = relX - bowX;
    const dy = relY - bowY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const maxDist = 100;
    
    let finalX = relX;
    let finalY = relY;
    
    if (dist > maxDist) {
      const angle = Math.atan2(dy, dx);
      finalX = bowX + Math.cos(angle) * maxDist;
      finalY = bowY + Math.sin(angle) * maxDist;
    }

    setGameState(prev => ({
      ...prev,
      dragCurrent: { x: finalX, y: finalY }
    }));
  };

  const handleDragEnd = () => {
    if (!gameState.isDragging) return;
    
    const dx = gameState.dragCurrent.x - bowPosRef.current.x;
    const dy = gameState.dragCurrent.y - bowPosRef.current.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist > 20 && gameState.arrows > 0) {
      const pull = Math.min(dist / 100, 1);
      const speed = 15 * pull * gameState.bowPower;
      const angle = Math.atan2(dy, dx);
      
      arrowsRef.current.push({
        x: bowPosRef.current.x,
        y: bowPosRef.current.y,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed
      });
      
      setGameState(prev => {
         // Reset streak on miss logic handled in loop
         return {
           ...prev,
           isDragging: false,
           arrows: prev.arrows - 1,
           shotsFired: prev.shotsFired + 1
         };
      });
    } else {
      setGameState(prev => ({ ...prev, isDragging: false }));
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDrag);
    window.addEventListener('touchend', handleDragEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDrag);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [gameState.isDragging]);

  // Restart loop on state change if needed (usually handled by ref)
  useEffect(() => {
     if (gameState.isGameStarted && !gameState.isGameOver && !gameState.isPaused && !animationFrameRef.current) {
        gameLoop();
     }
  }, [gameState.isGameStarted, gameState.isGameOver, gameState.isPaused]);

  // Upgrade handlers
  const buyPower = () => {
    if (gameState.score >= 100) {
      setGameState(prev => ({ ...prev, score: prev.score - 100, bowPower: prev.bowPower + 0.2 }));
      showAchievement('Upgraded!', 'Power Increased');
    }
  };
  
  const buyArrows = () => {
    if (gameState.score >= 50) {
      setGameState(prev => ({ ...prev, score: prev.score - 50, arrows: prev.arrows + 5, maxArrows: prev.maxArrows + 5 }));
      showAchievement('Restocked!', '+5 Arrows');
    }
  };

  return (
    <PS5GameWrapper gameTitle="Archery Master" onBack={() => window.history.back()}>
      <div className="archery-game" style={{ width: '100%', height: '100%' }}>
        <div className="ag-header">
          <h1 className="ag-title">Archery Master</h1>
          <p className="ag-subtitle">Real Physics • Drag & Shoot</p>
        </div>
        
        <div className="ag-score-panel">
          <div className="ag-score-item">
            <div className="ag-score-label">SCORE</div>
            <div className="ag-score-value">{gameState.score}</div>
          </div>
          <div className="ag-score-item">
            <div className="ag-score-label">BEST</div>
            <div className="ag-score-value">{gameState.highScore}</div>
          </div>
          <div className="ag-score-item">
            <div className="ag-score-label">ACCURACY</div>
            <div className="ag-score-value">
              {gameState.shotsFired > 0 ? Math.round((gameState.shotsHit / gameState.shotsFired) * 100) : 0}%
            </div>
          </div>
          <div className="ag-score-item">
            <div className="ag-score-label">LEVEL</div>
            <div className="ag-score-value">{gameState.level}</div>
          </div>
        </div>
        
        <div className="ag-game-container" ref={containerRef}>
          <canvas ref={canvasRef} />
          
          {/* Drag Handle UI */}
          <div 
            className="ag-drag-handle" 
            ref={dragHandleRef}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            style={{
              left: gameState.isDragging ? `${gameState.dragCurrent.x - 20}px` : `${bowPosRef.current.x - 20}px`,
              top: gameState.isDragging ? `${gameState.dragCurrent.y - 20}px` : `${bowPosRef.current.y - 20}px`,
              cursor: gameState.isDragging ? 'grabbing' : 'grab',
              position: 'absolute',
              pointerEvents: 'auto'
            }}
          />

          {/* UI Overlay */}
          <div className="ag-ui-overlay">
            <div className="ag-stats-panel">
              <div className="ag-stat">
                <span>Arrows:</span>
                <span className="ag-stat-value">{gameState.arrows}</span>
              </div>
              <div className="ag-stat">
                <span>Power:</span>
                <span className="ag-stat-value">{gameState.bowPower.toFixed(1)}x</span>
              </div>
              <div className="ag-stat">
                <span>Multiplier:</span>
                <span className="ag-stat-value">{gameState.multiplier}x</span>
              </div>
            </div>
            
            <div className="ag-controls">
              <button className="ag-btn ps5-button" onClick={buyPower} disabled={gameState.score < 100}>
                <FaBullseye /> Power (100)
              </button>
              <button className="ag-btn ps5-button" onClick={buyArrows} disabled={gameState.score < 50}>
                <FaArrowUp /> Arrows (50)
              </button>
              <button className="ag-btn ps5-button" onClick={startGame}>
                <FaSync /> Restart
              </button>
            </div>
          </div>

          {/* Indicators */}
          <div className="ag-power-indicator">
             <div 
               className="ag-power-fill" 
               style={{ 
                 width: gameState.isDragging 
                   ? `${Math.min(Math.sqrt(Math.pow(gameState.dragCurrent.x - bowPosRef.current.x, 2) + Math.pow(gameState.dragCurrent.y - bowPosRef.current.y, 2)), 100)}%` 
                   : '0%' 
               }} 
             />
          </div>
          
          <div className="ag-wind-indicator">
            <span>Wind:</span>
            <div className="ag-wind-arrow" style={{ transform: `rotate(${wind.angle}deg)` }} />
            <span>{wind.speed}</span>
          </div>

          {/* Overlays */}
          {!gameState.isGameStarted && (
            <div className="ag-modal">
               <div className="ag-modal-content ps5-card">
                 <h2>Ready Aim Fire!</h2>
                 <p>Drag the handle to aim and shoot targets. Account for wind and gravity!</p>
                 <button className="ag-btn ps5-button" style={{margin:'0 auto', fontSize:'1.2rem', padding:'10px 30px'}} onClick={startGame}>Start Game</button>
               </div>
            </div>
          )}

          {gameState.isGameOver && (
            <div className="ag-modal">
               <div className="ag-modal-content ps5-card">
                 <h2>Out of Arrows!</h2>
                 <p>Final Score: {gameState.score}</p>
                 <p>Level Reached: {gameState.level}</p>
                 <button className="ag-btn ps5-button" style={{margin:'0 auto'}} onClick={startGame}>Play Again</button>
               </div>
            </div>
          )}

          {showLevelUp && (
            <div className="ag-level-up">
              Level {gameState.level} Complete!<br/>
              <span style={{fontSize:'0.7em', color:'#fff'}}>+{(gameState.level * 25)} Points</span>
            </div>
          )}

          <div className={`ag-achievement ${achievement ? 'show' : ''}`}>
             <div className="ag-achievement-title">{achievement?.title}</div>
             <div className="ag-achievement-text">{achievement?.text}</div>
          </div>
        </div>
      </div>
    </PS5GameWrapper>
  );
};

export default ArcheryGame;