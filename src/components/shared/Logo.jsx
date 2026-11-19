import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ size = 'md', variant = 'combined', to = '/' }) => {
  const badgeSizes = {
    sm: 38,
    md: 50,
    lg: 80,
    xl: 140,
  };

  const textSizes = {
    sm: { rambo: '1.25rem', biriyani: '0.65rem' },
    md: { rambo: '1.65rem', biriyani: '0.785rem' },
    lg: { rambo: '2.4rem', biriyani: '1rem' },
    xl: { rambo: '3.2rem', biriyani: '1.25rem' },
  };

  const badgeDim = badgeSizes[size] || 50;
  const currentText = textSizes[size] || textSizes.md;

  const wingedElement = (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, userSelect: 'none' }}>
      {/* Top row: wing left, RAMBO, wing right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
          <line x1="2" y1="3" x2="22" y2="3" stroke="#e11d24" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="7" y1="8" x2="22" y2="8" stroke="#e11d24" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span
          style={{
            fontFamily: "'Michroma', sans-serif",
            fontSize: size === 'sm' ? '1.15rem' : size === 'lg' ? '2.1rem' : '1.5rem',
            fontWeight: 700,
            fontStyle: 'normal',
            letterSpacing: '0.08em',
            color: '#e11d24',
            lineHeight: 1,
            display: 'inline-block',
          }}
        >
          RAMBO
        </span>
        <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
          <line x1="0" y1="3" x2="20" y2="3" stroke="#e11d24" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="8" x2="15" y2="8" stroke="#e11d24" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Bottom row: wings, BIRIYANI, wings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '3px' }}>
        <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
          <line x1="0" y1="2" x2="20" y2="2" stroke="#eab308" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="5" y1="6" x2="20" y2="6" stroke="#eab308" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span
          style={{
            fontFamily: "'Michroma', sans-serif",
            fontSize: size === 'sm' ? '0.52rem' : size === 'lg' ? '0.82rem' : '0.62rem',
            fontWeight: 700,
            fontStyle: 'normal',
            letterSpacing: '0.24em',
            color: '#eab308',
            textTransform: 'uppercase',
          }}
        >
          BIRIYANI
        </span>
        <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
          <line x1="0" y1="2" x2="20" y2="2" stroke="#eab308" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="0" y1="6" x2="15" y2="6" stroke="#eab308" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );

  const badgeElement = (
    <div
      style={{
        position: 'relative',
        width: `${badgeDim}px`,
        height: `${badgeDim}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '1.5px solid var(--border-gold)',
        boxShadow: '0 0 15px rgba(225, 29, 36, 0.45), 0 4px 10px rgba(0, 0, 0, 0.8)',
        flexShrink: 0,
        backgroundColor: '#0a0505',
      }}
    >
      <img
        src="/images/rambo-logo-badge.jpg"
        alt="Rambo Biriyani Emblem"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  );

  const textElement = (
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
      <div
        style={{
          fontFamily: "'Michroma', sans-serif",
          fontSize: currentText.rambo,
          fontWeight: 700,
          fontStyle: 'normal',
          letterSpacing: '0.08em',
          color: 'var(--rambo-red-bright)',
          lineHeight: 1,
        }}
      >
        RAMBO
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          marginTop: '4px',
        }}
      >
        <span style={{ height: '1.5px', width: '12px', background: 'var(--spice-amber)', display: 'inline-block' }} />
        <span
          style={{
            fontFamily: "'Michroma', sans-serif",
            fontSize: currentText.biriyani,
            fontWeight: 700,
            fontStyle: 'normal',
            letterSpacing: '0.22em',
            color: 'var(--spice-amber)',
            textTransform: 'uppercase',
          }}
        >
          BIRIYANI
        </span>
        <span style={{ height: '1.5px', width: '12px', background: 'var(--spice-amber)', display: 'inline-block' }} />
      </div>
    </div>
  );

  const content = (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '0.65rem' : '0.85rem',
        textDecoration: 'none',
        userSelect: 'none',
        transition: 'transform var(--transition-fast)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {variant === 'winged' ? (
        wingedElement
      ) : variant === 'badge' ? (
        badgeElement
      ) : variant === 'text' ? (
        textElement
      ) : (
        <>
          {badgeElement}
          {textElement}
        </>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
