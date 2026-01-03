import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CarromGame.css';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import { useGame } from '../../components/context/GameContext';
import { useAuth } from '../../components/context/AuthContext';

interface Coin {
  id: number;
  type: 'white' | 'black' | 'red';
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  status: 'on-board' | 'pocketed';
  radius: number;
}

interface Vector2D {
  x: number;
  y: number;
}

const CarromGame = () => {
  const { user } = useAuth();
  const { updateGameProgress } = useGame();
  
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [playerTurn, setPlayerTurn] = useState(1); // 1 for Player 1 (White), 2 for Player 2 (Black)
  const [coins, setCoins] = useState<Coin[]>([]);
  const [strikerPosition, setStrikerPosition] = useState({ x: 300, y: 500 });
  const [aim, setAim] = useState(0); // Angle in degrees
  const [isAiming, setIsAiming] = useState(false);
  const [gameState, setGameState] = useState<'placing' | 'aiming' | 'striking' | 'moving'>('placing'); // placing -> aiming -> striking -> moving -> end_turn
  const [strikerVelocity, setStrikerVelocity] = useState<Vector2D>({ x: 0, y: 0 });
  const [power, setPower] = useState(0);
  
  // Refs to keep track of current values during physics simulation
  const scoreRef = useRef(score);
  const playerTurnRef = useRef(playerTurn);
  const coinsRef = useRef(coins);
  const strikerPositionRef = useRef(strikerPosition);
  const strikerVelocityRef = useRef(strikerVelocity);
  
  // Update refs when state changes
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  
  useEffect(() => {
    playerTurnRef.current = playerTurn;
  }, [playerTurn]);
  
  useEffect(() => {
    coinsRef.current = coins;
  }, [coins]);
  
  useEffect(() => {
    strikerPositionRef.current = strikerPosition;
  }, [strikerPosition]);
  
  useEffect(() => {
    strikerVelocityRef.current = strikerVelocity;
  }, [strikerVelocity]);
  
  // Initialize refs with initial values
  useEffect(() => {
    scoreRef.current = score;
    playerTurnRef.current = playerTurn;
    coinsRef.current = coins;
    strikerPositionRef.current = strikerPosition;
    strikerVelocityRef.current = strikerVelocity;
  }, []);
  
  const boardSize = 600;
  const boardRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  
  // Constants
  const STRIKER_RADIUS = 15;
  const COIN_RADIUS = 12;
  const POCKET_RADIUS = 15;
  const FRICTION = 0.98;
  const ELASTICITY = 0.8;
  const MIN_VELOCITY = 0.1;

  const setupBoard = useCallback(() => {
    let initialCoins: Coin[] = [];
    
    // Red coin (Queen) at center
    initialCoins.push({ 
      id: 0, 
      type: 'red', 
      position: { x: 300, y: 300 }, 
      velocity: { x: 0, y: 0 },
      status: 'on-board',
      radius: COIN_RADIUS
    });

    // Arrange white coins in a circle around the queen
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * 2 * Math.PI;
      const distance = 40;
      initialCoins.push({ 
        id: i + 1, 
        type: 'white', 
        position: { x: 300 + distance * Math.cos(angle), y: 300 + distance * Math.sin(angle) },
        velocity: { x: 0, y: 0 },
        status: 'on-board',
        radius: COIN_RADIUS
      });
    }
    
    // Arrange black coins in a circle around the queen
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * 2 * Math.PI + Math.PI/9;
      const distance = 80;
      initialCoins.push({ 
        id: i + 10, 
        type: 'black', 
        position: { x: 300 + distance * Math.cos(angle), y: 300 + distance * Math.sin(angle) },
        velocity: { x: 0, y: 0 },
        status: 'on-board',
        radius: COIN_RADIUS
      });
    }
    
    setCoins(initialCoins);
    
    // Update game progress
    if (user) {
      updateGameProgress(user.username, 'Carrom', {
        score: 0,
        lastPlayed: new Date().toISOString(),
      });
    }
  }, [user, updateGameProgress]);

  useEffect(() => {
    resetGame();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const resetGame = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setScore({ player1: 0, player2: 0 });
    setPlayerTurn(1);
    setupBoard();
    setStrikerPosition({ x: 300, y: 500 });
    setGameState('placing');
    setStrikerVelocity({ x: 0, y: 0 });
    setPower(0);
    setIsAiming(false);
  };

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'placing') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Constrain striker placement to baseline
    if (x > 100 && x < 500 && strikerPosition.y > 450) {
        setStrikerPosition(prev => ({ ...prev, x }));
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'aiming' || !boardRef.current) return;
    
    const rect = boardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate angle from striker to mouse position
    const dx = mouseX - strikerPosition.x;
    const dy = mouseY - strikerPosition.y;
    const angle = Math.atan2(dy, dx);
    
    setAim(angle * 180 / Math.PI);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState === 'placing') {
      handleBoardClick(e);
    } else if (gameState === 'aiming') {
      handleMouseMove(e);
    }
  };

  const handleAimStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (gameState === 'placing') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      // Place striker if in valid position
      if (x > 100 && x < 500) {
        setStrikerPosition(prev => ({ ...prev, x }));
        setGameState('aiming');
        setIsAiming(true);
      }
    }
  };

  const handleStrike = () => {
    if (gameState !== 'aiming' || !boardRef.current) return;
    
    setGameState('striking');
    setIsAiming(false);
    
    // Calculate velocity based on aim and power
    const angleRad = aim * Math.PI / 180;
    const velocityMagnitude = power * 0.5; // Adjust for gameplay feel
    
    const newVelocity = {
      x: Math.cos(angleRad) * velocityMagnitude,
      y: Math.sin(angleRad) * velocityMagnitude
    };
    
    setStrikerVelocity(newVelocity);
    strikerVelocityRef.current = newVelocity;
    
    // Start physics simulation
    startPhysicsSimulation();
  };
  
  const startPhysicsSimulation = () => {
    setGameState('moving');
    
    const updateGame = () => {
      // Update striker position
      setStrikerPosition(prev => {
        const newX = prev.x + strikerVelocityRef.current.x;
        const newY = prev.y + strikerVelocityRef.current.y;
        
        // Boundary collision for striker
        let newVelX = strikerVelocityRef.current.x;
        let newVelY = strikerVelocityRef.current.y;
        
        if (newX - STRIKER_RADIUS <= 0 || newX + STRIKER_RADIUS >= boardSize) {
          newVelX = -newVelX * ELASTICITY;
        }
        
        if (newY - STRIKER_RADIUS <= 0 || newY + STRIKER_RADIUS >= boardSize) {
          newVelY = -newVelY * ELASTICITY;
        }
        
        // Apply friction
        newVelX *= FRICTION;
        newVelY *= FRICTION;
        
        strikerVelocityRef.current = { x: newVelX, y: newVelY };
        setStrikerVelocity({ x: newVelX, y: newVelY });
        
        // Keep within bounds
        return {
          x: Math.max(STRIKER_RADIUS, Math.min(boardSize - STRIKER_RADIUS, newX)),
          y: Math.max(STRIKER_RADIUS, Math.min(boardSize - STRIKER_RADIUS, newY))
        };
      });
      
      // Update coins position
      setCoins(prevCoins => {
        const updatedCoins = [...prevCoins];
        
        // Update each coin
        for (let i = 0; i < updatedCoins.length; i++) {
          const coin = updatedCoins[i];
          if (coin.status === 'pocketed') continue;
          
          let newX = coin.position.x + coin.velocity.x;
          let newY = coin.position.y + coin.velocity.y;
          
          let newVelX = coin.velocity.x;
          let newVelY = coin.velocity.y;
          
          // Boundary collision for coins
          if (newX - coin.radius <= 0 || newX + coin.radius >= boardSize) {
            newVelX = -newVelX * ELASTICITY;
            // Keep coin within bounds
            newX = newX - coin.radius <= 0 ? coin.radius : boardSize - coin.radius;
          }
          
          if (newY - coin.radius <= 0 || newY + coin.radius >= boardSize) {
            newVelY = -newVelY * ELASTICITY;
            // Keep coin within bounds
            newY = newY - coin.radius <= 0 ? coin.radius : boardSize - coin.radius;
          }
          
          // Apply friction
          newVelX *= FRICTION;
          newVelY *= FRICTION;
          
          // Check for pocket collisions
          const pockets = [
            { x: 15, y: 15 },   // top-left
            { x: boardSize - 15, y: 15 }, // top-right
            { x: 15, y: boardSize - 15 }, // bottom-left
            { x: boardSize - 15, y: boardSize - 15 } // bottom-right
          ];
          
          for (const pocket of pockets) {
            const dist = Math.sqrt(Math.pow(newX - pocket.x, 2) + Math.pow(newY - pocket.y, 2));
            if (dist < POCKET_RADIUS + coin.radius) {
              // Coin pocketed
              if (coin.type === 'white') {
                setScore(s => ({...s, player1: s.player1 + 10}));
              } else if (coin.type === 'black') {
                setScore(s => ({...s, player2: s.player2 + 10}));
              } else if (coin.type === 'red') {
                // Queen pocketed - special rule
                setScore(s => ({...s, [playerTurnRef.current === 1 ? 'player1' : 'player2']: s[playerTurnRef.current === 1 ? 'player1' : 'player2'] + 20}));
              }
              
              updatedCoins[i] = { ...coin, status: 'pocketed' as const, velocity: { x: 0, y: 0 } };
              
              // Update game progress
              if (user) {
                const currentScore = playerTurnRef.current === 1 ? scoreRef.current.player1 : scoreRef.current.player2;
                updateGameProgress(user.username, 'Carrom', {
                  score: currentScore,
                  lastPlayed: new Date().toISOString(),
                });
              }
              
              continue; // Skip further processing for pocketed coin
            }
          }
          
          // Check for collisions with other coins
          for (let j = 0; j < updatedCoins.length; j++) {
            if (i === j || updatedCoins[j].status === 'pocketed') continue;
            
            const otherCoin = updatedCoins[j];
            const dx = otherCoin.position.x - newX;
            const dy = otherCoin.position.y - newY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if coins are colliding
            if (distance < coin.radius + otherCoin.radius) {
              // Calculate collision response
              const angle = Math.atan2(dy, dx);
              const sin = Math.sin(angle);
              const cos = Math.cos(angle);
              
              // Rotate velocity vectors
              const vx1 = newVelX * cos + newVelY * sin;
              const vy1 = newVelY * cos - newVelX * sin;
              const vx2 = otherCoin.velocity.x * cos + otherCoin.velocity.y * sin;
              const vy2 = otherCoin.velocity.y * cos - otherCoin.velocity.x * sin;
              
              // Collision response (1D elastic collision)
              const finalVx1 = ((coin.radius - otherCoin.radius) * vx1 + (2 * otherCoin.radius) * vx2) / (coin.radius + otherCoin.radius);
              const finalVx2 = ((2 * coin.radius) * vx1 + (otherCoin.radius - coin.radius) * vx2) / (coin.radius + otherCoin.radius);
              
              // Update velocities
              newVelX = finalVx1 * cos - vy1 * sin;
              newVelY = vy1 * cos + finalVx1 * sin;
              const newVelX2 = finalVx2 * cos - vy2 * sin;
              const newVelY2 = vy2 * cos + finalVx2 * sin;
              
              // Update the other coin's velocity
              updatedCoins[j] = { ...updatedCoins[j], velocity: { x: newVelX2, y: newVelY2 } };
            }
          }
          
          // Check for collision with striker
          const dxStriker = strikerPositionRef.current.x - newX;
          const dyStriker = strikerPositionRef.current.y - newY;
          const distToStriker = Math.sqrt(dxStriker * dxStriker + dyStriker * dyStriker);
          
          if (distToStriker < coin.radius + STRIKER_RADIUS) {
            // Calculate collision response with striker
            const angle = Math.atan2(dyStriker, dxStriker);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            
            // Rotate velocity vectors
            const vx1 = newVelX * cos + newVelY * sin;
            const vy1 = newVelY * cos - newVelX * sin;
            const vx2 = strikerVelocityRef.current.x * cos + strikerVelocityRef.current.y * sin;
            const vy2 = strikerVelocityRef.current.y * cos - strikerVelocityRef.current.x * sin;
            
            // Collision response (1D elastic collision)
            const finalVx1 = ((coin.radius - STRIKER_RADIUS) * vx1 + (2 * STRIKER_RADIUS) * vx2) / (coin.radius + STRIKER_RADIUS);
            const finalVx2 = ((2 * coin.radius) * vx1 + (STRIKER_RADIUS - coin.radius) * vx2) / (coin.radius + STRIKER_RADIUS);
            
            // Update velocities
            newVelX = finalVx1 * cos - vy1 * sin;
            newVelY = vy1 * cos + finalVx1 * sin;
            const newStrikerVelX = finalVx2 * cos - vy2 * sin;
            const newStrikerVelY = vy2 * cos + finalVx2 * sin;
            
            // Update striker velocity
            strikerVelocityRef.current = { x: newStrikerVelX, y: newStrikerVelY };
            setStrikerVelocity({ x: newStrikerVelX, y: newStrikerVelY });
          }
          
          // Check if velocity is low enough to stop
          if (Math.abs(newVelX) < MIN_VELOCITY && Math.abs(newVelY) < MIN_VELOCITY) {
            updatedCoins[i] = { ...coin, position: { x: newX, y: newY }, velocity: { x: 0, y: 0 } };
          } else {
            updatedCoins[i] = { ...coin, position: { x: newX, y: newY }, velocity: { x: newVelX, y: newVelY } };
          }
        }
        
        return updatedCoins;
      });
      
      // Check if all pieces have stopped moving
      const anyMoving = Math.abs(strikerVelocityRef.current.x) > MIN_VELOCITY || 
                       Math.abs(strikerVelocityRef.current.y) > MIN_VELOCITY ||
                       coinsRef.current.some(coin => 
                         coin.status === 'on-board' && 
                         (Math.abs(coin.velocity.x) > MIN_VELOCITY || Math.abs(coin.velocity.y) > MIN_VELOCITY)
                       );
      
      if (anyMoving) {
        animationRef.current = requestAnimationFrame(updateGame);
      } else {
        setTimeout(endTurn, 500); // End turn after a short delay
      }
    };
    
    animationRef.current = requestAnimationFrame(updateGame);
  };
  
  const endTurn = () => {
    setGameState('placing');
    
    // Check if the striker went into a pocket (foul)
    const strikerX = strikerPositionRef.current.x;
    const strikerY = strikerPositionRef.current.y;
    const pockets = [
      { x: 15, y: 15 },   // top-left
      { x: boardSize - 15, y: 15 }, // top-right
      { x: 15, y: boardSize - 15 }, // bottom-left
      { x: boardSize - 15, y: boardSize - 15 } // bottom-right
    ];
    
    const strikerInPocket = pockets.some(pocket => {
      const dist = Math.sqrt(Math.pow(strikerX - pocket.x, 2) + Math.pow(strikerY - pocket.y, 2));
      return dist < POCKET_RADIUS + STRIKER_RADIUS;
    });
    
    if (strikerInPocket) {
      // Foul: opponent gets a point
      if (playerTurnRef.current === 1) {
        setScore(s => ({...s, player2: s.player2 + 5}));
      } else {
        setScore(s => ({...s, player1: s.player1 + 5}));
      }
    }
    
    // Check if the player pocketed any coins
    const playerPocketedCoins = coinsRef.current.some(coin => 
      coin.status === 'pocketed' && 
      ((playerTurnRef.current === 1 && coin.type === 'white') || (playerTurnRef.current === 2 && coin.type === 'black'))
    );
    
    // Check if the player pocketed the queen
    const queenPocketed = coinsRef.current.some(coin => 
      coin.status === 'pocketed' && 
      coin.type === 'red'
    );
    
    // If player pocketed coins or queen, they get another turn
    if (playerPocketedCoins || queenPocketed) {
      // If queen was pocketed, check if the player has pocketed at least one coin of their type
      if (queenPocketed) {
        const playerCoinsPocketed = coinsRef.current.filter(coin => 
          coin.status === 'pocketed' && 
          ((playerTurnRef.current === 1 && coin.type === 'white') || (playerTurnRef.current === 2 && coin.type === 'black'))
        ).length;
        
        if (playerCoinsPocketed > 0) {
          // Queen and player's coin pocketed - Queen is returned to board
          setCoins(prevCoins => {
            return prevCoins.map(coin => 
              coin.type === 'red' ? { ...coin, status: 'on-board', position: { x: 300, y: 300 } } : coin
            );
          });
        }
      }
      
      // Player gets another turn if they pocketed a coin
    } else {
      // No coins pocketed, switch turn
      setPlayerTurn(prev => prev === 1 ? 2 : 1);
    }
  };

  // Handle power for shot strength
  const handleMouseDownPower = () => {
    if (gameState === 'aiming') {
      let currentPower = 0;
      const powerInterval = setInterval(() => {
        currentPower = Math.min(100, currentPower + 1);
        setPower(currentPower);
      }, 20);
      
      const handleMouseUp = () => {
        clearInterval(powerInterval);
      };
      
      window.addEventListener('mouseup', handleMouseUp, { once: true });
    }
  };

  return (
    <PS5GameWrapper gameTitle="Carrom Game" onBack={() => window.history.back()}>
      <div className="carrom-game-container">
        <div id="score-board" style={{ color: 'white', textAlign: 'center', padding: '10px' }}>
          Player 1 (White): {score.player1} | Player 2 (Black): {score.player2}
        </div>
        <div id="player-turn" style={{ color: 'white', textAlign: 'center', padding: '5px' }}>
          Current Turn: Player {playerTurn}
        </div>

        <div 
            id="carrom-board" 
            ref={boardRef}
            onClick={handleMouseDown}
            onMouseMove={handleMouseMove}
        >
            <div className="center-circle"></div>
            <div className="d-line"></div>
            <div className="baselines top"></div>
            <div className="baselines bottom"></div>
            <div className="pocket" id="pocket1"></div>
            <div className="pocket" id="pocket2"></div>
            <div className="pocket" id="pocket3"></div>
            <div className="pocket" id="pocket4"></div>

            {coins.map(coin => (
                coin.status === 'on-board' && (
                  <div 
                    key={coin.id} 
                    className={`coin ${coin.type}-coin`} 
                    style={{ 
                      left: coin.position.x - coin.radius, 
                      top: coin.position.y - coin.radius,
                      width: coin.radius * 2,
                      height: coin.radius * 2
                    }}
                  ></div>
                )
            ))}

            {gameState !== 'moving' && (
                <div 
                  className="striker" 
                  style={{ 
                    left: strikerPosition.x - STRIKER_RADIUS, 
                    top: strikerPosition.y - STRIKER_RADIUS,
                    width: STRIKER_RADIUS * 2,
                    height: STRIKER_RADIUS * 2
                  }}
                  onMouseDown={handleAimStart}
                ></div>
            )}

            {gameState === 'aiming' && (
              <>
                <div 
                  className="aim-line" 
                  style={{ 
                    left: strikerPosition.x, 
                    top: strikerPosition.y, 
                    width: '2px', 
                    height: '100px',
                    transformOrigin: 'top center',
                    transform: `rotate(${aim}deg)`
                  }}
                ></div>
                <div 
                  className="striker" 
                  style={{ 
                    left: strikerPosition.x - STRIKER_RADIUS, 
                    top: strikerPosition.y - STRIKER_RADIUS,
                    width: STRIKER_RADIUS * 2,
                    height: STRIKER_RADIUS * 2
                  }}
                  onClick={handleStrike}
                  onMouseDown={handleMouseDownPower}
                ></div>
              </>
            )}
            
            {gameState === 'aiming' && (
              <div 
                style={{
                  position: 'absolute',
                  top: strikerPosition.y + 120,
                  left: strikerPosition.x - 50,
                  width: 100,
                  height: 20,
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{
                    height: '100%',
                    width: `${power}%`,
                    background: power > 70 ? '#ff0000' : power > 40 ? '#ffff00' : '#00ff00',
                    transition: 'width 0.1s'
                  }}
                ></div>
              </div>
            )}
        </div>

        <div id="controls" style={{ marginTop: '20px' }}>
            <button className="ps5-button" onClick={resetGame}>New Game</button>
        </div>

         <div className="ps5-card" style={{marginTop:'20px', padding:'15px', maxWidth:'600px', textAlign:'center'}}>
            <h3>Instructions</h3>
            <p>
              {gameState === 'placing' 
                ? 'Click on the baseline to place your striker.' 
                : gameState === 'aiming' 
                ? 'Aim with your mouse, hold to charge power, then click striker to shoot.'
                : 'Pieces are moving...'}
            </p>
        </div>
      </div>
    </PS5GameWrapper>
  );
};

export default CarromGame;