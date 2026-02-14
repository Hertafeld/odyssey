'use client';

import { X } from 'lucide-react';

export interface StoryForModal {
  id: number;
  content: string;
  nickname: string;
}

interface StoryDetailModalProps {
  isOpen: boolean;
  story: StoryForModal | null;
  onClose: () => void;
  onVote: (direction: 'left' | 'right') => void;
}

export default function StoryDetailModal({ isOpen, story, onClose, onVote }: StoryDetailModalProps) {
  if (!isOpen || !story) return null;

  const handleVote = (direction: 'left' | 'right') => {
    onVote(direction);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded border-2 border-transparent hover:border-black transition-all"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="pr-10">
          <p className="text-xl font-medium italic text-gray-900 leading-relaxed mb-6">
            "{story.content}"
          </p>
          <p className="text-sm font-black tracking-widest uppercase text-gray-700 mb-8">
            — {story.nickname}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => handleVote('left')}
            className="flex-1 py-3 px-4 border-2 border-red-700 bg-red-50 font-black uppercase text-sm text-red-900 hover:bg-red-100 transition-colors rounded-lg"
          >
            I've Had Worse
          </button>
          <button
            onClick={() => handleVote('right')}
            className="flex-1 py-3 px-4 border-2 border-green-700 bg-green-50 font-black uppercase text-sm text-green-900 hover:bg-green-100 transition-colors rounded-lg"
          >
            That's Bad
          </button>
        </div>
      </div>
    </div>
  );
}
