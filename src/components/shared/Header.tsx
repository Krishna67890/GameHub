import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../../styles/ps5-theme.css';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header style={{ 
      backgroundColor: 'rgba(15, 15, 35, 0.9)',
      padding: '15px 20px',
      borderBottom: '2px solid var(--ps5-accent-blue)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Link to="/" style={{ 
          textDecoration: 'none', 
          color: 'var(--ps5-accent-blue)',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ marginRight: '10px' }}>🎮</span>
          PS5 GameHub
        </Link>

        <nav style={{ display: 'flex', gap: '20px' }}>
          <Link 
            to="/" 
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              transition: 'background-color 0.3s',
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 247, 255, 0.1)';
              e.currentTarget.style.borderColor = 'var(--ps5-accent-blue)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            Home
          </Link>
          
          <Link 
            to="/games" 
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              transition: 'background-color 0.3s',
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 247, 255, 0.1)';
              e.currentTarget.style.borderColor = 'var(--ps5-accent-blue)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            Games
          </Link>
          
          <Link 
            to="/leaderboard" 
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              transition: 'background-color 0.3s',
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 247, 255, 0.1)';
              e.currentTarget.style.borderColor = 'var(--ps5-accent-blue)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            Leaderboard
          </Link>
          
          <Link 
            to="/settings" 
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              transition: 'background-color 0.3s',
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 247, 255, 0.1)';
              e.currentTarget.style.borderColor = 'var(--ps5-accent-blue)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            Settings
          </Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {isAuthenticated ? (
            <>
              <span style={{ color: 'var(--ps5-accent-blue)' }}>Welcome!</span>
              <button 
                className="ps5-button"
                onClick={logout}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">
              <button className="ps5-button" style={{ padding: '8px 16px' }}>
                Login
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;