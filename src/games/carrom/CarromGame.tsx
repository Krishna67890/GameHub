import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CarromGame.css';
import PS5GameWrapper from '../../components/PS5GameWrapper';

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
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [playerTurn, setPlayerTurn] = useState(1); // 1 for Player 1 (White), 2 for Player 2 (Black)
  const [coins, setCoins] = useState<Coin[]>([]);
  const [strikerPosition, setStrikerPosition] = useState({ x: 300, y: 500 });
  const [aim, setAim] = useState(0); // Angle in degrees
  const [isAiming, setIsAiming] = useState(false);
  const [gameState, setGameState] = useState<'placing' | 'aiming' | 'striking' | 'moving'>('placing'); // placing -> aiming -> striking -> moving -> end_turn
  const [strikerVelocity, setStrikerVelocity] = useState<Vector2D>({ x: 0, y: 0 });
  const [power, setPower] = useState(0);
  
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
  }, []);

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
    
    // Start physics simulation
    startPhysicsSimulation();
  };
  
  const startPhysicsSimulation = () => {
    setGameState('moving');
    
    const updateGame = () => {
      // Update striker position
      setStrikerPosition(prev => {
        const newX = prev.x + strikerVelocity.x;
        const newY = prev.y + strikerVelocity.y;
        
        // Boundary collision for striker
        let newVelX = strikerVelocity.x;
        let newVelY = strikerVelocity.y;
        
        if (newX - STRIKER_RADIUS <= 0 || newX + STRIKER_RADIUS >= boardSize) {
          newVelX = -newVelX * ELASTICITY;
        }
        
        if (newY - STRIKER_RADIUS <= 0 || newY + STRIKER_RADIUS >= boardSize) {
          newVelY = -newVelY * ELASTICITY;
        }
        
        // Apply friction
        newVelX *= FRICTION;
        newVelY *= FRICTION;
        
        setStrikerVelocity({ x: newVelX, y: newVelY });
        
        // Check if velocity is low enough to stop
        if (Math.abs(newVelX) < MIN_VELOCITY && Math.abs(newVelY) < MIN_VELOCITY) {
          setStrikerVelocity({ x: 0, y: 0 });
          setTimeout(endTurn, 500); // End turn after a short delay
        }
        
        // Keep within bounds
        return {
          x: Math.max(STRIKER_RADIUS, Math.min(boardSize - STRIKER_RADIUS, newX)),
          y: Math.max(STRIKER_RADIUS, Math.min(boardSize - STRIKER_RADIUS, newY))
        };
      });
      
      // Update coins position
      setCoins(prevCoins => {
        return prevCoins.map(coin => {
          if (coin.status === 'pocketed') return coin;
          
          let newX = coin.position.x + coin.velocity.x;
          let newY = coin.position.y + coin.velocity.y;
          
          let newVelX = coin.velocity.x;
          let newVelY = coin.velocity.y;
          
          // Boundary collision for coins
          if (newX - coin.radius <= 0 || newX + coin.radius >= boardSize) {
            newVelX = -newVelX * ELASTICITY;
          }
          
          if (newY - coin.radius <= 0 || newY + coin.radius >= boardSize) {
            newVelY = -newVelY * ELASTICITY;
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
            if (dist < POCKET_RADIUS) {
              // Coin pocketed
              if (coin.type === 'white') {
                setScore(s => ({...s, player1: s.player1 + 10}));
              } else if (coin.type === 'black') {
                setScore(s => ({...s, player2: s.player2 + 10}));
              } else if (coin.type === 'red') {
                // Queen pocketed - special rule
                setScore(s => ({...s, [playerTurn === 1 ? 'player1' : 'player2']: s[playerTurn === 1 ? 'player1' : 'player2'] + 20}));
              }
              
              return { ...coin, status: 'pocketed' as const, velocity: { x: 0, y: 0 } };
            }
          }
          
          // Update coin velocity
          setCoins(prev => prev.map(c => 
            c.id === coin.id ? { ...c, velocity: { x: newVelX, y: newVelY } } : c
          ));
          
          // Check if velocity is low enough to stop
          if (Math.abs(newVelX) < MIN_VELOCITY && Math.abs(newVelY) < MIN_VELOCITY) {
            return { ...coin, position: { x: newX, y: newY }, velocity: { x: 0, y: 0 } };
          }
          
          return { ...coin, position: { x: newX, y: newY } };
        });
      });
      
      // Continue animation if any piece is still moving
      const anyMoving = Math.abs(strikerVelocity.x) > MIN_VELOCITY || 
                       Math.abs(strikerVelocity.y) > MIN_VELOCITY ||
                       coins.some(coin => 
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
    setPlayerTurn(prev => prev === 1 ? 2 : 1);
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