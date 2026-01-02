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

  const baseGridSize = 20;

  const generateFood = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const actualGridSize = Math.min(canvas.width / 20, canvas.height / 20);
    const gridWidth = Math.floor(canvas.width / actualGridSize);
    const gridHeight = Math.floor(canvas.height / actualGridSize);
    
    setFood({
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight)
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
        // Initialize canvas dimensions before starting game
        const canvas = canvasRef.current;
        if (canvas) {
          const container = canvas.parentElement;
          if (container) {
            const displayWidth = container.clientWidth;
            const displayHeight = Math.min(400, window.innerHeight * 0.5);
            
            canvas.width = displayWidth;
            canvas.height = displayHeight;
          }
        }
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

      const canvas = canvasRef.current;
      if (!canvas) return prevSnake;
      
      const actualGridSize = Math.min(canvas.width / 20, canvas.height / 20);
      const gridWidth = Math.floor(canvas.width / actualGridSize);
      const gridHeight = Math.floor(canvas.height / actualGridSize);
      
      if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight || newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
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
      // Adjust game speed based on screen size
      const canvas = canvasRef.current;
      let speed = 150; // Default speed
      
      if (canvas) {
        const actualGridSize = Math.min(canvas.width / 20, canvas.height / 20);
        // Smaller grid = faster game, larger grid = slower game
        speed = Math.max(80, Math.min(200, 200 - (actualGridSize * 3)));
      }
      
      gameLoopRef.current = window.setInterval(gameLoop, speed);
      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [gameStarted, gameOver, gameLoop]);
  
  // Handle window resize to update canvas dimensions
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const container = canvas.parentElement;
      if (container) {
        const displayWidth = container.clientWidth;
        const displayHeight = Math.min(400, window.innerHeight * 0.5);
        
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize canvas size
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas dimensions based on container
    const container = canvas.parentElement;
    if (container) {
      const displayWidth = container.clientWidth;
      const displayHeight = Math.min(400, window.innerHeight * 0.5); // Max 400px or 50% of viewport
      
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    } else {
      // Fallback to default dimensions
      canvas.width = 500;
      canvas.height = 400;
    }
    
    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate grid size based on canvas dimensions
    const actualGridSize = Math.min(canvas.width / 20, canvas.height / 20); // Use minimum of 20 grid cells in each direction
    const gridWidth = Math.floor(canvas.width / actualGridSize);
    const gridHeight = Math.floor(canvas.height / actualGridSize);
    
    const snakeImg = new Image();
    if (snakeImage) snakeImg.src = snakeImage;

    const foodImg = new Image();
    if (foodImage) foodImg.src = foodImage;

    snake.forEach((segment, index) => {
        if (snakeImage && snakeImg.complete) {
            context.drawImage(snakeImg, segment.x * actualGridSize, segment.y * actualGridSize, actualGridSize, actualGridSize);
        } else {
            context.fillStyle = index === 0 ? '#4CAF50' : '#81C784';
            context.fillRect(segment.x * actualGridSize, segment.y * actualGridSize, actualGridSize, actualGridSize);
        }
    });

    if (foodImage && foodImg.complete) {
        context.drawImage(foodImg, food.x * actualGridSize, food.y * actualGridSize, actualGridSize, actualGridSize);
    } else {
        context.fillStyle = '#f44336';
        context.beginPath();
        context.arc(food.x * actualGridSize + actualGridSize / 2, food.y * actualGridSize + actualGridSize / 2, actualGridSize / 2, 0, 2 * Math.PI);
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

            <canvas ref={canvasRef} className="ps5-card" style={{ background: 'rgba(0,0,0,0.2)', width: '100%', maxWidth: '500px', height: '400px', display: 'block' }} />

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