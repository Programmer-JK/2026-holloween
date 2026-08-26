import { useState, useEffect, useRef } from 'react';

const INTRO_KEY = 'hw2026_introSeen';
const PARTICLE_COLORS = ['#FF7A00', '#FF9D00', '#8B4BC0', '#EDE7F6'];

type Stage = 'flying' | 'dropping' | 'landed' | 'opening';

interface IntroAnimationProps {
  onDone: () => void;
}

function BatSVG({ style, className }: { style?: React.CSSProperties; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 16"
      width="100%"
      height="100%"
      style={{ imageRendering: 'pixelated', overflow: 'visible', ...style }}
      fill="none"
      className={className}
    >
      {/* Left wing */}
      <g style={{ transformBox: 'fill-box', transformOrigin: 'right center', animation: 'wingFlap .35s ease-in-out infinite' }}>
        <rect x="0" y="6" width="2" height="2" fill="#5B2A86" />
        <rect x="2" y="4" width="2" height="4" fill="#5B2A86" />
        <rect x="4" y="3" width="2" height="6" fill="#5B2A86" />
        <rect x="6" y="2" width="2" height="7" fill="#5B2A86" />
        <rect x="8" y="4" width="2" height="5" fill="#5B2A86" />
      </g>
      {/* Right wing */}
      <g style={{ transformBox: 'fill-box', transformOrigin: 'left center', animation: 'wingFlap .35s ease-in-out infinite .12s' }}>
        <rect x="22" y="4" width="2" height="5" fill="#5B2A86" />
        <rect x="24" y="2" width="2" height="7" fill="#5B2A86" />
        <rect x="26" y="3" width="2" height="6" fill="#5B2A86" />
        <rect x="28" y="4" width="2" height="4" fill="#5B2A86" />
        <rect x="30" y="6" width="2" height="2" fill="#5B2A86" />
      </g>
      {/* Body */}
      <rect x="12" y="5" width="8" height="6" fill="#3a1a5a" />
      <rect x="13" y="4" width="2" height="2" fill="#3a1a5a" />
      <rect x="17" y="4" width="2" height="2" fill="#3a1a5a" />
      {/* Eyes */}
      <rect x="13" y="6" width="2" height="2" fill="#FF7A00" />
      <rect x="17" y="6" width="2" height="2" fill="#FF7A00" />
    </svg>
  );
}

function SealSVG() {
  return (
    <svg viewBox="0 0 10 10" width="18" height="18">
      <rect x="3" y="0" width="4" height="1" fill="#FF7A00" />
      <rect x="1" y="1" width="8" height="1" fill="#FF7A00" />
      <rect x="0" y="2" width="10" height="6" fill="#FF7A00" />
      <rect x="1" y="8" width="8" height="1" fill="#FF7A00" />
      <rect x="3" y="9" width="4" height="1" fill="#FF7A00" />
      <rect x="3" y="3" width="4" height="4" fill="#B85C00" />
    </svg>
  );
}

