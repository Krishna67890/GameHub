import React, { useState } from 'react';
import { useAuth } from '../components/context/AuthContext';
import { useTheme } from '../components/context/ThemeContext';
import '../styles/ps5-theme.css';

const Settings = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [newUsername, setNewUsername] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setMessage('You must be logged in to update profile');
      return;
    }
    

    
    // Update user info in localStorage
    const updatedUser = {
      ...user,
      username: newUsername || user.username,
    };
    
    localStorage.setItem('demoUser', JSON.stringify(updatedUser));
    

    
    // Update context state would require adding update function to auth context
    setMessage('Profile updated successfully!');
    setNewUsername('');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your demo account? This cannot be undone.')) {
      localStorage.removeItem('demoUser');
      logout();
      setMessage('Account deleted successfully');
    }
  };

  return (
    <div className="ps5-container" style={{ padding: '20px' }}>
      <div className="ps5-header">
        <h1 className="ps5-title">⚙️ Settings</h1>
        <p className="ps5-subtitle">Manage your demo account settings</p>
      </div>

      <div className="ps5-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '30px' }}>
        {isAuthenticated && user ? (
          <div>
            <h2 style={{ color: 'var(--ps5-accent-blue)', marginBottom: '20px' }}>Your Account</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: 'white', marginBottom: '5px' }}><strong>Current Username:</strong> {user.username}</p>
              <p style={{ color: 'white', marginBottom: '5px' }}><strong>Account Created:</strong> {new Date(user.joinDate).toLocaleDateString()}</p>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', color: 'white', marginBottom: '5px' }}>
                  New Username (leave blank to keep current)
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid var(--ps5-accent-blue)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px'
                  }}
                  placeholder={user.username}
                />
              </div>

          

              <button type="submit" className="ps5-button" style={{ width: '100%', marginBottom: '15px' }}>
                Update Username
              </button>
            </form>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: 'var(--ps5-accent-blue)', marginBottom: '10px' }}>Theme Settings</h3>
              <div className="theme-toggle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ color: 'var(--ps5-light-text)' }}>Dark Mode</span>
                <button 
                  onClick={toggleTheme}
                  className="ps5-button"
                  style={{ 
                    padding: '8px 12px', 
                    fontSize: '16px',
                    minWidth: 'auto',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid var(--ps5-accent-blue)'
                  }}
                  title="Toggle theme"
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <span style={{ color: 'var(--ps5-light-text)' }}>Light Mode</span>
              </div>
            </div>

            <button 
              onClick={handleDeleteAccount}
              className="ps5-button"
              style={{ 
                width: '100%', 
                backgroundColor: '#ff4757',
                marginBottom: '15px'
              }}
            >
              Delete Account
            </button>

            <button 
              onClick={logout}
              className="ps5-button"
              style={{ 
                width: '100%',
                backgroundColor: '#ffa502'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <h2 style={{ color: 'var(--ps5-accent-blue)', marginBottom: '20px' }}>Demo Account Settings</h2>
            <p style={{ color: 'white', marginBottom: '20px' }}>
              You are not currently logged in. Please create a demo account first.
            </p>
            <button 
              className="ps5-button"
              onClick={() => window.location.href = '/login'}
              style={{ width: '100%' }}
            >
              Create Demo Account
            </button>
          </div>
        )}

        {message && (
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            backgroundColor: message.includes('successfully') ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)',
            border: message.includes('successfully') ? '1px solid #2ecc71' : '1px solid #e74c3c',
            borderRadius: '5px',
            color: message.includes('successfully') ? '#2ecc71' : '#e74c3c'
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;