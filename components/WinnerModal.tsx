'use client';

import { useEffect, useState } from 'react';
import { X, Trophy } from 'lucide-react';
import Link from 'next/link';

const DISMISSED_KEY = 'ivehadworse_winner_seen';

interface WinnerStory {
  storyId: string;
  text: string;
  storyName: string | null;
  thatsBadCount: number;
}

export default function WinnerModal({ countdownDone }: { countdownDone: boolean }) {
  const [winner, setWinner] = useState<WinnerStory | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!countdownDone) return;

    // Already dismissed?
    if (typeof window !== 'undefined' && localStorage.getItem(DISMISSED_KEY)) return;

    // Fetch the #1 story
    fetch('/api/leaderboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.entries?.length > 0) {
          setWinner(data.entries[0]);
          setIsOpen(true);
        }
      })
      .catch(() => {});
  }, [countdownDone]);

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISSED_KEY, '1');
    }
  };

  if (!isOpen || !winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-black">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-5">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Trophy className="text-yellow-500" size={32} />
            <span className="text-4xl font-black">#1</span>
            <Trophy className="text-yellow-500" size={32} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mb-1">
            The Worst Date Story
          </h2>
          <p className="text-sm font-semibold text-gray-500">
            Voted by the community as the ultimate disaster.
          </p>
        </div>

        <div className="bg-yellow-50 border-4 border-black rounded-xl p-5 mb-5">
          <p className="font-medium italic text-gray-900 leading-relaxed text-base">
            <span className="text-2xl font-serif leading-none text-gray-400 mr-0.5">&ldquo;</span>
            {winner.text}
            <span className="text-2xl font-serif leading-none text-gray-400 ml-0.5">&rdquo;</span>
          </p>
          {winner.storyName && (
            <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mt-3 text-right">
              — {winner.storyName}
            </p>
          )}
        </div>

        <div className="text-center mb-5">
          <p className="text-sm font-bold text-black">
            <span className="text-2xl font-black text-yellow-600">{winner.thatsBadCount}</span>{' '}
            <span className="uppercase tracking-wider text-gray-500">people voted &quot;That&apos;s Bad&quot;</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/leaderboard"
            onClick={handleClose}
            className="flex-1 py-3 bg-black text-white font-black uppercase text-sm text-center border-4 border-black hover:bg-gray-800 transition-colors"
          >
            See Full Leaderboard
          </Link>
          <button
            onClick={handleClose}
            className="flex-1 py-3 bg-white text-black font-black uppercase text-sm text-center border-4 border-black hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
