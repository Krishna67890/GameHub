import React, { createContext, useContext, useState } from 'react';

interface GameProgress {
  gameName: string;
  level?: number;
  score?: number;
  completed?: boolean;
  lastPlayed?: string;
}

interface GameContextType {
  currentGame: string | null;
  setCurrentGame: (game: string | null) => void;
  gameScore: number;
  setGameScore: (score: number) => void;
  submitScore: (playerName: string, gameName: string, score: number) => void;
  updateGameProgress: (username: string, gameName: string, progress: Partial<GameProgress>) => void;
  getGameProgress: (username: string, gameName: string) => GameProgress | null;
  getAllGameProgress: (username: string) => GameProgress[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameScore, setGameScore] = useState<number>(0);

  const submitScore = (playerName: string, gameName: string, score: number) => {
    // Load existing leaderboard data
    const savedLeaderboard = localStorage.getItem('leaderboardData');
    let leaderboardData = [];
    
    if (savedLeaderboard) {
      try {
        leaderboardData = JSON.parse(savedLeaderboard);
      } catch (error) {
        console.error('Error parsing leaderboard data:', error);
        leaderboardData = [];
      }
    }
    
    // Add new score entry
    const newEntry = {
      id: Date.now(),
      name: playerName,
      score: score,
      game: gameName
    };
    
    // Add new entry to the leaderboard
    leaderboardData.push(newEntry);
    
    // Sort by score descending
    leaderboardData.sort((a: any, b: any) => b.score - a.score);
    
    // Limit to top 20
    const top20 = leaderboardData.slice(0, 20);
    
    // Save back to localStorage
    localStorage.setItem('leaderboardData', JSON.stringify(top20));
  };

  const updateGameProgress = (username: string, gameName: string, progress: Partial<GameProgress>) => {
    const key = `gameProgress_${username}`;
    const existingProgress = getAllGameProgress(username);
    
    // Check if game progress already exists
    const existingGameIndex = existingProgress.findIndex(g => g.gameName === gameName);
    
    if (existingGameIndex >= 0) {
      // Update existing progress
      existingProgress[existingGameIndex] = { ...existingProgress[existingGameIndex], ...progress };
    } else {
      // Add new progress
      existingProgress.push({ gameName, ...progress });
    }
    
    localStorage.setItem(key, JSON.stringify(existingProgress));
  };

  const getGameProgress = (username: string, gameName: string): GameProgress | null => {
    const key = `gameProgress_${username}`;
    const allProgress = localStorage.getItem(key);
    
    if (!allProgress) return null;
    
    try {
      const progressArray: GameProgress[] = JSON.parse(allProgress);
      return progressArray.find(g => g.gameName === gameName) || null;
    } catch (error) {
      console.error('Error parsing game progress:', error);
      return null;
    }
  };

  const getAllGameProgress = (username: string): GameProgress[] => {
    const key = `gameProgress_${username}`;
    const allProgress = localStorage.getItem(key);
    
    if (!allProgress) return [];
    
    try {
      return JSON.parse(allProgress);
    } catch (error) {
      console.error('Error parsing game progress:', error);
      return [];
    }
  };

  return (
    <GameContext.Provider value={{ 
      currentGame, 
      setCurrentGame, 
      gameScore, 
      setGameScore, 
      submitScore,
      updateGameProgress,
      getGameProgress,
      getAllGameProgress
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};