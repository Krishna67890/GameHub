import React, { useState, useEffect, useRef } from 'react';
import '../../styles/ps5-theme.css';
import './TrollLaunchGame.css';
import PS5GameWrapper from '../../components/PS5GameWrapper';

type Troll = {
  id: number;
  name: string;
  icon: string;
  price: number;
  owned: boolean;
};

type Powerup = {
  count: number;
  active: boolean;
};

type Achievement = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
};

type GameState = {
  coins: number;
  level: number;
  score: number;
  maxLevel: number;
  selectedTroll: number;
  powerups: {
    multiShot: Powerup;
    giantTroll: Powerup;
    slowMotion: Powerup;
  };
  achievements: Record<string, boolean>;
  trolls: Troll[];
  combo: number;
  comboMultiplier: number;
  shotHistory: Array<{angle: number, power: number, hit: boolean, timestamp: string}>;
  shotsThisLevel: number;
  infiniteMode: boolean;
};

const TrollLaunchGame = () => {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    coins: 250,
    level: 1,
    score: 0,
    maxLevel: 15,
    selectedTroll: 0,
    powerups: {
      multiShot: { count: 2, active: false },
      giantTroll: { count: 1, active: false },
      slowMotion: { count: 3, active: false }
    },
    achievements: {
      firstWin: false,
      fiveLevels: false,
      perfectAim: false,
      coinCollector: false,
      infiniteMaster: false
    },
    trolls: [
      { id: 0, name: "Classic", icon: "🧌", price: 0, owned: true },
      { id: 1, name: "Viking", icon: "🤴", price: 100, owned: false },
      { id: 2, name: "Wizard", icon: "🧙", price: 200, owned: false },
      { id: 3, name: "Robot", icon: "🤖", price: 300, owned: false }
    ],
    combo: 0,
    comboMultiplier: 1,
    shotHistory: [],
    shotsThisLevel: 0,
    infiniteMode: false
  });

  // UI state
  const [angle, setAngle] = useState(0);
  const [power, setPower] = useState(50);
  const [isCharging, setIsCharging] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showCombo, setShowCombo] = useState(false);
  const [autoNextCountdown, setAutoNextCountdown] = useState(0);
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chargeStartTimeRef = useRef<number>(0);
  const powerIntervalRef = useRef<number | null>(null);
  const autoNextTimeoutRef = useRef<number | null>(null);

  // Game elements
  const [trolls, setTrolls] = useState<any[]>([]);
  const [targets, setTargets] = useState<any[]>([]);
  const [coins, setCoins] = useState<any[]>([]);
  const [obstacles, setObstacles] = useState<any[]>([]);
  
  // Physics constants
  const GRAVITY = 0.5;
  const FRICTION = 0.99;
  
  // Game loop ref
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Adjust angle function
  const adjustAngle = (delta: number) => {
    setAngle(prev => Math.max(-90, Math.min(90, prev + delta)));
  };

  // Start charging power
  const startCharging = () => {
    if (isCharging) return;
    
    setIsCharging(true);
    chargeStartTimeRef.current = Date.now();
    
    // Simulate power charging
    powerIntervalRef.current = setInterval(() => {
      setPower(prev => Math.min(200, prev + 2));
    }, 50);
  };

  // Launch the troll
  const launchTroll = () => {
    if (!isCharging) return;
    
    setIsCharging(false);
    
    if (powerIntervalRef.current) {
      clearInterval(powerIntervalRef.current);
    }
    
    // Record shot details
    const newShot = {
      angle,
      power,
      hit: false, // Will be updated after physics simulation
      timestamp: new Date().toLocaleTimeString()
    };
    
    setGameState(prev => ({
      ...prev,
      shotHistory: [...prev.shotHistory, newShot],
      shotsThisLevel: prev.shotsThisLevel + 1
    }));
    
    // Reset power after launch
    setPower(50);
    
    // Add a new troll to the game with physics
    const newTroll = {
      id: Date.now(),
      x: 100,
      y: 400,
      velocityX: Math.cos(angle * Math.PI / 180) * power / 8,
      velocityY: Math.sin(angle * Math.PI / 180) * power / 8,
      radius: gameState.powerups.giantTroll.active ? 25 : 15,
      color: gameState.trolls.find(t => t.id === gameState.selectedTroll)?.icon || '🧌',
      type: gameState.selectedTroll,
      launched: true
    };
    
    setTrolls(prev => [...prev, newTroll]);
    
    // Deactivate powerup if used
    if (gameState.powerups.giantTroll.active) {
      setGameState(prev => ({
        ...prev,
        powerups: {
          ...prev.powerups,
          giantTroll: {
            ...prev.powerups.giantTroll,
            active: false,
            count: prev.powerups.giantTroll.count - 1
          }
        }
      }));
    }
    
    // Start game loop if not already running
    if (!gameLoopRef.current) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  };
  
  // Game loop for physics
  const gameLoop = (timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    // Update trolls
    setTrolls(prevTrolls => {
      return prevTrolls.map(troll => {
        if (!troll.launched) return troll;
        
        let newX = troll.x + troll.velocityX;
        let newY = troll.y + troll.velocityY;
        let newVelX = troll.velocityX * FRICTION;
        let newVelY = troll.velocityY + GRAVITY;
        
        // Boundary collision
        if (newX < troll.radius || newX > 800 - troll.radius) {
          newVelX = -newVelX * 0.8; // Bounce with energy loss
          newX = newX < troll.radius ? troll.radius : 800 - troll.radius;
        }
        
        if (newY > 600 - troll.radius) {
          newVelY = -newVelY * 0.7; // Bounce with energy loss
          newY = 600 - troll.radius;
          
          // If velocity is very low, stop bouncing
          if (Math.abs(newVelY) < 1) {
            newVelY = 0;
          }
        }
        
        return {
          ...troll,
          x: newX,
          y: newY,
          velocityX: newVelX,
          velocityY: newVelY
        };
      }).filter(troll => {
        // Remove trolls that have stopped moving and are on the ground
        return !(Math.abs(troll.velocityY) < 0.1 && troll.y > 600 - troll.radius - 5 && Math.abs(troll.velocityX) < 0.1);
      });
    });
    
    // Check for collisions with targets
    setTargets(prevTargets => {
      const updatedTargets = [...prevTargets];
      
      setTrolls(prevTrolls => {
        return prevTrolls.map(troll => {
          let hit = false;
          
          for (let i = 0; i < updatedTargets.length; i++) {
            const target = updatedTargets[i];
            if (target.hit) continue;
            
            const dx = troll.x - (target.x + target.width / 2);
            const dy = troll.y - (target.y + target.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < troll.radius + 15) { // 15 is target radius
              updatedTargets[i] = { ...target, hit: true };
              hit = true;
              
              // Update game state when target is hit
              setGameState(prev => ({
                ...prev,
                score: prev.score + 100,
                coins: prev.coins + 25,
                combo: prev.combo + 1,
                comboMultiplier: prev.comboMultiplier
              }));
              
              // Show combo effect
              setShowCombo(true);
              setTimeout(() => setShowCombo(false), 1000);
              
              break;
            }
          }
          
          return { ...troll, hit };
        });
      });
      
      return updatedTargets;
    });
    
    // Check if all targets are hit to advance level
    const allTargetsHit = targets.length > 0 && targets.every(target => target.hit);
    if (allTargetsHit) {
      setTimeout(() => {
        setGameState(prev => {
          const newLevel = prev.level + 1;
          
          // Initialize new targets for the next level
          const newTargets = [];
          for (let i = 0; i < Math.min(3 + newLevel, 8); i++) {
            newTargets.push({
              id: i,
              x: 400 + i * 80,
              y: 200 + (i % 3) * 80,
              width: 50,
              height: 50,
              hit: false
            });
          }
          setTargets(newTargets);
          
          return {
            ...prev,
            level: newLevel,
            score: prev.score + 500, // Level completion bonus
            coins: prev.coins + 100,
            shotsThisLevel: 0,
            combo: 0
          };
        });
      }, 1500);
    }
    
    // Continue game loop
    if (trolls.length > 0 || !allTargetsHit) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  };
  
  // Cleanup game loop on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  // Select a troll
  const selectTroll = (id: number) => {
    if (gameState.trolls.find(t => t.id === id)?.owned) {
      setGameState(prev => ({
        ...prev,
        selectedTroll: id
      }));
    }
  };

  // Buy a troll
  const buyTroll = (id: number) => {
    const troll = gameState.trolls.find(t => t.id === id);
    if (!troll || troll.owned) return;
    
    if (gameState.coins >= troll.price) {
      setGameState(prev => ({
        ...prev,
        coins: prev.coins - troll.price,
        trolls: prev.trolls.map(t => 
          t.id === id ? {...t, owned: true} : t
        )
      }));
    }
  };

  // Use a powerup
  const usePowerup = (powerupType: keyof typeof gameState.powerups) => {
    if (gameState.powerups[powerupType].count > 0) {
      setGameState(prev => ({
        ...prev,
        powerups: {
          ...prev.powerups,
          [powerupType]: {
            ...prev.powerups[powerupType],
            active: true,
            count: prev.powerups[powerupType].count - 1
          }
        }
      }));
    }
  };

  // Reset game
  const resetGame = () => {
    setGameState({
      coins: 250,
      level: 1,
      score: 0,
      maxLevel: 15,
      selectedTroll: 0,
      powerups: {
        multiShot: { count: 2, active: false },
        giantTroll: { count: 1, active: false },
        slowMotion: { count: 3, active: false }
      },
      achievements: {
        firstWin: false,
        fiveLevels: false,
        perfectAim: false,
        coinCollector: false,
        infiniteMaster: false
      },
      trolls: [
        { id: 0, name: "Classic", icon: "🧌", price: 0, owned: true },
        { id: 1, name: "Viking", icon: "🤴", price: 100, owned: false },
        { id: 2, name: "Wizard", icon: "🧙", price: 200, owned: false },
        { id: 3, name: "Robot", icon: "🤖", price: 300, owned: false }
      ],
      combo: 0,
      comboMultiplier: 1,
      shotHistory: [],
      shotsThisLevel: 0,
      infiniteMode: false
    });
    setTrolls([]);
    setTargets([]);
    setCoins([]);
    setObstacles([]);
    setAngle(0);
    setPower(50);
  };

  // Start game
  const startGame = () => {
    setShowTutorial(false);
    resetGame();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (powerIntervalRef.current) {
        clearInterval(powerIntervalRef.current);
      }
      if (autoNextTimeoutRef.current) {
        clearTimeout(autoNextTimeoutRef.current);
      }
    };
  }, []);

  // Initialize game elements
  useEffect(() => {
    // Initialize targets for the current level
    setTargets(prevTargets => {
      const newTargets = [];
      for (let i = 0; i < Math.min(3 + gameState.level, 8); i++) {
        newTargets.push({
          id: i,
          x: 400 + i * 80,
          y: 200 + (i % 3) * 80,
          width: 50,
          height: 50,
          hit: false
        });
      }
      return newTargets;
    });
  }, [gameState.level]);
  
  // Initialize targets when game starts
  useEffect(() => {
    // Initialize targets for the initial level
    const initialTargets = [];
    for (let i = 0; i < Math.min(3 + gameState.level, 8); i++) {
      initialTargets.push({
        id: i,
        x: 400 + i * 80,
        y: 200 + (i % 3) * 80,
        width: 50,
        height: 50,
        hit: false
      });
    }
    setTargets(initialTargets);
  }, []);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') adjustAngle(-5);
      if (e.key === 'ArrowRight') adjustAngle(5);
      if (e.key === ' ') startCharging();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') launchTroll();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isCharging]);

  return (
    <PS5GameWrapper gameTitle="Troll Launch" onBack={() => window.history.back()}>
      <div className="container">
        <header>
          <div className="logo">
            <div className="logo-icon">🧌</div>
            <div className="logo-text">TROLL LAUNCH</div>
          </div>
          <div className="header-controls">
            <button className="header-btn" title="Fullscreen">
              <i className="fas fa-expand"></i>
            </button>
          </div>
          <div className="stats">
            <div className="stat-box">
              <div className="stat-value" id="coins">{gameState.coins}</div>
              <div className="stat-label">Coins</div>
            </div>
            <div className="stat-box">
              <div className="stat-value" id="level">{gameState.level}</div>
              <div className="stat-label">Level</div>
            </div>
            <div className="stat-box">
              <div className="stat-value" id="score">{gameState.score}</div>
              <div className="stat-label">Score</div>
            </div>
          </div>
        </header>
        
        <div className="game-container">
          <div className="game-area">
            <canvas 
              id="gameCanvas" 
              ref={canvasRef}
              width={800}
              height={600}
              onClick={(e) => {
                // Handle canvas click for game interactions
              }}
            />
            
            {/* Render game elements */}
            <div className="game-elements">
              {/* Render trolls */}
              {trolls.map(troll => (
                <div 
                  key={troll.id}
                  className="troll"
                  style={{
                    position: 'absolute',
                    left: `${troll.x - troll.radius}px`,
                    top: `${troll.y - troll.radius}px`,
                    width: `${troll.radius * 2}px`,
                    height: `${troll.radius * 2}px`,
                    fontSize: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    zIndex: 10
                  }}
                >
                  {gameState.trolls[troll.type]?.icon || '🧌'}
                </div>
              ))}
              
              {/* Render targets */}
              {targets.map(target => (
                <div 
                  key={target.id}
                  className={`target ${target.hit ? 'hit' : ''}`}
                  style={{
                    position: 'absolute',
                    left: `${target.x}px`,
                    top: `${target.y}px`,
                    width: `${target.width}px`,
                    height: `${target.height}px`,
                    backgroundColor: target.hit ? '#444' : '#ff5555',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                    zIndex: 5
                  }}
                >
                  {!target.hit && '🎯'}
                </div>
              ))}
            </div>
            
            <div className="level-indicator">
              Level <span id="currentLevel">{gameState.level}</span>
              <div className="level-progress">
                <div 
                  className="level-progress-bar" 
                  id="levelProgress"
                  style={{ width: `${(gameState.shotsThisLevel % 5) * 20}%` }}
                ></div>
              </div>
            </div>
            
            <div className="shot-history">
              <div className="shot-history-title">Shot History</div>
              <div id="shotHistoryList">
                {gameState.shotHistory.slice(-5).map((shot, index) => (
                  <div key={index} className="shot-item">
                    {shot.angle.toFixed(0)}°, {shot.power.toFixed(0)}p - {shot.hit ? 'HIT' : 'MISS'}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="power-meter" id="powerMeter" style={{ display: isCharging ? 'block' : 'none' }}>
              <div 
                className="power-fill" 
                id="powerFill" 
                style={{ width: `${(power / 200) * 100}%` }}
              ></div>
            </div>
            
            {autoNextCountdown > 0 && (
              <div className="auto-next-notification" id="autoNextNotification" style={{ opacity: 1 }}>
                <h3>Level Complete!</h3>
                <p>Next level starting in <span id="countdown">{autoNextCountdown}</span> seconds</p>
              </div>
            )}
            
            <div className="controls">
              <div 
                className="control-btn" 
                id="leftBtn"
                onClick={() => adjustAngle(-5)}
              >
                <i className="fas fa-arrow-left"></i>
              </div>
              <div 
                className={`control-btn ${isCharging ? 'charging' : ''}`} 
                id="launchBtn"
                onMouseDown={startCharging}
                onMouseUp={launchTroll}
                onTouchStart={startCharging}
                onTouchEnd={launchTroll}
              >
                <i className="fas fa-rocket"></i>
              </div>
              <div 
                className="control-btn" 
                id="rightBtn"
                onClick={() => adjustAngle(5)}
              >
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
            
            {showCombo && (
              <div className="combo-display" id="comboDisplay" style={{ opacity: 1 }}>
                COMBO x<span id="comboCount">{gameState.combo}</span>!
              </div>
            )}
          </div>
          
          <div className="sidebar">
            <div className="section">
              <div className="section-title">
                <i className="fas fa-map"></i>
                Levels
              </div>
              <div className="level-list" id="levelList">
                {Array.from({ length: gameState.maxLevel }, (_, i) => i + 1).map(level => (
                  <div 
                    key={level} 
                    className={`level ${level === gameState.level ? 'active' : ''} ${level > 5 ? 'locked' : ''}`}
                    onClick={() => level <= 5 && setGameState(prev => ({ ...prev, level }))}
                  >
                    {level}
                  </div>
                ))}
                <div className="level infinite" onClick={() => setGameState(prev => ({ ...prev, infiniteMode: true, level: 999 }))}>
                  ∞
                </div>
              </div>
            </div>
            
            <div className="section">
              <div className="section-title">
                <i className="fas fa-user"></i>
                Select Troll
              </div>
              <div className="troll-selector" id="trollSelector">
                {gameState.trolls.map(troll => (
                  <div 
                    key={troll.id}
                    className={`troll-option ${gameState.selectedTroll === troll.id ? 'active' : ''}`}
                    onClick={() => selectTroll(troll.id)}
                  >
                    <div className="troll-icon">{troll.icon}</div>
                    <div className="troll-name">{troll.name}</div>
                    {!troll.owned && (
                      <div className="troll-price" onClick={(e) => {
                        e.stopPropagation();
                        buyTroll(troll.id);
                      }}>
                        {troll.price} coins
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="section">
              <div className="section-title">
                <i className="fas fa-bolt"></i>
                Power-ups
              </div>
              <div className="powerups" id="powerups">
                <div className="powerup" onClick={() => usePowerup('multiShot')}>
                  <div className="powerup-icon">🎯</div>
                  <div className="powerup-info">
                    <div className="powerup-name">Multi-Shot</div>
                    <div className="powerup-desc">Launch 3 trolls at once</div>
                  </div>
                  <div className="powerup-count">{gameState.powerups.multiShot.count}</div>
                </div>
                
                <div className="powerup" onClick={() => usePowerup('giantTroll')}>
                  <div className="powerup-icon"> enlarge </div>
                  <div className="powerup-info">
                    <div className="powerup-name">Giant Troll</div>
                    <div className="powerup-desc">Larger troll, more damage</div>
                  </div>
                  <div className="powerup-count">{gameState.powerups.giantTroll.count}</div>
                </div>
                
                <div className="powerup" onClick={() => usePowerup('slowMotion')}>
                  <div className="powerup-icon">⏳</div>
                  <div className="powerup-info">
                    <div className="powerup-name">Slow Motion</div>
                    <div className="powerup-desc">Slower game speed</div>
                  </div>
                  <div className="powerup-count">{gameState.powerups.slowMotion.count}</div>
                </div>
              </div>
            </div>
            
            <div className="section">
              <div className="section-title">
                <i className="fas fa-trophy"></i>
                Achievements
              </div>
              <div className="achievements" id="achievements">
                <div className="achievement">
                  <div className="achievement-icon">🏆</div>
                  <div className="achievement-info">
                    <div className="achievement-name">First Win</div>
                    <div className="achievement-desc">Complete your first level</div>
                  </div>
                </div>
                
                <div className="achievement">
                  <div className="achievement-icon">🎯</div>
                  <div className="achievement-info">
                    <div className="achievement-name">Perfect Aim</div>
                    <div className="achievement-desc">Hit all targets in a level</div>
                  </div>
                </div>
                
                <div className="achievement">
                  <div className="achievement-icon">💰</div>
                  <div className="achievement-info">
                    <div className="achievement-name">Coin Collector</div>
                    <div className="achievement-desc">Collect 1000 coins</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <footer>
          <p>Troll Launch &copy; 2023 | A fun physics-based puzzle game | Follows all community guidelines</p>
        </footer>
      </div>
      
      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="modal active" id="tutorialModal">
          <div className="modal-content">
            <h2 className="modal-title">Welcome to Troll Launch!</h2>
            <p className="modal-text">
              Your mission is to launch trolls to hit targets and complete levels.
              <br /><br />
              <strong>New Advanced Controls:</strong>
              <br />
              • Use arrow buttons to aim
              <br />
              • <span style={{ color: '#ffcc00' }}>HOLD the fire button to charge power</span>
              <br />
              • Release to launch with more force!
              <br /><br />
              Complete levels to earn coins and unlock new trolls and power-ups.
              <br />
              Levels automatically advance when all targets are destroyed!
            </p>
            <button className="modal-btn" id="startGameBtn" onClick={startGame}>Start Playing</button>
          </div>
        </div>
      )}
    </PS5GameWrapper>
  );
};

export default TrollLaunchGame;