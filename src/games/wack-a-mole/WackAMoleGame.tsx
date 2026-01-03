import React, { useState, useEffect, useRef } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import { useGame } from '../../components/context/GameContext';
import { useAuth } from '../../components/context/AuthContext';
import '../../styles/ps5-theme.css';

const WackAMoleGame = () => {
  const { user } = useAuth();
  const { updateGameProgress } = useGame();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [moles, setMoles] = useState(Array(9).fill(false));
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

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

    // Update game progress when game starts
    if (user) {
      updateGameProgress(user.username, 'Wack-a-Mole', {
        score: 0,
        lastPlayed: new Date().toISOString(),
      });
    }

    // Clear any existing intervals
    if (timerRef.current) clearInterval(timerRef.current);
    if (moleTimerRef.current) clearInterval(moleTimerRef.current);
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
            
            // Update game progress when game ends
            if (user) {
              updateGameProgress(user.username, 'Wack-a-Mole', {
                score: score,
                lastPlayed: new Date().toISOString(),
              });
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
      setScore(prev => {
        const newScore = prev + 10;
        
        // Update game progress when score increases
        if (user) {
          updateGameProgress(user.username, 'Wack-a-Mole', {
            score: newScore,
            lastPlayed: new Date().toISOString(),
          });
        }
        
        return newScore;
      });
      setMoles(prev => {
        const newMoles = [...prev];
        newMoles[index] = false;
        return newMoles;
      });
    }
  };

  // Generate hole positions in a 3x3 grid
  const holePositions = [
    { top: '10%', left: '10%' },
    { top: '10%', left: '50%' },
    { top: '10%', left: '90%' },
    { top: '50%', left: '10%' },
    { top: '50%', left: '50%' },
    { top: '50%', left: '90%' },
    { top: '90%', left: '10%' },
    { top: '90%', left: '50%' },
    { top: '90%', left: '90%' },
  ];

  return (
    <PS5GameWrapper gameTitle="Wack-a-Mole" onBack={() => window.history.back()}>
      <div className="wack-a-mole-container" style={{ 
        textAlign: 'center', 
        padding: '20px',
        maxWidth: '900px',
        margin: '0 auto',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
      }}>
        <h2 style={{ 
          color: 'var(--ps5-accent-blue)', 
          margin: '0 0 30px 0',
          fontSize: 'clamp(1.8em, 4vw, 2.5em)',
          textShadow: '0 0 10px rgba(0, 247, 255, 0.5)'
        }}>
          Wack-a-Mole
        </h2>

        <div id="wack-stats" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '15px', 
          marginBottom: '15px',
          fontSize: 'clamp(1em, 3vw, 1.2em)',
          flexWrap: 'wrap'
        }}>
          <div className="stat ps5-card" style={{ 
            backgroundColor: 'var(--ps5-card-bg)', 
            padding: '8px 16px', 
            borderRadius: '20px', 
            minWidth: '100px',
            color: 'white'
          }}>
            Score: <span id="wack-score" style={{ color: 'var(--ps5-accent-yellow)' }}>{score}</span>
          </div>
          <div className="stat ps5-card" style={{ 
            backgroundColor: 'var(--ps5-card-bg)', 
            padding: '8px 16px', 
            borderRadius: '20px', 
            minWidth: '100px',
            color: 'white'
          }}>
            Time: <span id="wack-time" style={{ color: 'var(--ps5-accent-red)' }}>{timeLeft}</span>s
          </div>
          <div className="stat ps5-card" style={{ 
            backgroundColor: 'var(--ps5-card-bg)', 
            padding: '8px 16px', 
            borderRadius: '20px', 
            minWidth: '100px',
            color: 'white'
          }}>
            High Score: <span id="wack-high-score" style={{ color: 'var(--ps5-accent-yellow)' }}>{highScore}</span>
          </div>
        </div>

        <div id="wack-game" style={{
          position: 'relative',
          height: 'clamp(300px, 60vw, 400px)',
          width: '100%',
          margin: '15px auto',
          backgroundColor: '#8e44ad',
          borderRadius: '15px',
          overflow: 'hidden',
          contain: 'strict'
        }}>
          {holePositions.map((pos, index) => (
            <div 
              key={index}
              className="hole"
              style={{
                position: 'absolute',
                width: 'clamp(60px, 12vw, 80px)',
                height: 'clamp(60px, 12vw, 80px)',
                backgroundColor: '#2c3e50',
                borderRadius: '50%',
                cursor: 'pointer',
                boxShadow: 'inset 0 10px 0 rgba(0,0,0,0.3)',
                transform: 'translateZ(0)',
                willChange: 'transform',
                top: `calc(${pos.top} - clamp(30px, 6vw, 40px))`,
                left: `calc(${pos.left} - clamp(30px, 6vw, 40px))`,
              }}
              onClick={() => whackMole(index)}
            >
              {moles[index] && (
                <div 
                  className="mole"
                  style={{
                    position: 'absolute',
                    width: 'calc(100% - 10px)',
                    height: 'calc(100% - 10px)',
                    backgroundColor: '#e67e22',
                    borderRadius: '50%',
                    top: '5px',
                    left: '5px',
                    display: 'block',
                    boxShadow: 'inset 0 -5px 0 rgba(0,0,0,0.2)',
                    transform: 'translateZ(0)',
                    willChange: 'transform'
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div id="wack-controls" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '15px', 
          margin: '15px 0',
          flexWrap: 'wrap' 
        }}>
          {!gameActive ? (
            <button 
              className="ps5-button" 
              onClick={startGame}
              style={{ minWidth: '120px' }}
            >
              {gameOver ? 'Play Again' : 'Start Game'}
            </button>
          ) : (
            <button 
              className="ps5-button" 
              disabled
              style={{ minWidth: '120px' }}
            >
              Playing...
            </button>
          )}
          <button 
            className="ps5-button" 
            onClick={() => setShowHelp(true)}
          >
            How to Play
          </button>
        </div>

        {gameOver && (
          <div className="ps5-card" style={{ 
            marginTop: '20px', 
            padding: '20px',
            backgroundColor: 'var(--ps5-card-bg)',
            borderRadius: '10px',
            color: 'white'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--ps5-accent-blue)' }}>Game Over!</h3>
            <p style={{ margin: '5px 0', fontSize: '1.2em' }}>Final Score: <span style={{ color: 'var(--ps5-accent-yellow)' }}>{score}</span></p>
            {score > highScore && (
              <p style={{ margin: '5px 0', color: 'var(--ps5-accent-yellow)' }}>🎉 New High Score! 🎉</p>
            )}
          </div>
        )}

        {/* Help Modal */}
        {showHelp && (
          <div 
            className="modal" 
            style={{
              display: 'flex',
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 1000,
              justifyContent: 'center',
              alignItems: 'center',
              backdropFilter: 'blur(3px)'
            }}
            onClick={() => setShowHelp(false)}
          >
            <div 
              className="modal-content ps5-card" 
              style={{
                backgroundColor: 'var(--ps5-card-bg)',
                padding: '20px',
                borderRadius: '10px',
                maxWidth: 'min(90%, 500px)',
                textAlign: 'center',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                animation: 'modalFadeIn 0.3s',
                transform: 'translateZ(0)',
                color: 'white'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 15px 0', color: 'var(--ps5-accent-blue)' }}>How to Play Wack-a-Mole</h3>
              <p>Click on the moles as they pop up from the holes to score points.</p>
              <p>Each successful whack gives you 10 points.</p>
              <p>The game lasts for 30 seconds - try to get the highest score possible!</p>
              <p>Your high score will be saved between games.</p>
              <div style={{ marginTop: '15px' }}>
                <button 
                  className="ps5-button" 
                  onClick={() => setShowHelp(false)}
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PS5GameWrapper>
  );
};

export default WackAMoleGame;