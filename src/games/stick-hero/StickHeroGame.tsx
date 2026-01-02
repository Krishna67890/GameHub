import React, { useEffect, useRef, useState } from 'react';
import './StickHeroGame.css';

const StickHeroGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [isGameOver, setIsGameOver] = useState(false);
    const [instructionsVisible, setInstructionsVisible] = useState(true);

    // Game configuration
    const config = {
        canvasWidth: 800,
        canvasHeight: 1000,
        heroWidth: 40,
        heroHeight: 80,
        platformHeight: 250, // Raised platform height for visibility
        minGap: 50,
        maxGap: 250,
        gravity: 0.8,
        jumpForce: 15,
        walkSpeed: 4,
        stickGrowthSpeed: 8,
        maxStickLength: 800,
        levelDifficultyIncrease: 0.1,
        scoreMultiplier: 10,
        heroColor: '#FF5555',
        heroHeadColor: '#FFD700',
        platformColor: '#8B4513',
        platformSideColor: '#A0522D',
        stickColor: '#8B4513',
        stickPatternColor: '#A0522D'
    };

    // Game state ref to avoid closure staleness in loop
    const state = useRef({
        score: 0,
        level: 1,
        heroX: 0,
        heroY: 0,
        heroVelocityY: 0,
        isWalking: false,
        isFalling: false,
        isGrowingStick: false,
        stickLength: 0,
        stickAngle: 0,
        stickX: 0,
        platforms: [] as { x: number, y: number, width: number, height: number }[],
        sceneOffset: 0,
        gameOver: false,
        lastPlatformX: 0,
        nextPlatformDistance: 0,
        gameStarted: false,
        animationFrameId: 0
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            // Maintain aspect ratio
            // const aspectRatio = config.canvasWidth / config.canvasHeight;
            canvas.width = containerWidth;
            canvas.height = containerHeight;
            
            // Re-render immediately
            render(ctx, canvas);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        initGame();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (state.current.animationFrameId) {
                cancelAnimationFrame(state.current.animationFrameId);
            }
        };
    }, []);

    const initGame = () => {
        resetGameData();
        createInitialPlatforms();
        state.current.gameStarted = true;
        gameLoop();
        
        // Hide instructions after 3 seconds
        setTimeout(() => {
            setInstructionsVisible(false);
        }, 3000);
    };

    const resetGameData = () => {
        const canvas = canvasRef.current;
        const startY = canvas ? canvas.height - config.platformHeight : 600;

        state.current = {
            ...state.current,
            score: 0,
            level: 1,
            heroX: 100,
            heroY: startY - config.heroHeight,
            heroVelocityY: 0,
            isWalking: false,
            isFalling: false,
            isGrowingStick: false,
            stickLength: 0,
            stickAngle: 0,
            stickX: 100 + config.heroWidth, // Stick starts at right edge of hero/platform
            platforms: [],
            sceneOffset: 0,
            gameOver: false,
            lastPlatformX: 0,
            nextPlatformDistance: 0
        };
        
        setScore(0);
        setLevel(1);
        setIsGameOver(false);
    };

    const createInitialPlatforms = () => {
        const canvas = canvasRef.current;
        const groundY = canvas ? canvas.height - config.platformHeight : 600;

        state.current.platforms = [];

        // Starting platform
        const startPlatform = {
            x: 50,
            y: groundY,
            width: 100,
            height: config.platformHeight
        };
        state.current.platforms.push(startPlatform);

        state.current.heroX = startPlatform.x + startPlatform.width - config.heroWidth - 20;
        state.current.heroY = groundY - config.heroHeight;
        state.current.stickX = state.current.heroX + config.heroWidth;

        state.current.lastPlatformX = startPlatform.x + startPlatform.width;

        // Generate next platforms
        generateNextPlatform();
    };

    const generateNextPlatform = () => {
        const canvas = canvasRef.current;
        const groundY = canvas ? canvas.height - config.platformHeight : 600;
        
        const minGap = config.minGap;
        const maxGap = Math.min(config.maxGap + (state.current.level * 10), 400);

        const gap = Math.random() * (maxGap - minGap) + minGap;
        const platformWidth = 40 + Math.random() * 80; // Random width between 40 and 120

        const nextPlatform = {
            x: state.current.lastPlatformX + gap,
            y: groundY,
            width: platformWidth,
            height: config.platformHeight
        };

        state.current.platforms.push(nextPlatform);
        state.current.lastPlatformX += gap + platformWidth;
        state.current.nextPlatformDistance = gap;
    };

    const handleMouseDown = () => {
        if (state.current.gameOver) return;
        if (state.current.isWalking || state.current.isFalling) return;

        state.current.isGrowingStick = true;
    };

    const handleMouseUp = () => {
        if (state.current.gameOver) return;
        if (!state.current.isGrowingStick) return;

        state.current.isGrowingStick = false;
        state.current.isWalking = true;
    };

    const resetGame = () => {
        resetGameData();
        createInitialPlatforms();
        gameLoop();
    };

    const update = () => {
        if (state.current.gameOver) return;

        // Grow stick
        if (state.current.isGrowingStick) {
            state.current.stickLength += config.stickGrowthSpeed;
            if (state.current.stickLength > config.maxStickLength) {
                state.current.stickLength = config.maxStickLength;
            }
        }

        // Stick falling animation (rotation)
        if (state.current.isWalking && state.current.stickAngle < 90 && state.current.heroX < state.current.stickX) {
             // Instant rotation for this game style usually, or animated?
             // The original code implies walk starts after stick is placed.
             // Usually stick rotates down then hero walks.
             // Let's assume stick is placed instantly or rotates quickly.
        }

        // Hero movement
        if (state.current.isWalking) {
            state.current.heroX += config.walkSpeed;
            
            // Move scene to keep hero centered-ish
            if (state.current.heroX > 200) {
                 state.current.sceneOffset += config.walkSpeed;
            }

            const heroRight = state.current.heroX + config.heroWidth;
            const stickTip = state.current.stickX + state.current.stickLength;

            // Check if reached end of stick
            if (state.current.heroX >= stickTip) {
                // Determine if successful
                const currentPlatform = state.current.platforms[0];
                const nextPlatform = state.current.platforms[1];
                
                // Hero is walking on the stick which bridges current to next
                // If stick tip is within next platform bounds
                const stickLanded = stickTip >= nextPlatform.x && stickTip <= (nextPlatform.x + nextPlatform.width);

                if (stickLanded) {
                     // Walk to the end of the platform
                     if (state.current.heroX < nextPlatform.x + nextPlatform.width - config.heroWidth - 20) {
                         // Keep walking
                     } else {
                         // Stop walking
                         state.current.isWalking = false;
                         state.current.stickLength = 0; // Reset stick
                         
                         // Score calculation
                         const points = 10;
                         state.current.score += points;
                         setScore(state.current.score);
                         
                         if (state.current.score % 50 === 0) {
                             state.current.level++;
                             setLevel(state.current.level);
                         }

                         // Prepare for next round
                         // Remove first platform
                         state.current.platforms.shift();
                         generateNextPlatform();
                         
                         // Reset hero position logic relative to new platform
                         // Stick start position update
                         state.current.stickX = state.current.heroX + config.heroWidth;
                     }
                } else {
                    // Fall
                    state.current.isWalking = false;
                    state.current.isFalling = true;
                }
            } else {
                 // Check if hero is over a gap while walking (if stick was too short)
                 // Or stick was too long and hero walks past next platform?
                 
                 // If stick is too short:
                 const currentPlatform = state.current.platforms[0];
                 const nextPlatform = state.current.platforms[1];
                 
                 if (state.current.heroX > state.current.stickX + state.current.stickLength) {
                     state.current.isWalking = false;
                     state.current.isFalling = true;
                 }
                 
                 // If stick is too long, hero walks to end of stick then falls? 
                 // Logic: Hero walks distance of stick. If that point is not on a platform, fall.
                 // We handled "reached end of stick" above.
            }
        }

        // Hero falling
        if (state.current.isFalling) {
            state.current.heroVelocityY += config.gravity;
            state.current.heroY += state.current.heroVelocityY;

            if (state.current.heroY > (canvasRef.current?.height || 1000)) {
                state.current.gameOver = true;
                setIsGameOver(true);
            }
        }
    };

    const render = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F7FA');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(-state.current.sceneOffset, 0);

        // Draw Platforms
        state.current.platforms.forEach(platform => {
            ctx.fillStyle = config.platformColor;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // 3D effect side
            ctx.fillStyle = config.platformSideColor;
            ctx.fillRect(platform.x, platform.y + platform.height, platform.width, 10); // Not really visible if height goes to bottom
            
            // Center red dot for bonus (optional, often in Stick Hero)
            ctx.fillStyle = 'red';
            ctx.fillRect(platform.x + platform.width/2 - 5, platform.y, 10, 5);
        });

        // Draw Stick
        if (state.current.stickLength > 0 || state.current.isWalking || state.current.isFalling) {
             ctx.save();
             ctx.translate(state.current.stickX, state.current.heroY + config.heroHeight);
             
             // If walking, stick is down (0 degrees visually if we draw horizontally, but typically Stick Hero stick grows UP then falls DOWN)
             // Let's assume simplified: Stick grows UP, then rotates 90deg to be horizontal.
             
             if (state.current.isGrowingStick) {
                 // Draw vertical growing stick
                 ctx.strokeStyle = config.stickColor;
                 ctx.lineWidth = 4;
                 ctx.beginPath();
                 ctx.moveTo(0, 0);
                 ctx.lineTo(0, -state.current.stickLength);
                 ctx.stroke();
             } else {
                 // Draw horizontal stick (landed)
                 // Or rotating
                 ctx.strokeStyle = config.stickColor;
                 ctx.lineWidth = 4;
                 ctx.beginPath();
                 ctx.moveTo(0, 0);
                 ctx.lineTo(state.current.stickLength, 0);
                 ctx.stroke();
             }
             ctx.restore();
        }

        // Draw Hero
        ctx.fillStyle = config.heroColor;
        ctx.fillRect(state.current.heroX, state.current.heroY, config.heroWidth, config.heroHeight);
        
        // Hero headband/eye
        ctx.fillStyle = config.heroHeadColor;
        ctx.fillRect(state.current.heroX + 20, state.current.heroY + 10, 20, 10); // Bandana

        ctx.restore();
    };

    const gameLoop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        update();
        render(ctx, canvas);

        if (!state.current.gameOver) {
            state.current.animationFrameId = requestAnimationFrame(gameLoop);
        }
    };

    return (
        <div className="stick-hero-container" ref={containerRef}>
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
                className="stick-hero-canvas"
            />
            
            <div className="stick-hero-ui">
                <div className="score-board">Score: {score}</div>
                <div className="level-board">Level: {level}</div>
            </div>

            {instructionsVisible && !state.current.isGrowingStick && !state.current.isWalking && (
                <div className="instructions-overlay">
                    <p>Hold to grow stick</p>
                    <p>Release to bridge gap</p>
                </div>
            )}

            {isGameOver && (
                <div className="game-over-overlay">
                    <h2>Game Over</h2>
                    <p>Final Score: {score}</p>
                    <button onClick={resetGame} className="restart-btn">Try Again</button>
                </div>
            )}
        </div>
    );
};

export default StickHeroGame;