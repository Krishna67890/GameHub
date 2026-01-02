import React, { useState, useEffect, useCallback } from 'react';
import './CarromGame.css';
import PS5GameWrapper from '../../components/PS5GameWrapper';

interface Coin {
  id: number;
  type: 'white' | 'black' | 'red';
  position: { x: number; y: number };
  status: 'on-board' | 'pocketed';
}

const CarromGame = () => {
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [playerTurn, setPlayerTurn] = useState(1); // 1 for Player 1 (White), 2 for Player 2 (Black)
  const [coins, setCoins] = useState<Coin[]>([]);
  const [strikerPosition, setStrikerPosition] = useState({ x: 300, y: 500 });
  const [aim, setAim] = useState(0); // Angle in degrees
  const [isAiming, setIsAiming] = useState(false);
  const [gameState, setGameState] = useState('placing'); // placing -> aiming -> striking -> end_turn

  const boardSize = 600;

  const setupBoard = useCallback(() => {
    let initialCoins: Coin[] = [];
    // Red coin (Queen)
    initialCoins.push({ id: 0, type: 'red', position: { x: 300, y: 300 }, status: 'on-board' });

    // Arrange other coins in a circle around the queen
    for (let i = 0; i < 9; i++) {
      const angleW = (i / 9) * 2 * Math.PI;
      initialCoins.push({ id: i + 1, type: 'white', position: { x: 300 + 40 * Math.cos(angleW), y: 300 + 40 * Math.sin(angleW) }, status: 'on-board' });
      
      const angleB = (i / 9) * 2 * Math.PI + Math.PI/9;
      initialCoins.push({ id: i + 10, type: 'black', position: { x: 300 + 80 * Math.cos(angleB), y: 300 + 80 * Math.sin(angleB) }, status: 'on-board' });
    }
    setCoins(initialCoins);
  }, []);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    setScore({ player1: 0, player2: 0 });
    setPlayerTurn(1);
    setupBoard();
    setStrikerPosition({ x: 300, y: 500 });
    setGameState('placing');
  };

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'placing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Constrain striker placement
    if (x > 50 && x < 550) {
        setStrikerPosition({ x, y: 500 });
        setGameState('aiming');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'aiming') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const angle = Math.atan2(strikerPosition.y - e.clientY + rect.top, strikerPosition.x - mouseX) * 180 / Math.PI;
    setAim(angle + 90);
  };

  const handleStrike = () => {
    if (gameState !== 'aiming') return;
    setGameState('striking');
    
    // Simple strike simulation
    setTimeout(() => {
        // Randomly pocket some coins
        const coinsToPocket = Math.floor(Math.random() * 3);
        let pocketedCount = 0;
        const newCoins = coins.map(c => {
            if(c.status === 'on-board' && Math.random() < 0.2 && pocketedCount < coinsToPocket) {
                pocketedCount++;
                if (c.type === 'white') setScore(s => ({...s, player1: s.player1 + 10}));
                if (c.type === 'black') setScore(s => ({...s, player2: s.player2 + 10}));
                return {...c, status: 'pocketed'};
            }
            return c;
        });
        setCoins(newCoins.filter(c => c.status === 'on-board'));

        // End turn
        setPlayerTurn(pt => (pt === 1 ? 2 : 1));
        setGameState('placing');
    }, 1000);
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
            onClick={handleBoardClick} 
            onMouseMove={handleMouseMove}
        >
            <div className="center-circle"></div>
            <div className="pocket" id="pocket1"></div>
            <div className="pocket" id="pocket2"></div>
            <div className="pocket" id="pocket3"></div>
            <div className="pocket" id="pocket4"></div>

            {coins.map(coin => (
                <div key={coin.id} className={`coin ${coin.type}-coin`} style={{ left: coin.position.x - 14, top: coin.position.y - 14 }}></div>
            ))}

            {gameState !== 'striking' && (
                <div className="striker" style={{ left: strikerPosition.x - 15, top: strikerPosition.y - 15 }} onClick={handleStrike}></div>
            )}

            {gameState === 'aiming' && (
                 <div style={{ position: 'absolute', top: strikerPosition.y, left: strikerPosition.x, height: '100px', width: '2px', background: 'white', transformOrigin: 'top center', transform: `rotate(${aim}deg)`}}></div>
            )}
        </div>

        <div id="controls" style={{ marginTop: '20px' }}>
            <button className="ps5-button" onClick={resetGame}>New Game</button>
        </div>

         <div className="ps5-card" style={{marginTop:'20px', padding:'15px', maxWidth:'600px', textAlign:'center'}}>
            <h3>Instructions</h3>
            <p>{gameState === 'placing' ? 'Click on the baseline to place your striker.' : 'Aim with your mouse and click the striker to shoot.'}</p>
        </div>
      </div>
    </PS5GameWrapper>
  );
};

export default CarromGame;