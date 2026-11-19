import React, { useEffect } from 'react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '550px',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* Modal Dialog Card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: maxWidth,
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          zIndex: 10,
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div>
            {title && <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              fontSize: '1.25rem',
              lineHeight: 1,
              transition: 'background-color var(--transition-fast), color var(--transition-fast)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-light)',
              backgroundColor: 'var(--bg-tertiary)',
            }}
          >
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Modal;
