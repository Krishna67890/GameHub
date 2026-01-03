import React from 'react';
import '../../styles/ps5-theme.css';

const Footer = () => {
  return (
    <footer style={{ 
      backgroundColor: 'rgba(15, 15, 35, 0.9)',
      padding: '30px 20px',
      borderTop: '2px solid var(--ps5-accent-blue)',
      backdropFilter: 'blur(10px)',
      marginTop: 'auto'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h3 style={{ 
            color: 'var(--ps5-accent-blue)', 
            margin: '0 0 10px 0',
            fontSize: '1.2rem'
          }}>
            🎮 GameHub
          </h3>
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)' }}>
            Experience the power of GameHub
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <div>
            <h4 style={{ 
              color: 'white', 
              margin: '0 0 10px 0',
              fontSize: '1rem'
            }}>
              Quick Links
            </h4>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              <li style={{ marginBottom: '5px' }}><a href="/" style={{ color: 'var(--ps5-accent-blue)', textDecoration: 'none' }}>Home</a></li>
              <li style={{ marginBottom: '5px' }}><a href="/games" style={{ color: 'var(--ps5-accent-blue)', textDecoration: 'none' }}>Games</a></li>
              <li style={{ marginBottom: '5px' }}><a href="/leaderboard" style={{ color: 'var(--ps5-accent-blue)', textDecoration: 'none' }}>Leaderboard</a></li>
              <li><a href="/settings" style={{ color: 'var(--ps5-accent-blue)', textDecoration: 'none' }}>Settings</a></li>
            </ul>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 10px 0', color: 'rgba(255, 255, 255, 0.7)' }}>
            © 2026 GameHub
          </p>
          <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
            Experience the Future of Gaming
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;