'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useState, useRef } from 'react';

interface Story {
  id: string | number;
  content: string;
  nickname: string;
}

interface StoryCardProps {
  story: Story;
  onVote: (direction: 'left' | 'right') => void;
  onCardClick?: () => void;
}

export default function StoryCard({ story, onVote, onCardClick }: StoryCardProps) {
  const [exitX, setExitX] = useState<number | null>(null);
  const didDrag = useRef(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const bg = useTransform(x, [-200, 0, 200], ["#f87171", "#ffffff", "#4ade80"]);

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 10) didDrag.current = true;
    if (info.offset.x > 100) {
      setExitX(200);
      onVote('right');
    } else if (info.offset.x < -100) {
      setExitX(-200);
      onVote('left');
    }
  };

  const handleClick = () => {
    if (!didDrag.current && onCardClick) onCardClick();
    didDrag.current = false;
  };

  return (
    <motion.div
      drag={true}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      style={{ x, rotate, opacity, background: bg }}
      animate={exitX ? { x: exitX, opacity: 0 } : { x: 0, opacity: 1 }}
      onDragStart={() => { didDrag.current = false; }}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      whileTap={{ cursor: "grabbing" }}
      className="absolute inset-0 w-full max-w-md p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl cursor-grab flex flex-col justify-between select-none touch-none"
    >
      <div className="min-h-0 flex flex-col">
        <p className="text-xl font-medium italic text-gray-900 leading-relaxed line-clamp-5 flex-1">
          "{story.content}"
        </p>
      </div>

      <div className="mt-4 flex-shrink-0">
        <p className="text-sm font-black tracking-widest uppercase text-gray-700">
          — {story.nickname}
        </p>

        <div className="flex justify-between mt-6 text-xs font-bold uppercase text-gray-800">
          <span className="text-red-600">I've Had Worse</span>
          <span className="text-green-600">That's Bad</span>
        </div>
      </div>
    </motion.div>
  );
}
