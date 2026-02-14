'use client';

import { useState, useEffect } from 'react';
import StoryCard from '@/components/StoryCard';
import ShareStoryModal from '@/components/ShareStoryModal';
import FullStoryModal from '@/components/FullStoryModal'; // Import new modal
import { RefreshCcw, MessageCirclePlus, ArrowLeft, ArrowRight } from 'lucide-react';

const MOCK_STORIES = [
  { id: 1, content: "He brought his mom to our first date. She ordered for him.", nickname: "MommasBoy_Run" },
  { id: 2, content: "She spent 20 minutes explaining why the earth is flat. We were at a planetarium.", nickname: "ScienceGuy" },
  { id: 3, content: "He forgot his wallet, so I paid. Then he asked for the receipt to expense it.", nickname: "CorporateGreed" },
];

const RIGHT_BUBBLE_TEXTS = ["That sucks!", "That is bad!", "Oh my god..", "Yikes 😬", "Big Oof"];

export default function Home() {
  const [stories, setStories] = useState(MOCK_STORIES);
  const [activeStory, setActiveStory] = useState(MOCK_STORIES[0]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFullStoryOpen, setIsFullStoryOpen] = useState(false); // New State
  const [rightBubbleText, setRightBubbleText] = useState("That is bad!");

  useEffect(() => {
    const randomText = RIGHT_BUBBLE_TEXTS[Math.floor(Math.random() * RIGHT_BUBBLE_TEXTS.length)];
    setRightBubbleText(randomText);
  }, [activeStory]);

  const handleVote = (direction: 'left' | 'right') => {
    // If voting from the modal, close it first
    setIsFullStoryOpen(false);

    setTimeout(() => {
      const nextIndex = stories.indexOf(activeStory) + 1;
      if (nextIndex < stories.length) {
        setActiveStory(stories[nextIndex]);
      } else {
        setActiveStory(null as any);
      }
    }, 200);
  };

  const triggerSwipeLeft = () => handleVote('left');
  const triggerSwipeRight = () => handleVote('right');

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-yellow-50 overflow-hidden relative p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* --- HEADER --- */}
      <div className="z-10 mt-8 text-center h-20">
        <h1 className="text-4xl font-black uppercase tracking-tighter">I'VE HAD WORSE</h1>
      </div>

      {/* --- MAIN AREA --- */}
      <div className="flex w-full max-w-6xl items-center justify-center relative z-10">

        {/* LEFT BUBBLE (Desktop) */}
        <div className="hidden md:flex flex-col items-end mr-8 w-48 opacity-0 animate-in fade-in slide-in-from-right-4 duration-700" style={{ opacity: 1 }}>
          <div className="bg-white border-4 border-black p-4 rounded-xl rounded-br-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-2">
            <p className="font-black text-xl uppercase">I've had worse!</p>
          </div>
          <ArrowRight size={48} className="text-black rotate-180" strokeWidth={3} />
        </div>

        {/* CARD CONTAINER */}
        <div className="relative w-full max-w-lg h-[55vh] flex items-center justify-center my-4">
          {activeStory ? (
            <StoryCard
              key={activeStory.id}
              story={activeStory}
              onVote={handleVote}
              onExpand={() => setIsFullStoryOpen(true)} // Pass click handler
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

        {/* RIGHT BUBBLE (Desktop) */}
        <div className="hidden md:flex flex-col items-start ml-8 w-48 opacity-0 animate-in fade-in slide-in-from-left-4 duration-700" style={{ opacity: 1 }}>
          <div className="bg-white border-4 border-black p-4 rounded-xl rounded-bl-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-2">
            <p className="font-black text-xl uppercase">{rightBubbleText}</p>
          </div>
          <ArrowLeft size={48} className="text-black rotate-180" strokeWidth={3} />
        </div>
      </div>

      {/* --- FOOTER AREA --- */}
      <div className="z-10 w-full max-w-md flex flex-col items-center gap-4 mb-4">
        {activeStory && (
          <div className="flex gap-4 w-full">
            <button
              onClick={triggerSwipeLeft}
              className="flex-1 py-4 bg-red-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all rounded-lg"
            >
              <span className="block font-black text-lg md:text-xl uppercase leading-none">I've Had Worse</span>
            </button>
            <button
              onClick={triggerSwipeRight}
              className="flex-1 py-4 bg-green-500 text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all rounded-lg"
            >
              <span className="block font-black text-lg md:text-xl uppercase leading-none">That's Bad</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setIsShareModalOpen(true)}
          className="group relative w-full mt-2"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-black rounded-lg translate-x-1 translate-y-1"></div>
          <div className="relative bg-white border-4 border-black p-3 rounded-lg flex items-center justify-center gap-3 active:translate-x-1 active:translate-y-1 transition-all">
            <MessageCirclePlus className="w-5 h-5" />
            <span className="font-black uppercase tracking-wider text-base">Share Your Story</span>
          </div>
        </button>
      </div>

      {/* MODALS */}
      <ShareStoryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {activeStory && (
        <FullStoryModal
          isOpen={isFullStoryOpen}
          onClose={() => setIsFullStoryOpen(false)}
          story={activeStory}
          onVote={handleVote}
        />
      )}
    </main>
  );
}
