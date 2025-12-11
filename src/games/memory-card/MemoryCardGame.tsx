import React, { useState, useEffect } from 'react';
import { useTheme } from '../../components/context/ThemeContext';

const MemoryCardGame = () => {
  const { theme } = useTheme();
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Card symbols
  const symbols = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍒', '🍑', '🍍'];

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Create pairs of cards
    const initialCards = [...symbols, ...symbols]
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5);

    setCards(initialCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameCompleted(false);
  };

  const handleCardClick = (id: number) => {
    // Don't process if card is already flipped or matched
    if (flipped.includes(id) || matched.includes(id)) {
      return;
    }

    // Don't allow more than 2 cards to be flipped
    if (flipped.length === 2) {
      return;
    }

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    // Check for match when two cards are flipped
    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // Match found
        setMatched([...matched, firstId, secondId]);
        setFlipped([]);

        // Check if game is completed
        if (matched.length + 2 === cards.length) {
          setGameCompleted(true);
        }
      } else {
        // No match, flip cards back after delay
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  return (
    <div className={`memory-card-game ${theme}`}>
      <h2>Memory Card Game</h2>
      <div className="game-info">
        <p>Moves: {moves}</p>
        {gameCompleted && (
          <div className="game-completed">
            <p>Congratulations! You completed the game in {moves} moves!</p>
            <button onClick={initializeGame}>Play Again</button>
          </div>
        )}
      </div>
      <div className="game-board">
        {cards.map(card => (
          <div
            key={card.id}
            className={`card ${flipped.includes(card.id) || matched.includes(card.id) ? 'flipped' : ''} ${matched.includes(card.id) ? 'matched' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-inner">
              <div className="card-front">?</div>
              <div className="card-back">{card.symbol}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="controls">
        <button onClick={initializeGame}>Restart Game</button>
      </div>
    </div>
  );
};

export default MemoryCardGame;