'use client';

import { useState, useEffect } from 'react';

// 15 Feb 2026, 12:35 Amsterdam (CET = UTC+1 in February)
const TARGET = new Date('2026-02-15T12:35:00+01:00').getTime();

export function useCountdown() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, TARGET - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);

  return { days, hours, minutes, seconds, done: diff === 0 };
}
