import React from 'react';

interface PixelButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'orange' | 'purple' | 'green' | 'ghost';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'aria-label'?: string;
}

export function PixelButton({
  children,
  onClick,
  variant = 'orange',
  disabled = false,
  type = 'button',
  className = '',
  'aria-label': ariaLabel,
}: PixelButtonProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    orange: {
      background: '#FF7A00',
      color: '#000',
      border: '2px solid #FF7A00',
      boxShadow: '0 10px 24px rgba(0,0,0,.4)',
    },
    purple: {
      background: 'transparent',
      color: '#EDE7F6',
      border: '2px solid #5B2A86',
      boxShadow: '0 10px 24px rgba(0,0,0,.4)',
    },
    green: {
      background: 'transparent',
      color: '#7CFF6B',
      border: '2px solid #7CFF6B',
      boxShadow: '0 10px 24px rgba(0,0,0,.4)',
    },
    ghost: {
      background: 'transparent',
      color: '#EDE7F6',
      border: '2px solid #5B2A86',
      boxShadow: '0 10px 24px rgba(0,0,0,.4)',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        font-sans
        cursor-pointer
        transition-all duration-100
        disabled:opacity-40 disabled:cursor-not-allowed
        select-none
        whitespace-nowrap
        ${className}
      `}
      style={{
        fontFamily: "'Do Hyeon', sans-serif",
        fontSize: '18px',
        padding: '16px 26px',
        display: 'inline-block',
        ...variantStyles[variant],
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        const el = e.currentTarget;
        if (variant === 'orange') {
          el.style.background = '#FF9D00';
          el.style.borderColor = '#FF9D00';
          el.style.boxShadow = '0 10px 24px rgba(0,0,0,.4), 0 0 22px rgba(255,122,0,.55)';
        } else {
          el.style.boxShadow = '0 10px 24px rgba(0,0,0,.4), 0 0 20px rgba(237,231,246,.4)';
          el.style.background = 'rgba(237,231,246,.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        const el = e.currentTarget;
        Object.assign(el.style, variantStyles[variant]);
      }}
    >
      {children}
    </button>
  );
}
