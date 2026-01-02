import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/context/AuthContext';
import { GameProvider } from './components/context/GameContext';
import { ThemeProvider } from './components/context/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import GameMode from './pages/GameMode';
import LeaderBoard from './pages/LeaderBoard';
import Settings from './pages/Settings';
import GameLoader from './components/GameLoader';
import Game2048 from './games/2048/2048Game';
import CandyCrushGame from './games/candy-crush/CandyCrushGame';
import FlappyBirdGame from './games/flappy-bird/FlappyBirdGame';
import MemoryCardGame from './games/memory-card/MemoryCardGame';
import RockPaperScissorsGame from './games/rock-paper-scissors/RockPaperScissorsGame';
import StickHeroGame from './games/stick-hero/StickHeroGame';
import ShapeBreakerGame from './games/shape-breaker/ShapeBreakerGame';
import ArcheryGame from './games/archery/ArcheryGame';
import SudokuGame from './games/sudoku/SudokuGame';
import TicTacToeGame from './games/tic-tac-toe/TicTacToeGame';
import BubbleShooterGame from './games/bubble-shooter/BubbleShooterGame';
import PollGame from './games/poll/PollGame';
import WackAMoleGame from './games/wack-a-mole/WackAMoleGame';
import MazeGame from './games/maze/MazeGame'; // Corrected import
import HangmanGame from './games/hangman/HangmanGame';
import CarromGame from './games/carrom/CarromGame';
import TrollLaunchGame from './games/troll-launch/TrollLaunchGame';
import CricketGame from './games/cricket/CricketGame';
import SnakeGame from './games/snake/SnakeGame';
import KhoKhoGame from './games/kho-kho/KhoKhoGame';
import './styles/ps5-theme.css';

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <GameProvider>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/games" element={<GameMode />} />
                <Route path="/games/2048" element={<Game2048 />} />
                <Route path="/games/candy-crush" element={<CandyCrushGame />} />
                <Route path="/games/flappy-bird" element={<FlappyBirdGame />} />
                <Route path="/games/memory-card" element={<MemoryCardGame />} />
                <Route path="/games/rock-paper-scissors" element={<RockPaperScissorsGame />} />
                <Route path="/games/stick-hero" element={<StickHeroGame />} />
                <Route path="/games/shape-breaker" element={<ShapeBreakerGame />} />
                <Route path="/games/archery" element={<ArcheryGame />} />
                <Route path="/games/sudoku" element={<SudokuGame />} />
                <Route path="/games/tic-tac-toe" element={<TicTacToeGame />} />
                <Route path="/games/bubble-shooter" element={<BubbleShooterGame />} />
                <Route path="/games/poll" element={<PollGame />} />
                <Route path="/games/wack-a-mole" element={<WackAMoleGame />} />
                <Route path="/games/maze" element={<MazeGame />} /> {/* Corrected component */}
                <Route path="/games/hangman" element={<HangmanGame />} />
                <Route path="/games/carrom" element={<CarromGame />} />
                <Route path="/games/troll-launch" element={<TrollLaunchGame />} />
                <Route path="/games/cricket" element={<CricketGame />} />
                <Route path="/games/snake" element={<SnakeGame />} />
                <Route path="/games/kho-kho" element={<KhoKhoGame />} />
                <Route path="/game/:gameId" element={<GameLoader />} />
                <Route path="/leaderboard" element={<LeaderBoard />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </MainLayout>
          </GameProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;