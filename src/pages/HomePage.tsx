import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost } from '../components/Ghost';
import { Pumpkin } from '../components/Pumpkin';
import { Countdown } from '../components/Countdown';
import { AttendeeModal } from '../components/AttendeeModal';
import { PartyInfo } from '../components/PartyInfo';

// Konami code easter egg
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];

const SECRET_MESSAGES = [
  '🦇 박쥐가 전하는 비밀: 초대장은 자정에만 진짜 모습을 보여준대...',
  '📜 봉인 아래 작은 글씨: "오는 자, 배부르게 하리라"',
  '🕯️ 초대장 뒷면에 뭔가 적혀있다... "그림자도 함께 옵니다"',
  '🦇 박쥐 왈: "다음엔 내가 문 앞까지 데려다줄게"',
  '🎃 사실 호박은 알람시계다. 10월 31일, 울린다.',
];

const OWL_LINES = [
  '끼익~ 파티엔 진심이지 🦇',
  '초대장은 잘 전달했다구!',
  '나도 포틀럭 가져갈까 고민중...',
  '10월 31일, 잊지 마!',
];

interface HomePageProps {
  onReplayIntro?: () => void;
}

function BatEasterEgg({ line }: { line: string }) {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '80px',
          height: '40px',
          animation: 'owlLoop 3s ease-in-out forwards',
        }}
      >
        <svg viewBox="0 0 32 16" width="100%" height="100%" style={{ imageRendering: 'pixelated' }} fill="none">
          <rect x="0" y="6" width="2" height="2" fill="#5B2A86" />
          <rect x="2" y="4" width="2" height="4" fill="#5B2A86" />
          <rect x="4" y="3" width="2" height="6" fill="#5B2A86" />
          <rect x="6" y="2" width="2" height="7" fill="#5B2A86" />
          <rect x="8" y="4" width="2" height="5" fill="#5B2A86" />
          <rect x="22" y="4" width="2" height="5" fill="#5B2A86" />
          <rect x="24" y="2" width="2" height="7" fill="#5B2A86" />
          <rect x="26" y="3" width="2" height="6" fill="#5B2A86" />
          <rect x="28" y="4" width="2" height="4" fill="#5B2A86" />
          <rect x="30" y="6" width="2" height="2" fill="#5B2A86" />
          <rect x="12" y="5" width="8" height="6" fill="#3a1a5a" />
          <rect x="13" y="4" width="2" height="2" fill="#3a1a5a" />
          <rect x="17" y="4" width="2" height="2" fill="#3a1a5a" />
          <rect x="13" y="6" width="2" height="2" fill="#FF7A00" />
          <rect x="17" y="6" width="2" height="2" fill="#FF7A00" />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#EDE7F6',
            color: '#1A1026',
            padding: '6px 10px',
            fontFamily: "'Do Hyeon', sans-serif",
            fontSize: '13px',
            whiteSpace: 'nowrap',
            border: '2px solid #1A1026',
          }}
        >
          {line}
        </div>
      </div>
    </div>
  );
}

