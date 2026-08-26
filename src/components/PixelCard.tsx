import React from 'react';

interface PixelCardProps {
  children: React.ReactNode;
  variant?: 'orange' | 'purple' | 'green';
  className?: string;
  title?: string;
}

export function PixelCard({ children, variant = 'orange', className = '', title }: PixelCardProps) {
  const topBorderColors: Record<string, string> = {
    orange: '#FF7A00',
    purple: '#8B4BC0',
    green: '#8B4BC0',
  };

  const titleColors: Record<string, string> = {
    orange: '#FF7A00',
    purple: '#8B4BC0',
    green: '#8B4BC0',
  };

  return (
    <div
      className={`bg-[#1A1026] ${className}`}
      style={{
        border: '1px solid #5B2A86',
        borderTop: `3px solid ${topBorderColors[variant]}`,
        boxShadow: '0 10px 24px rgba(0,0,0,.4)',
        padding: '26px 22px',
      }}
    >
      {title && (
        <div
          className="font-pixel text-xs mb-4"
          style={{ color: titleColors[variant] }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
