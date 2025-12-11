import React, { useState } from 'react';
import { useTheme } from '../components/context/ThemeContext';
import './Settings.css';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const handleSave = () => {
    // Save settings logic here
    alert('Settings saved!');
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <div className="settings-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        
        <div className="form-group">
          <label>Theme</label>
          <div className="theme-toggle">
            <span>Light</span>
            <button onClick={toggleTheme} className="theme-switch">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <span>Dark</span>
          </div>
        </div>
        
        <button onClick={handleSave} className="save-button">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;