export function IntroAnimation({ onDone }: IntroAnimationProps) {
  const [stage, setStage] = useState<Stage>('flying');
  const [fading, setFading] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const cardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Allow skip after 0.5s
    const t = setTimeout(() => setCanSkip(true), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    return () => {
      if (cardTimerRef.current) clearTimeout(cardTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const finishIntro = () => {
    setFading(true);
    try { localStorage.setItem(INTRO_KEY, '1'); } catch (_) {}
    fadeTimerRef.current = setTimeout(() => onDone(), 600);
  };

  const handleFlyEnd = () => {
    if (stage === 'flying') setStage('dropping');
  };

  const handleDropEnd = () => {
    if (stage === 'dropping') setStage('landed');
  };

  const handleOpen = () => {
    if (stage === 'landed') setStage('opening');
  };

  const handleCardEnd = () => {
    if (stage === 'opening' && !fading) {
      cardTimerRef.current = setTimeout(() => finishIntro(), 800);
    }
  };

  const skipIntro = () => {
    if (!fading) finishIntro();
  };

  // Owl position styles
  const owlStyle: React.CSSProperties = (() => {
    const base: React.CSSProperties = {
      position: 'absolute',
      top: '27%',
      left: '50%',
      marginLeft: '-48px',
      width: '96px',
      height: '48px',
    };
    if (stage === 'flying') {
      return { ...base, animation: 'owlFlyIn 2.1s cubic-bezier(0.25,0.7,0.3,1) forwards' };
    }
    if (stage === 'dropping') {
      return { ...base, animation: 'owlPerchMove 0.8s ease-out forwards' };
    }
    return { ...base, transform: 'translate(84px,-16px) rotate(-8deg)' };
  })();

  // Envelope position styles
  const envelopeStyle: React.CSSProperties = (() => {
    const base: React.CSSProperties = {
      position: 'absolute',
      top: '30%',
      left: '50%',
      marginLeft: '-70px',
      width: '140px',
      height: '100px',
    };
    if (stage === 'dropping') {
      return { ...base, animation: 'envelopeDrop 0.8s ease-out forwards' };
    }
    if (stage === 'landed') {
      return { ...base, transform: 'translateY(38px)', animation: 'floatIdle 3s ease-in-out infinite' };
    }
    // opening
    return { ...base, transform: 'translateY(38px)' };
  })();

  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: i * 45,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    delay: (0.5 + i * 0.02).toFixed(2) + 's',
  }));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#0B0610',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.6s ease',
      }}
    >
      {/* Skip button */}
      {canSkip && !fading && (
        <button
          type="button"
          onClick={skipIntro}
          aria-label="인트로 건너뛰기"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 6,
            background: 'transparent',
            color: '#8B4BC0',
            border: '1px solid #5B2A86',
            fontFamily: "'Do Hyeon', sans-serif",
            fontSize: '14px',
            padding: '8px 13px',
            cursor: 'pointer',
            letterSpacing: '.06em',
          }}
        >
          건너뛰기 →
        </button>
      )}

      {/* Bat / Owl flying */}
      <div style={owlStyle} onAnimationEnd={handleFlyEnd}>
        <BatSVG />
      </div>

      {/* Envelope */}
      {stage !== 'flying' && (
        <div style={{ ...envelopeStyle }} onAnimationEnd={stage === 'dropping' ? handleDropEnd : undefined}>
          {/* Envelope body */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(165deg,#F5F0FF 0%,#EDE7F6 55%,#E2D6F5 100%)',
              border: '2px solid #FF7A00',
              boxShadow: '0 10px 24px rgba(0,0,0,.4),inset 0 0 0 5px rgba(139,75,192,.14)',
              zIndex: 1,
            }}
          />

          {/* Landed - clickable flap */}
          {stage === 'landed' && (
            <>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: 'translate(3px,3px)',
                  background: '#1A1026',
                  opacity: .35,
                  clipPath: 'polygon(0 0,100% 0,50% 62%)',
                  zIndex: 2,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(155deg,#F2EAFC 0%,#cdb7ec 100%)',
                  clipPath: 'polygon(0 0,100% 0,50% 62%)',
                  zIndex: 3,
                  cursor: 'pointer',
                }}
                onClick={handleOpen}
              >
                <div style={{ position: 'absolute', top: '62%', left: '50%', transform: 'translate(-50%,-50%)', width: '18px', height: '18px', animation: 'sealPulse 2s ease-in-out infinite' }}>
                  <SealSVG />
                </div>
              </div>
            </>
          )}

          {/* Opening animation */}
          {stage === 'opening' && (
            <>
              {/* Flap opening */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(155deg,#F2EAFC 0%,#cdb7ec 100%)',
                  clipPath: 'polygon(0 0,100% 0,50% 62%)',
                  zIndex: 2,
                  transformOrigin: 'top center',
                  animation: 'flapOpen .45s ease-in forwards',
                }}
              >
                <div style={{ position: 'absolute', top: '62%', left: '50%', transform: 'translate(-50%,-50%)', width: '18px', height: '18px' }}>
                  <SealSVG />
                </div>
              </div>

              {/* Card popping out */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  width: '196px',
                  marginLeft: '-98px',
                  zIndex: 3,
                  opacity: 0,
                  animation: 'cardPopOut 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.35s forwards',
                }}
                onAnimationEnd={handleCardEnd}
              >
                <div style={{ background: '#1A1026', border: '2px solid #FF7A00', boxShadow: '0 10px 24px rgba(0,0,0,.4)', padding: '26px 20px 22px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
                    <span style={{ width: '5px', height: '5px', background: '#FF7A00', transform: 'rotate(45deg)', display: 'inline-block' }} />
                    <span style={{ width: '5px', height: '5px', background: '#8B4BC0', transform: 'rotate(45deg)', display: 'inline-block' }} />
                    <span style={{ width: '5px', height: '5px', background: '#FF7A00', transform: 'rotate(45deg)', display: 'inline-block' }} />
                  </div>
                  <div style={{ fontSize: '30px', lineHeight: 1, marginBottom: '12px' }}>🎃</div>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '13px', color: '#FF7A00', textShadow: '0 0 10px #FF7A00', lineHeight: 1.6, marginBottom: '14px' }}>
                    YOU'RE<br />INVITED
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ flex: 1, height: '1px', background: 'rgba(139,75,192,.5)' }} />
                    <span style={{ width: '5px', height: '5px', background: '#8B4BC0', transform: 'rotate(45deg)', flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ flex: 1, height: '1px', background: 'rgba(139,75,192,.5)' }} />
                  </div>
                  <div style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '14px', color: '#B98CE0', letterSpacing: '.08em', marginBottom: '12px' }}>
                    HALLOWEEN PARTY
                  </div>
                  <div style={{ display: 'inline-block', background: '#0B0610', border: '1px solid #FF7A00', padding: '7px 14px' }}>
                    <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '12px', color: '#EDE7F6' }}>2026.10.31</div>
                  </div>
                </div>
              </div>

              {/* Sparkle particles */}
              {particles.map((p) => (
                <div
                  key={p.id}
                  style={{ position: 'absolute', top: '30%', left: '50%', transform: `rotate(${p.angle}deg)`, zIndex: 4 }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      left: '-4px',
                      width: '8px',
                      height: '8px',
                      background: p.color,
                      animation: `sparkleOut 0.6s ease-out ${p.delay} forwards`,
                    }}
                  />
                </div>
              ))}

              {/* "INVITATION" text pop */}
              <div
                style={{
                  position: 'absolute',
                  top: '14%',
                  left: '50%',
                  transform: 'translate(-50%,-50%)',
                  opacity: 0,
                  animation: 'taDaText 0.6s ease-out 0.85s forwards',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 'clamp(12px,3vw,16px)',
                  color: '#FF9D00',
                  textShadow: '0 0 10px #FF7A00, 0 0 24px #FF7A00',
                  whiteSpace: 'nowrap',
                  zIndex: 5,
                }}
              >
                INVITATION
              </div>
            </>
          )}
        </div>
      )}

      {/* "Tap to open" hint when landed */}
      {stage === 'landed' && (
        <div style={{ position: 'absolute', top: '64%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Do Hyeon', sans-serif", fontWeight: 500, fontSize: '15px', letterSpacing: '.04em', color: '#B98CE0', animation: 'blink 1.4s step-end infinite', whiteSpace: 'nowrap' }}>
            👆 탭해서 열어보세요
          </p>
        </div>
      )}
    </div>
  );
}

export function shouldShowIntro(): boolean {
  try { return localStorage.getItem(INTRO_KEY) !== '1'; } catch (_) { return true; }
}
