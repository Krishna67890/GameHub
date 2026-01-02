import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PS5Animator from '../utils/ps5-animator';
import '../styles/ps5-theme.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const homeRef = useRef<HTMLDivElement>(null);
  const gameCardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate the home screen entrance
    if (homeRef.current) {
      PS5Animator.animateEntrance(homeRef.current, 'fadeInScale');
    }

    // Animate header
    if (headerRef.current) {
      PS5Animator.animateEntrance(headerRef.current, 'slideInFromTop');
    }

    // Animate game cards with stagger
    setTimeout(() => {
      PS5Animator.animateStagger(
        gameCardRefs.current,
        'slideInFromBottom',
        0.1
      );
    }, 300);

    // Add hover effects to game cards
    gameCardRefs.current.forEach((card) => {
      if (card) {
        PS5Animator.addHoverEffect(card, 'card');
      }
    });
  }, []);

  const games = [
    { id: '2048', name: '2048', icon: '🎮', path: '/games/2048' },
    { id: 'archery', name: 'Archery', icon: '🏹', path: '/games/archery' },
    { id: 'candy-crush', name: 'Candy Crush', icon: '🍭', path: '/games/candy-crush' },
    { id: 'cricket', name: 'Cricket', icon: '🏏', path: '/games/cricket' },
    { id: 'flappy-bird', name: 'Flappy Bird', icon: '🐦', path: '/games/flappy-bird' },
    { id: 'kho-kho', name: 'Kho Kho', icon: '🏃', path: '/games/kho-kho' },
    { id: 'maze', name: 'Maze', icon: '🧭', path: '/games/maze' },
    { id: 'memory-card', name: 'Memory Card', icon: '🃏', path: '/games/memory-card' },
    { id: 'rock-paper-scissors', name: 'Rock Paper Scissors', icon: '✌️', path: '/games/rock-paper-scissors' },
    { id: 'shape-breaker', name: 'Shape Breaker', icon: '🧱', path: '/games/shape-breaker' },
    { id: 'snake', name: 'Snake', icon: '🐍', path: '/games/snake' },
    { id: 'stick-hero', name: 'Stick Hero', icon: '🦸', path: '/games/stick-hero' },
    { id: 'sudoku', name: 'Sudoku', icon: '🧩', path: '/games/sudoku' },
    { id: 'tic-tac-toe', name: 'Tic Tac Toe', icon: '❌', path: '/games/tic-tac-toe' },
    { id: 'wack-a-mole', name: 'Wack A Mole', icon: '🐹', path: '/games/wack-a-mole' },
    { id: 'wordle', name: 'Wordle', icon: '🔤', path: '/games/wordle' },
  ];

  const handleGameClick = (path: string) => {
    // Add click animation
    PS5Animator.createNotification(`Loading ${games.find(g => g.path === path)?.name}...`, 'success');
    setTimeout(() => {
      navigate(path);
    }, 500);
  };

  return (
    <div className="ps5-container" ref={homeRef}>
      <div className="ps5-header" ref={headerRef}>
        <h1 className="ps5-title">🎮 PLAYSTATION 5</h1>
        <p className="ps5-subtitle">Game Library - Select a game to start playing</p>
      </div>
      
      <div className="ps5-game-grid">
        {games.map((game, index) => (
          <div 
            key={game.id}
            ref={el => gameCardRefs.current[index] = el}
            className="ps5-game-card"
            onClick={() => handleGameClick(game.path)}
          >
            <span className="ps5-game-icon">{game.icon}</span>
            <div className="ps5-game-name">{game.name}</div>
          </div>
        ))}
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        padding: '30px', 
        marginTop: '20px',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '14px'
      }}>
        <p>🎮 Use your controller or mouse to navigate</p>
        <p>⚡ Experience the power of PS5 gaming</p>
      </div>
    </div>
  );
};

export default Home;