'use client';

import { X } from 'lucide-react';

export interface StoryForModal {
  id: string | number;
  content: string;
  nickname: string;
}

interface StoryDetailModalProps {
  isOpen: boolean;
  story: StoryForModal | null;
  onClose: () => void;
  onVote?: (direction: 'left' | 'right') => void;
}

export default function StoryDetailModal({ isOpen, story, onClose, onVote }: StoryDetailModalProps) {
  if (!isOpen || !story) return null;

  const handleVote = (direction: 'left' | 'right') => {
    onVote?.(direction);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl flex flex-col"
        style={{ maxHeight: 'calc(100vh - 3rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1 hover:bg-gray-100 rounded border-2 border-transparent hover:border-black transition-all"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Scrollable story content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 pr-14">
          <p className="text-xl font-medium italic text-gray-900 leading-relaxed mb-6">
            <span className="text-4xl font-serif leading-none text-gray-300 mr-0.5">&ldquo;</span>{story.content}<span className="text-4xl font-serif leading-none text-gray-300 ml-0.5">&rdquo;</span>
          </p>
          <p className="text-sm font-black tracking-widest uppercase text-black">
            — {story.nickname}
          </p>
        </div>

        {/* Vote buttons pinned at the bottom (only when onVote is provided) */}
        {onVote && (
          <div className="flex-shrink-0 border-t border-gray-200 p-4 sm:p-6 flex gap-4">
            <button
              onClick={() => handleVote('left')}
              className="group relative flex-1"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-black rounded-lg translate-x-1 translate-y-1" />
              <div className="relative bg-white border-4 border-red-500 py-3 px-4 rounded-lg flex items-center justify-center font-black uppercase tracking-wider text-red-800 hover:bg-red-50 active:translate-x-1 active:translate-y-1 transition-all">
                I've Had Worse
              </div>
            </button>
            <button
              onClick={() => handleVote('right')}
              className="group relative flex-1"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-black rounded-lg translate-x-1 translate-y-1" />
              <div className="relative bg-white border-4 border-yellow-500 py-3 px-4 rounded-lg flex items-center justify-center font-black uppercase tracking-wider text-yellow-800 hover:bg-yellow-50 active:translate-x-1 active:translate-y-1 transition-all">
                That's Bad
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
