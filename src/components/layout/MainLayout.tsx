import React from 'react';
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import '../../styles/ps5-theme.css';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
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