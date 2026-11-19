import React from 'react';

export const Loader = ({
  fullScreen = false,
  text = 'Loading...',
  size = 'md',
  type = 'spinner', // 'spinner' | 'skeleton'
}) => {
  const spinnerSizes = {
    sm: '24px',
    md: '40px',
    lg: '56px',
  };

  const spinner = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.85rem',
      }}
    >
      <div
        style={{
          width: spinnerSizes[size] || '40px',
          height: spinnerSizes[size] || '40px',
          border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--primary-500)',
          borderRadius: '50%',
          animation: 'spin 0.75s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite',
        }}
      />
      {text && (
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {text}
        </span>
      )}
    </div>
  );

  if (type === 'skeleton') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: '120px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
    );
  }

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--bg-primary)',
          zIndex: 'var(--z-modal)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem',
        width: '100%',
      }}
    >
      {spinner}
    </div>
  );
};

export default Loader;
