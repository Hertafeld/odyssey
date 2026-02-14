'use client';

import { useState } from 'react';
import StoryCard from '@/components/StoryCard';
import ShareStoryModal from '@/components/ShareStoryModal'; // Import the new modal
import { RefreshCcw, MessageCirclePlus } from 'lucide-react';

const MOCK_STORIES = [
  { id: 1, content: "He brought his mom to our first date. She ordered for him.", nickname: "MommasBoy_Run" },
  { id: 2, content: "She spent 20 minutes explaining why the earth is flat. We were at a planetarium.", nickname: "ScienceGuy" },
  { id: 3, content: "He forgot his wallet, so I paid. Then he asked for the receipt to expense it.", nickname: "CorporateGreed" },
];

export default function Home() {
  const [stories, setStories] = useState(MOCK_STORIES);
  const [activeStory, setActiveStory] = useState(MOCK_STORIES[0]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false); // State for modal

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
    <main className="flex min-h-screen flex-col items-center justify-between bg-yellow-50 overflow-hidden relative p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* --- HEADER (Placeholder for Logo & Timer - We will do this in Phase 4) --- */}
      <div className="z-10 mt-8 text-center h-20">
        <h1 className="text-4xl font-black uppercase tracking-tighter">I've Had Worse</h1>
      </div>

      {/* --- CARD AREA --- */}
      <div className="relative w-full max-w-sm h-[50vh] z-10 flex items-center justify-center my-4">
        {activeStory ? (
          <StoryCard
            key={activeStory.id}
            story={activeStory}
            onVote={handleVote}
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

      {/* --- FOOTER AREA --- */}
      <div className="z-10 w-full max-w-md flex flex-col items-center gap-6 mb-8">

        {/* Placeholder for Vote Buttons (We will do this in Phase 2) */}
        <div className="flex gap-4">
           {/* Temporary Buttons */}
           <div className="w-16 h-16 border-4 border-black rounded-full flex items-center justify-center bg-white">👎</div>
           <div className="w-16 h-16 border-4 border-black rounded-full flex items-center justify-center bg-white">😬</div>
        </div>

        {/* --- THE NEW SHARE BUTTON --- */}
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

      {/* --- MODAL --- */}
      <ShareStoryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </main>
  );
}
