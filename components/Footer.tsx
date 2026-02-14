'use client';

const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/ivehadworse.app/' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@ivehadworsee'},
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 bg-yellow-50/80 mt-auto">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-6">
          <a href="https://www.instagram.com/ivehadworse.app/" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-800 hover:text-black transition-colors" aria-label="Instagram">Instagram</a>
          <a href="https://www.tiktok.com/@ivehadworsee" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-800 hover:text-black transition-colors" aria-label="TikTok">TikTok</a>
        </div>
        <p className="text-sm text-gray-700">
          © {year} I've Had Worse. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
