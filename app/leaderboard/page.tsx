'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShareStoryModal from '@/components/ShareStoryModal';
import { getOrCreateCookieId, clearCookieId } from '@/lib/auth';

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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [isTempAccount, setIsTempAccount] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cookieId, setCookieId] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const cid = getOrCreateCookieId();
    setCookieId(cid);
    if (!cid) { setAuthLoading(false); return; }
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cookieId: cid }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.userId) {
          setUserId(data.userId);
          setIsTempAccount(data.isTempAccount ?? true);
        }
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const handleLoginSuccess = (params: { userId: string; isTempAccount: boolean; userEmail?: string | null }) => {
    setUserId(params.userId);
    setIsTempAccount(params.isTempAccount);
    setUserEmail(params.userEmail ?? null);
  };

  const handleSignOut = () => {
    clearCookieId();
    setUserId(null);
    setIsTempAccount(true);
    setUserEmail(null);
    const newCid = getOrCreateCookieId();
    setCookieId(newCid);
    if (newCid) {
      fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookieId: newCid }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.userId) {
            setUserId(data.userId);
          }
        });
    }
  };

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
      <Header
        isTempAccount={isTempAccount}
        authLoading={authLoading}
        onSignInClick={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      <div className="flex flex-col items-center flex-1 z-10 p-4 pt-6 pb-8">
        <nav className="w-full max-w-2xl mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 text-sm">
            <li>
              <Link href="/" className="font-semibold text-gray-500 hover:text-black transition-colors">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="font-semibold text-black">Leaderboard</li>
          </ol>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tighter text-center mb-2">
          Leaderboard
        </h1>
        <p className="text-base font-semibold text-black text-center mb-8 max-w-md">
          The worst of the worst - ranked by you.
        </p>

        <div className="w-full max-w-2xl">
          {loading && (
            <p className="text-center font-bold text-black py-12">Loading…</p>
          )}
          {error && !loading && (
            <div className="bg-white border-4 border-black rounded-xl p-6 text-center">
              <p className="font-bold text-black">{error}</p>
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
              <p className="font-bold text-black">No stories yet.</p>
              <p className="text-black mt-2">Vote on stories to build the leaderboard.</p>
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
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === entry.storyId ? null : entry.storyId)}
                    className="w-full text-left bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-yellow-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white font-black text-lg">
                        {entry.rank}
                      </span>
                      <span className="font-black text-lg text-yellow-700 tabular-nums">
                        {entry.thatsBadCount}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium italic text-gray-900 leading-snug ${expandedId === entry.storyId ? '' : 'line-clamp-2'}`}>
                        <span className="text-2xl font-serif leading-none text-gray-300 mr-0.5">&ldquo;</span>{entry.text}<span className="text-2xl font-serif leading-none text-gray-300 ml-0.5">&rdquo;</span>
                      </p>
                      {entry.storyName && (
                        <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mt-1 text-right">
                          — {entry.storyName}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Footer />

      <ShareStoryModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        userId={userId}
        isTempAccount={isTempAccount}
        userEmail={userEmail}
        cookieId={cookieId}
        onLoginSuccess={handleLoginSuccess}
        onSignOut={handleSignOut}
      />
    </main>
  );
}
