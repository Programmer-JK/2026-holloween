interface GhostProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
}

export function Ghost({ size = 40, className = '', style, color = '#EDE7F6' }: GhostProps) {
  return (
    <div
      className={`inline-block ${className}`}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 16 16"
        width={size}
        height={size}
        style={{ imageRendering: 'pixelated' }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ghost body */}
        <rect x="4" y="2" width="8" height="1" fill={color} />
        <rect x="3" y="3" width="10" height="1" fill={color} />
        <rect x="2" y="4" width="12" height="6" fill={color} />
        <rect x="2" y="10" width="2" height="2" fill={color} />
        <rect x="4" y="11" width="1" height="2" fill={color} />
        <rect x="5" y="10" width="2" height="2" fill={color} />
        <rect x="7" y="11" width="2" height="2" fill={color} />
        <rect x="9" y="10" width="2" height="2" fill={color} />
        <rect x="11" y="11" width="1" height="2" fill={color} />
        <rect x="12" y="10" width="2" height="2" fill={color} />
        {/* Eyes */}
        <rect x="5" y="6" width="2" height="2" fill="#1A1026" />
        <rect x="9" y="6" width="2" height="2" fill="#1A1026" />
        {/* Eye shine */}
        <rect x="6" y="6" width="1" height="1" fill={color} />
        <rect x="10" y="6" width="1" height="1" fill={color} />
      </svg>
    </div>
  );
}
