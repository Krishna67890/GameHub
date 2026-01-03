import React, { useState, useEffect } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import { useGame } from '../../components/context/GameContext';
import { useAuth } from '../../components/context/AuthContext';
import '../../styles/ps5-theme.css';

const WordleGame = () => {
  const { user } = useAuth();
  const { updateGameProgress } = useGame();
  
  // Sample word list - in a real app, you'd have a larger dictionary
  const wordList = ['REACT', 'TYPESCRIPT', 'VITE', 'GAMES', 'PUZZLE', 'WORDLE', 'GUESS', 'LETTER', 'APPLE', 'BEACH', 'CLOUD', 'DANCE', 'EARTH', 'FLAME', 'GLASS', 'HOUSE', 'IGLOO', 'JUMBO', 'KNIFE', 'LEMON'];
  
  const [targetWord, setTargetWord] = useState<string>('');
  const [guesses, setGuesses] = useState<string[]>(Array(6).fill(''));
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [currentRow, setCurrentRow] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [letterStatus, setLetterStatus] = useState<{[key: string]: 'correct' | 'present' | 'absent' | 'unused'}>({});
  const [showHelp, setShowHelp] = useState(false);
  const [message, setMessage] = useState<string>('');

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
    if (currentGuess.length !== 5) {
      setMessage('Word must be 5 letters');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    if (!wordList.includes(currentGuess)) {
      setMessage('Not in word list');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

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
      setMessage('Congratulations! You won!');
      
      // Update game progress when game is won
      if (user) {
        updateGameProgress(user.username, 'Wordle', {
          score: 1000, // Give a score for winning
          completed: true,
          lastPlayed: new Date().toISOString(),
        });
      }
    } else if (currentRow === 5) {
      // Last guess, game over
      setGameStatus('lost');
      setMessage(`Game over! The word was: ${targetWord}`);
      
      // Update game progress when game is lost
      if (user) {
        updateGameProgress(user.username, 'Wordle', {
          score: 0,
          lastPlayed: new Date().toISOString(),
        });
      }
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
    setMessage('');
    
    // Update game progress when game restarts
    if (user) {
      updateGameProgress(user.username, 'Wordle', {
        score: 0,
        lastPlayed: new Date().toISOString(),
      });
    }
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

  // Keyboard layout
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  const handleKeyboardClick = (key: string) => {
    if (gameStatus !== 'playing') return;

    if (key === 'ENTER' && currentGuess.length === 5) {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
    }
  };

  return (
    <PS5GameWrapper gameTitle="Wordle" onBack={() => window.history.back()}>
      <div className="wordle-game" style={{ 
        textAlign: 'center', 
        padding: '20px',
        maxWidth: '900px',
        margin: '0 auto',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
      }}>
        <h2 style={{ 
          color: 'var(--ps5-accent-blue)', 
          margin: '0 0 20px 0',
          fontSize: 'clamp(1.8em, 4vw, 2.5em)',
          textShadow: '0 0 10px rgba(0, 247, 255, 0.5)'
        }}>
          Wordle
        </h2>

        <div id="wordle-message" style={{ 
          height: '24px', 
          margin: '10px auto',
          color: 'var(--ps5-accent-green)',
          fontWeight: 'bold',
          minHeight: '24px',
          fontSize: 'clamp(0.9em, 3vw, 1em)',
          maxWidth: 'min(100%, 320px)'
        }}>
          {message}
        </div>

        <div id="wordle-game">
          <div id="wordle-board" style={{
            display: 'grid',
            gridTemplateRows: 'repeat(6, minmax(40px, 62px))',
            gridTemplateColumns: 'repeat(5, minmax(40px, 62px))',
            gap: '5px',
            margin: '15px auto',
            width: 'min(100%, 320px)'
          }}>
            {guesses.map((guess, rowIndex) => (
              Array.from({ length: 5 }).map((_, colIndex) => {
                const letter = rowIndex === currentRow ? currentGuess[colIndex] : guess[colIndex];
                const status = rowIndex < currentRow && letter 
                  ? getLetterStatus(guess, letter, colIndex) 
                  : '';
                
                return (
                  <div 
                    key={`${rowIndex}-${colIndex}`} 
                    className={`wordle-tile ${letter ? 'tile-filled' : ''}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: '2px solid #d3d6da',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: 'clamp(24px, 6vw, 32px)',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      transform: 'translateZ(0)',
                      willChange: 'transform',
                      backgroundColor: status === 'correct' ? '#6aaa64' : 
                                     status === 'present' ? '#c9b458' : 
                                     status === 'absent' ? '#787c7e' : 
                                     '#fff',
                      color: status === 'correct' || status === 'present' || status === 'absent' ? 'white' : '#000',
                      borderColor: status === 'correct' ? '#6aaa64' : 
                                  status === 'present' ? '#c9b458' : 
                                  status === 'absent' ? '#787c7e' : 
                                  '#d3d6da'
                    }}
                  >
                    {letter}
                  </div>
                );
              })
            ))}
            
            {/* Current row tiles */}
            {currentRow < 6 && Array.from({ length: 5 }).map((_, colIndex) => {
              const letter = currentGuess[colIndex] || '';
              return (
                <div 
                  key={`current-${colIndex}`} 
                  className={`wordle-tile ${letter ? 'tile-filled' : ''}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: '2px solid #d3d6da',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: 'clamp(24px, 6vw, 32px)',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                    backgroundColor: '#fff',
                    color: '#000'
                  }}
                >
                  {letter}
                </div>
              );
            })}
          </div>

          <div id="wordle-input-container" style={{
            margin: '15px auto',
            display: 'flex',
            gap: '10px',
            width: 'min(100%, 320px)'
          }}>
            <input 
              type="text" 
              id="wordle-input" 
              value={currentGuess}
              onChange={(e) => {
                if (e.target.value.length <= 5) {
                  setCurrentGuess(e.target.value.toUpperCase());
                }
              }}
              maxLength={5}
              placeholder="Enter guess"
              autoComplete="off"
              style={{
                fontSize: 'clamp(18px, 4vw, 24px)',
                padding: '8px',
                width: '100%',
                textAlign: 'center',
                textTransform: 'uppercase',
                border: '2px solid #d3d6da',
                borderRadius: '5px',
                outline: 'none',
                backgroundColor: '#fff',
                color: '#000'
              }}
              disabled={gameStatus !== 'playing'}
            />
            <button 
              className="ps5-button" 
              onClick={submitGuess}
              disabled={currentGuess.length !== 5 || gameStatus !== 'playing'}
              style={{ height: 'fit-content' }}
            >
              Submit
            </button>
          </div>

          <div id="wordle-keyboard" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            margin: '15px auto',
            width: 'min(100%, 500px)'
          }}>
            {keyboardRows.map((row, rowIndex) => (
              <div key={rowIndex} className="keyboard-row" style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '5px'
              }}>
                {row.map((key) => (
                  <button
                    key={key}
                    className={`keyboard-key ps5-button ${key.length > 1 ? 'wide' : ''}`}
                    style={{
                      minWidth: key.length > 1 ? '50px' : '30px',
                      height: '50px',
                      flex: key.length > 1 ? '0 0 auto' : '1',
                      border: 'none',
                      borderRadius: '5px',
                      fontWeight: 'bold',
                      backgroundColor: letterStatus[key] === 'correct' ? '#6aaa64' : 
                                      letterStatus[key] === 'present' ? '#c9b458' : 
                                      letterStatus[key] === 'absent' ? '#787c7e' : 
                                      'var(--ps5-button-bg)',
                      color: letterStatus[key] === 'correct' || 
                             letterStatus[key] === 'present' || 
                             letterStatus[key] === 'absent' ? 'white' : 'white',
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      transform: 'translateZ(0)',
                      willChange: 'transform',
                      cursor: gameStatus === 'playing' ? 'pointer' : 'not-allowed'
                    }}
                    onClick={() => handleKeyboardClick(key)}
                    disabled={gameStatus !== 'playing'}
                  >
                    {key === 'BACKSPACE' ? '⌫' : key}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div id="wordle-controls" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            marginTop: '15px'
          }}>
            <button 
              className="ps5-button" 
              onClick={() => setShowHelp(true)}
            >
              How to Play
            </button>
            <button 
              className="ps5-button" 
              onClick={restartGame}
            >
              New Game
            </button>
          </div>
        </div>

        {gameStatus === 'won' && (
          <div className="ps5-card" style={{ 
            marginTop: '20px', 
            padding: '20px',
            backgroundColor: 'var(--ps5-card-bg)',
            borderRadius: '10px',
            color: 'white'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--ps5-accent-green)' }}>🎉 Congratulations! 🎉</h3>
            <p>You guessed the word: <strong>{targetWord}</strong></p>
            <button 
              className="ps5-button" 
              onClick={restartGame}
              style={{ marginTop: '10px' }}
            >
              Play Again
            </button>
          </div>
        )}

        {gameStatus === 'lost' && (
          <div className="ps5-card" style={{ 
            marginTop: '20px', 
            padding: '20px',
            backgroundColor: 'var(--ps5-card-bg)',
            borderRadius: '10px',
            color: 'white'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--ps5-accent-red)' }}>Game Over</h3>
            <p>The word was: <strong>{targetWord}</strong></p>
            <button 
              className="ps5-button" 
              onClick={restartGame}
              style={{ marginTop: '10px' }}
            >
              Try Again
            </button>
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
              <h3 style={{ margin: '0 0 15px 0', color: 'var(--ps5-accent-blue)' }}>How to Play Wordle</h3>
              <p>Guess the hidden 5-letter word in 6 tries.</p>
              <p>After each guess, the color of the tiles will change to show how close your guess was:</p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', margin: '15px 0' }}>
                <div 
                  className="wordle-tile correct" 
                  style={{
                    width: '40px', 
                    height: '40px', 
                    fontSize: '20px',
                    backgroundColor: '#6aaa64',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  A
                </div>
                <div 
                  className="wordle-tile present" 
                  style={{
                    width: '40px', 
                    height: '40px', 
                    fontSize: '20px',
                    backgroundColor: '#c9b458',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  B
                </div>
                <div 
                  className="wordle-tile absent" 
                  style={{
                    width: '40px', 
                    height: '40px', 
                    fontSize: '20px',
                    backgroundColor: '#787c7e',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  C
                </div>
              </div>

              <p><strong style={{ color: '#6aaa64' }}>Green</strong>: Correct letter in correct position</p>
              <p><strong style={{ color: '#c9b458' }}>Yellow</strong>: Correct letter in wrong position</p>
              <p><strong style={{ color: '#787c7e' }}>Gray</strong>: Letter not in the word</p>
              
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

export default WordleGame;