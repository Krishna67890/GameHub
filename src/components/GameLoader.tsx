import React, { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';

// Dynamically import all game components
const gameComponents: { [key: string]: React.LazyExoticComponent<React.ComponentType<any>> } = {
  '2048': lazy(() => import('../games/2048/2048Game')),
  'candy-crush': lazy(() => import('../games/candy-crush/CandyCrushGame')),
  'cricket': lazy(() => import('../games/cricket/CricketGame')),
  'flappy-bird': lazy(() => import('../games/flappy-bird/FlappyBirdGame')),
  'kho-kho': lazy(() => import('../games/kho-kho/KhoKhoGame')),
  'maze': lazy(() => import('../games/maze/MazeGame')),
  'memory-card': lazy(() => import('../games/memory-card/MemoryCardGame')),
  'rock-paper-scissors': lazy(() => import('../games/rock-paper-scissors/RockPaperScissorsGame')),
  'snake': lazy(() => import('../games/snake/SnakeGame')),
  'stick-hero': lazy(() => import('../games/stick-hero/StickHeroGame')),
  'sudoku': lazy(() => import('../games/sudoku/SudokuGame')),
  'tic-tac-toe': lazy(() => import('../games/tic-tac-toe/TicTacToeGame')),
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