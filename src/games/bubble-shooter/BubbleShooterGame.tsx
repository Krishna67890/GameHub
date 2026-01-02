import React, { useState, useEffect, useRef, useCallback } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import '../../styles/ps5-theme.css';
import './BubbleShooterGame.css';

const BubbleShooterGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gamePaused, setGamePaused] = useState(false);
  
  const gameInstance = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const bubbleRadius = 20;
    const colors = ["#ff7675", "#74b9ff", "#55efc4", "#ffeaa7", "#a29bfe", "#fd79a8"];
    let bubbles: any[] = [];
    let playerBubble: any;

    const resizeCanvas = () => {
        canvas.width = canvas.parentElement!.offsetWidth;
        canvas.height = canvas.parentElement!.offsetHeight;
    };

    const initBubbles = () => {
      bubbles = [];
      const rows = 5;
      const bubblesPerRow = Math.floor(canvas.width / (bubbleRadius * 2.5));
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < bubblesPerRow; j++) {
          const x = bubbleRadius + j * (bubbleRadius * 2 + 5);
          const y = bubbleRadius + i * (bubbleRadius * 2 + 5);
          bubbles.push({ x, y, radius: bubbleRadius, color: colors[Math.floor(Math.random() * colors.length)], destroyed: false });
        }
      }
    };

    const resetPlayerBubble = () => {
      playerBubble = {
        x: canvas.width / 2,
        y: canvas.height - 50,
        radius: bubbleRadius,
        color: colors[Math.floor(Math.random() * colors.length)],
        dx: 0, dy: 0, speed: 10
      };
    };

    const draw = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        bubbles.forEach(b => {
            if(!b.destroyed){
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
        }
    };

    const update = () => {
      if (gamePaused || !playerBubble) return;
      
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
              return;
            }
          }
        }
      }
    };

    const gameLoop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    const handleCanvasClick = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const angle = Math.atan2(mouseY - playerBubble.y, mouseX - playerBubble.x);
        playerBubble.dx = playerBubble.speed * Math.cos(angle);
        playerBubble.dy = playerBubble.speed * Math.sin(angle);
    };

    resizeCanvas();
    initBubbles();
    resetPlayerBubble();
    gameLoop();

    canvas.addEventListener("click", handleCanvasClick);
    window.addEventListener("resize", resizeCanvas);

    gameInstance.current = { restart: () => { setScore(0); initBubbles(); resetPlayerBubble(); } };

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("click", handleCanvasClick);
    };
  }, [gamePaused]);

  return (
    <PS5GameWrapper gameTitle="Bubble Shooter" onBack={() => window.history.back()}>
        <div className="bubble-shooter-container">
            <div id="score">Score: {score}</div>
            <canvas ref={canvasRef} />
            <div id="controls">
                <button onClick={() => setGamePaused(!gamePaused)}>{gamePaused ? 'Resume' : 'Pause'}</button>
                <button onClick={() => gameInstance.current?.restart()}>Restart</button>
            </div>
        </div>
    </PS5GameWrapper>
  );
};

export default BubbleShooterGame;
