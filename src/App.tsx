import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/context/AuthContext';
import { GameProvider } from './components/context/GameContext';
import { ThemeProvider } from './components/context/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import GameMode from './pages/GameMode';
import LeaderBoard from './pages/LeaderBoard';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Tasks from './pages/Tasks';
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
import WordleGame from './games/wordle/WordleGame';
import MazeGame from './games/maze/MazeGame'; // Corrected import
import HangmanGame from './games/hangman/HangmanGame';
import CarromGame from './games/carrom/CarromGame';
import TrollLaunchGame from './games/troll-launch/TrollLaunchGame';
import BalloonGoesUpGame from './games/Balloon-Goes-Up/BalloonGoesUpGame';
import CricketGame from './games/cricket/CricketGame';
import SnakeGame from './games/snake/SnakeGame';
import KhoKhoGame from './games/kho-kho/KhoKhoGame';
import PongGame from './games/pong/PongGame';
import './styles/ps5-theme.css';

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <GameProvider>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes */}
                <Route path="/home" element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/games" element={
                  <ProtectedRoute>
                    <GameMode />
                  </ProtectedRoute>
                } />
                <Route path="/games/2048" element={
                  <ProtectedRoute>
                    <Game2048 />
                  </ProtectedRoute>
                } />
                <Route path="/games/candy-crush" element={
                  <ProtectedRoute>
                    <CandyCrushGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/flappy-bird" element={
                  <ProtectedRoute>
                    <FlappyBirdGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/memory-card" element={
                  <ProtectedRoute>
                    <MemoryCardGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/rock-paper-scissors" element={
                  <ProtectedRoute>
                    <RockPaperScissorsGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/stick-hero" element={
                  <ProtectedRoute>
                    <StickHeroGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/shape-breaker" element={
                  <ProtectedRoute>
                    <ShapeBreakerGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/archery" element={
                  <ProtectedRoute>
                    <ArcheryGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/sudoku" element={
                  <ProtectedRoute>
                    <SudokuGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/tic-tac-toe" element={
                  <ProtectedRoute>
                    <TicTacToeGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/bubble-shooter" element={
                  <ProtectedRoute>
                    <BubbleShooterGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/poll" element={
                  <ProtectedRoute>
                    <PollGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/wack-a-mole" element={
                  <ProtectedRoute>
                    <WackAMoleGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/wordle" element={
                  <ProtectedRoute>
                    <WordleGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/maze" element={
                  <ProtectedRoute>
                    <MazeGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/hangman" element={
                  <ProtectedRoute>
                    <HangmanGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/carrom" element={
                  <ProtectedRoute>
                    <CarromGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/troll-launch" element={
                  <ProtectedRoute>
                    <TrollLaunchGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/balloon-goes-up" element={
                  <ProtectedRoute>
                    <BalloonGoesUpGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/cricket" element={
                  <ProtectedRoute>
                    <CricketGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/snake" element={
                  <ProtectedRoute>
                    <SnakeGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/kho-kho" element={
                  <ProtectedRoute>
                    <KhoKhoGame />
                  </ProtectedRoute>
                } />
                <Route path="/games/pong" element={
                  <ProtectedRoute>
                    <PongGame />
                  </ProtectedRoute>
                } />
                <Route path="/game/:gameId" element={
                  <ProtectedRoute>
                    <GameLoader />
                  </ProtectedRoute>
                } />
                <Route path="/leaderboard" element={
                  <ProtectedRoute>
                    <LeaderBoard />
                  </ProtectedRoute>
                } />
                <Route path="/tasks" element={
                  <ProtectedRoute>
                    <Tasks />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
              </Routes>
            </MainLayout>
          </GameProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;