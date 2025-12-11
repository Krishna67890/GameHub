import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className={`main-layout ${theme}`}>
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;