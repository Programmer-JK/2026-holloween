import { useState, useEffect } from 'react';
import type { CountdownTime } from '../types/party';

// Party date: 2026-10-31 18:00 KST
const PARTY_DATE = new Date('2026-10-31T18:00:00+09:00');

export function useCountdown(): CountdownTime {
  const calculate = (): CountdownTime => {
    const now = new Date();
    const diff = PARTY_DATE.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isOver: false };
  };

  const [time, setTime] = useState<CountdownTime>(calculate);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(calculate());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return time;
}
