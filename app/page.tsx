'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import StoryCard from '@/components/StoryCard';
import ShareStoryModal from '@/components/ShareStoryModal';
import StoryDetailModal from '@/components/StoryDetailModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RefreshCcw, MessageCirclePlus } from 'lucide-react';
import { getOrCreateCookieId, clearCookieId } from '@/lib/auth';
import { useCountdown } from '@/lib/useCountdown';

export type AppStory = { id: string; content: string; nickname: string };

function mapApiStoryToApp(data: { storyId: string; text: string; storyName?: string | null }): AppStory {
  return {
    id: data.storyId,
    content: data.text,
    nickname: data.storyName ?? 'Anonymous',
  };
}

export default function Home() {
  const [activeStory, setActiveStory] = useState<AppStory | null>(null);
  const [nextStory, setNextStory] = useState<AppStory | null>(null);
  const [storyLoading, setStoryLoading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isStoryDetailOpen, setIsStoryDetailOpen] = useState(false);
  const lastPrefetchIdRef = useRef<string | null>(null);

  const { days, hours, minutes, seconds, done: countdownDone } = useCountdown();
  const [mounted, setMounted] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [isTempAccount, setIsTempAccount] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cookieId, setCookieId] = useState<string>('');

  useEffect(() => setMounted(true), []);

  const pad = (n: number) => String(n).padStart(2, '0');

  useEffect(() => {
    const cid = getOrCreateCookieId();
    setCookieId(cid);
    if (!cid) {
      setAuthLoading(false);
      return;
    }
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
    setActiveStory(null);
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
            setIsTempAccount(true);
            fetchNextStory(data.userId);
          }
        });
    }
  };

  const fetchNextStory = async (
    uid: string,
    options?: { excludeStoryIds?: string[]; forPreload?: boolean }
  ) => {
    const { excludeStoryIds, forPreload } = options ?? {};
    if (!forPreload) setStoryLoading(true);
    try {
      const res = await fetch('/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          ...(excludeStoryIds?.length ? { excludeStoryIds } : {}),
        }),
      });
      const data = await res.json();
      const story = data.success && data.hasStory && data.story ? mapApiStoryToApp(data.story) : null;
      if (forPreload) {
        setNextStory(story);
      } else {
        setActiveStory(story);
        setNextStory(null);
      }
    } finally {
      if (!forPreload) setStoryLoading(false);
    }
  };

  useEffect(() => {
    if (userId && !authLoading) fetchNextStory(userId);
  }, [userId, authLoading]);

  // Pre-fetch next story when we have one on screen (so no loading after vote)
  useEffect(() => {
    if (!userId || !activeStory || nextStory !== null) return;
    if (lastPrefetchIdRef.current === activeStory.id) return;
    lastPrefetchIdRef.current = activeStory.id;
    fetchNextStory(userId, { excludeStoryIds: [activeStory.id], forPreload: true });
  }, [userId, activeStory?.id, nextStory]);

  const handleVote = (direction: 'left' | 'right') => {
    const currentStory = activeStory;
    const uid = userId;
    const cachedNext = nextStory;
    if (!currentStory || !uid) return;
    const vote = direction === 'left' ? 'ive_had_worse' : 'sucks';
    fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId: currentStory.id, userId: uid, vote }),
    }).catch(() => {});
    lastPrefetchIdRef.current = null;
    setTimeout(() => {
      if (cachedNext) {
        setActiveStory(cachedNext);
        setNextStory(null);
        // Pre-fetch will run from effect (activeStory changed, nextStory null)
      } else {
        setActiveStory(null);
        fetchNextStory(uid);
      }
    }, 200);
  };

  return (
    <main className="flex min-h-screen flex-col bg-yellow-50 overflow-hidden relative">
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />

      <Header
        isTempAccount={isTempAccount}
        authLoading={authLoading}
        onSignInClick={() => setIsShareModalOpen(true)}
        onSignOut={handleSignOut}
      />

      <div className="flex flex-col items-center flex-1 z-10 p-4 pt-0">
        <div className="mt-0 mb-4 flex justify-center">
          <Image
            src="/ive-hard-worse-logo-transparent.png"
            alt="I've Had Worse"
            width={1000}
            height={600}
            className="h-32 w-auto object-contain sm:h-40 md:h-48"
            priority
          />
        </div>

        {/* Countdown */}
        <div className="flex flex-col items-center mb-2">
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

        {/* Card area with swipe labels */}
        <div className="w-full max-w-2xl flex items-center justify-center gap-3 sm:gap-6 my-4 flex-shrink-0 z-10">
          {activeStory && (
            <span className="text-red-600 font-black uppercase tracking-wider text-xs sm:text-sm flex-shrink-0 text-center w-14 sm:w-20 leading-tight">
              I've Had Worse
            </span>
          )}
          <div className="relative w-full max-w-md min-h-[280px] max-h-[38vh] flex items-center justify-center flex-shrink-0">
        {activeStory ? (
          <StoryCard
            key={activeStory.id}
            story={activeStory}
            onVote={handleVote}
            onCardClick={() => setIsStoryDetailOpen(true)}
          />
        ) : (
          <div className="text-center p-8 border-4 border-gray-300 rounded-xl bg-white w-full h-full flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold uppercase mb-4">No more disasters!</h2>
            <p className="text-sm text-black mb-4">You’ve seen everything. Check back later or share your own.</p>
            <button
              onClick={() => userId && fetchNextStory(userId)}
              disabled={!userId || storyLoading}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold uppercase hover:bg-gray-800 transition-colors disabled:opacity-60"
            >
              <RefreshCcw size={18} /> Try again
            </button>
          </div>
        )}
          </div>
          {activeStory && (
            <span className="text-yellow-600 font-black uppercase tracking-wider text-xs sm:text-sm flex-shrink-0 text-center w-14 sm:w-20 leading-tight">
              That's Bad
            </span>
          )}
        </div>

        {/* Vote buttons */}
        {activeStory && (
          <div className="flex gap-3 sm:gap-4 w-full max-w-md justify-center flex-shrink-0 mt-2 px-2">
            <button
              onClick={() => handleVote('left')}
              className="group relative flex-1"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-black rounded-lg translate-x-1 translate-y-1" />
              <div className="relative bg-white border-2 sm:border-4 border-red-500 py-2.5 px-3 sm:py-3 sm:px-4 rounded-lg flex items-center justify-center font-black uppercase whitespace-nowrap text-xs sm:text-base tracking-tight sm:tracking-wider text-red-800 hover:bg-red-50 active:translate-x-1 active:translate-y-1 transition-all">
                I've Had Worse
              </div>
            </button>
            <button
              onClick={() => handleVote('right')}
              className="group relative flex-1"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-black rounded-lg translate-x-1 translate-y-1" />
              <div className="relative bg-white border-2 sm:border-4 border-yellow-500 py-2.5 px-3 sm:py-3 sm:px-4 rounded-lg flex items-center justify-center font-black uppercase whitespace-nowrap text-xs sm:text-base tracking-tight sm:tracking-wider text-yellow-800 hover:bg-yellow-50 active:translate-x-1 active:translate-y-1 transition-all">
                That's Bad
              </div>
            </button>
          </div>
        )}

        {/* Share button */}
        <div className="z-10 w-full max-w-md flex flex-col items-center gap-6 mb-8 mt-6 flex-shrink-0">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="group relative w-full"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-black rounded-lg translate-x-1 translate-y-1" />
            <div className="relative bg-white border-4 border-black p-4 rounded-lg flex items-center justify-center gap-3 active:translate-x-1 active:translate-y-1 transition-all">
              <MessageCirclePlus className="w-6 h-6" />
              <span className="font-black uppercase tracking-wider text-lg">Share Your Story</span>
            </div>
          </button>
        </div>
      </div>

      {/* About section */}
      <section className="w-full bg-yellow-100 border-t border-yellow-200 z-10">
        <div className="mx-auto max-w-2xl px-6 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-black mb-4">
            What is I've Had Worse?
          </h2>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
            We all have that one date story we can't believe actually happened.
            <strong> I've Had Worse</strong> is the place to share yours — anonymously.
            Read through real stories submitted by real people, swipe to vote, and
            find out if the internet thinks your disaster was truly terrible or just
            another Tuesday.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left mt-8">
            <div>
              <h3 className="font-black uppercase text-black text-sm tracking-wider mb-1">Read</h3>
              <p className="text-sm text-gray-600">Swipe through anonymous dating horror stories submitted by the community.</p>
            </div>
            <div>
              <h3 className="font-black uppercase text-black text-sm tracking-wider mb-1">Vote</h3>
              <p className="text-sm text-gray-600">Think it's not that bad? Hit <em>"I've Had Worse."</em> Truly awful? Smash <em>"That's Bad."</em></p>
            </div>
            <div>
              <h3 className="font-black uppercase text-black text-sm tracking-wider mb-1">Share</h3>
              <p className="text-sm text-gray-600">Submit your own story and see how it stacks up on the leaderboard.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <ShareStoryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        userId={userId}
        isTempAccount={isTempAccount}
        userEmail={userEmail}
        cookieId={cookieId}
        onLoginSuccess={handleLoginSuccess}
        onSignOut={handleSignOut}
      />
      <StoryDetailModal
        isOpen={isStoryDetailOpen}
        story={activeStory}
        onClose={() => setIsStoryDetailOpen(false)}
        onVote={handleVote}
      />
    </main>
  );
}
