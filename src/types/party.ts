export interface Attendee {
  nickname: string;
}

export interface ApplyRequest {
  action: 'apply';
  nickname: string;
}

export interface ApplyResponse {
  success: boolean;
  message?: string;
}

export interface AttendeeResponse {
  success: boolean;
  attendees: string[];
  message?: string;
}

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOver: boolean;
}
