import React, { useState, useEffect, useRef } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import '../../styles/ps5-theme.css';
import './WackAMoleGame.css';

const WackAMoleGame = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [moles, setMoles] = useState(Array(9).fill(false));
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const timerRef = useRef<number | null>(null);
  const moleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('wackHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    setGameOver(false);
    setMoles(Array(9).fill(false));
  };

  useEffect(() => {
    if (gameActive && !gameOver) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setGameActive(false);
            setGameOver(true);
            if(score > highScore) {
                setHighScore(score);
                localStorage.setItem('wackHighScore', score.toString());
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const showMole = () => {
        setMoles(prevMoles => {
            const newMoles = Array(9).fill(false);
            const randomIndex = Math.floor(Math.random() * 9);
            newMoles[randomIndex] = true;
            return newMoles;
        });
      };
      moleTimerRef.current = window.setInterval(showMole, 1000);

    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (moleTimerRef.current) clearInterval(moleTimerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (moleTimerRef.current) clearInterval(moleTimerRef.current);
    };
  }, [gameActive, gameOver, score, highScore]);

  const whackMole = (index: number) => {
    if (moles[index]) {
      setScore(prev => prev + 10);
      setMoles(prev => {
        const newMoles = [...prev];
        newMoles[index] = false;
        return newMoles;
      });
    }
  };

  return (
    <PS5GameWrapper gameTitle="Wack-a-Mole" onBack={() => window.history.back()}>
      <div className="wack-a-mole-container">
        <div id="wack-stats">
            <div className="stat">Score: <span id="wack-score">{score}</span></div>
            <div className="stat">Time: <span id="wack-time">{timeLeft}</span>s</div>
            <div className="stat">High Score: <span id="wack-high-score">{highScore}</span></div>
        </div>
        <div id="wack-game">
            {moles.map((isMoleVisible, index) => (
                <div key={index} className="hole" onClick={() => whackMole(index)}>
                    {isMoleVisible && <div className="mole"></div>}
                </div>
            ))}
        </div>
        <div id="wack-controls">
            {!gameActive ? (
                <button onClick={startGame}>{gameOver ? 'Play Again' : 'Start Game'}</button>
            ) : (
                <button disabled>Wack 'em!</button>
            )}
        </div>
        {gameOver && <div className="ps5-card" style={{marginTop: '20px'}}><h3>Game Over! Final Score: {score}</h3></div>}
      </div>
    </PS5GameWrapper>
  );
};

export default WackAMoleGame;