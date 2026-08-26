import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { applyParty } from '../services/googleSheets';

// ── MBTI Types ────────────────────────────────────────────────────────────────
const MBTI_TYPES: Record<string, { icon: string; name: string; desc: string; food: string }> = {
  ISTJ: { icon: '🧻', name: '규칙을 지키는 미라', desc: '체계적이고 철저한 당신. 파티에서도 스케줄을 꼼꼼히 확인합니다.', food: '정량대로 만든 김밥 한 줄 세트' },
  ISFJ: { icon: '🕯️', name: '현관을 지키는 잭오랜턴', desc: '따뜻하고 헌신적인 당신. 파티의 분위기를 밝히는 존재입니다.', food: '모두를 위한 따뜻한 호박죽' },
  INFJ: { icon: '🔮', name: '조용한 점성술 마녀', desc: '깊은 통찰력을 가진 당신. 파티의 숨겨진 이야기를 읽어냅니다.', food: '신비로운 블랙 카레' },
  INTJ: { icon: '🧛', name: '성에 사는 뱀파이어 백작', desc: '전략적이고 독립적인 당신. 파티를 자신만의 방식으로 즐깁니다.', food: '고급 레드 와인 & 치즈 플래터' },
  ISTP: { icon: '🐺', name: '말없이 해결하는 늑대인간', desc: '논리적이고 실용적인 당신. 문제가 생기면 조용히 해결합니다.', food: '직접 구운 바베큐 고기' },
  ISFP: { icon: '🐈‍⬛', name: '분위기를 아는 검은 고양이', desc: '감성적이고 자유로운 당신. 파티의 무드를 자연스럽게 만들어갑니다.', food: '예쁘게 꾸민 핑거 푸드 모둠' },
  INFP: { icon: '👻', name: '벽 뒤의 다정한 유령', desc: '이상적이고 공감 능력이 뛰어난 당신. 조용히 모두를 응원합니다.', food: '마음을 담은 수제 쿠키' },
  INTP: { icon: '⚗️', name: '실험 중인 프랑켄슈타인 박사', desc: '호기심 많고 창의적인 당신. 파티에서 새로운 것을 시도합니다.', food: '색다른 퓨전 음식 실험작' },
  ESTP: { icon: '🧟', name: '일단 돌진하는 좀비', desc: '대담하고 즉흥적인 당신. 파티의 에너지를 끌어올립니다.', food: '크고 화려한 버거 세트' },
  ESFP: { icon: '🎃', name: '파티의 주인공 호박', desc: '활발하고 표현력이 풍부한 당신. 파티의 중심에 서는 타입입니다.', food: '화려하게 데코된 컵케이크' },
  ENFP: { icon: '🍬', name: '사탕 뿌리는 도깨비불', desc: '열정적이고 창의적인 당신. 파티에 생기와 아이디어를 불어넣습니다.', food: '형형색색 할로윈 사탕 바구니' },
  ENTP: { icon: '😈', name: '장난부터 치는 임프', desc: '도전적이고 재치 있는 당신. 파티에서 예상치 못한 재미를 만듭니다.', food: '깜짝 놀라는 트릭 초코' },
  ESTJ: { icon: '💀', name: '진행을 맡은 사신', desc: '결단력 있고 체계적인 당신. 파티 진행을 완벽하게 이끕니다.', food: '깔끔하게 세팅된 도시락 세트' },
  ESFJ: { icon: '🧹', name: '모두를 챙기는 마녀', desc: '배려심 깊고 사교적인 당신. 파티에서 모두가 즐길 수 있도록 챙깁니다.', food: '모두 입맛에 맞는 파스타' },
  ENFJ: { icon: '🪄', name: '판을 여는 마법사', desc: '카리스마 있고 공감 능력이 뛰어난 당신. 파티의 분위기를 연출합니다.', food: '마법처럼 맛있는 특제 떡볶이' },
  ENTJ: { icon: '🩸', name: '파티를 지배하는 드라큘라', desc: '리더십 있고 추진력이 강한 당신. 파티를 장악하는 타입입니다.', food: '프리미엄 스테이크 & 레드 소스' },
};

