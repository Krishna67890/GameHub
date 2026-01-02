import React, { useEffect, useRef } from 'react';
import PS5Animator from '../utils/ps5-animator';

interface PS5GameWrapperProps {
  children: React.ReactNode;
  gameTitle: string;
  onBack?: () => void;
}

const PS5GameWrapper: React.FC<PS5GameWrapperProps> = ({ 
  children, 
  gameTitle, 
  onBack 
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate the game wrapper entrance
    if (wrapperRef.current) {
      PS5Animator.animateEntrance(wrapperRef.current, 'fadeInScale');
    }

    // Animate header
    if (headerRef.current) {
      PS5Animator.animateEntrance(headerRef.current, 'slideInFromTop');
    }

    // Add keyboard navigation support
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onBack) {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  return (
    <div className="ps5-container" ref={wrapperRef}>
      {/* Game Header */}
      <div className="ps5-header" ref={headerRef}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <h1 className="ps5-title" style={{ margin: 0 }}>
            🎮 {gameTitle}
          </h1>
          {onBack && (
            <button 
              className="ps5-button"
              onClick={onBack}
              style={{ minWidth: '120px' }}
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      {/* Game Content */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px',
        flex: 1
      }}>
        {children}
      </div>

      {/* Game Controls Info */}
      <div style={{ 
        textAlign: 'center', 
        padding: '20px', 
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '14px',
        borderTop: '1px solid rgba(0, 247, 255, 0.2)'
      }}>
        <p>🎮 Use arrow keys or mouse to play</p>
        <p>{onBack ? 'ESC: Back to Menu' : ''}</p>
      </div>
    </div>
  );
};

export default PS5GameWrapper;