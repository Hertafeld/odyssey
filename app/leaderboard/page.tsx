'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShareStoryModal from '@/components/ShareStoryModal';
import StoryDetailModal from '@/components/StoryDetailModal';
import { getOrCreateCookieId, clearCookieId, saveSession, loadSession, clearSession } from '@/lib/auth';
import { useCountdown } from '@/lib/useCountdown';

interface LeaderboardEntry {
  rank: number;
  storyId: string;
  text: string;
  storyName: string | null;
  thatsBadCount: number;
  hasVoted: boolean;
}

export default function LeaderboardPage() {
  const { days, hours, minutes, seconds, done: countdownDone } = useCountdown();
  const [mounted, setMounted] = useState(false);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<LeaderboardEntry | null>(null);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const [userId, setUserId] = useState<string | null>(null);
  const [isTempAccount, setIsTempAccount] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cookieId, setCookieId] = useState<string>('');
  const [modalMode, setModalMode] = useState<'auth' | 'submit' | null>(null);

  useEffect(() => setMounted(true), []);
  const pad = (n: number) => String(n).padStart(2, '0');

  useEffect(() => {
    const cid = getOrCreateCookieId();
    setCookieId(cid);

    const saved = loadSession();
    if (saved && !saved.isTempAccount) {
      setUserId(saved.userId);
      setIsTempAccount(saved.isTempAccount);
      setUserEmail(saved.userEmail);
      setAuthLoading(false);
      return;
    }

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
    saveSession({ userId: params.userId, isTempAccount: params.isTempAccount, userEmail: params.userEmail ?? null });
  };

  const handleSignOut = () => {
    clearCookieId();
    clearSession();
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

  const handleVote = (direction: 'left' | 'right') => {
    if (!selectedStory || !userId) return;
    const vote = direction === 'left' ? 'ive_had_worse' : 'sucks';
    fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId: selectedStory.storyId, userId, vote }),
    }).catch(() => {});
    setVotedIds((prev) => new Set(prev).add(selectedStory.storyId));
  };

  useEffect(() => {
    let cancelled = false;
    async function fetchLeaderboard() {
      try {
        const url = userId ? `/api/leaderboard?userId=${userId}` : '/api/leaderboard';
        const res = await fetch(url);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error ?? 'Failed to load leaderboard');
          setEntries([]);
          return;
        }
        const fetchedEntries: LeaderboardEntry[] = json.entries ?? [];
        setEntries(fetchedEntries);
        setVotedIds(new Set(fetchedEntries.filter((e) => e.hasVoted).map((e) => e.storyId)));
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
  }, [userId]);

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
        onSignInClick={() => setModalMode('auth')}
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
        <p className="text-base font-semibold text-black text-center mb-4 max-w-md">
          The worst of the worst — ranked by you.
        </p>

        {/* Countdown */}
        <div className="flex flex-col items-center mb-6">
          {mounted && !countdownDone ? (
            <>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500">
                Voting closes in
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 font-black text-black tabular-nums text-lg sm:text-2xl">
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
            <span className="text-lg sm:text-xl font-black uppercase tracking-wider text-black">
              Voting Closed!
            </span>
          ) : null}
        </div>

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
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedStory(entry)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedStory(entry); }}}
                    className="w-full text-left bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-start gap-3 hover:bg-yellow-50 transition-colors cursor-pointer"
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
                      <p className="font-medium italic text-gray-900 leading-snug line-clamp-2">
                        <span className="text-2xl font-serif leading-none text-gray-300 mr-0.5">&ldquo;</span>{entry.text}<span className="text-2xl font-serif leading-none text-gray-300 ml-0.5">&rdquo;</span>
                      </p>
                      {entry.storyName && (
                        <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mt-1 text-right">
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

        {/* Submit your story CTA */}
        <div className="w-full max-w-2xl mt-10 mb-4 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black mb-2">
            Think your story is worse?
          </h2>
          <p className="text-sm sm:text-base font-medium text-gray-700 mb-4">
            Share your Valentine&apos;s Day disaster and let people judge.
          </p>
          <button
            onClick={() => setModalMode('submit')}
            className="inline-block px-6 py-3 bg-red-500 text-white font-black uppercase border-4 border-black hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Submit Your Story
          </button>
        </div>
      </div>

      <Footer />

      <ShareStoryModal
        isOpen={modalMode !== null}
        mode={modalMode ?? 'submit'}
        onClose={() => setModalMode(null)}
        userId={userId}
        isTempAccount={isTempAccount}
        userEmail={userEmail}
        cookieId={cookieId}
        onLoginSuccess={handleLoginSuccess}
        onSignOut={handleSignOut}
      />
      <StoryDetailModal
        isOpen={!!selectedStory}
        story={selectedStory ? { id: selectedStory.storyId, content: selectedStory.text, nickname: selectedStory.storyName ?? 'Anonymous' } : null}
        onClose={() => setSelectedStory(null)}
        onVote={selectedStory && !votedIds.has(selectedStory.storyId) ? handleVote : undefined}
      />
    </main>
  );
}