// ── 8 Questions (2 per MBTI dimension) ────────────────────────────────────────
type Dimension = 'EI' | 'SN' | 'TF' | 'JP';

interface Question {
  id: number;
  dimension: Dimension;
  text: string;
  options: [string, string]; // index 0 = E/S/T/J side, index 1 = I/N/F/P side
}

const QUESTIONS: Question[] = [
  // E / I
  {
    id: 1,
    dimension: 'EI',
    text: '할로윈 파티 당일, 나는?',
    options: ['처음 보는 사람에게 먼저 말을 건다', '누군가 말을 걸어올 때까지 기다린다'],
  },
  {
    id: 2,
    dimension: 'EI',
    text: '파티가 끝난 후 나의 에너지는?',
    options: ['사람들과 어울려서 충전된다', '혼자 쉬어야 회복된다'],
  },
  // S / N
  {
    id: 3,
    dimension: 'SN',
    text: '할로윈 코스튬을 고를 때 나는?',
    options: ['유행하는 코스튬 중에서 고른다', '아무도 하지 않을 독창적인 것을 만든다'],
  },
  {
    id: 4,
    dimension: 'SN',
    text: '귀신의 집에 들어갔을 때 나는?',
    options: ['눈앞의 공포에 집중해서 반응한다', '어떤 장치가 있는지 구조를 파악한다'],
  },
  // T / F
  {
    id: 5,
    dimension: 'TF',
    text: '친구의 코스튬이 좀 이상할 때 나는?',
    options: ['솔직하게 어떤 부분이 문제인지 말한다', '기분 상하지 않게 좋게 이야기한다'],
  },
  {
    id: 6,
    dimension: 'TF',
    text: '파티에서 게임 규칙이 갑자기 바뀌면?',
    options: ['논리적으로 원래 규칙이 맞다고 주장한다', '분위기를 봐서 그냥 맞춰준다'],
  },
  // J / P
  {
    id: 7,
    dimension: 'JP',
    text: '파티 포틀럭 음식, 언제 준비하나요?',
    options: ['미리 계획하고 날짜에 맞춰 준비한다', '당일 마트에서 즉흥적으로 고른다'],
  },
  {
    id: 8,
    dimension: 'JP',
    text: '파티 일정이 갑자기 바뀌었을 때 나는?',
    options: ['당황스럽고 미리 알려줬으면 좋겠다고 생각한다', '오히려 더 재미있을 것 같아서 좋다'],
  },
];

