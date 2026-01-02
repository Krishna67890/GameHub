import React, { useState } from "react";
import { useTheme } from "../components/context/ThemeContext";
import "../styles/ps5-theme.css";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    sound: true,
    music: true,
    notifications: true,
    difficulty: "medium",
  });

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  return (
    <div className="ps5-container">
      <div className="ps5-header">
        <h1 className="ps5-title">⚙️ Settings</h1>
        <p className="ps5-subtitle">Customize your gaming experience</p>
      </div>

      <div className="ps5-card" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Theme Toggle */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0" }}>
            <span>Dark Mode</span>
            <button 
              className="ps5-button"
              onClick={toggleTheme}
              style={{ minWidth: "auto", padding: "8px 16px" }}
            >
              {theme}
            </button>
          </div>

          {/* Sound Settings */}
          <div style={{ padding: "15px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 style={{ margin: "0 0 15px 0", color: "var(--ps5-accent-blue)" }}>Audio Settings</h3>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span>Sound Effects</span>
              <input
                type="checkbox"
                name="sound"
                checked={settings.sound}
                onChange={handleSettingChange}
                style={{ transform: "scale(1.2)" }}
              />
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span>Background Music</span>
              <input
                type="checkbox"
                name="music"
                checked={settings.music}
                onChange={handleSettingChange}
                style={{ transform: "scale(1.2)" }}
              />
            </div>
          </div>

          {/* Notification Settings */}
          <div style={{ padding: "15px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 style={{ margin: "0 0 15px 0", color: "var(--ps5-accent-blue)" }}>Notification Settings</h3>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Enable Notifications</span>
              <input
                type="checkbox"
                name="notifications"
                checked={settings.notifications}
                onChange={handleSettingChange}
                style={{ transform: "scale(1.2)" }}
              />
            </div>
          </div>

          {/* Difficulty Settings */}
          <div style={{ padding: "15px 0" }}>
            <h3 style={{ margin: "0 0 15px 0", color: "var(--ps5-accent-blue)" }}>Game Difficulty</h3>
            
            <select
              name="difficulty"
              value={settings.difficulty}
              onChange={handleSettingChange}
              className="ps5-button"
              style={{ width: "100%", padding: "12px", textAlign: "center" }}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "30px" }}>
        <button 
          className="ps5-button ps5-button--success"
          style={{ minWidth: "200px" }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;