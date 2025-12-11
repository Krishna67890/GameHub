import React from 'react';
import { useAuth } from '../components/context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <section className="hero-section">
        <h1>Welcome to GameHub</h1>
        <p>Your ultimate destination for fun and challenging games!</p>
        {isAuthenticated ? (
          <button onClick={() => window.location.href = '/games'}>
            Play Games
          </button>
        ) : (
          <button onClick={() => window.location.href = '/login'}>
            Get Started
          </button>
        )}
      </section>
      
      <section className="features-section">
        <h2>Why Choose GameHub?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🎮 Multiple Games</h3>
            <p>Enjoy a variety of games from classics to modern challenges</p>
          </div>
          <div className="feature-card">
            <h3>🏆 Leaderboards</h3>
            <p>Compete with players worldwide and climb the rankings</p>
          </div>
          <div className="feature-card">
            <h3>📱 Responsive Design</h3>
            <p>Play on any device - desktop, tablet, or mobile</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;