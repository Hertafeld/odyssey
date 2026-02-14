'use client';

import { X } from 'lucide-react';

interface Story {
  id: number;
  content: string;
  nickname: string;
}

interface FullStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story;
  onVote: (direction: 'left' | 'right') => void;
}

export default function FullStoryModal({ isOpen, onClose, story, onVote }: FullStoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-6 md:p-10 flex flex-col max-h-[90vh]">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all rounded-full"
        >
          <X size={24} />
        </button>

        {/* Content - Scrollable if too long */}
        <div className="flex-grow overflow-y-auto mb-6 pr-2 custom-scrollbar">
          <div className="flex justify-between items-center mb-6">
             <span className="bg-yellow-400 border-2 border-black px-3 py-1 font-bold text-xs uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
               Story #{story.id}
             </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black leading-tight uppercase mb-8">
            "{story.content}"
          </h2>

          <p className="text-lg font-bold text-gray-500 uppercase tracking-wider">
            — Submitted by {story.nickname}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t-4 border-black">
          <button
            onClick={() => onVote('left')}
            className="py-4 bg-red-500 text-white font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all"
          >
            I've Had Worse
          </button>
          <button
            onClick={() => onVote('right')}
            className="py-4 bg-green-500 text-white font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all"
          >
            That's Bad
          </button>
        </div>

      </div>
    </div>
  );
}
