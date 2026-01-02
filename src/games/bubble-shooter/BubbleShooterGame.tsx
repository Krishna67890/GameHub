import React, { useState, useEffect, useRef } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import '../../styles/ps5-theme.css';
import './BubbleShooterGame.css';

const BubbleShooterGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gamePaused, setGamePaused] = useState(false);
  const [bubbles, setBubbles] = useState<any[]>([]);
  const [playerBubble, setPlayerBubble] = useState<any>(null);

  const gameInstance = useRef<any>(null);

  const bubbleRadius = 20;
  const colors = ["#ff7675", "#74b9ff", "#55efc4", "#ffeaa7", "#a29bfe", "#fd79a8"];

  const initBubbles = () => {
    if (!canvasRef.current) return;
    const newBubbles: any[] = [];
    const rows = 5;
    const bubblesPerRow = Math.floor(canvasRef.current.width / (bubbleRadius * 2.5));
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < bubblesPerRow; j++) {
        const x = bubbleRadius + j * (bubbleRadius * 2 + 5);
        const y = bubbleRadius + i * (bubbleRadius * 2 + 5);
        newBubbles.push({ x, y, radius: bubbleRadius, color: colors[Math.floor(Math.random() * colors.length)], destroyed: false });
      }
    }
    setBubbles(newBubbles);
  };

  const resetPlayerBubble = () => {
      if(!canvasRef.current) return;
    setPlayerBubble({
      x: canvasRef.current.width / 2,
      y: canvasRef.current.height - 50,
      radius: bubbleRadius,
      color: colors[Math.floor(Math.random() * colors.length)],
      dx: 0, dy: 0, speed: 10
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement!.offsetWidth;
      canvas.height = canvas.parentElement!.offsetHeight;
      initBubbles();
      resetPlayerBubble();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let animationFrameId: number;

    const gameLoop = () => {
      if (!gamePaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        bubbles.forEach(b => {
          if (!b.destroyed) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fillStyle = b.color;
            ctx.fill();
            ctx.closePath();
          }
        });

        if (playerBubble) {
          ctx.beginPath();
          ctx.arc(playerBubble.x, playerBubble.y, playerBubble.radius, 0, Math.PI * 2);
          ctx.fillStyle = playerBubble.color;
          ctx.fill();
          ctx.closePath();

          if (playerBubble.dx !== 0 || playerBubble.dy !== 0) {
            playerBubble.x += playerBubble.dx;
            playerBubble.y += playerBubble.dy;

            if (playerBubble.x - bubbleRadius <= 0 || playerBubble.x + bubbleRadius >= canvas.width) {
              playerBubble.dx *= -1;
            }

            if (playerBubble.y < 0) {
              resetPlayerBubble();
            }

            for (const bubble of bubbles) {
              if (!bubble.destroyed) {
                const dist = Math.hypot(playerBubble.x - bubble.x, playerBubble.y - bubble.y);
                if (dist < playerBubble.radius + bubble.radius) {
                  if (playerBubble.color === bubble.color) {
                    bubble.destroyed = true;
                    setScore(s => s + 1);
                  }
                  resetPlayerBubble();
                  break;
                }
              }
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [gamePaused, bubbles, playerBubble]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!playerBubble || (playerBubble.dx !== 0 && playerBubble.dy !== 0)) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const angle = Math.atan2(mouseY - playerBubble.y, mouseX - playerBubble.x);
    setPlayerBubble((p:any) => ({...p, dx: p.speed * Math.cos(angle), dy: p.speed * Math.sin(angle)}));
  };
  
  const restartGame = () => {
      setScore(0);
      initBubbles();
      resetPlayerBubble();
  };

  return (
    <PS5GameWrapper gameTitle="Bubble Shooter" onBack={() => window.history.back()}>
      <div className="bubble-shooter-container">
        <div id="score">Score: {score}</div>
        <canvas ref={canvasRef} onClick={handleCanvasClick} />
        <div id="controls">
          <button onClick={() => setGamePaused(!gamePaused)}>{gamePaused ? 'Resume' : 'Pause'}</button>
          <button onClick={restartGame}>Restart</button>
        </div>
      </div>
    </PS5GameWrapper>
  );
};

export default BubbleShooterGame;
