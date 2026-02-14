'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useState } from 'react';

interface Story {
  id: number;
  content: string;
  nickname: string;
}

interface StoryCardProps {
  story: Story;
  onVote: (direction: 'left' | 'right') => void;
  onExpand: () => void; // New prop to handle click
}

export default function StoryCard({ story, onVote, onExpand }: StoryCardProps) {
  const [exitX, setExitX] = useState<number | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  // 1. REMOVED OPACITY TRANSFORM (Stays visible during drag)
  // 2. Background color shift on drag
  const bg = useTransform(x, [-150, 0, 150], ["#fca5a5", "#ffffff", "#86efac"]);
  const borderColor = useTransform(x, [-150, 0, 150], ["#b91c1c", "#000000", "#15803d"]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    // Threshold to trigger vote
    if (info.offset.x > 100) {
      setExitX(300); // Fly off screen
      onVote('right');
    } else if (info.offset.x < -100) {
      setExitX(-300); // Fly off screen
      onVote('left');
    }
  };

  return (
    <motion.div
      drag={true}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      style={{ x, rotate, background: bg, borderColor: borderColor }}
      // Only fade out when actually exiting (voted), not during drag
      animate={exitX ? { x: exitX, opacity: 0 } : { x: 0, opacity: 1 }}
      onDragEnd={handleDragEnd}
      onTap={(event, info) => {
        // Only trigger expand if it was a tap, not a drag release
        if (Math.abs(info.offset.x) < 10 && Math.abs(info.offset.y) < 10) {
          onExpand();
        }
      }}
      whileTap={{ scale: 0.98, cursor: "grabbing" }}
      className="absolute w-full max-w-lg h-[60vh] p-8 md:p-12 border-[5px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-3xl cursor-grab flex flex-col justify-between select-none touch-none bg-white z-20"
    >
      {/* Decorative Header */}
      <div className="flex justify-between items-start pointer-events-none">
        <div className="flex gap-2">
           <div className="w-3 h-3 rounded-full bg-red-500 border border-black"></div>
           <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black"></div>
           <div className="w-3 h-3 rounded-full bg-green-500 border border-black"></div>
        </div>
        <span className="font-black text-gray-300 text-4xl">#0{story.id}</span>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center pointer-events-none">
        <p className="text-3xl md:text-4xl font-black leading-tight text-center text-black drop-shadow-sm line-clamp-6">
          "{story.content}"
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 border-t-4 border-black pt-4 pointer-events-none">
        <p className="text-sm font-bold tracking-widest uppercase text-gray-500 mb-1">
          Submitted by:
        </p>
        <p className="text-xl font-black uppercase text-black">
          {story.nickname}
        </p>
        <p className="text-xs font-bold text-gray-400 mt-2 uppercase text-center">
          (Tap card to read full story)
        </p>
      </div>
    </motion.div>
  );
}
