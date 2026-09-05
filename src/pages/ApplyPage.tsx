import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { applyParty } from '../services/googleSheets';

// ── Characters ─────────────────────────────────────────────────────────────────
const CHARACTERS: Record<string, { icon: string; name: string; desc: string; food: string }> = {
  ISTJ: { icon: '🧻', name: '규칙을 지키는 미라', desc: '파티에서도 계획대로. 당신이 있으면 아무도 길을 잃지 않습니다.', food: '정량대로 만든 김밥 한 줄 세트' },
  ISFJ: { icon: '🕯️', name: '현관을 지키는 잭오랜턴', desc: '파티 분위기를 조용히 밝히는 사람. 모두 당신 덕분입니다.', food: '모두를 위한 따뜻한 호박죽' },
  INFJ: { icon: '🔮', name: '조용한 점성술 마녀', desc: '시끄러운 파티 한가운데서도 남들이 놓친 이야기를 발견합니다.', food: '신비로운 블랙 카레' },
  INTJ: { icon: '🧛', name: '성에 사는 뱀파이어 백작', desc: '자신만의 방식으로 파티를 즐깁니다. 가까이 오면 알아챌걸요.', food: '고급 레드 와인 & 치즈 플래터' },
  ISTP: { icon: '🐺', name: '말없이 해결하는 늑대인간', desc: '말보다 행동으로. 뭔가 문제가 생기면 이미 해결하고 있습니다.', food: '직접 구운 바베큐 고기' },
  ISFP: { icon: '🐈‍⬛', name: '분위기를 아는 검은 고양이', desc: '강요하지 않아도 자연스럽게 파티의 무드를 만들어가는 타입.', food: '예쁘게 꾸민 핑거 푸드 모둠' },
  INFP: { icon: '👻', name: '벽 뒤의 다정한 유령', desc: '조용히 모두를 응원합니다. 당신의 존재가 파티를 따뜻하게 합니다.', food: '마음을 담은 수제 쿠키' },
  INTP: { icon: '⚗️', name: '실험 중인 프랑켄슈타인 박사', desc: '파티에서도 "이게 왜 재밌는 거지?"를 분석하는 타입입니다.', food: '색다른 퓨전 음식 실험작' },
  ESTP: { icon: '🧟', name: '일단 돌진하는 좀비', desc: '생각보다 행동이 먼저. 파티의 에너지는 이 사람에게서 시작됩니다.', food: '크고 화려한 버거 세트' },
  ESFP: { icon: '🎃', name: '파티의 주인공 호박', desc: '어디서든 자연스럽게 중심에 서는 타입. 파티는 당신이 있어야 완성됩니다.', food: '화려하게 데코된 컵케이크' },
  ENFP: { icon: '🍬', name: '사탕 뿌리는 도깨비불', desc: '파티에 생기와 아이디어를 불어넣습니다. 옆에 있으면 즐거워집니다.', food: '형형색색 할로윈 사탕 바구니' },
  ENTP: { icon: '😈', name: '장난부터 치는 임프', desc: '예상치 못한 방향에서 재미를 만들어냅니다. 당신 옆엔 항상 웃음이 있습니다.', food: '깜짝 놀라는 트릭 초코' },
  ESTJ: { icon: '💀', name: '진행을 맡은 사신', desc: '파티 진행이 완벽한 이유가 있습니다. 당신이 있으니까요.', food: '깔끔하게 세팅된 도시락 세트' },
  ESFJ: { icon: '🧹', name: '모두를 챙기는 마녀', desc: '아무도 소외되지 않도록 살핍니다. 파티의 온기는 당신으로부터.', food: '모두 입맛에 맞는 파스타' },
  ENFJ: { icon: '🪄', name: '판을 여는 마법사', desc: '분위기를 읽고, 연출하고, 이끕니다. 파티가 살아 움직입니다.', food: '마법처럼 맛있는 특제 떡볶이' },
  ENTJ: { icon: '🩸', name: '파티를 지배하는 드라큘라', desc: '자연스럽게 파티의 흐름을 장악합니다. 모두 당신 리듬에 맞춰 움직이고 있어요.', food: '프리미엄 스테이크 & 레드 소스' },
};

