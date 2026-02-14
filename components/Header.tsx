'use client';

import { useState } from 'react';
import Link from 'next/link';

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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 w-full bg-yellow-50/95 backdrop-blur supports-[backdrop-filter]:bg-yellow-50/80">
      <div className="mx-auto flex h-14 sm:h-16 max-w-4xl items-center justify-between px-3 py-2">
        <Link href="/" className="flex flex-col justify-center focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded -my-1">
          <span className="text-base sm:text-lg font-black text-black uppercase tracking-tighter">
            I've Had Worse
          </span>
          <span className="text-[10px] sm:text-xs font-semibold text-gray-500 tracking-tight">
            Swipe through the worst dates.
          </span>
        </Link>

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
