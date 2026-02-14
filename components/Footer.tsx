'use client';

import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 bg-yellow-50/80 mt-auto">
      <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col items-center gap-4">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <a href="https://www.instagram.com/ivehadworse.app/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-black hover:opacity-80 transition-colors">Instagram</a>
          <a href="https://www.tiktok.com/@ivehadworsee" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-black hover:opacity-80 transition-colors">TikTok</a>
          <span className="hidden sm:inline text-gray-300">|</span>
          <Link href="/privacy" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Privacy</Link>
          <Link href="/terms" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Terms</Link>
        </div>
        <p className="text-sm text-black">
          © {year} I've Had Worse. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
