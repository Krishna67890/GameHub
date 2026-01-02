import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import './GameHub.css';
// Importing the existing Wordle CSS to ensure it loads when the game is active
import './games/wordle/WordleGame.css';

// --- Game Components (Placeholders & Integration) ---

// 1. Working Wordle Game
const WordleGame = () => {
  const solution = "GAMES";
  const [guesses, setGuesses] = useState(Array(6).fill(null));
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState("playing"); // playing, won, lost
  
  const keys = [
    "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P",
    "A", "S", "D", "F", "G", "H", "J", "K", "L",
    "Z", "X", "C", "V", "B", "N", "M"
  ];

  useEffect(() => {
    const handleKey = (e) => {
      if (gameStatus !== "playing") return;

      if (e.key === "Enter") {
        if (currentGuess.length !== 5) return;
        submitGuess();
      } else if (e.key === "Backspace") {
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < 5) {
        setCurrentGuess(prev => (prev + e.key).toUpperCase());
      }
    };

    const submitGuess = () => {
      const newGuesses = [...guesses];
      const idx = newGuesses.findIndex(g => g === null);
      if (idx === -1) return;
      
      newGuesses[idx] = currentGuess;
      setGuesses(newGuesses);
      
      if (currentGuess === solution) setGameStatus("won");
      else if (idx === 5) setGameStatus("lost");
      
      setCurrentGuess("");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentGuess, guesses, gameStatus]);

  return (
    <div className="wordle-game">
      <h2>WORDLE</h2>
      <div className="game-board">
        {guesses.map((guess, i) => {
          const isCurrent = guesses.findIndex(g => g === null) === i;
          return (
            <div key={i} className="word-row">
              {Array(5).fill(null).map((_, j) => {
                const letter = isCurrent ? currentGuess[j] : (guess ? guess[j] : "");
                let status = "";
                if (!isCurrent && guess) {
                  if (letter === solution[j]) status = "correct";
                  else if (solution.includes(letter)) status = "present";
                  else status = "absent";
                }
                return <div key={j} className={`letter-box ${status}`}>{letter}</div>;
              })}
            </div>
          );
        })}
      </div>
      
      {/* Keyboard UI */}
      <div className="keyboard">
        <div className="keyboard-row">
          {keys.slice(0, 10).map(key => <KeyButton key={key} val={key} guesses={guesses} solution={solution} onClick={() => currentGuess.length < 5 && setCurrentGuess(p => p + key)} />)}
        </div>
        <div className="keyboard-row">
          {keys.slice(10, 19).map(key => <KeyButton key={key} val={key} guesses={guesses} solution={solution} onClick={() => currentGuess.length < 5 && setCurrentGuess(p => p + key)} />)}
        </div>
        <div className="keyboard-row">
          <button className="key enter" onClick={() => currentGuess.length === 5 && window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Enter'}))}>ENTER</button>
          {keys.slice(19, 26).map(key => <KeyButton key={key} val={key} guesses={guesses} solution={solution} onClick={() => currentGuess.length < 5 && setCurrentGuess(p => p + key)} />)}
          <button className="key backspace" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Backspace'}))}>⌫</button>
        </div>
      </div>

      {gameStatus !== "playing" && (
        <div className={`game-result ${gameStatus === "won" ? "win" : "lose"}`}>
          <p>{gameStatus === "won" ? "YOU WON!" : "GAME OVER"}</p>
          <button onClick={() => { setGuesses(Array(6).fill(null)); setGameStatus("playing"); }}>Play Again</button>
        </div>
      )}
    </div>
  );
};

const KeyButton = ({ val, guesses, solution, onClick }) => {
  let status = "";
  // Check history to color keys
  for (let guess of guesses) {
    if (!guess) break;
    if (guess.includes(val)) {
      if (solution.includes(val)) {
        // Check if it was in correct spot
        let isCorrect = false;
        for(let i=0; i<5; i++) if(guess[i] === val && solution[i] === val) isCorrect = true;
        status = isCorrect ? "correct" : (status !== "correct" ? "present" : status);
      } else {
        status = status || "absent";
      }
    }
  }
  return <div className={`key ${status}`} onClick={onClick}>{val}</div>;
};

// 2. Working Candy Crush (Simplified Match 3)
const CandyCrushGame = () => {
  const width = 8;
  const candyColors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
  const [board, setBoard] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  const createBoard = useCallback(() => {
    const randomBoard = [];
    for (let i = 0; i < width * width; i++) {
      randomBoard.push(candyColors[Math.floor(Math.random() * candyColors.length)]);
    }
    setBoard(randomBoard);
  }, []);

  useEffect(() => { createBoard(); }, [createBoard]);

  const checkForMatches = useCallback(() => {
    let newBoard = [...board];
    let isMatch = false;

    // Check Rows
    for (let i = 0; i < 64; i++) {
      if (i % width > width - 3) continue;
      if (newBoard[i] && newBoard[i] === newBoard[i + 1] && newBoard[i] === newBoard[i + 2]) {
        newBoard[i] = ''; newBoard[i + 1] = ''; newBoard[i + 2] = '';
        isMatch = true;
        setScore(s => s + 30);
      }
    }
    // Check Cols
    for (let i = 0; i < 48; i++) { // width * (width - 2)
      if (newBoard[i] && newBoard[i] === newBoard[i + width] && newBoard[i] === newBoard[i + width * 2]) {
        newBoard[i] = ''; newBoard[i + width] = ''; newBoard[i + width * 2] = '';
        isMatch = true;
        setScore(s => s + 30);
      }
    }
    if (isMatch) setBoard(newBoard);
    return isMatch;
  }, [board]);

  const moveBelow = useCallback(() => {
    let newBoard = [...board];
    let moved = false;
    for (let i = 0; i < 56; i++) { // 64 - width
      if (newBoard[i + width] === '') {
        newBoard[i + width] = newBoard[i];
        newBoard[i] = '';
        moved = true;
      }
      const firstRow = [0, 1, 2, 3, 4, 5, 6, 7];
      if (firstRow.includes(i) && newBoard[i] === '') {
        newBoard[i] = candyColors[Math.floor(Math.random() * candyColors.length)];
        moved = true;
      }
    }
    if (moved) setBoard(newBoard);
    return moved;
  }, [board]);

  useEffect(() => {
    const timer = setInterval(() => {
      checkForMatches();
      moveBelow();
    }, 100);
    return () => clearInterval(timer);
  }, [checkForMatches, moveBelow]);

  const handleClick = (i) => {
    if (selected === null) {
      setSelected(i);
    } else {
      // Swap logic
      const newBoard = [...board];
      const temp = newBoard[selected];
      newBoard[selected] = newBoard[i];
      newBoard[i] = temp;
      setBoard(newBoard);
      setSelected(null);
      // Note: A real implementation would check if swap is valid (adjacent) and reverts if no match.
      // For this demo, we allow free swapping to make it fun/easy.
    }
  };

  return (
    <div className="candy-game">
      <h1 style={{ fontFamily: 'cursive', color: '#ff69b4', textShadow: '0 0 10px #ff69b4', margin: 0 }}>Candy Pop</h1>
      <div className="candy-score">Score: {score}</div>
      <div className="candy-board">
        {board.map((color, i) => (
          <div 
            key={i}
            className={`candy-cell ${selected === i ? 'selected' : ''}`}
            onClick={() => handleClick(i)}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
};

// 3. Working 2048 Game
const Game2048 = () => {
  const [grid, setGrid] = useState(Array(16).fill(0));
  const [score, setScore] = useState(0);
  
  const addNumber = (newGrid) => {
    let added = false;
    while (!added) {
      const rand = Math.floor(Math.random() * 16);
      if (newGrid[rand] === 0) {
        newGrid[rand] = Math.random() > 0.5 ? 2 : 4;
        added = true;
      }
      if (!newGrid.includes(0)) break;
    }
  };

  const initGame = () => {
    const newGrid = Array(16).fill(0);
    addNumber(newGrid);
    addNumber(newGrid);
    setGrid(newGrid);
    setScore(0);
  };

  useEffect(() => { initGame(); }, []);

  // Game Logic Helpers
  const slide = (row) => {
    let arr = row.filter(val => val);
    let missing = 4 - arr.length;
    let zeros = Array(missing).fill(0);
    return arr.concat(zeros);
  };

  const combine = (row) => {
    let newScore = 0;
    for (let i = 0; i < 3; i++) {
      if (row[i] === row[i + 1] && row[i] !== 0) {
        row[i] = row[i] * 2;
        row[i + 1] = 0;
        newScore += row[i];
      }
    }
    return { newRow: row, scoreAdd: newScore };
  };

  const operate = (row) => {
    let slided = slide(row);
    let combined = combine(slided);
    let final = slide(combined.newRow);
    return { final, score: combined.scoreAdd };
  };

  const handleKeyDown = (e) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    
    let newGrid = [...grid];
    let scoreAdd = 0;

    // Logic for 4 directions
    if (e.key === "ArrowLeft") {
      for (let i = 0; i < 16; i += 4) {
        let row = [newGrid[i], newGrid[i+1], newGrid[i+2], newGrid[i+3]];
        let res = operate(row);
        scoreAdd += res.score;
        [newGrid[i], newGrid[i+1], newGrid[i+2], newGrid[i+3]] = res.final;
      }
    } else if (e.key === "ArrowRight") {
      for (let i = 0; i < 16; i += 4) {
        let row = [newGrid[i], newGrid[i+1], newGrid[i+2], newGrid[i+3]];
        row.reverse();
        let res = operate(row);
        scoreAdd += res.score;
        res.final.reverse();
        [newGrid[i], newGrid[i+1], newGrid[i+2], newGrid[i+3]] = res.final;
      }
    } else if (e.key === "ArrowUp") {
      for (let i = 0; i < 4; i++) {
        let col = [newGrid[i], newGrid[i+4], newGrid[i+8], newGrid[i+12]];
        let res = operate(col);
        scoreAdd += res.score;
        [newGrid[i], newGrid[i+4], newGrid[i+8], newGrid[i+12]] = res.final;
      }
    } else if (e.key === "ArrowDown") {
      for (let i = 0; i < 4; i++) {
        let col = [newGrid[i], newGrid[i+4], newGrid[i+8], newGrid[i+12]];
        col.reverse();
        let res = operate(col);
        scoreAdd += res.score;
        res.final.reverse();
        [newGrid[i], newGrid[i+4], newGrid[i+8], newGrid[i+12]] = res.final;
      }
    }
    
    if (JSON.stringify(grid) !== JSON.stringify(newGrid)) {
      addNumber(newGrid);
      setGrid(newGrid);
      setScore(s => s + scoreAdd);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [grid]);

  const getColors = (num) => {
    const colors = {
      0: '#cdc1b4', 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
      32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61', 512: '#edc850',
      1024: '#edc53f', 2048: '#edc22e'
    };
    return colors[num] || '#3c3a32';
  };

  return (
    <div className="game-2048">
      <h1 style={{ fontSize: '3rem', color: '#edc22e', fontWeight: 'bold', margin: 0 }}>2048</h1>
      <div className="score-2048">Score: {score}</div>
      <div className="board-2048">
          {grid.map((num, i) => (
            <div key={i} className="cell-2048" style={{ backgroundColor: getColors(num), color: num <= 4 ? '#776e65' : '#f9f6f2' }}>
              {num !== 0 && num}
            </div>
          ))}
      </div>
      <p style={{color: 'white', marginTop: '20px'}}>Use Arrow Keys to Move</p>
    </div>
  );
};

const gamesLibrary = [
  {
    id: 'wordle',
    title: 'Wordle',
    description: 'Guess the hidden word in 6 tries. A daily word puzzle game that tests your vocabulary.',
    bgImage: 'linear-gradient(135deg, #0f0f23, #1a1a2e)', // Using gradient as placeholder for BG image
    tags: ['Puzzle', 'Free', 'Daily'],
    component: WordleGame
  },
  {
    id: 'candy',
    title: 'Candy Crush',
    description: 'Switch and match candies in this tasty puzzle adventure. Progress to the next level for that sweet winning feeling!',
    bgImage: 'linear-gradient(135deg, #4a148c, #880e4f)',
    tags: ['Arcade', 'Free', 'Match 3'],
    component: CandyCrushGame
  },
  {
    id: '2048',
    title: '2048',
    description: 'Join the numbers and get to the 2048 tile! A simple yet addictive logic puzzle.',
    bgImage: 'linear-gradient(135deg, #e65100, #ff9800)',
    tags: ['Logic', 'Free', 'Strategy'],
    component: Game2048
  }
];

export default function GameHub() {
  const [selectedGame, setSelectedGame] = useState(gamesLibrary[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const heroRef = useRef(null);
  const listRef = useRef(null);

  // GSAP Animations on selection change
  useEffect(() => {
    if (!isPlaying && heroRef.current) {
      gsap.fromTo(heroRef.current.children, 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [selectedGame, isPlaying]);

  const handlePlay = () => {
    // Animate out
    gsap.to(".hub-content", { opacity: 0, duration: 0.5, onComplete: () => setIsPlaying(true) });
  };

  const handleCloseGame = () => {
    setIsPlaying(false);
    // Animate in handled by CSS or initial render, but we can force a fade in
    setTimeout(() => {
      gsap.fromTo(".hub-content", { opacity: 0 }, { opacity: 1, duration: 0.5 });
    }, 100);
  };

  return (
    <div className="game-hub-container">
      {/* Background Layer */}
      <div className="hub-background" style={{ background: selectedGame.bgImage }}></div>
      <div className="hub-overlay"></div>

      {/* Header */}
      <div className="hub-header">
        <div className="nav-tabs">
          <div className="nav-tab active">Games</div>
          <div className="nav-tab">Media</div>
        </div>
        <div className="user-info">
          <span>Player 1</span>
          <div className="avatar"></div>
        </div>
      </div>

      {/* Main Dashboard */}
      {!isPlaying ? (
        <div className="hub-content">
          <div className="game-list" ref={listRef}>
            {gamesLibrary.map((game) => (
              <div 
                key={game.id} 
                className={`game-card ${selectedGame.id === game.id ? 'active' : ''}`}
                onClick={() => setSelectedGame(game)}
                style={{ background: game.bgImage }}
              >
                {/* Placeholder for game icon/thumbnail */}
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                  {game.title[0]}
                </div>
              </div>
            ))}
          </div>

          <div className="game-hero" ref={heroRef}>
            <h1 className="hero-title">{selectedGame.title}</h1>
            <div className="game-tags">
              {selectedGame.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
            <p className="hero-desc">{selectedGame.description}</p>
            <button className="play-button" onClick={handlePlay}>
              <span>▶</span> Play Game
            </button>
          </div>
        </div>
      ) : (
        /* Active Game Viewport */
        <div className="game-viewport">
          <button className="close-game-btn" onClick={handleCloseGame}>✕</button>
          <selectedGame.component />
        </div>
      )}
    </div>
  );
}