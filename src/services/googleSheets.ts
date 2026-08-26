import type { ApplyResponse, AttendeeResponse } from '../types/party';

const API_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL as string;

function sanitizeNickname(nickname: string): string {
  return nickname
    .trim()
    .replace(/[<>"'&]/g, (c) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return map[c];
    });
}

export async function applyParty(rawNickname: string): Promise<ApplyResponse> {
  const nickname = sanitizeNickname(rawNickname);

  if (!nickname || nickname.length === 0) {
    return { success: false, message: '닉네임을 입력해주세요.' };
  }

  if (nickname.length > 20) {
    return { success: false, message: '닉네임은 최대 20자까지 입력 가능합니다.' };
  }

  if (!API_URL) {
    console.warn('VITE_GOOGLE_SCRIPT_URL is not set. Using mock response.');
    await new Promise((r) => setTimeout(r, 800));
    return { success: true };
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'apply', nickname }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = (await response.json()) as ApplyResponse;
    return data;
  } catch (error) {
    console.error('applyParty error:', error);
    return {
      success: false,
      message: '👻 유령들이 서버를 점령했어요... 잠시 후 다시 시도해주세요.',
    };
  }
}

export async function getAttendees(): Promise<AttendeeResponse> {
  if (!API_URL) {
    console.warn('VITE_GOOGLE_SCRIPT_URL is not set. Using mock response.');
    await new Promise((r) => setTimeout(r, 1000));
    return {
      success: true,
      attendees: ['조라', '모닥불', '고스트'],
    };
  }

  try {
    const url = new URL(API_URL);
    url.searchParams.set('action', 'attendees');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = (await response.json()) as AttendeeResponse;
    return data;
  } catch (error) {
    console.error('getAttendees error:', error);
    return {
      success: false,
      attendees: [],
      message: '🦇 참가자 명단을 불러오지 못했어요. 잠시 후 다시 확인해주세요.',
    };
  }
}