// ── Trait system ───────────────────────────────────────────────────────────────
// Trait names are deliberately decoupled from MBTI letters to prevent user guessing.
// Internal mapping: social→E, reflective→I, intuitive→N, grounded→S,
//                   empathetic→F, analytical→T, flexible→P, structured→J
interface TraitScores {
  social: number;
  reflective: number;
  intuitive: number;
  grounded: number;
  empathetic: number;
  analytical: number;
  flexible: number;
  structured: number;
}

const EMPTY_TRAITS: TraitScores = {
  social: 0, reflective: 0,
  intuitive: 0, grounded: 0,
  empathetic: 0, analytical: 0,
  flexible: 0, structured: 0,
};

function calcMbti(t: TraitScores): string {
  return (
    (t.social >= t.reflective ? 'E' : 'I') +
    (t.intuitive >= t.grounded ? 'N' : 'S') +
    (t.empathetic >= t.analytical ? 'F' : 'T') +
    (t.structured >= t.flexible ? 'J' : 'P')
  );
}

// ── Questions ──────────────────────────────────────────────────────────────────
// 8 scenes from a single Halloween night. Each option is a concrete action or
// inner monologue — not a personality label. Both choices are intentionally
// appealing so users think "what would I actually do?" not "which is the
// right answer?"
interface StoryOptionData {
  emoji: string;
  action: string;   // short bold line
  detail: string;   // inner monologue or dialogue line
  traits: Partial<TraitScores>;
}

