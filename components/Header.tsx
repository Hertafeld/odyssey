'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-20 w-full bg-yellow-50/95 backdrop-blur supports-[backdrop-filter]:bg-yellow-50/80">
      <div className="mx-auto flex h-24 sm:h-28 max-w-4xl items-center justify-between px-3 py-2">
        <Link href="/" className="flex items-center focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded -my-1">
          <Image
            src="/ive-hard-worse-logo-transparent.png"
            alt="I've Had Worse"
            width={400}
            height={140}
            className="h-20 w-auto object-contain sm:h-24"
            priority
          />
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/leaderboard"
            className="text-base font-semibold text-gray-900 hover:text-black transition-colors"
          >
            Leaderboard
          </Link>
          <Link
            href="/login"
            className="rounded-md border-2 border-gray-900 bg-gray-100 px-4 py-2 text-base font-semibold text-gray-900 hover:bg-gray-200 transition-colors"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