// index 0 answers → E/S/T/J,  index 1 answers → I/N/F/P
// split (1-1): second answer wins
function getMbtiCode(answers: number[]): string {
  const dim = (a: number, b: number, first: string, second: string) => {
    const score = a + b; // 0 = both first, 2 = both second, 1 = split
    return score < 2 ? first : second;
  };
  return (
    dim(answers[0], answers[1], 'E', 'I') +
    dim(answers[2], answers[3], 'S', 'N') +
    dim(answers[4], answers[5], 'T', 'F') +
    dim(answers[6], answers[7], 'J', 'P')
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Phase = 'intro' | 'quiz' | 'result' | 'form' | 'success';
type FormState = 'idle' | 'loading' | 'error';
const MAX_LENGTH = 20;

function validateNickname(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return '닉네임을 입력해주세요.';
  if (trimmed.length > MAX_LENGTH) return `닉네임은 최대 ${MAX_LENGTH}자까지 입력 가능합니다.`;
  if (/[<>]/.test(trimmed)) return '사용할 수 없는 문자가 포함되어 있어요.';
  return null;
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ApplyPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [mbtiCode, setMbtiCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [fieldError, setFieldError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setMbtiCode(getMbtiCode(newAnswers));
      setPhase('result');
    }
  };

  const skipToForm = () => setPhase('form');

  const retakeQuiz = () => {
    setCurrentQ(0);
    setAnswers([]);
    setMbtiCode('');
    setPhase('quiz');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateNickname(nickname);
    if (err) {
      setFieldError(err);
      inputRef.current?.focus();
      return;
    }
    setFieldError('');
    setFormState('loading');
    try {
      const result = await applyParty(nickname.trim());
      if (result.success) {
        setPhase('success');
      } else {
        setErrorMessage(result.message ?? '신청 중 오류가 발생했어요. 다시 시도해주세요.');
        setFormState('error');
      }
    } catch {
      setErrorMessage('👻 유령들이 서버를 점령했어요... 잠시 후 다시 시도해주세요.');
      setFormState('error');
    }
  };

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <PageShell>
        <StepIndicator step={1} />
        <Card accentColor="#FF7A00">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>🎃</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '12px', color: '#FF7A00', textShadow: '0 0 10px #FF7A00', lineHeight: 1.8, marginBottom: '16px' }}>
              나의 할로윈<br />캐릭터는?
            </div>
            <p style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '16px', color: '#B98CE0', lineHeight: 1.7, marginBottom: '28px' }}>
              8가지 질문으로 당신만의<br />할로윈 캐릭터를 찾아드려요!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Btn primary onClick={() => setPhase('quiz')}>🔮 시작하기</Btn>
              <Btn onClick={skipToForm}>건너뛰고 바로 신청하기</Btn>
            </div>
          </div>
        </Card>
        <BackLink onClick={() => navigate('/')} />
      </PageShell>
    );
  }

  // ── QUIZ ───────────────────────────────────────────────────────────────────
  if (phase === 'quiz') {
    const q = QUESTIONS[currentQ];
    const progress = (currentQ / QUESTIONS.length) * 100;
    return (
      <PageShell>
        <StepIndicator step={1} />
        <div style={{ width: '100%', maxWidth: '420px', marginTop: '28px' }}>
          {/* Progress row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#8B4BC0' }}>
              Q{currentQ + 1} / {QUESTIONS.length}
            </span>
            <button
              type="button"
              onClick={skipToForm}
              style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '13px', color: '#5B2A86', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              건너뛰기 →
            </button>
          </div>
          {/* Progress bar */}
          <div style={{ height: '4px', background: '#1A1026', border: '1px solid #5B2A86', marginBottom: '20px' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#FF7A00', transition: 'width 0.3s ease' }} />
          </div>

          <Card accentColor="#FF7A00">
            <p style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '19px', color: '#EDE7F6', lineHeight: 1.6, marginBottom: '28px', textAlign: 'center' }}>
              {q.text}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {q.options.map((opt, i) => (
                <QuizOption key={i} label={String.fromCharCode(65 + i)} text={opt} onClick={() => handleAnswer(i)} />
              ))}
            </div>
          </Card>
        </div>
      </PageShell>
    );
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const character = MBTI_TYPES[mbtiCode] ?? MBTI_TYPES['ENFP'];
    return (
      <PageShell>
        <StepIndicator step={1} />
        <Card accentColor="#FF7A00" style={{ animation: 'ghostPop 0.4s ease-out' }}>
          <div style={{ textAlign: 'center' }}>
            {/* Diamond row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              {['#FF7A00', '#8B4BC0', '#FF7A00'].map((c, i) => (
                <span key={i} style={{ width: '6px', height: '6px', background: c, transform: 'rotate(45deg)', display: 'inline-block' }} />
              ))}
            </div>
            <div style={{ fontSize: '56px', marginBottom: '10px' }}>{character.icon}</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#8B4BC0', marginBottom: '6px' }}>{mbtiCode}</div>
            <div style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '21px', color: '#FF7A00', marginBottom: '16px' }}>{character.name}</div>
            <div style={{ height: '1px', background: 'rgba(139,75,192,.4)', margin: '16px 0' }} />
            <p style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '15px', color: '#B98CE0', lineHeight: 1.7, marginBottom: '18px' }}>
              {character.desc}
            </p>
            <div style={{ background: '#0B0610', border: '1px solid #5B2A86', padding: '12px 16px', marginBottom: '24px', textAlign: 'left' }}>
              <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#FF7A00', marginBottom: '6px' }}>추천 포틀럭 메뉴</p>
              <p style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '15px', color: '#EDE7F6' }}>🍽 {character.food}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Btn primary onClick={() => setPhase('form')}>🎃 이 캐릭터로 신청하기</Btn>
              <Btn onClick={retakeQuiz}>다시 하기</Btn>
            </div>
          </div>
        </Card>
      </PageShell>
    );
  }

  // ── SUCCESS ────────────────────────────────────────────────────────────────
  if (phase === 'success') {
    const character = mbtiCode ? MBTI_TYPES[mbtiCode] : null;
    return (
      <PageShell>
        <StepIndicator step={2} done />
        <Card accentColor="#7CFF6B">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{character ? character.icon : '🎃'}</div>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '12px', color: '#7CFF6B', textShadow: '0 0 10px #7CFF6B', marginBottom: '20px' }}>
              YOU'RE IN!
            </div>
            <div style={{ padding: '12px 0', borderTop: '1px solid rgba(124,255,107,.3)', borderBottom: '1px solid rgba(124,255,107,.3)', marginBottom: '16px' }}>
              <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#8B4BC0', marginBottom: '4px' }}>WELCOME,</p>
              <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '13px', color: '#FF7A00' }}>{nickname.trim()}</p>
            </div>
            {character && (
              <p style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '16px', color: '#B98CE0', marginBottom: '12px' }}>
                당신의 캐릭터: {character.name}
              </p>
            )}
            <p style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '16px', color: '#EDE7F6', marginBottom: '8px' }}>
              파티 참가 신청이 완료되었습니다.
            </p>
            <p style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '14px', color: '#8B4BC0', marginBottom: '24px' }}>
              📅 2026.10.31 · 📍 사당역
            </p>
            <p style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '16px', color: '#7CFF6B', marginBottom: '24px' }}>
              그날 만나요, 👻
            </p>
            <Btn onClick={() => navigate('/')}>← 돌아가기</Btn>
          </div>
        </Card>
      </PageShell>
    );
  }

  // ── FORM ───────────────────────────────────────────────────────────────────
  const character = mbtiCode ? MBTI_TYPES[mbtiCode] : null;
  return (
    <PageShell>
      <StepIndicator step={2} />
      <div style={{ width: '100%', maxWidth: '420px', marginTop: '28px' }}>
        {/* Character badge */}
        {character && (
          <div style={{ background: '#1A1026', border: '1px solid #5B2A86', padding: '14px 18px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '32px' }}>{character.icon}</span>
            <div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#8B4BC0', marginBottom: '4px' }}>{mbtiCode}</div>
              <div style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '16px', color: '#FF7A00' }}>{character.name}</div>
            </div>
          </div>
        )}

        <Card accentColor="#FF7A00">
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#FF7A00', textShadow: '0 0 8px #FF7A00', marginBottom: '20px', textAlign: 'center' }}>
            JOIN THE PARTY
          </div>
          <form onSubmit={handleSubmit} noValidate>
            {/* Nickname */}
            <div style={{ marginBottom: '18px' }}>
              <label htmlFor="nickname" style={{ display: 'block', fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#FF7A00', marginBottom: '10px' }}>
                NICKNAME
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  ref={inputRef}
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={e => {
                    setNickname(e.target.value);
                    if (fieldError) setFieldError('');
                    if (formState === 'error') setFormState('idle');
                  }}
                  maxLength={MAX_LENGTH}
                  placeholder="파티에서 사용할 닉네임"
                  disabled={formState === 'loading'}
                  aria-invalid={!!fieldError}
                  style={{
                    width: '100%',
                    background: '#0B0610',
                    color: '#EDE7F6',
                    fontSize: '14px',
                    padding: '12px 52px 12px 16px',
                    border: fieldError ? '2px solid #D62828' : '2px solid #FF7A00',
                    outline: 'none',
                    fontFamily: "'Do Hyeon', sans-serif",
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#5B2A86' }}>
                  {nickname.length}/{MAX_LENGTH}
                </span>
              </div>
              {fieldError && (
                <p role="alert" style={{ marginTop: '8px', fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#D62828' }}>
                  {fieldError}
                </p>
              )}
            </div>

            {/* Info */}
            <div style={{ background: '#0B0610', padding: '12px', border: '1px solid #5B2A86', marginBottom: '18px' }}>
              <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#8B4BC0', lineHeight: 2 }}>
                📅 2026.10.31 · 사당역<br />
                💰 30,000원 · 🍕 포틀럭 파티
              </p>
            </div>

            {/* Error */}
            {formState === 'error' && errorMessage && (
              <div role="alert" style={{ padding: '12px', border: '2px solid #D62828', background: 'rgba(214,40,40,.1)', marginBottom: '18px' }}>
                <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#D62828', lineHeight: 2, textAlign: 'center' }}>
                  {errorMessage}
                </p>
              </div>
            )}

            <Btn primary type="submit" disabled={formState === 'loading'} style={{ width: '100%', opacity: formState === 'loading' ? 0.5 : 1 }}>
              {formState === 'loading' ? '신청 중...' : '🎃 JOIN PARTY'}
            </Btn>
          </form>
        </Card>

        <BackLink onClick={() => navigate('/')} />
        <p style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '12px', color: '#5B2A86', textAlign: 'center', marginTop: '10px' }}>
          닉네임만 받아요. 개인정보는 수집하지 않습니다. 🔒
        </p>
      </div>
    </PageShell>
  );
}

// ── Shared UI helpers ─────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 16px' }}>
      {children}
    </div>
  );
}

function Card({ children, accentColor = '#FF7A00', style }: { children: React.ReactNode; accentColor?: string; style?: React.CSSProperties }) {
  return (
    <div style={{ width: '100%', maxWidth: '420px', background: '#1A1026', border: '1px solid #5B2A86', borderTop: `3px solid ${accentColor}`, padding: '28px 22px', ...style }}>
      {children}
    </div>
  );
}

function Btn({
  children,
  primary,
  onClick,
  type = 'button',
  disabled,
  style,
}: {
  children: React.ReactNode;
  primary?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: "'Do Hyeon', sans-serif",
        fontSize: '18px',
        padding: '14px 24px',
        background: primary ? '#FF7A00' : 'transparent',
        color: primary ? '#000' : '#8B4BC0',
        border: primary ? '2px solid #FF7A00' : '1px solid #5B2A86',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: '100%',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function QuizOption({ label, text, onClick }: { label: string; text: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: "'Do Hyeon', sans-serif",
        fontSize: '16px',
        padding: '16px 18px',
        background: '#0B0610',
        color: '#EDE7F6',
        border: '2px solid #5B2A86',
        cursor: 'pointer',
        textAlign: 'left',
        lineHeight: 1.5,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = '#FF7A00';
        (e.currentTarget as HTMLButtonElement).style.background = '#1A0A2E';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = '#5B2A86';
        (e.currentTarget as HTMLButtonElement).style.background = '#0B0610';
      }}
    >
      <span style={{ color: '#FF7A00', marginRight: '10px' }}>{label}.</span>
      {text}
    </button>
  );
}

function StepIndicator({ step, done }: { step: 1 | 2; done?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <StepDot num="1" label="캐릭터 진단" active={step === 1} done={step === 2} />
      <div style={{ width: '36px', height: '1px', background: '#5B2A86' }} />
      <StepDot num="2" label="파티 신청" active={step === 2} done={!!done} />
    </div>
  );
}

function StepDot({ num, label, active, done }: { num: string; label: string; active: boolean; done?: boolean }) {
  const borderColor = active ? '#FF7A00' : done ? '#7CFF6B' : '#5B2A86';
  const textColor = active ? '#000' : done ? '#7CFF6B' : '#5B2A86';
  const bg = active ? '#FF7A00' : 'transparent';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '28px', height: '28px', border: `2px solid ${borderColor}`, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: textColor }}>
          {done ? '✓' : num}
        </span>
      </div>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '6px', color: borderColor, whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '14px' }}>
      <button
        type="button"
        onClick={onClick}
        style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#5B2A86', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
      >
        ← BACK
      </button>
    </div>
  );
}