interface Question {
  id: number;
  scene: string;    // narrative setup (may contain \n)
  options: [StoryOptionData, StoryOptionData];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    scene: '문이 열리는 순간, 베이스 사운드가 가슴팍을 치고 들어온다.\n드라큘라, 마녀, 좀비... 온갖 캐릭터들이 뒤섞인 공간.\n그런데 아는 얼굴이 한 명도 없다.',
    options: [
      {
        emoji: '🎃',
        action: '가장 가까운 사람에게 먼저 말을 건다',
        detail: '"저기, 코스튬 진짜 멋진데요. 혹시 직접 만드신 거예요?" — 이 정도면 시작할 수 있어.',
        traits: { social: 2, flexible: 1 },
      },
      {
        emoji: '👀',
        action: '음료수 한 잔 집어 들고 구석에 선다',
        detail: '잠깐 둘러보는 거야. 분위기 좀 읽고 나서 움직이면 돼.',
        traits: { reflective: 2, intuitive: 1 },
      },
    ],
  },
  {
    id: 2,
    scene: '보라색 마녀 코스튬을 입은 누군가가 다가온다.\n무대 조명이 빛깔을 바꾸는 순간, 눈이 마주쳤다.\n"이 코스튬, 어디서 아이디어 얻으셨어요?"',
    options: [
      {
        emoji: '✨',
        action: '설명을 시작한다 — 멈출 수가 없다',
        detail: '컨셉, 제작 과정, 숨겨진 디테일까지. 이 사람, 좋은 청중인데?',
        traits: { social: 2, intuitive: 1 },
      },
      {
        emoji: '🎭',
        action: '오히려 상대방 코스튬이 더 궁금해진다',
        detail: '"잠깐, 저한테 물어보기 전에... 이 드레스 디테일은 어떻게 한 거예요? 이게 더 궁금한데요."',
        traits: { empathetic: 2, reflective: 1 },
      },
    ],
  },
  {
    id: 3,
    scene: '일주일 전으로 돌아가보자.\n초대장을 받아 든 그 순간부터 오늘 파티까지 —\n당신은 코스튬을 어떻게 준비했나?',
    options: [
      {
        emoji: '🪡',
        action: '그날 바로 레퍼런스를 찾기 시작했다',
        detail: '참고 이미지 저장, 재료 구매, 두 번의 수정. 파티 당일엔 완성본만 입으면 됐어.',
        traits: { structured: 2, grounded: 1 },
      },
      {
        emoji: '🛸',
        action: '파티 전날 밤, 머릿속 아이디어를 꺼내 만들었다',
        detail: '이 조합은 아무도 생각 못 했을 거야. 세계관은 내 머릿속에만 있으니까.',
        traits: { intuitive: 2, flexible: 1 },
      },
    ],
  },
  {
    id: 4,
    scene: '테이블 위에 각자 가져온 음식들이 하나씩 쌓인다.\n초대장엔 "가져올 것: 먹을 것"이라고만 적혀 있었다.\n당신이 들고 온 건?',
    options: [
      {
        emoji: '🍱',
        action: '어제 저녁부터 만든 음식',
        detail: '레시피 두 번 읽고, 담음새까지 신경 썼어. 다들 맛있게 먹어줬으면 해서.',
        traits: { structured: 1, empathetic: 2 },
      },
      {
        emoji: '🛒',
        action: '오전에 편의점에서 골라온 것들',
        detail: '젤리, 과자, 음료 세 종류. 종류가 많으면 누군가는 좋아하겠지.',
        traits: { flexible: 2, social: 1 },
      },
    ],
  },
  {
    id: 5,
    scene: '귀신의 집에 들어선 지 2분.\n사방이 완전한 어둠이고, 바닥에서 연기가 피어오른다.\n그때 — 오른쪽 벽이 쾅 소리를 내며 열렸다.',
    options: [
      {
        emoji: '😱',
        action: '앞 사람 팔을 꽉 잡았다',
        detail: '심장이 멎는 줄 알았어. 무섭다는 걸 알면서 왜 들어온 거야, 나.',
        traits: { empathetic: 1, social: 1, flexible: 1 },
      },
      {
        emoji: '🔦',
        action: '저 장치가 어떻게 작동하는지 더 궁금하다',
        detail: '"에어컴프레셔야, 스프링이야?" 무섭기보다 신기해서 더 가까이 들여다봤어.',
        traits: { analytical: 2, intuitive: 1 },
      },
    ],
  },
  {
    id: 6,
    scene: '한 시간이나 공들인 뱀파이어 코스튬이라던 친구.\n막상 나타났더니 가발이 삐뚤어지고, 망토가 반쯤 풀려 있다.\n근데 친구는 전혀 눈치채지 못한 채 신이 나서 들어온다.',
    options: [
      {
        emoji: '💬',
        action: '바로 말해준다',
        detail: '"잠깐, 가발 삐뚤어졌어. 지금 고치는 게 낫겠어." — 나중에 알면 더 민망하잖아.',
        traits: { analytical: 2, grounded: 1 },
      },
      {
        emoji: '🌟',
        action: '일단 분위기를 맞춰주고 나중에 알려준다',
        detail: '"오, 이거 의도한 거야? 나쁘지 않은데?" — 조금 있다가 조용히 말해줘야겠다.',
        traits: { empathetic: 2, social: 1 },
      },
    ],
  },
  {
    id: 7,
    scene: '테이블 게임이 한창이다.\n내 순서가 막 돌아오려는 순간, 진행자가 선언한다.\n"잠깐, 규칙 조금 바꾸자. 이게 더 재밌을 것 같아서."',
    options: [
      {
        emoji: '📋',
        action: '"처음이랑 다르지 않아?"',
        detail: '"원래 규칙대로 끝내자. 중간에 바뀌면 공평하지 않잖아."',
        traits: { structured: 2, analytical: 1 },
      },
      {
        emoji: '🎲',
        action: '"오케이, 해보자!"',
        detail: '"바뀐 거 설명해봐. 어차피 해보기 전까진 모르는 거잖아."',
        traits: { flexible: 2, social: 1 },
      },
    ],
  },
  {
    id: 8,
    scene: '새벽 두 시.\n조명이 꺼지고 음악이 멈췄다.\n마지막 남은 사람들이 천천히 짐을 챙기기 시작한다.\n오늘 밤이 끝나가고 있다.',
    options: [
      {
        emoji: '🌃',
        action: '"2차 가자!"',
        detail: '에너지가 아직 남았어. 이 분위기, 오늘 밤 여기서 끊기면 아까울 것 같아.',
        traits: { social: 2, flexible: 1 },
      },
      {
        emoji: '🌙',
        action: '조용히 혼자 걸어 나간다',
        detail: '오늘 많이 썼어. 집에 가는 길에 오늘 밤을 혼자 곱씹는 게 더 좋아.',
        traits: { reflective: 2, intuitive: 1 },
      },
    ],
  },
];

