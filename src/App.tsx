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
import './games/tic-tac-toe/TicTacToeGame.css';

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