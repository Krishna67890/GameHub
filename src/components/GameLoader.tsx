import React, { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';

// Dynamically import all game components
const gameComponents: { [key: string]: React.LazyExoticComponent<React.ComponentType<any>> } = {
  '2048': lazy(() => import('../games/2048/2048Game')),
  'archery': lazy(() => import('../games/archery/ArcheryGame')),
  'balloon-goes-up': lazy(() => import('../games/Balloon-Goes-Up/BalloonGoesUpGame')),
  'bubble-shooter': lazy(() => import('../games/bubble-shooter/BubbleShooterGame')),
  'candy-crush': lazy(() => import('../games/candy-crush/CandyCrushGame')),
  'carrom': lazy(() => import('../games/carrom/CarromGame')),
  'cricket': lazy(() => import('../games/cricket/CricketGame')),
  'flappy-bird': lazy(() => import('../games/flappy-bird/FlappyBirdGame')),
  'hangman': lazy(() => import('../games/hangman/HangmanGame')),
  'kho-kho': lazy(() => import('../games/kho-kho/KhoKhoGame')),
  'maze': lazy(() => import('../games/maze/MazeGame')),
  'memory-card': lazy(() => import('../games/memory-card/MemoryCardGame')),
  'poll': lazy(() => import('../games/poll/PollGame')),
  'rock-paper-scissors': lazy(() => import('../games/rock-paper-scissors/RockPaperScissorsGame')),
  'shape-breaker': lazy(() => import('../games/shape-breaker/ShapeBreakerGame')),
  'snake': lazy(() => import('../games/snake/SnakeGame')),
  'stick-hero': lazy(() => import('../games/stick-hero/StickHeroGame')),
  'sudoku': lazy(() => import('../games/sudoku/SudokuGame')),
  'tic-tac-toe': lazy(() => import('../games/tic-tac-toe/TicTacToeGame')),
  'troll-launch': lazy(() => import('../games/troll-launch/TrollLaunchGame')),
  'wack-a-mole': lazy(() => import('../games/wack-a-mole/WackAMoleGame')),
  'wordle': lazy(() => import('../games/wordle/WordleGame')),
};

const GameLoader: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  
  if (!gameId) {
    return <div>Game not found</div>;
  }
  
  const GameComponent = gameComponents[gameId];
  
  if (!GameComponent) {
    return <div>Game not found</div>;
  }
  
  return (
    <div className="game-loader">
      <Suspense fallback={<div>Loading game...</div>}>
        <GameComponent />
      </Suspense>
    </div>
  );
};

export default GameLoader;