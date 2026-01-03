import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import '../../styles/ps5-theme.css';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();

  useEffect(() => {
    // Apply theme to the body element
    document.body.setAttribute('data-theme', theme);
    
    // Also apply to the root element for CSS selectors
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="ps5-container">
      <Header />
      <main style={{ flex: 1, padding: '20px 0' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;