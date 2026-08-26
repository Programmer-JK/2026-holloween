# 🎃 Halloween Party 2026

> 2026년 10월 31일, 사당역에서 열리는 할로윈 포틀럭 파티 초대장 웹사이트

레트로 게임 / 픽셀 아트 컨셉의 할로윈 파티 초대장 및 참가 신청 웹사이트입니다.

## 기술 스택

- **Frontend**: Vite + React + TypeScript
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v6
- **Backend**: Google Apps Script + Google Sheets
- **Fonts**: Press Start 2P, VT323, Noto Sans KR (Google Fonts)

## 페이지 구조

```
/         소개 페이지 (파티 정보, 카운트다운, 참가자 명단)
/apply    참가 신청 페이지
```

## 로컬 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 환경변수 설정

`.env.example`을 복사하여 `.env` 파일을 생성합니다.

```bash
cp .env.example .env
```

`.env` 파일에 Google Apps Script Web App URL을 입력합니다.

```env
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

> **주의**: `.env` 파일은 git에 커밋하지 마세요.
>
> `VITE_GOOGLE_SCRIPT_URL`이 설정되지 않은 경우, 목(mock) 데이터로 동작합니다.

## Google Sheets 구조

Sheet 이름: `Sheet1`

| A: timestamp | B: nickname | C: show |
|---|---|---|
| 2026-08-18T22:30:00.000Z | 조라 | Y |
| 2026-08-18T22:35:00.000Z | 모닥불 | N |

- `show = Y`: 웹사이트 참가자 명단에 공개
- `show = N`: 비공개 (기본값, 관리자가 수동으로 Y로 변경)

## Google Apps Script 배포 방법

1. [Google Apps Script](https://script.google.com) 접속
2. 새 프로젝트 생성
3. `google-apps-script/Code.gs` 내용을 붙여넣기
4. Google Sheets와 연결 (스크립트 편집기에서 해당 스프레드시트 열기)
5. **배포 > 새 배포** 선택
   - 유형: **웹 앱**
   - 실행 계정: **나**
   - 액세스 권한: **모든 사용자**
6. 배포 후 생성된 Web App URL을 `.env`의 `VITE_GOOGLE_SCRIPT_URL`에 입력

## API 사용 방법

### 참가 신청 (POST)

```http
POST {VITE_GOOGLE_SCRIPT_URL}
Content-Type: text/plain

{
  "action": "apply",
  "nickname": "조라"
}
```

응답: `{ "success": true }`

### 참가자 조회 (GET)

```http
GET {VITE_GOOGLE_SCRIPT_URL}?action=attendees
```

응답: `{ "success": true, "attendees": ["조라", "모닥불"] }`

> `show = Y`인 참가자 닉네임만 반환합니다.

## 배포

### Vercel

```bash
npm i -g vercel && vercel
# Dashboard > Settings > Environment Variables 에서 VITE_GOOGLE_SCRIPT_URL 추가
```

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Environment Variables에 `VITE_GOOGLE_SCRIPT_URL` 추가

## 주요 기능

| 기능 | 설명 |
|---|---|
| 픽셀 아트 UI | 레트로 게임 스타일 디자인 |
| 카운트다운 | 파티까지 남은 시간 실시간 표시 |
| 참가자 명단 | Google Sheets에서 show=Y인 참가자만 공개 |
| 참가 신청 | 닉네임 입력 → Google Sheets 저장 |
| 박쥐 애니메이션 | 화면을 날아다니는 픽셀 박쥐 |
| Easter Egg 1 | 호박 5번 클릭 → 유령 등장 |
| Easter Egg 2 | 코나미 코드 (↑↑↓↓←→←→) → 비밀 메시지 |
| 반응형 | 모바일 우선 (375px~) |
| 접근성 | ARIA, 키보드 네비게이션, prefers-reduced-motion |

## 프로젝트 구조

```
src/
├── components/
│   ├── AttendeeModal.tsx
│   ├── Bat.tsx
│   ├── Countdown.tsx
│   ├── FloatingBats.tsx
│   ├── Ghost.tsx
│   ├── Loading.tsx
│   ├── PartyInfo.tsx
│   ├── PixelBackground.tsx
│   ├── PixelButton.tsx
│   ├── PixelCard.tsx
│   └── Pumpkin.tsx
├── hooks/
│   └── useCountdown.ts
├── pages/
│   ├── ApplyPage.tsx
│   ├── HomePage.tsx
│   └── NotFoundPage.tsx
├── services/
│   └── googleSheets.ts
├── types/
│   └── party.ts
├── App.tsx
├── main.tsx
└── index.css

google-apps-script/
└── Code.gs
```
