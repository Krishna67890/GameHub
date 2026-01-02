import React, { useState, useEffect, useCallback } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import '../../styles/ps5-theme.css';

const RockPaperScissorsGame = () => {
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [computerChoice, setComputerChoice] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [gameHistory, setGameHistory] = useState<Array<{player: string, computer: string, result: string}>>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const choices = [
    { name: 'Rock', icon: '✊', beats: ['Scissors', 'Lizard'] },
    { name: 'Paper', icon: '✋', beats: ['Rock', 'Spock'] },
    { name: 'Scissors', icon: '✌️', beats: ['Paper', 'Lizard'] },
    { name: 'Lizard', icon: '🦎', beats: ['Paper', 'Spock'] },
    { name: 'Spock', icon: '🖖', beats: ['Rock', 'Scissors'] }
  ];

  const determineWinner = useCallback((player: string, computer: string) => {
    let gameResult = '';
    
    if (player === computer) {
      gameResult = 'Tie';
    } else {
      const playerChoiceObj = choices.find(c => c.name === player);
      
      if (playerChoiceObj && playerChoiceObj.beats.includes(computer)) {
        gameResult = 'You Win!';
        setPlayerScore(prev => prev + 1);
      } else {
        gameResult = 'Computer Wins!';
        setComputerScore(prev => prev + 1);
      }
    }
    
    setResult(gameResult);
    
    setGameHistory(prev => [
      { player, computer, result: gameResult },
      ...prev
    ].slice(0, 5));
    
    setIsAnimating(false);

  }, [choices]);

  const makeComputerChoice = useCallback((playerSelection: string) => {
    const randomIndex = Math.floor(Math.random() * choices.length);
    const compChoice = choices[randomIndex].name;
    
    setComputerChoice(compChoice);
    determineWinner(playerSelection, compChoice);
  }, [choices, determineWinner]);

  const handleChoice = (choiceName: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setPlayerChoice(choiceName);
    setComputerChoice(null);
    setResult(null);
    
    let count = 3;
    setCountdown(count);
    
    const timer = setInterval(() => {
      count--;
      setCountdown(c => c !== null ? c - 1 : null);
      if (count <= 0) {
        clearInterval(timer);
        setCountdown(null);
        makeComputerChoice(choiceName);
      }
    }, 600);
  };

  const resetGame = () => {
    setPlayerScore(0);
    setComputerScore(0);
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setGameHistory([]);
    setCountdown(null);
    setIsAnimating(false);
  };

  const getIcon = (name: string | null) => {
    if (!name) return '❓';
    return choices.find(c => c.name === name)?.icon || '❓';
  };

  return (
    <PS5GameWrapper 
      gameTitle="RPS Lizard Spock" 
      onBack={() => window.history.back()}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '20px',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Score Board */}
        <div className="ps5-card" style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          width: '100%', 
          padding: '20px' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Player</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--ps5-accent-blue)' }}>
              {playerScore}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Computer</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--ps5-danger)' }}>
              {computerScore}
            </div>
          </div>
        </div>

        {/* Game Arena */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          width: '100%',
          margin: '20px 0'
        }}>
          {/* Player Hand */}
          <div style={{ textAlign: 'center' }}>
            <div className={`ps5-card ${isAnimating && !result ? 'ps5-pulse' : ''}`} style={{ 
              width: '120px', 
              height: '120px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '4rem',
              borderRadius: '50%',
              border: playerChoice ? '4px solid var(--ps5-accent-blue)' : 'none'
            }}>
              {playerChoice ? getIcon(playerChoice) : '👤'}
            </div>
            <p style={{ marginTop: '10px' }}>You</p>
          </div>

          {/* VS / Result */}
          <div style={{ textAlign: 'center' }}>
            {countdown !== null ? (
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--ps5-accent-purple)' }}>
                {countdown}
              </div>
            ) : result ? (
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: result === 'You Win!' ? 'var(--ps5-success)' : 
                       result === 'Computer Wins!' ? 'var(--ps5-danger)' : 'var(--ps5-warning)'
              }}>
                {result}
              </div>
            ) : (
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.5)' }}>VS</div>
            )}
          </div>

          {/* Computer Hand */}
          <div style={{ textAlign: 'center' }}>
            <div className="ps5-card" style={{ 
              width: '120px', 
              height: '120px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '4rem',
              borderRadius: '50%',
              border: computerChoice ? '4px solid var(--ps5-danger)' : 'none'
            }}>
              {computerChoice ? getIcon(computerChoice) : '🤖'}
            </div>
            <p style={{ marginTop: '10px' }}>Computer</p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ width: '100%' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Choose Your Weapon</h3>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '10px', 
            flexWrap: 'wrap' 
          }}>
            {choices.map(choice => (
              <button
                key={choice.name}
                className={`ps5-button ${playerChoice === choice.name ? 'ps5-button--active' : ''}`}
                onClick={() => handleChoice(choice.name)}
                disabled={isAnimating}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  padding: '15px',
                  minWidth: '100px'
                }}
              >
                <span style={{ fontSize: '2rem', marginBottom: '5px' }}>{choice.icon}</span>
                <span>{choice.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button 
            className="ps5-button ps5-button--danger"
            onClick={resetGame}
          >
            Reset Game
          </button>
        </div>

        {/* History */}
        <div className="ps5-card" style={{ width: '100%', marginTop: '20px' }}>
          <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '10px' }}>
            Recent Games
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {gameHistory.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No games played yet</div>
            ) : (
              gameHistory.map((game, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '10px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>{getIcon(game.player)}</span>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>vs</span>
                    <span>{getIcon(game.computer)}</span>
                  </div>
                  <div style={{ 
                    fontWeight: 'bold',
                    color: game.result === 'You Win!' ? 'var(--ps5-success)' : 
                           game.result === 'Computer Wins!' ? 'var(--ps5-danger)' : 'var(--ps5-warning)'
                  }}>
                    {game.result}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PS5GameWrapper>
  );
};

export default RockPaperScissorsGame;