'use client';

import { useState, useEffect, useRef } from 'react';
import StoryCard from '@/components/StoryCard';
import ShareStoryModal from '@/components/ShareStoryModal';
import StoryDetailModal from '@/components/StoryDetailModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RefreshCcw, MessageCirclePlus } from 'lucide-react';
import { getOrCreateCookieId, clearCookieId } from '@/lib/auth';

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

  const [userId, setUserId] = useState<string | null>(null);
  const [isTempAccount, setIsTempAccount] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cookieId, setCookieId] = useState<string>('');

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
    const cookieId = getOrCreateCookieId();
    if (cookieId) {
      fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookieId }),
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
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      <Header
        isTempAccount={isTempAccount}
        authLoading={authLoading}
        onSignInClick={() => setIsShareModalOpen(true)}
        onSignOut={handleSignOut}
      />

      <div className="flex flex-col items-center flex-1 z-10 p-4 pt-2">
        <h1 className="text-4xl sm:text-6xl font-black text-black uppercase tracking-tighter text-center mt-2 mb-2 drop-shadow-sm">
          I've Had Worse
        </h1>
        <p className="text-lg sm:text-xl font-semibold text-black text-center mb-12 max-w-md">
          Swipe through the worst dates humanity has to offer.
        </p>

        {/* --- CARD AREA --- */}
      <div className="relative w-full max-w-md min-h-[280px] max-h-[38vh] z-10 flex items-center justify-center my-4 flex-shrink-0">
        {((authLoading || storyLoading) && !activeStory) ? (
          <div className="text-center p-8 border-4 border-gray-300 rounded-xl bg-white w-full h-full flex flex-col items-center justify-center">
            <p className="font-semibold text-gray-600">{authLoading ? 'Loading…' : 'Loading story…'}</p>
          </div>
        ) : activeStory ? (
          <StoryCard
            key={activeStory.id}
            story={activeStory}
            onVote={handleVote}
            onCardClick={() => setIsStoryDetailOpen(true)}
          />
        ) : (
          <div className="text-center p-8 border-4 border-gray-300 rounded-xl bg-white w-full h-full flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold uppercase mb-4">No more disasters!</h2>
            <p className="text-sm text-gray-600 mb-4">You’ve seen everything. Check back later or share your own.</p>
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

        {/* --- Share --- */}
        <div className="z-10 w-full max-w-md flex flex-col items-center gap-6 mb-8 mt-6 flex-shrink-0">

        {/* --- SHARE BUTTON --- */}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="group relative w-full"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-black rounded-lg translate-x-1 translate-y-1"></div>
          <div className="relative bg-white border-4 border-black p-4 rounded-lg flex items-center justify-center gap-3 active:translate-x-1 active:translate-y-1 transition-all">
            <MessageCirclePlus className="w-6 h-6" />
            <span className="font-black uppercase tracking-wider text-lg">Share Your Story</span>
          </div>
        </button>
        </div>
      </div>

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
