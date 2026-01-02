import React, { useState, useEffect } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import '../../styles/ps5-theme.css';
import './HangmanGame.css';

const HangmanGame = () => {
  const words = ["javascript", "python", "java", "ruby", "swift", "kotlin", "php", "typescript"];
  const [selectedWord, setSelectedWord] = useState('');
  const [guessedWord, setGuessedWord] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost

  const maxGuesses = 6;

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const newWord = words[Math.floor(Math.random() * words.length)];
    setSelectedWord(newWord);
    setGuessedWord(Array(newWord.length).fill('_'));
    setWrongGuesses(0);
    setGameStatus('playing');
  };

  const handleGuess = (letter: string) => {
    if (gameStatus !== 'playing') return;

    if (selectedWord.includes(letter)) {
        const newGuessedWord = guessedWord.map((char, index) => 
            selectedWord[index] === letter ? letter : char
        );
        setGuessedWord(newGuessedWord);

        if (!newGuessedWord.includes('_')) {
            setGameStatus('won');
        }
    } else {
        setWrongGuesses(prev => prev + 1);
        if (wrongGuesses + 1 >= maxGuesses) {
            setGameStatus('lost');
        }
    }
  };

  const renderWordDisplay = () => (
    <div className="word-display">
      {guessedWord.join(' ')}
    </div>
  );

  const renderKeyboard = () => (
    <div className="letters">
      {'abcdefghijklmnopqrstuvwxyz'.split('').map(letter => (
        <button 
          key={letter} 
          className={`letter ${guessedWord.includes(letter) || wrongGuesses > 0 ? 'disabled' : ''}`}
          onClick={() => handleGuess(letter)} 
          disabled={guessedWord.includes(letter) || gameStatus !== 'playing'}
        >
          {letter}
        </button>
      ))}
    </div>
  );

  return (
    <PS5GameWrapper gameTitle="Hangman" onBack={() => window.history.back()}>
        <div className="hangman-container">
            <h2>Hangman</h2>
            <div className="game-status">Wrong Guesses: {wrongGuesses} / {maxGuesses}</div>
            {renderWordDisplay()}
            
            {gameStatus === 'playing' && renderKeyboard()}

            {gameStatus === 'won' && (
                <div className="game-result ps5-card" style={{background: 'var(--ps5-gradient-success)'}}>
                    <h3>You Won!</h3>
                    <p>The word was: {selectedWord}</p>
                    <button className="ps5-button" onClick={resetGame}>Play Again</button>
                </div>
            )}
            {gameStatus === 'lost' && (
                <div className="game-result ps5-card" style={{background: 'var(--ps5-gradient-danger)'}}>
                    <h3>Game Over!</h3>
                    <p>The word was: {selectedWord}</p>
                    <button className="ps5-button" onClick={resetGame}>Try Again</button>
                </div>
            )}
        </div>
    </PS5GameWrapper>
  );
};

export default HangmanGame;