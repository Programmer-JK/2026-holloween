interface PumpkinProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  clickCount?: number;
}

export function Pumpkin({ size = 48, className = '', style, onClick, clickCount = 0 }: PumpkinProps) {
  const isAngry = clickCount >= 3 && clickCount < 5;
  const isHappy = clickCount >= 5;

  return (
    <div
      className={`inline-block cursor-pointer select-none ${className}`}
      style={{ width: size, height: size, ...style }}
      onClick={onClick}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        style={{ imageRendering: 'pixelated' }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Stem */}
        <rect x="11" y="1" width="2" height="3" fill="#4a7c00" />
        <rect x="12" y="2" width="3" height="2" fill="#4a7c00" />
        {/* Body */}
        <rect x="4" y="4" width="2" height="12" fill="#FF7A00" />
        <rect x="6" y="3" width="3" height="14" fill="#FF9D00" />
        <rect x="9" y="4" width="2" height="12" fill="#FF7A00" />
        <rect x="11" y="4" width="2" height="12" fill="#FF9D00" />
        <rect x="13" y="4" width="2" height="12" fill="#FF7A00" />
        <rect x="15" y="3" width="3" height="14" fill="#FF9D00" />
        <rect x="18" y="4" width="2" height="12" fill="#FF7A00" />
        {/* Top */}
        <rect x="6" y="3" width="12" height="1" fill="#FF9D00" />
        <rect x="4" y="4" width="16" height="1" fill="#FF7A00" />
        {/* Bottom */}
        <rect x="4" y="15" width="16" height="1" fill="#FF7A00" />
        <rect x="6" y="16" width="12" height="1" fill="#FF7A00" />
        {/* Eyes - normal or angry */}
        {!isAngry && !isHappy && (
          <>
            <rect x="7" y="8" width="3" height="2" fill="#1A1026" />
            <rect x="14" y="8" width="3" height="2" fill="#1A1026" />
            {/* Eye shine */}
            <rect x="9" y="8" width="1" height="1" fill="#FF7A00" />
            <rect x="16" y="8" width="1" height="1" fill="#FF7A00" />
          </>
        )}
        {isAngry && (
          <>
            <rect x="7" y="7" width="1" height="1" fill="#1A1026" />
            <rect x="8" y="8" width="2" height="2" fill="#1A1026" />
            <rect x="16" y="7" width="1" height="1" fill="#1A1026" />
            <rect x="14" y="8" width="2" height="2" fill="#1A1026" />
          </>
        )}
        {isHappy && (
          <>
            <rect x="7" y="8" width="3" height="1" fill="#1A1026" />
            <rect x="7" y="7" width="1" height="1" fill="#1A1026" />
            <rect x="14" y="8" width="3" height="1" fill="#1A1026" />
            <rect x="16" y="7" width="1" height="1" fill="#1A1026" />
          </>
        )}
        {/* Mouth */}
        <rect x="8" y="12" width="1" height="2" fill="#1A1026" />
        <rect x="9" y="13" width="2" height="1" fill="#1A1026" />
        <rect x="11" y="12" width="2" height="1" fill="#1A1026" />
        <rect x="13" y="13" width="2" height="1" fill="#1A1026" />
        <rect x="15" y="12" width="1" height="2" fill="#1A1026" />
        {/* Glow */}
        <rect x="9" y="9" width="6" height="3" fill="rgba(255,157,0,0.15)" />
      </svg>
    </div>
  );
}
