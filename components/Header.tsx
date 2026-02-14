'use client';

import Link from 'next/link';
import Image from 'next/image';

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
  return (
    <header className="sticky top-0 z-20 w-full bg-yellow-50/95 backdrop-blur supports-[backdrop-filter]:bg-yellow-50/80">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-3 py-1">
        <Link href="/" className="flex items-center focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded -my-1">
          <Image
            src="/ive-hard-worse-logo-transparent.png"
            alt="I've Had Worse"
            width={320}
            height={96}
            className="h-16 w-auto object-contain sm:h-20"
            priority
          />
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4">
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
      </div>
    </header>
  );
}
