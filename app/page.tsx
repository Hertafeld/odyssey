'use client';

import { useState } from 'react';
import StoryCard from '@/components/StoryCard';
import ShareStoryModal from '@/components/ShareStoryModal';
import StoryDetailModal from '@/components/StoryDetailModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RefreshCcw, MessageCirclePlus } from 'lucide-react';

const MOCK_STORIES = [
  { id: 1, content: "He brought his mom to our first date. She ordered for him.", nickname: "MommasBoy_Run" },
  { id: 2, content: "She spent 20 minutes explaining why the earth is flat. We were at a planetarium.", nickname: "ScienceGuy" },
  { id: 3, content: "He forgot his wallet, so I paid. Then he asked for the receipt to expense it.", nickname: "CorporateGreed" },
];

export default function Home() {
  const [stories, setStories] = useState(MOCK_STORIES);
  const [activeStory, setActiveStory] = useState(MOCK_STORIES[0]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isStoryDetailOpen, setIsStoryDetailOpen] = useState(false);

  const handleVote = (direction: 'left' | 'right') => {
    setTimeout(() => {
      const nextIndex = stories.indexOf(activeStory) + 1;
      if (nextIndex < stories.length) {
        setActiveStory(stories[nextIndex]);
      } else {
        setActiveStory(null as any);
      }
    }, 200);
  };

  return (
    <main className="flex min-h-screen flex-col bg-yellow-50 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      <Header />

      <div className="flex flex-col items-center flex-1 z-10 p-4 pt-2">
        <h1 className="text-4xl sm:text-6xl font-black text-black uppercase tracking-tighter text-center mt-2 mb-2 drop-shadow-sm">
          I've Had Worse
        </h1>
        <p className="text-lg sm:text-xl font-semibold text-black text-center mb-12 max-w-md">
          Swipe through the worst dates humanity has to offer.
        </p>

        {/* --- CARD AREA (with swipe labels on the sides) --- */}
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
            <button
              onClick={() => { setStories(MOCK_STORIES); setActiveStory(MOCK_STORIES[0]); }}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold uppercase hover:bg-gray-800 transition-colors"
            >
              <RefreshCcw size={18} /> Start Over
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

        {/* --- Vote buttons --- */}
        {activeStory && (
          <div className="flex gap-4 w-full max-w-md justify-center flex-shrink-0 mt-2">
            <button
              onClick={() => handleVote('left')}
              className="group relative flex-1 max-w-[200px]"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-black rounded-lg translate-x-1 translate-y-1" />
              <div className="relative bg-white border-4 border-red-500 py-3 px-4 rounded-lg flex items-center justify-center font-black uppercase tracking-wider text-red-800 hover:bg-red-50 active:translate-x-1 active:translate-y-1 transition-all">
                I've Had Worse
              </div>
            </button>
            <button
              onClick={() => handleVote('right')}
              className="group relative flex-1 max-w-[200px]"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-black rounded-lg translate-x-1 translate-y-1" />
              <div className="relative bg-white border-4 border-yellow-500 py-3 px-4 rounded-lg flex items-center justify-center font-black uppercase tracking-wider text-yellow-800 hover:bg-yellow-50 active:translate-x-1 active:translate-y-1 transition-all">
                That's Bad
              </div>
            </button>
          </div>
        )}

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
