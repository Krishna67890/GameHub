import React, { useState, useEffect } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import PS5Animator from '../../utils/ps5-animator';
import '../../styles/ps5-theme.css';

const MemoryCardGame = () => {
  // Game levels configuration
  const levels = [
    {
      theme: 'Letters',
      cards: [
        { name: 'A', emoji: '🅰️' },
        { name: 'B', emoji: '🅱️' },
        { name: 'C', emoji: '🅲' },
        { name: 'D', emoji: '🅳' },
        { name: 'E', emoji: '🅴' },
        { name: 'F', emoji: '🅵' },
        { name: 'G', emoji: '🅶' },
        { name: 'H', emoji: '🅷' }
      ]
    },
    {
      theme: 'Animals',
      cards: [
        { name: 'Lion', emoji: '🦁' },
        { name: 'Tiger', emoji: '🐯' },
        { name: 'Elephant', emoji: '🐘' },
        { name: 'Monkey', emoji: '🐵' },
        { name: 'Giraffe', emoji: '🦒' },
        { name: 'Zebra', emoji: '🦓' },
        { name: 'Panda', emoji: '🐼' },
        { name: 'Koala', emoji: '🐨' }
      ]
    },
    {
      theme: 'Fruits',
      cards: [
        { name: 'Apple', emoji: '🍎' },
        { name: 'Banana', emoji: '🍌' },
        { name: 'Orange', emoji: '🍊' },
        { name: 'Grapes', emoji: '🍇' },
        { name: 'Strawberry', emoji: '🍓' },
        { name: 'Watermelon', emoji: '🍉' },
        { name: 'Pineapple', emoji: '🍍' },
        { name: 'Mango', emoji: '🥭' }
      ]
    },
    {
      theme: 'Sports',
      cards: [
        { name: 'Soccer', emoji: '⚽' },
        { name: 'Basketball', emoji: '🏀' },
        { name: 'Tennis', emoji: '🎾' },
        { name: 'Baseball', emoji: '⚾' },
        { name: 'Volleyball', emoji: '🏐' },
        { name: 'Golf', emoji: '⛳' },
        { name: 'Hockey', emoji: '🏒' },
        { name: 'Swimming', emoji: '🏊' }
      ]
    },
    {
      theme: 'Countries',
      cards: [
        { name: 'USA', emoji: '🇺🇸' },
        { name: 'UK', emoji: '🇬🇧' },
        { name: 'Japan', emoji: '🇯🇵' },
        { name: 'France', emoji: '🇫🇷' },
        { name: 'Germany', emoji: '🇩🇪' },
        { name: 'Italy', emoji: '🇮🇹' },
        { name: 'Brazil', emoji: '🇧🇷' },
        { name: 'Canada', emoji: '🇨🇦' }
      ]
    }
  ];

  // Game state
  const [currentLevel, setCurrentLevel] = useState(0);
  const [cards, setCards] = useState<any[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Initialize the game for the current level
  useEffect(() => {
    initializeLevel(currentLevel);
  }, [currentLevel]);

  // Initialize a level
  const initializeLevel = (levelIndex: number) => {
    if (levelIndex >= levels.length) {
      setGameCompleted(true);
      PS5Animator.createNotification("🎉 Congratulations! You completed all levels!", "success");
      return;
    }

    const levelCards = levels[levelIndex].cards;
    // Duplicate cards for matching
    const duplicatedCards = [...levelCards, ...levelCards];
    
    // Shuffle the cards
    const shuffledCards = [...duplicatedCards]
      .sort(() => 0.5 - Math.random())
      .map((card, index) => ({
        ...card,
        id: index,
        isFlipped: false,
        isMatched: false
      }));

    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
  };

  // Handle card click
  const handleCardClick = (id: number) => {
    // Prevent actions during check or if card is already flipped/matched
    if (isChecking || flippedCards.length >= 2 || matchedCards.includes(id)) {
      return;
    }

    // Flip the card
    const newCards = cards.map(card => 
      card.id === id ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      setMoves(moves + 1);
      
      const firstCard = cards.find(card => card.id === newFlippedCards[0]);
      const secondCard = cards.find(card => card.id === newFlippedCards[1]);
      
      if (firstCard && secondCard && firstCard.name === secondCard.name) {
        // Match found
        setTimeout(() => {
          setMatchedCards([...matchedCards, ...newFlippedCards]);
          setFlippedCards([]);
          setIsChecking(false);
          
          // Check if all cards are matched
          if (matchedCards.length + 2 === cards.length) {
            PS5Animator.createNotification(`Level completed in ${moves + 1} moves!`, "success");
            setTimeout(() => {
              setCurrentLevel(currentLevel + 1);
            }, 1000);
          }
        }, 500);
      } else {
        // No match, flip cards back
        setTimeout(() => {
          setCards(cards.map(card => 
            newFlippedCards.includes(card.id) ? { ...card, isFlipped: false } : card
          ));
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  // Restart current level
  const restartLevel = () => {
    initializeLevel(currentLevel);
  };

  // Go to next level
  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  // Reset to first level
  const resetGame = () => {
    setCurrentLevel(0);
    setGameCompleted(false);
  };

  // Render the game
  return (
    <PS5GameWrapper 
      gameTitle="Memory Card" 
      onBack={() => window.history.back()}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        height: '100%',
        gap: '20px'
      }}>
        {/* Game Info Panel */}
        <div className="ps5-card" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          width: '100%',
          maxWidth: '600px',
          padding: '15px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="ps5-game-name" style={{ fontSize: '1rem', marginBottom: '5px' }}>Level</div>
            <div className="ps5-score-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--ps5-accent-blue)' }}>
              {currentLevel + 1} / {levels.length}
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div className="ps5-game-name" style={{ fontSize: '1rem', marginBottom: '5px' }}>Moves</div>
            <div className="ps5-score-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--ps5-accent-blue)' }}>
              {moves}
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div className="ps5-game-name" style={{ fontSize: '1rem', marginBottom: '5px' }}>Theme</div>
            <div className="ps5-score-value" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--ps5-accent-purple)' }}>
              {currentLevel < levels.length ? levels[currentLevel].theme : 'Complete'}
            </div>
          </div>
        </div>

        {/* Game Completed Screen */}
        {gameCompleted && (
          <div className="ps5-card ps5-pulse" style={{ 
            backgroundColor: 'var(--ps5-gradient-success)',
            padding: '40px', 
            textAlign: 'center',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ color: 'white', marginBottom: '20px' }}>🎉 Congratulations!</h2>
            <p style={{ color: 'white', fontSize: '1.2rem', marginBottom: '20px' }}>
              You completed all levels!
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                className="ps5-button ps5-button--success"
                onClick={resetGame}
              >
                Play Again
              </button>
              <button 
                className="ps5-button"
                onClick={() => window.history.back()}
              >
                Exit
              </button>
            </div>
          </div>
        )}

        {/* Game Board */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '15px',
          maxWidth: '600px',
          width: '100%'
        }}>
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className="ps5-game-cell"
              style={{
                aspectRatio: '1',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '2rem',
                cursor: 'pointer',
                transform: card.isFlipped || matchedCards.includes(card.id) ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.5s',
                background: card.isFlipped || matchedCards.includes(card.id) 
                  ? 'linear-gradient(135deg, #00f7ff, #0077ff)' 
                  : 'linear-gradient(135deg, #2e3d49, #1a1a2e)',
                color: card.isFlipped || matchedCards.includes(card.id) ? 'white' : 'white',
                borderRadius: '10px',
                border: '2px solid var(--ps5-accent-blue)',
                boxShadow: card.isFlipped || matchedCards.includes(card.id) 
                  ? '0 0 20px rgba(0, 247, 255, 0.8)' 
                  : '0 4px 8px rgba(0, 0, 0, 0.3)',
                transformStyle: 'preserve-3d',
                position: 'relative'
              }}
            >
              {card.isFlipped || matchedCards.includes(card.id) ? card.emoji : '?'}
            </div>
          ))}
        </div>

        {/* Game Controls */}
        <div className="ps5-card" style={{ 
          display: 'flex', 
          gap: '15px',
          padding: '15px'
        }}>
          <button 
            className="ps5-button"
            onClick={restartLevel}
          >
            Restart Level
          </button>
          
          {currentLevel > 0 && (
            <button 
              className="ps5-button"
              onClick={() => setCurrentLevel(currentLevel - 1)}
            >
              Previous Level
            </button>
          )}
          
          {currentLevel < levels.length - 1 && !gameCompleted && (
            <button 
              className="ps5-button"
              onClick={nextLevel}
            >
              Next Level
            </button>
          )}
        </div>

        {/* Game Instructions */}
        <div className="ps5-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <p>🎮 Flip two cards at a time to find matching pairs</p>
          <p>⚡ Match all pairs in the fewest moves possible</p>
          <p>🎯 Complete all levels to win the game</p>
        </div>
      </div>
    </PS5GameWrapper>
  );
};

export default MemoryCardGame;