import { useEffect, useRef, useState, useCallback } from 'react';
import { getAttendees } from '../services/googleSheets';
import { Loading } from './Loading';

interface AttendeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GHOST_ICONS = ['🎃', '👻', '🧟', '💀', '🦇', '🕷️', '🪄', '🧛'];

function getGhostIcon(index: number): string {
  return GHOST_ICONS[index % GHOST_ICONS.length];
}

export function AttendeeModal({ isOpen, onClose }: AttendeeModalProps) {
  const [attendees, setAttendees] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const fetchAttendees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAttendees();
      if (result.success) {
        setAttendees(result.attendees);
      } else {
        setError(result.message ?? '명단을 불러오지 못했어요.');
      }
    } catch {
      setError('🦇 참가자 명단을 불러오지 못했어요. 잠시 후 다시 확인해주세요.');
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !hasFetched) {
      fetchAttendees();
    }
  }, [isOpen, hasFetched, fetchAttendees]);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (e.key === 'Tab' && isOpen && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="참가자 명단"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-md animate-ghost-pop"
        style={{
          background: '#0B0610',
          border: '1px solid #5B2A86',
          borderTop: '3px solid #FF7A00',
          boxShadow: '0 18px 40px rgba(0,0,0,.6), 0 0 40px rgba(255,122,0,.2)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{ padding: '20px', borderBottom: '2px solid #FF7A00' }}
        >
          <h2
            className="font-pixel glow-orange"
            style={{ fontSize: '13px', color: '#FF7A00', textShadow: '0 0 10px #FF7A00', margin: 0 }}
          >
            WHO'S COMING?
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="닫기"
            className="font-pixel cursor-pointer"
            style={{
              fontSize: '12px',
              color: '#EDE7F6',
              background: 'transparent',
              border: '1px solid #8B4BC0',
              padding: '8px 12px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', minHeight: '160px' }}>
          {loading && (
            <Loading message="SUMMONING PARTICIPANTS..." />
          )}

          {!loading && error && (
            <div className="text-center py-6">
              <div className="text-4xl mb-4" aria-hidden="true">🦇</div>
              <p className="font-pixel text-[9px] text-[#D62828] leading-loose text-center">{error}</p>
              <button
                onClick={() => { setHasFetched(false); fetchAttendees(); }}
                className="mt-4 font-pixel text-[9px] text-[#FF7A00] underline cursor-pointer hover:no-underline"
              >
                다시 시도
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {attendees.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px' }}>👻</div>
                  <p
                    className="font-sans"
                    style={{ fontSize: '14px', color: '#B98CE0', lineHeight: 1.8, margin: 0 }}
                  >
                    아직 참가자가 없어요.<br />첫 번째 파티원이 되어보세요!
                  </p>
                </div>
              ) : (
                <>
                  <p
                    className="font-sans"
                    style={{ fontSize: '14px', color: '#B98CE0', marginBottom: '16px' }}
                  >
                    {attendees.length}명이 참가 예정입니다.
                  </p>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      maxHeight: '260px',
                      overflowY: 'auto',
                    }}
                  >
                    {attendees.map((name, i) => (
                      <li
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          background: '#1A1026',
                          border: '1px solid #5B2A86',
                        }}
                      >
                        <span style={{ fontSize: '18px' }} aria-hidden="true">{getGhostIcon(i)}</span>
                        <span className="font-pixel" style={{ fontSize: '12px', color: '#EDE7F6' }}>{name}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{ padding: '20px', borderTop: '2px solid #1A1026', display: 'flex', justifyContent: 'center' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="font-sans cursor-pointer"
            style={{
              fontSize: '16px',
              padding: '12px 22px',
              background: 'transparent',
              color: '#EDE7F6',
              border: '2px solid #5B2A86',
              boxShadow: '0 10px 24px rgba(0,0,0,.4)',
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
