'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// 15 Feb 2026, 11:00 Amsterdam (CET = UTC+1 in February)
const TARGET = new Date('2026-02-15T11:00:00+01:00').getTime();

function useCountdown() {
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

export interface HeaderProps {
  isTempAccount: boolean;
  authLoading: boolean;
  onSignInClick: () => void;
  onSignOut: () => void;
}

export default function Header({
  isTempAccount,
  authLoading,
  onSignInClick,
  onSignOut,
}: HeaderProps) {
  const { days, hours, minutes, seconds, done } = useCountdown();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <header className="sticky top-0 z-20 w-full bg-yellow-50/95 backdrop-blur supports-[backdrop-filter]:bg-yellow-50/80">
      <div className="mx-auto flex h-16 sm:h-28 max-w-4xl items-center justify-between px-3 py-2">
        <Link href="/" className="flex items-center focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded -my-1">
          <span className="text-base sm:text-lg font-black text-black uppercase tracking-tighter">
            I've Had Worse
          </span>
        </Link>

        {/* Countdown */}
        <div className="flex flex-col items-center">
          {mounted && !done ? (
            <>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">
                Voting closes in
              </span>
              <div className="flex items-center gap-1 sm:gap-2 font-black text-black tabular-nums text-sm sm:text-lg">
                <span>{pad(days)}</span>
                <span className="text-gray-300">:</span>
                <span>{pad(hours)}</span>
                <span className="text-gray-300">:</span>
                <span>{pad(minutes)}</span>
                <span className="text-gray-300">:</span>
                <span>{pad(seconds)}</span>
              </div>
            </>
          ) : mounted ? (
            <span className="text-sm sm:text-base font-black uppercase tracking-wider text-black">
              Voting Closed!
            </span>
          ) : null}
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-4">
          <Link
            href="/leaderboard"
            className="text-base font-semibold text-gray-900 hover:text-black transition-colors"
          >
            Leaderboard
          </Link>
          {!authLoading && (
            isTempAccount ? (
              <button
                type="button"
                onClick={onSignInClick}
                className="rounded-md border-2 border-gray-900 bg-gray-100 px-4 py-2 text-base font-semibold text-gray-900 hover:bg-gray-200 transition-colors"
              >
                Sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={onSignOut}
                className="rounded-md border-2 border-gray-900 bg-gray-100 px-4 py-2 text-base font-semibold text-gray-900 hover:bg-gray-200 transition-colors"
              >
                Sign out
              </button>
            )
          )}
        </nav>

        {/* Mobile hamburger button */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="sm:hidden flex flex-col items-center justify-center w-10 h-10 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span
            className={`block h-0.5 w-5 bg-black transition-all duration-200 ${menuOpen ? 'translate-y-[3px] rotate-45' : ''}`}
          />
          <span
            className={`block h-0.5 w-5 bg-black transition-all duration-200 mt-1 ${menuOpen ? 'opacity-0' : ''}`}
          />
          <span
            className={`block h-0.5 w-5 bg-black transition-all duration-200 mt-1 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`}
          />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-200 ease-in-out ${menuOpen ? 'max-h-40 border-t border-yellow-200' : 'max-h-0'}`}
      >
        <nav className="mx-auto max-w-4xl flex flex-col gap-2 px-4 py-3">
          <Link
            href="/leaderboard"
            onClick={() => setMenuOpen(false)}
            className="text-base font-semibold text-gray-900 hover:text-black transition-colors py-2"
          >
            Leaderboard
          </Link>
          {!authLoading && (
            isTempAccount ? (
              <button
                type="button"
                onClick={() => { onSignInClick(); setMenuOpen(false); }}
                className="rounded-md border-2 border-gray-900 bg-gray-100 px-4 py-2 text-base font-semibold text-gray-900 hover:bg-gray-200 transition-colors text-left"
              >
                Sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { onSignOut(); setMenuOpen(false); }}
                className="rounded-md border-2 border-gray-900 bg-gray-100 px-4 py-2 text-base font-semibold text-gray-900 hover:bg-gray-200 transition-colors text-left"
              >
                Sign out
              </button>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