export function HomePage({ onReplayIntro }: HomePageProps) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pumpkinSpin, setPumpkinSpin] = useState(false);
  const [, setKonamiBuffer] = useState<string[]>([]);
  const [secretMessage, setSecretMessage] = useState('');
  const [showKonamiMsg, setShowKonamiMsg] = useState(false);
  const [owlClicks, setOwlClicks] = useState(0);
  const [showOwlEgg, setShowOwlEgg] = useState(false);
  const [owlLine, setOwlLine] = useState('');

  const konamiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const owlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pumpkinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (konamiTimerRef.current) clearTimeout(konamiTimerRef.current);
      if (owlTimerRef.current) clearTimeout(owlTimerRef.current);
      if (pumpkinTimerRef.current) clearTimeout(pumpkinTimerRef.current);
    };
  }, []);

  // Easter egg: Konami code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKonamiBuffer((prev) => {
        const next = [...prev, e.key].slice(-8);
        if (next.join(',') === KONAMI.join(',')) {
          const msg = SECRET_MESSAGES[Math.floor(Math.random() * SECRET_MESSAGES.length)];
          setSecretMessage(msg);
          setShowKonamiMsg(true);
          if (konamiTimerRef.current) clearTimeout(konamiTimerRef.current);
          konamiTimerRef.current = setTimeout(() => setShowKonamiMsg(false), 3200);
          return [];
        }
        return next;
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pumpkin click: just spin briefly
  const handlePumpkinClick = useCallback(() => {
    setPumpkinSpin(true);
    if (pumpkinTimerRef.current) clearTimeout(pumpkinTimerRef.current);
    pumpkinTimerRef.current = setTimeout(() => setPumpkinSpin(false), 600);
  }, []);

  // Bat (footer) click easter egg: 5 clicks → flying bat with message
  const handleOwlClick = useCallback(() => {
    setOwlClicks((c) => {
      const next = c + 1;
      if (next >= 5) {
        const line = OWL_LINES[Math.floor(Math.random() * OWL_LINES.length)];
        setOwlLine(line);
        setShowOwlEgg(true);
        if (owlTimerRef.current) clearTimeout(owlTimerRef.current);
        owlTimerRef.current = setTimeout(() => setShowOwlEgg(false), 3000);
        return 0;
      }
      return next;
    });
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center">

      {/* Replay intro button */}
      {onReplayIntro && (
        <button
          type="button"
          onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); onReplayIntro(); }}
          style={{
            position: 'fixed',
            top: '14px',
            left: '14px',
            zIndex: 40,
            background: '#1A1026',
            color: '#B98CE0',
            border: '1px solid #5B2A86',
            fontFamily: "'Do Hyeon', sans-serif",
            fontSize: '13px',
            padding: '9px 12px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          🦇 인트로 다시보기
        </button>
      )}

      {/* Konami code message */}
      {showKonamiMsg && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            animation: 'slideInTop 0.4s ease-out forwards',
          }}
        >
          <div
            style={{
              background: '#0B0610',
              padding: '14px 20px',
              border: '1px solid #8B4BC0',
              borderTop: '3px solid #FF7A00',
              boxShadow: '0 10px 24px rgba(0,0,0,.5)',
              maxWidth: '88vw',
            }}
          >
            <p
              className="font-sans"
              style={{ fontSize: '14px', color: '#EDE7F6', textAlign: 'center', lineHeight: 1.7, margin: 0 }}
            >
              {secretMessage}
            </p>
          </div>
        </div>
      )}

      {/* Bat easter egg flying animation */}
      {showOwlEgg && <BatEasterEgg line={owlLine} />}

      {/* ── Hero Section ─────────────────────────────── */}
      <section
        className="relative w-full flex flex-col items-center justify-center text-center"
        style={{ padding: '80px 16px 60px' }}
        aria-label="히어로"
      >
        {/* Floating ghosts */}
        <div
          className="absolute opacity-30 animate-float-slow"
          style={{ top: '32px', left: '24px', animationDelay: '0s' }}
          aria-hidden="true"
        >
          <Ghost size={32} color="#8B4BC0" />
        </div>
        <div
          className="absolute opacity-25 animate-float-slow"
          style={{ top: '48px', right: '32px', animationDelay: '1.5s' }}
          aria-hidden="true"
        >
          <Ghost size={24} color="#5B2A86" />
        </div>

        {/* Main title row */}
        <div
          className="flex items-center justify-center flex-wrap"
          style={{ gap: '16px', marginBottom: '16px' }}
        >
          <Pumpkin
            size={48}
            className={pumpkinSpin ? 'animate-pumpkin-spin' : ''}
            onClick={handlePumpkinClick}
          />
          <h1
            className="font-pixel animate-flicker"
            style={{
              fontSize: 'clamp(18px,4vw,26px)',
              color: '#FF7A00',
              textShadow: '0 0 10px #FF7A00, 0 0 20px #FF7A00, 0 0 40px rgba(255,122,0,.5)',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            HALLOWEEN
          </h1>
          <Pumpkin
            size={48}
            className={pumpkinSpin ? 'animate-pumpkin-spin' : ''}
            onClick={handlePumpkinClick}
          />
        </div>

        <h2
          className="font-pixel"
          style={{
            fontSize: 'clamp(26px,6vw,38px)',
            color: '#FF9D00',
            textShadow: '0 0 10px #FF7A00, 0 0 20px #FF7A00',
            margin: '0 0 8px',
          }}
        >
          PARTY
        </h2>

        {/* Korean subtitle box */}
        <div
          style={{
            maxWidth: '380px',
            margin: '0 auto 40px',
            padding: '16px 24px',
            border: '1px solid rgba(91,42,134,.4)',
            background: 'rgba(26,16,38,.6)',
          }}
        >
          <p className="font-sans" style={{ fontSize: '16px', color: '#EDE7F6', margin: '0 0 8px' }}>
            👻 유령도 좀비도 환영합니다.
          </p>
          <p className="font-sans" style={{ fontSize: '14px', color: '#8B4BC0', lineHeight: 1.7, margin: 0 }}>
            10월의 마지막 밤,<br />
            우리끼리 즐기는 작은 할로윈 파티
          </p>
        </div>

        {/* Countdown */}
        <div style={{ marginBottom: '40px' }}>
          <Countdown />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center" style={{ gap: '16px' }}>
          <a
            href="/apply"
            onClick={(e) => { e.preventDefault(); navigate('/apply'); }}
            aria-label="파티 참가 신청하기"
            style={{
              textDecoration: 'none',
              fontFamily: "'Do Hyeon', sans-serif",
              fontSize: '18px',
              padding: '16px 26px',
              background: '#FF7A00',
              color: '#000',
              border: '2px solid #FF7A00',
              boxShadow: '0 10px 24px rgba(0,0,0,.4)',
              cursor: 'pointer',
              display: 'inline-block',
              whiteSpace: 'nowrap',
            }}
          >
            🎃 파티 참가 신청
          </a>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-label="참가자 명단 보기"
            style={{
              fontFamily: "'Do Hyeon', sans-serif",
              fontSize: '18px',
              padding: '16px 26px',
              background: 'transparent',
              color: '#EDE7F6',
              border: '2px solid #5B2A86',
              boxShadow: '0 10px 24px rgba(0,0,0,.4)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            참가자 보기
          </button>
        </div>
      </section>

      {/* ── About Section ─────────────────────────────── */}
      <section
        style={{ maxWidth: '640px', width: '100%', padding: '0 16px 60px' }}
        aria-label="파티 소개"
      >
        <div
          style={{
            background: '#1A1026',
            border: '1px solid #5B2A86',
            borderTop: '3px solid #8B4BC0',
            boxShadow: '0 10px 24px rgba(0,0,0,.4)',
            padding: '26px 22px',
          }}
        >
          <h3 className="font-pixel" style={{ fontSize: '12px', color: '#8B4BC0', margin: '0 0 16px' }}>
            THIS HALLOWEEN...
          </h3>
          <p className="font-sans" style={{ fontSize: '16px', color: '#EDE7F6', lineHeight: 1.7, margin: '0 0 12px' }}>
            무서운 밤을 혼자 보내기엔 아쉽잖아요?
          </p>
          <p className="font-sans" style={{ fontSize: '15px', color: '#B98CE0', lineHeight: 1.8, margin: 0 }}>
            거창한 준비는 필요 없습니다.<br />
            먹고, 이야기하고, 놀고,<br />
            할로윈 분위기만 제대로 즐겨주세요.
          </p>
        </div>
      </section>

      {/* ── Party Info ─────────────────────────────── */}
      <div style={{ width: '100%', paddingBottom: '60px' }}>
        <PartyInfo />
      </div>

      {/* ── Potluck Section ─────────────────────────────── */}
      <section
        style={{ maxWidth: '640px', width: '100%', padding: '0 16px 60px' }}
        aria-label="포틀럭 안내"
      >
        <div
          style={{
            background: '#1A1026',
            border: '1px solid #5B2A86',
            borderTop: '3px solid #8B4BC0',
            boxShadow: '0 10px 24px rgba(0,0,0,.4)',
            padding: '26px 22px',
          }}
        >
          <h3 className="font-pixel" style={{ fontSize: '12px', color: '#8B4BC0', textShadow: '0 0 10px #8B4BC0', margin: '0 0 8px' }}>
            POTLUCK
          </h3>
          <p className="font-sans" style={{ fontSize: '14px', color: '#B98CE0', margin: '0 0 20px' }}>
            핑거푸드 &amp; 각자 가져오기
          </p>
          <p className="font-sans" style={{ fontSize: '17px', color: '#EDE7F6', lineHeight: 1.7, margin: '0 0 20px' }}>
            간단한 음식이나 간식을 하나씩 가져와 주세요.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
            {[
              '직접 만든 음식',
              '편의점에서 사 온 간식',
              '배달 음식도 OK',
            ].map((item) => (
              <li
                key={item}
                className="font-sans"
                style={{ display: 'flex', alignItems: 'center', gap: '11px', fontSize: '15px', color: '#EDE7F6' }}
              >
                <span
                  style={{ width: '7px', height: '7px', background: '#FF7A00', transform: 'rotate(45deg)', flexShrink: 0, display: 'inline-block' }}
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
          <p className="font-sans" style={{ fontSize: '14px', color: '#B98CE0', margin: 0 }}>
            부담 없이 함께 나눠 먹는 파티입니다.
          </p>
        </div>
      </section>

      {/* ── RSVP Section ─────────────────────────────── */}
      <section
        style={{ maxWidth: '520px', width: '100%', padding: '0 16px 60px' }}
        aria-label="참가 신청 안내"
      >
        <div
          style={{
            background: '#1A1026',
            border: '1px solid #5B2A86',
            borderTop: '3px solid #FF7A00',
            boxShadow: '0 10px 24px rgba(0,0,0,.4)',
            padding: '30px 22px',
            textAlign: 'center',
          }}
        >
          <p className="font-pixel" style={{ fontSize: '12px', color: '#8B4BC0', margin: '0 0 18px' }}>
            RSVP
          </p>
          <p className="font-sans" style={{ fontSize: '18px', color: '#EDE7F6', lineHeight: 1.7, margin: '0 0 8px' }}>
            할로윈 MBTI로 내 캐릭터를 정하고<br />
            바로 파티에 참가하세요.
          </p>
          <p className="font-sans" style={{ fontSize: '14px', color: '#B98CE0', lineHeight: 1.7, margin: '0 0 26px' }}>
            8문항 진단 &amp; 참가 신청 · 2분이면 끝나요
          </p>
          <a
            href="/apply"
            onClick={(e) => { e.preventDefault(); navigate('/apply'); }}
            style={{
              textDecoration: 'none',
              display: 'inline-block',
              fontFamily: "'Do Hyeon', sans-serif",
              fontSize: '19px',
              padding: '18px 30px',
              background: '#FF7A00',
              color: '#000',
              border: '2px solid #FF7A00',
            }}
          >
            🔮 캐릭터 찾고 신청하기 →
          </a>
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────── */}
      <section
        style={{ maxWidth: '640px', width: '100%', padding: '0 16px 80px', textAlign: 'center' }}
        aria-label="하단 참가 신청"
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', animation: 'floatY 3s ease-in-out infinite' }}>
          <Ghost size={64} />
        </div>
        <h3 className="font-pixel" style={{ fontSize: '13px', color: '#EDE7F6', margin: '0 0 16px' }}>
          👻 SEE YOU THERE
        </h3>
        <p className="font-sans" style={{ fontSize: '14px', color: '#8B4BC0', margin: '0 0 24px' }}>
          2026년 10월 31일, 사당역에서 만나요!
        </p>
        <a
          href="/apply"
          onClick={(e) => { e.preventDefault(); navigate('/apply'); }}
          style={{
            textDecoration: 'none',
            display: 'inline-block',
            fontFamily: "'Do Hyeon', sans-serif",
            fontWeight: 700,
            fontSize: '18px',
            padding: '20px 32px',
            background: '#FF7A00',
            color: '#000',
            border: '2px solid #FF7A00',
            boxShadow: '0 10px 24px rgba(0,0,0,.4)',
          }}
        >
          🎃 파티 참가 신청
        </a>
      </section>

      {/* ── Footer ─────────────────────────────── */}
      <footer
        style={{ width: '100%', borderTop: '1px solid #1A1026', padding: '24px 16px', textAlign: 'center' }}
      >
        <div
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginBottom: '12px' }}
        >
          <span style={{ fontSize: '18px', opacity: .4 }}>🪦</span>
          <span style={{ fontSize: '18px', opacity: .4 }}>🕷️</span>
          {/* Clickable bat - easter egg (5 clicks triggers flying bat) */}
          <div
            style={{
              width: '52px',
              height: '26px',
              opacity: .6,
              cursor: 'pointer',
              animation: 'owlBob 2.4s ease-in-out infinite',
            }}
            onClick={handleOwlClick}
            role="button"
            title="🦇"
            aria-label="박쥐"
          >
            <svg viewBox="0 0 32 16" width="100%" height="100%" style={{ imageRendering: 'pixelated' }} fill="none">
              <rect x="0" y="6" width="2" height="2" fill="#5B2A86" />
              <rect x="2" y="4" width="2" height="4" fill="#5B2A86" />
              <rect x="4" y="3" width="2" height="6" fill="#5B2A86" />
              <rect x="6" y="2" width="2" height="7" fill="#5B2A86" />
              <rect x="8" y="4" width="2" height="5" fill="#5B2A86" />
              <rect x="22" y="4" width="2" height="5" fill="#5B2A86" />
              <rect x="24" y="2" width="2" height="7" fill="#5B2A86" />
              <rect x="26" y="3" width="2" height="6" fill="#5B2A86" />
              <rect x="28" y="4" width="2" height="4" fill="#5B2A86" />
              <rect x="30" y="6" width="2" height="2" fill="#5B2A86" />
              <rect x="12" y="5" width="8" height="6" fill="#3a1a5a" />
              <rect x="13" y="4" width="2" height="2" fill="#3a1a5a" />
              <rect x="17" y="4" width="2" height="2" fill="#3a1a5a" />
              <rect x="13" y="6" width="2" height="2" fill="#FF7A00" />
              <rect x="17" y="6" width="2" height="2" fill="#FF7A00" />
            </svg>
          </div>
          <span style={{ fontSize: '18px', opacity: .4 }}>🕷️</span>
          <span style={{ fontSize: '18px', opacity: .4 }}>🪦</span>
        </div>
        <p className="font-pixel" style={{ fontSize: '12px', color: '#5B2A86', margin: '0 0 10px' }}>
          HALLOWEEN 2026
        </p>
        {owlClicks > 0 && owlClicks < 5 && (
          <p className="font-pixel" style={{ fontSize: '8px', color: '#3a1a5a', marginTop: '4px' }}>
            {5 - owlClicks}번 더...
          </p>
        )}
      </footer>

      {/* Attendee Modal */}
      <AttendeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
