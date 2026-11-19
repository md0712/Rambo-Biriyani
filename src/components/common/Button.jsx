import React from 'react';
import { cn } from '../../utils/helpers';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  fullWidth = false,
  className = '',
  onClick,
  style: customStyle = {},
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 focus:ring-slate-400',
    outline: 'border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-red-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 focus:ring-slate-400',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && 'w-full',
        className
      )}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        borderRadius: '9999px',
        transition: 'all 0.2s ease',
        border: variant === 'outline' ? '1px solid var(--border-subtle, #33251B)' : 'none',
        background:
          variant === 'primary'
            ? 'linear-gradient(135deg, #e51e25 0%, #b91c1c 100%)'
            : variant === 'secondary'
            ? 'var(--bg-tertiary, #1f1412)'
            : variant === 'danger'
            ? 'var(--danger, #ef4444)'
            : variant === 'success'
            ? 'var(--success, #10b981)'
            : variant === 'outline'
            ? 'transparent'
            : 'transparent',
        color:
          variant === 'primary' || variant === 'danger' || variant === 'success'
            ? '#ffffff'
            : 'var(--text-primary, #ffffff)',
        boxShadow: variant === 'primary' ? '0 4px 15px rgba(229, 30, 37, 0.4)' : 'none',
        padding: size === 'sm' ? '0.45rem 0.9rem' : size === 'lg' ? '0.8rem 1.6rem' : '0.65rem 1.25rem',
        fontSize: size === 'sm' ? '0.825rem' : size === 'lg' ? '1.05rem' : '0.925rem',
        width: fullWidth ? '100%' : 'auto',
        gap: '0.5rem',
        opacity: disabled || isLoading ? 0.6 : 1,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        ...customStyle,
      }}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            width: '1em',
            height: '1em',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            display: 'inline-block',
          }}
        />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default Button;
