import React, { useState, useEffect, useCallback, useRef } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import '../../styles/ps5-theme.css';

const SnakeGame = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  const [snakeImage, setSnakeImage] = useState<string | null>(null);
  const [foodImage, setFoodImage] = useState<string | null>(null);

  const gameLoopRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const gridSize = 20;

  const generateFood = useCallback(() => {
    setFood({
      x: Math.floor(Math.random() * (canvasRef.current?.width ?? 0) / gridSize),
      y: Math.floor(Math.random() * (canvasRef.current?.height ?? 0) / gridSize)
    });
  }, []);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    generateFood();
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setGameStarted(true);
  }, [generateFood]);

  useEffect(() => {
    if (gameStarted) {
        resetGame();
    }
  }, [gameStarted]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'snake' | 'food') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'snake') {
          setSnakeImage(event.target?.result as string);
        } else {
          setFoodImage(event.target?.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) return;
      
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
        case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
        case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
        case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameStarted]);

  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      if (head.x < 0 || head.x >= (canvasRef.current?.width ?? 0) / gridSize || head.y < 0 || head.y >= (canvasRef.current?.height ?? 0) / gridSize || newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return prevSnake;
      }

      newSnake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        generateFood();
      } else {
        newSnake.pop();
      }
      
      return newSnake;
    });
  }, [gameStarted, gameOver, direction, food, generateFood]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = window.setInterval(gameLoop, 150);
      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [gameStarted, gameOver, gameLoop]);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    const snakeImg = new Image();
    if (snakeImage) snakeImg.src = snakeImage;

    const foodImg = new Image();
    if (foodImage) foodImg.src = foodImage;

    snake.forEach((segment, index) => {
        if (snakeImage && snakeImg.complete) {
            context.drawImage(snakeImg, segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        } else {
            context.fillStyle = index === 0 ? '#4CAF50' : '#81C784';
            context.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        }
    });

    if (foodImage && foodImg.complete) {
        context.drawImage(foodImg, food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    } else {
        context.fillStyle = '#f44336';
        context.beginPath();
        context.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2, 0, 2 * Math.PI);
        context.fill();
    }
  }, [snake, food, snakeImage, foodImage]);

  return (
    <PS5GameWrapper gameTitle="Advanced Snake" onBack={() => window.history.back()}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div className="ps5-card" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '500px', padding: '15px' }}>
                <h3>Score: {score}</h3>
                {!gameStarted && <button className="ps5-button" onClick={() => setGameStarted(true)}>Start Game</button>}
            </div>

            <canvas ref={canvasRef} width="400" height="400" className="ps5-card" style={{ background: 'rgba(0,0,0,0.2)' }} />

            {gameOver && (
                <div className="ps5-card" style={{ padding: '30px', textAlign: 'center', background: 'var(--ps5-gradient-danger)' }}>
                    <h2>Game Over</h2>
                    <p>Final Score: {score}</p>
                    <button className="ps5-button" onClick={resetGame}>Play Again</button>
                </div>
            )}
            
            <div className="ps5-card" style={{ display: 'flex', gap: '15px', padding: '20px' }}>
                <div>
                    <label>Snake Image:</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'snake')} />
                </div>
                <div>
                    <label>Food Image:</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'food')} />
                </div>
            </div>
        </div>
    </PS5GameWrapper>
  );
};

export default SnakeGame;