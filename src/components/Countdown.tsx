import { useCountdown } from '../hooks/useCountdown';

function TimeUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="font-pixel glow-orange tabular-nums"
        style={{
          fontSize: 'clamp(22px,5vw,30px)',
          color: '#FF7A00',
          textShadow: '0 0 10px #FF7A00',
          minWidth: '2.4ch',
          textAlign: 'center',
        }}
        aria-label={`${value} ${label}`}
      >
        {display}
      </div>
      <div
        className="font-sans"
        style={{ fontSize: '13px', color: '#8B4BC0', letterSpacing: '.06em' }}
      >
        {label}
      </div>
    </div>
  );
}

export function Countdown() {
  const { days, hours, minutes, seconds, isOver } = useCountdown();

  if (isOver) {
    return (
      <div className="text-center">
        <p
          className="font-pixel animate-flicker"
          style={{ fontSize: '14px', color: '#FF7A00', textShadow: '0 0 10px #FF7A00' }}
        >
          🎃 PARTY TIME! 🎃
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4" role="timer" aria-live="off">
      <p className="font-sans" style={{ fontSize: '15px', color: '#B98CE0', letterSpacing: '.06em', margin: 0 }}>
        파티 시작까지
      </p>
      <div className="flex items-center justify-center" style={{ gap: '8px', marginBottom: '8px' }}>
        <TimeUnit value={days} label="DAYS" />
        <div className="font-pixel animate-blink" style={{ fontSize: '22px', color: '#FF7A00', marginBottom: '16px' }}>:</div>
        <TimeUnit value={hours} label="HRS" />
        <div className="font-pixel animate-blink" style={{ fontSize: '22px', color: '#FF7A00', marginBottom: '16px' }}>:</div>
        <TimeUnit value={minutes} label="MIN" />
        <div className="font-pixel animate-blink" style={{ fontSize: '22px', color: '#FF7A00', marginBottom: '16px' }}>:</div>
        <TimeUnit value={seconds} label="SEC" />
      </div>
    </div>
  );
}
