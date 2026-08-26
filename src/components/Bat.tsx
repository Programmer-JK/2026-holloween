interface BatProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Bat({ size = 32, className = '', style }: BatProps) {
  return (
    <div
      className={`inline-block ${className}`}
      style={{ width: size * 2, height: size, ...style }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 32 16"
        width={size * 2}
        height={size}
        style={{ imageRendering: 'pixelated' }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left wing */}
        <rect x="0" y="6" width="2" height="2" fill="#5B2A86" />
        <rect x="2" y="4" width="2" height="4" fill="#5B2A86" />
        <rect x="4" y="3" width="2" height="6" fill="#5B2A86" />
        <rect x="6" y="2" width="2" height="7" fill="#5B2A86" />
        <rect x="8" y="4" width="2" height="5" fill="#5B2A86" />
        {/* Body */}
        <rect x="12" y="5" width="8" height="6" fill="#3a1a5a" />
        {/* Eyes */}
        <rect x="13" y="6" width="2" height="2" fill="#FF7A00" />
        <rect x="17" y="6" width="2" height="2" fill="#FF7A00" />
        {/* Right wing */}
        <rect x="22" y="4" width="2" height="5" fill="#5B2A86" />
        <rect x="24" y="2" width="2" height="7" fill="#5B2A86" />
        <rect x="26" y="3" width="2" height="6" fill="#5B2A86" />
        <rect x="28" y="4" width="2" height="4" fill="#5B2A86" />
        <rect x="30" y="6" width="2" height="2" fill="#5B2A86" />
        {/* Ears */}
        <rect x="13" y="4" width="2" height="2" fill="#3a1a5a" />
        <rect x="17" y="4" width="2" height="2" fill="#3a1a5a" />
      </svg>
    </div>
  );
}
