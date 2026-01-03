import React, { useState } from 'react';
import { useAuth } from '../components/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/ps5-theme.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true); // true for login, false for register
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    // Register the user
    register(username.trim());
    
    // Navigate to home page after registration
    navigate('/');
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    // Attempt to login
    const loginSuccess = login(username.trim());
    
    if (loginSuccess) {
      // Navigate to home page after successful login
      navigate('/');
    } else {
      setError('User not found');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      handleLogin(e);
    } else {
      handleRegister(e);
    }
  };

  return (
    <div className="ps5-container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '70vh',
      padding: '20px'
    }}>
      <div className="ps5-card" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '30px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: 'var(--ps5-accent-blue)', marginBottom: '20px' }}>🎮 Demo Login</h2>
        <p style={{ color: 'white', marginBottom: '20px' }}>
          Create your demo account with username
        </p>
        
        {error && (
          <div style={{ 
            color: '#ff6b6b', 
            backgroundColor: 'rgba(255, 107, 107, 0.1)', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '15px' 
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label style={{ display: 'block', color: 'white', marginBottom: '5px' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid var(--ps5-accent-blue)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px'
              }}
              placeholder="Enter your username"
              autoFocus
            />
          </div>
          
          <button 
            type="submit" 
            className="ps5-button"
            style={{ 
              width: '100%', 
              padding: '12px',
              fontSize: '16px',
              marginTop: '10px'
            }}
          >
            {isLoginMode ? 'Login' : 'Create Demo Account'}
          </button>
        </form>
        
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <button 
            type="button" 
            onClick={() => setIsLoginMode(!isLoginMode)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ps5-accent-blue)',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline'
            }}
          >
            {isLoginMode 
              ? 'Need an account? Register here' 
              : 'Already have an account? Login here'}
          </button>
        </div>
        
        <div style={{ marginTop: '20px', color: '#ff6b6b', fontSize: '14px', textAlign: 'center' }}>
          <p><strong>Disclaimer:</strong> This is a demo account. This site only stores names locally in your browser. No password required.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;