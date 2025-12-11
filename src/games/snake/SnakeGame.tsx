import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../components/context/ThemeContext';

const SnakeGame = () => {
  const { theme } = useTheme();
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Generate random food position
  const generateFood = () => {
    return {
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20)
    };
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case ' ':
          if (gameOver) resetGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [direction, gameStarted, gameOver]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        
        // Move head based on direction
        switch (direction) {
          case 'UP':
            head.y -= 1;
            break;
          case 'DOWN':
            head.y += 1;
            break;
          case 'LEFT':
            head.x -= 1;
            break;
          case 'RIGHT':
            head.x += 1;
            break;
        }

        // Check for collisions with walls
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
          setGameOver(true);
          return prevSnake;
        }

        // Check for collisions with self
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];
        
        // Check for food collision
        if (head.x === food.x && head.y === food.y) {
          setFood(generateFood());
          setScore(prev => prev + 10);
        } else {
          newSnake.pop();
        }
        
        return newSnake;
      });
    };

    gameLoopRef.current = setInterval(moveSnake, 150);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [direction, food, gameStarted, gameOver]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setGameStarted(false);
  };

  return (
    <div className={`snake-game ${theme}`}>
      <h2>Snake Game</h2>
      <div className="game-info">
        <p>Score: {score}</p>
        {!gameStarted && !gameOver && (
          <button onClick={startGame}>Start Game</button>
        )}
        {gameOver && (
          <div className="game-over">
            <p>Game Over!</p>
            <p>Final Score: {score}</p>
            <button onClick={resetGame}>Play Again</button>
          </div>
        )}
      </div>
      <div className="game-board">
        {Array.from({ length: 20 }).map((_, rowIndex) => (
          <div key={rowIndex} className="row">
            {Array.from({ length: 20 }).map((_, colIndex) => {
              const isSnake = snake.some(segment => segment.x === colIndex && segment.y === rowIndex);
              const isHead = snake[0].x === colIndex && snake[0].y === rowIndex;
              const isFood = food.x === colIndex && food.y === rowIndex;
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`cell ${
                    isHead ? 'snake-head' : 
                    isSnake ? 'snake-body' : 
                    isFood ? 'food' : ''
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="controls">
        <p>Use arrow keys to move. Press SPACE to restart after game over.</p>
      </div>
    </div>
  );
};

export default SnakeGame;