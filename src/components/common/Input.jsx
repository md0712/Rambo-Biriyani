import React from 'react';
import { cn } from '../../utils/helpers';

export const Input = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  rows = 4,
  className = '',
  options = [], // For select type
  style: customStyle,
  containerStyle: customContainerStyle,
  ...props
}) => {
  const isTextarea = type === 'textarea';
  const isSelect = type === 'select';

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    width: '100%',
    marginBottom: '0.85rem',
    ...customContainerStyle,
  };

  const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  };

  const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  };

  const fieldStyle = {
    width: '100%',
    padding: leftIcon ? '0.65rem 0.85rem 0.65rem 2.4rem' : '0.65rem 0.85rem',
    paddingRight: rightIcon ? '2.4rem' : '0.85rem',
    borderRadius: 'var(--radius-md)',
    border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border-subtle)'}`,
    backgroundColor: disabled ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '0.925rem',
    outline: 'none',
    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
    boxSizing: 'border-box',
    ...customStyle,
  };

  const iconStyle = {
    position: 'absolute',
    top: isTextarea ? '0.75rem' : '50%',
    transform: isTextarea ? 'none' : 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  };

  return (
    <div style={containerStyle} className={className}>
      {label && (
        <label htmlFor={name} style={labelStyle}>
          {label}
          {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}

      <div style={inputWrapperStyle}>
        {leftIcon && <div style={{ ...iconStyle, left: '0.75rem' }}>{leftIcon}</div>}

        {isTextarea ? (
          <textarea
            id={name}
            name={name}
            rows={rows}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            style={fieldStyle}
            {...props}
          />
        ) : isSelect ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            style={fieldStyle}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            style={fieldStyle}
            {...props}
          />
        )}

        {rightIcon && <div style={{ ...iconStyle, right: '0.75rem', pointerEvents: 'auto' }}>{rightIcon}</div>}
      </div>

      {error ? (
        <span style={{ fontSize: '0.785rem', color: 'var(--danger)', fontWeight: 500 }}>{error}</span>
      ) : helperText ? (
        <span style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>{helperText}</span>
      ) : null}
    </div>
  );
};

export default Input;
