import React, { useState, useEffect, useRef } from 'react';
import Matter from 'matter-js';
import './CarromGame.css';
import PS5GameWrapper from '../../components/PS5GameWrapper';

const CarromGame = () => {
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [playerTurn, setPlayerTurn] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef(Matter.Engine.create());
  const runnerRef = useRef(Matter.Runner.create());

  useEffect(() => {
    const engine = engineRef.current;
    const world = engine.world;
    const render = Matter.Render.create({
        element: sceneRef.current!,
        engine: engine,
        options: {
            width: 600,
            height: 600,
            wireframes: false,
            background: '#f7dE9A'
        }
    });

    // Walls
    const wallOptions = { isStatic: true, render: { fillStyle: '#5D2906' } };
    Matter.World.add(world, [
        Matter.Bodies.rectangle(300, 0, 600, 20, wallOptions),
        Matter.Bodies.rectangle(300, 600, 600, 20, wallOptions),
        Matter.Bodies.rectangle(0, 300, 20, 600, wallOptions),
        Matter.Bodies.rectangle(600, 300, 20, 600, wallOptions)
    ]);

    // Pockets
    const pocketRadius = 30;
    const pockets = [
        { x: 30, y: 30 }, { x: 570, y: 30 },
        { x: 30, y: 570 }, { x: 570, y: 570 }
    ];
    pockets.forEach(p => {
        const pocket = Matter.Bodies.circle(p.x, p.y, pocketRadius, { isStatic: true, isSensor: true, render: { fillStyle: '#111' } });
        pocket.label = 'pocket';
        Matter.World.add(world, pocket);
    });

    // Coins
    let coins: Matter.Body[] = [];
    const coinOptions = { restitution: 0.8, friction: 0.1 };
    
    // Red coin (Queen)
    const queen = Matter.Bodies.circle(300, 300, 16, { ...coinOptions, render: { fillStyle: '#c0392b' } });
    queen.label = 'red';
    coins.push(queen);

    // White and Black coins
    for(let i=0; i<9; i++){
        const angle = (i/9) * Math.PI * 2;
        const xW = 300 + 50 * Math.cos(angle);
        const yW = 300 + 50 * Math.sin(angle);
        const whiteCoin = Matter.Bodies.circle(xW, yW, 14, { ...coinOptions, render: { fillStyle: '#f1f1f1' } });
        whiteCoin.label = 'white';
        coins.push(whiteCoin);

        const xB = 300 + 80 * Math.cos(angle + Math.PI/9);
        const yB = 300 + 80 * Math.sin(angle + Math.PI/9);
        const blackCoin = Matter.Bodies.circle(xB, yB, 14, { ...coinOptions, render: { fillStyle: '#333' } });
        blackCoin.label = 'black';
        coins.push(blackCoin);
    }
    Matter.World.add(world, coins);

    // Striker
    const striker = Matter.Bodies.circle(300, 500, 15, { restitution: 0.9, render: { fillStyle: '#ddd' } });
    striker.label = 'striker';
    Matter.World.add(world, striker);

    // Mouse control for striker
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: { stiffness: 0.2, render: { visible: false } }
    });
    Matter.World.add(world, mouseConstraint);

    // Collision events
    Matter.Events.on(engine, 'collisionStart', (event) => {
        event.pairs.forEach(pair => {
            const { bodyA, bodyB } = pair;
            if (bodyA.label === 'pocket' || bodyB.label === 'pocket') {
                const coin = bodyA.label !== 'pocket' ? bodyA : bodyB;
                if(coin.label.includes('coin')){
                    Matter.World.remove(world, coin);
                    // Update score
                }
            }
        });
    });
    
    Matter.Render.run(render);
    Matter.Runner.run(runnerRef.current, engine);

    return () => {
      Matter.Render.stop(render);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
      render.canvas.remove();
    };
  }, []);

  const handleNewGame = () => {
      // This should ideally re-initialize the Matter.js world
      // For now, it just resets scores
      setScore({ player1: 0, player2: 0 });
      setPlayerTurn(1);
      setGameOver(false);
  };

  return (
    <PS5GameWrapper gameTitle="Carrom 3D" onBack={() => window.history.back()}>
      <div className="carrom-game-container">
        <div id="score-board">
            Player 1 (White): {score.player1} | Player 2 (Black): {score.player2}
        </div>
        <div id="player-turn">
            Current Turn: Player {playerTurn}
        </div>
        <div ref={sceneRef} style={{ width: 600, height: 600, position: 'relative' }}>
           {/* Matter.js will render here */}
        </div>
        <div id="controls">
            <button id="new-game-btn" onClick={handleNewGame}>New Game</button>
        </div>
      </div>
    </PS5GameWrapper>
  );
};

export default CarromGame;