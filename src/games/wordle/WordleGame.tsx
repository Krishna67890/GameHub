import React, { useState, useEffect } from 'react';
import './WordleGame.css';
const WordleGame: React.FC = () => {
  // Sample word list - in a real app, you'd have a larger dictionary
  const wordList = ['REACT', 'TYPESCRIPT', 'VITE', 'GAMES', 'PUZZLE', 'WORDLE', 'GUESS', 'LETTER'];
  
  const [targetWord, setTargetWord] = useState<string>('');
  const [guesses, setGuesses] = useState<string[]>(Array(6).fill(''));
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [currentRow, setCurrentRow] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [letterStatus, setLetterStatus] = useState<{[key: string]: 'correct' | 'present' | 'absent' | 'unused'}>({});

  // Initialize game
  useEffect(() => {
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    setTargetWord(randomWord);
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameStatus !== 'playing') return;

      const key = event.key.toUpperCase();

      if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
        setCurrentGuess((prev: string) => prev + key);
      } else if (key === 'BACKSPACE') {
        setCurrentGuess((prev: string) => prev.slice(0, -1));
      } else if (key === 'ENTER' && currentGuess.length === 5) {
        submitGuess();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentGuess, gameStatus]);

  const submitGuess = () => {
    const newGuesses = [...guesses];
    newGuesses[currentRow] = currentGuess;
    setGuesses(newGuesses);

    // Update letter statuses
    const newLetterStatus = {...letterStatus};
    for (let i = 0; i < currentGuess.length; i++) {
      const letter = currentGuess[i];
      if (targetWord[i] === letter) {
        newLetterStatus[letter] = 'correct';
      } else if (targetWord.includes(letter)) {
        // Only mark as present if not already correct
        if (newLetterStatus[letter] !== 'correct') {
          newLetterStatus[letter] = 'present';
        }
      } else {
        newLetterStatus[letter] = 'absent';
      }
    }
    setLetterStatus(newLetterStatus);

    // Check win condition
    if (currentGuess === targetWord) {
      setGameStatus('won');
    } else if (currentRow === 5) {
      // Last guess, game over
      setGameStatus('lost');
    }

    // Move to next row
    setCurrentRow((prev: number) => prev + 1);
    setCurrentGuess('');
  };

  const restartGame = () => {
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    setTargetWord(randomWord);
    setGuesses(Array(6).fill(''));
    setCurrentGuess('');
    setCurrentRow(0);
    setGameStatus('playing');
    setLetterStatus({});
  };

  // Get status for a specific letter in a guess
  const getLetterStatus = (guess: string, letter: string, index: number) => {
    if (targetWord[index] === letter) {
      return 'correct';
    } else if (targetWord.includes(letter)) {
      return 'present';
    } else {
      return 'absent';
    }
  };

  return (
    <div className="wordle-game">
      <h2>Wordle</h2>
      
      <div className="game-board">
        {guesses.map((guess, rowIndex) => (
          <div key={rowIndex} className="word-row">
            {Array.from({ length: 5 }).map((_, colIndex) => {
              const letter = rowIndex === currentRow ? currentGuess[colIndex] : guess[colIndex];
              const status = rowIndex < currentRow && letter 
                ? getLetterStatus(guess, letter, colIndex) 
                : '';
              
              return (
                <div 
                  key={colIndex} 
                  className={`letter-box ${status}`}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {gameStatus === 'won' && (
        <div className="game-result win">
          <p>Congratulations! You guessed the word!</p>
          <button onClick={restartGame}>Play Again</button>
        </div>
      )}

      {gameStatus === 'lost' && (
        <div className="game-result lose">
          <p>Game Over! The word was: {targetWord}</p>
          <button onClick={restartGame}>Try Again</button>
        </div>
      )}

      <div className="keyboard">
        {'QWERTYUIOP'.split('').map(letter => (
          <button
            key={letter}
            className={`key ${letterStatus[letter] || 'unused'}`}
            onClick={() => {
              if (gameStatus === 'playing' && currentGuess.length < 5) {
                setCurrentGuess((prev: string) => prev + letter);
              }
            }}
          >
            {letter}
          </button>
        ))}
        <div className="keyboard-row">
          {'ASDFGHJKL'.split('').map(letter => (
            <button
              key={letter}
              className={`key ${letterStatus[letter] || 'unused'}`}
              onClick={() => {
                if (gameStatus === 'playing' && currentGuess.length < 5) {
                  setCurrentGuess((prev: string) => prev + letter);
                }
              }}
            >
              {letter}
            </button>
          ))}
        </div>
        <div className="keyboard-row">
          <button
            className="key enter"
            onClick={submitGuess}
            disabled={currentGuess.length !== 5}
          >
            ENTER
          </button>
          {'ZXCVBNM'.split('').map(letter => (
            <button
              key={letter}
              className={`key ${letterStatus[letter] || 'unused'}`}
              onClick={() => {
                if (gameStatus === 'playing' && currentGuess.length < 5) {
                  setCurrentGuess((prev: string) => prev + letter);
                }
              }}
            >
              {letter}
            </button>
          ))}
          <button
            className="key backspace"
            onClick={() => setCurrentGuess((prev: string) => prev.slice(0, -1))}
          >
            ⌫
          </button>
        </div>
      </div>

      <div className="instructions">
        <p>Guess the 5-letter word in 6 tries.</p>
        <p>Green = Correct letter in correct position</p>
        <p>Yellow = Correct letter in wrong position</p>
        <p>Gray = Letter not in word</p>
      </div>
    </div>
  );
};

export default WordleGame;