// Trait bar display config — max values computed from question data above.
// Shows the 4 "positive pole" traits to avoid any negative framing.
const TRAIT_BAR_CONFIG = [
  { key: 'social' as const, label: '사교성', max: 10 },
  { key: 'intuitive' as const, label: '상상력', max: 6 },
  { key: 'empathetic' as const, label: '공감력', max: 7 },
  { key: 'flexible' as const, label: '즉흥성', max: 8 },
];

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
  const [traits, setTraits] = useState<TraitScores>({ ...EMPTY_TRAITS });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [mbtiCode, setMbtiCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [fieldError, setFieldError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAnswer = (optionIndex: number) => {
    if (selectedOption !== null) return; // block during transition
    setSelectedOption(optionIndex);

    const option = QUESTIONS[currentQ].options[optionIndex];
    const newTraits = { ...traits };
    for (const [key, val] of Object.entries(option.traits)) {
      newTraits[key as keyof TraitScores] += val as number;
    }

    const nextQ = currentQ + 1;
    const isLast = nextQ >= QUESTIONS.length;

    setTimeout(() => {
      setSelectedOption(null);
      setTraits(newTraits);
      if (!isLast) {
        setCurrentQ(nextQ);
      } else {
        setMbtiCode(calcMbti(newTraits));
        setPhase('result');
      }
    }, 650);
  };

  const skipToForm = () => setPhase('form');

  const retakeQuiz = () => {
    setCurrentQ(0);
    setTraits({ ...EMPTY_TRAITS });
    setMbtiCode('');
    setSelectedOption(null);
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
      const char = mbtiCode ? CHARACTERS[mbtiCode] : null;
      const result = await applyParty(
        nickname.trim(),
        char ? { character: char.name, characterIcon: char.icon } : undefined,
      );
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
            <p style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '16px', color: '#B98CE0', lineHeight: 1.7, marginBottom: '6px' }}>
              8가지 할로윈 밤의 상황.
            </p>
            <p style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '14px', color: '#5B2A86', lineHeight: 1.7, marginBottom: '28px' }}>
              당신의 선택이 쌓여 캐릭터가 완성됩니다.
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
              {currentQ + 1} / {QUESTIONS.length}
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

          <Card
            key={currentQ}
            accentColor="#FF7A00"
            style={{
              animation: selectedOption !== null
                ? 'questionExit 0.38s ease-in forwards'
                : 'questionEnter 0.28s ease-out both',
            }}
          >
            {/* Scene */}
            <p style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '18px', color: '#EDE7F6', lineHeight: 1.8, marginBottom: '22px', textAlign: 'center', whiteSpace: 'pre-line' }}>
              {q.scene}
            </p>
            <div style={{ height: '1px', background: 'rgba(91,42,134,0.4)', marginBottom: '18px' }} />
            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {q.options.map((opt, i) => (
                <StoryOption
                  key={i}
                  label={String.fromCharCode(65 + i)}
                  option={opt}
                  onClick={() => handleAnswer(i)}
                  selected={selectedOption === i}
                  dimmed={selectedOption !== null && selectedOption !== i}
                />
              ))}
            </div>
            {/* Selection feedback */}
            {selectedOption !== null && (
              <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#FF7A00', textAlign: 'center', marginTop: '16px', opacity: 0.7 }}>
                ✦ 선택이 기록됐다...
              </p>
            )}
          </Card>
        </div>
      </PageShell>
    );
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const character = CHARACTERS[mbtiCode] ?? CHARACTERS['ENFP'];
    // Shorthand helper so JSX stays readable
    const anim = (name: string, duration: string, delay: string, easing = 'ease-out') =>
      ({ animation: `${name} ${duration} ${easing} both`, animationDelay: delay } as React.CSSProperties);

    return (
      <PageShell>
        <StepIndicator step={1} />
        <Card accentColor="#FF7A00" style={{ animation: 'ghostPop 0.4s ease-out both' }}>
          <div style={{ textAlign: 'center' }}>
            {/* Narrative lead-in */}
            <p style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '13px', color: '#5B2A86', marginBottom: '4px', ...anim('fadeInUp', '0.35s', '0.2s') }}>
              10월 31일 밤, 8번의 선택.
            </p>
            <p style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '14px', color: '#8B4BC0', marginBottom: '20px', ...anim('fadeInUp', '0.35s', '0.32s') }}>
              오늘 밤 당신이 써 내려간 이야기의 주인공은...
            </p>
            {/* Diamond row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '18px', ...anim('fadeInUp', '0.25s', '0.42s') }}>
              {(['#FF7A00', '#8B4BC0', '#FF7A00'] as const).map((c, i) => (
                <span key={i} style={{ width: '6px', height: '6px', background: c, transform: 'rotate(45deg)', display: 'inline-block' }} />
              ))}
            </div>
            {/* Character emoji — pops in then floats */}
            <div style={{ marginBottom: '10px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{
                fontSize: '56px',
                display: 'inline-block',
                animation: 'charPop 0.55s cubic-bezier(0.34,1.56,0.64,1) both, float 3.5s ease-in-out infinite',
                animationDelay: '0.5s, 1.2s',
              }}>
                {character.icon}
              </span>
            </div>
            {/* Character name */}
            <div style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '22px', color: '#FF7A00', marginBottom: '16px', ...anim('nameReveal', '0.45s', '0.78s') }}>
              {character.name}
            </div>
            {/* Divider + description */}
            <div style={{ ...anim('fadeInUp', '0.4s', '0.92s') }}>
              <div style={{ height: '1px', background: 'rgba(139,75,192,.4)', margin: '16px 0' }} />
              <p style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '15px', color: '#B98CE0', lineHeight: 1.7, marginBottom: '20px', textAlign: 'left' }}>
                {character.desc}
              </p>
            </div>
            {/* Trait bars */}
            <div style={{ background: '#0B0610', border: '1px solid #5B2A86', padding: '16px', marginBottom: '14px', textAlign: 'left', ...anim('slideInFromBottom', '0.4s', '1.05s') }}>
              <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#8B4BC0', marginBottom: '14px', letterSpacing: '0.05em' }}>
                🌙 이 밤의 나
              </p>
              {TRAIT_BAR_CONFIG.map((cfg, idx) => (
                <TraitBar key={cfg.key} label={cfg.label} value={traits[cfg.key]} max={cfg.max} traitIndex={idx} />
              ))}
            </div>
            {/* Potluck */}
            <div style={{ background: '#0B0610', border: '1px solid #5B2A86', padding: '12px 16px', marginBottom: '24px', textAlign: 'left', ...anim('fadeInUp', '0.4s', '1.65s') }}>
              <p style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '13px', color: '#FF7A00', letterSpacing: '.06em', marginBottom: '6px' }}>✦ 추천 포틀럭 메뉴</p>
              <p style={{ fontFamily: "'Do Hyeon', sans-serif", fontSize: '15px', color: '#EDE7F6' }}>🍽 {character.food}</p>
            </div>
            {/* CTA buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', ...anim('fadeInUp', '0.35s', '1.8s') }}>
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
    const character = mbtiCode ? CHARACTERS[mbtiCode] : null;
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
  const character = mbtiCode ? CHARACTERS[mbtiCode] : null;
  return (
    <PageShell>
      <StepIndicator step={2} />
      <div style={{ width: '100%', maxWidth: '420px', marginTop: '28px' }}>
        {/* Character badge */}
        {character && (
          <div style={{ background: '#1A1026', border: '1px solid #5B2A86', padding: '14px 18px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '32px' }}>{character.icon}</span>
            <div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#5B2A86', marginBottom: '4px' }}>✦ 오늘 밤의 역할</div>
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

function StoryOption({
  label,
  option,
  onClick,
  selected,
  dimmed,
}: {
  label: string;
  option: StoryOptionData;
  onClick: () => void;
  selected: boolean;
  dimmed: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '18px',
        background: selected ? '#1A0A2E' : '#0B0610',
        border: selected ? '2px solid #FF7A00' : '2px solid #5B2A86',
        cursor: dimmed ? 'default' : 'pointer',
        textAlign: 'left',
        width: '100%',
        opacity: dimmed ? 0.35 : 1,
        boxShadow: selected ? '0 0 16px rgba(255,122,0,0.2)' : 'none',
        transition: 'border-color 0.15s, background 0.15s, opacity 0.25s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        if (!selected && !dimmed) {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.borderColor = '#FF7A00';
          el.style.background = '#150820';
        }
      }}
      onMouseLeave={e => {
        if (!selected && !dimmed) {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.borderColor = '#5B2A86';
          el.style.background = '#0B0610';
        }
      }}
    >
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        {/* Label + emoji column */}
        <div style={{ minWidth: '34px' }}>
          <span style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px',
            color: selected ? '#FF7A00' : '#5B2A86',
            display: 'block',
            marginBottom: '8px',
          }}>
            {label}
          </span>
          <span style={{ fontSize: '26px', display: 'block', lineHeight: 1 }}>{option.emoji}</span>
        </div>
        {/* Action + detail column */}
        <div style={{ flex: 1, paddingTop: '1px' }}>
          <div style={{
            fontFamily: "'Do Hyeon', sans-serif",
            fontSize: '17px',
            color: selected ? '#FF7A00' : '#EDE7F6',
            marginBottom: '6px',
            lineHeight: 1.3,
          }}>
            {option.action}
          </div>
          <div style={{
            fontFamily: "'Do Hyeon', sans-serif",
            fontSize: '13px',
            color: '#6B3E9A',
            lineHeight: 1.6,
          }}>
            {option.detail}
          </div>
        </div>
      </div>
    </button>
  );
}

// Pixel-style trait bar — 10 blocks filled proportionally, staggered animation
function TraitBar({ label, value, max, traitIndex }: { label: string; value: number; max: number; traitIndex: number }) {
  const filled = Math.min(10, Math.round((value / max) * 10));
  // Each trait's blocks start appearing after the previous trait's last block
  const baseDelay = 1.2 + traitIndex * 0.15;
  return (
    <div style={{ marginBottom: '12px' }}>
      <span style={{
        fontFamily: "'Do Hyeon', sans-serif",
        fontSize: '14px',
        color: '#B98CE0',
        display: 'block',
        marginBottom: '5px',
        animation: 'fadeInUp 0.25s ease-out both',
        animationDelay: `${baseDelay}s`,
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: '3px' }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '10px',
              background: i < filled ? '#FF7A00' : '#150820',
              border: `1px solid ${i < filled ? '#FF7A00' : '#2D1650'}`,
              transformOrigin: 'bottom',
              animation: 'blockAppear 0.2s ease-out both',
              animationDelay: `${baseDelay + 0.08 + i * 0.04}s`,
            }}
          />
        ))}
      </div>
    </div>
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
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '12px', color: borderColor, whiteSpace: 'nowrap' }}>{label}</span>
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
