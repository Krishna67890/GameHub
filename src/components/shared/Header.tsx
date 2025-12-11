import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Header.css';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`header ${theme}`}>
      <div className="header-content">
        <h1>GameHub</h1>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/games">Games</a></li>
            <li><a href="/leaderboard">Leaderboard</a></li>
            <li><a href="/settings">Settings</a></li>
          </ul>
        </nav>
        <div className="header-actions">
          <button onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {isAuthenticated ? (
            <button onClick={logout}>Logout</button>
          ) : (
            <button>Login</button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;