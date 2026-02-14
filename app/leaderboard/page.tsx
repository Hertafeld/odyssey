'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface LeaderboardEntry {
  rank: number;
  storyId: string;
  text: string;
  storyName: string | null;
  thatsBadCount: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard');
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error ?? 'Failed to load leaderboard');
          setEntries([]);
          return;
        }
        setEntries(json.entries ?? []);
        setError(null);
      } catch {
        if (!cancelled) {
          setError('Failed to load leaderboard');
          setEntries([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchLeaderboard();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-yellow-50 overflow-hidden relative">
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <Header />

      <div className="flex flex-col items-center flex-1 z-10 p-4 pt-6 pb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tighter text-center mb-2">
          Leaderboard
        </h1>
        <p className="text-base font-semibold text-black text-center mb-8 max-w-md">
          Top 20 stories by &quot;That&apos;s Bad&quot; votes
        </p>

        <div className="w-full max-w-2xl">
          {loading && (
            <p className="text-center font-bold text-gray-700 py-12">Loading…</p>
          )}
          {error && !loading && (
            <div className="bg-white border-4 border-black rounded-xl p-6 text-center">
              <p className="font-bold text-gray-800">{error}</p>
              <Link
                href="/"
                className="inline-block mt-4 px-4 py-2 bg-black text-white font-bold uppercase text-sm hover:bg-gray-800 transition-colors"
              >
                Back home
              </Link>
            </div>
          )}
          {!loading && !error && entries.length === 0 && (
            <div className="bg-white border-4 border-black rounded-xl p-8 text-center">
              <p className="font-bold text-gray-800">No stories yet.</p>
              <p className="text-gray-700 mt-2">Vote on stories to build the leaderboard.</p>
              <Link
                href="/"
                className="inline-block mt-4 px-4 py-2 bg-black text-white font-bold uppercase text-sm hover:bg-gray-800 transition-colors"
              >
                Go vote
              </Link>
            </div>
          )}
          {!loading && !error && entries.length > 0 && (
            <ul className="space-y-3">
              {entries.map((entry) => (
                <li key={entry.storyId}>
                  <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white font-black text-lg">
                        {entry.rank}
                      </span>
                      <span className="font-black text-lg text-yellow-700 tabular-nums">
                        {entry.thatsBadCount}
                        <span className="text-xs font-bold uppercase text-gray-600 ml-1">That&apos;s Bad</span>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium italic text-gray-900 leading-snug line-clamp-2">
                        &quot;{entry.text}&quot;
                      </p>
                      {entry.storyName && (
                        <p className="text-sm font-black tracking-widest uppercase text-gray-600 mt-1">
                          — {entry.storyName}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
