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
  const bg = useTransform(x, [-200, 0, 200], ["#ef4444", "#ffffff", "#eab308"]);

  const handleDrag = (_event: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 5 || Math.abs(info.offset.y) > 5) {
      didDrag.current = true;
    }
  };

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
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
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      style={{ x, rotate, opacity, background: bg }}
      animate={exitX ? { x: exitX, opacity: 0 } : { x: 0, opacity: 1 }}
      onDragStart={() => { didDrag.current = false; }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      whileTap={{ cursor: "grabbing" }}
      className="absolute inset-0 w-full max-w-md p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl cursor-grab flex flex-col justify-between select-none touch-none"
    >
      <div className="min-h-0 flex flex-col">
        <p className="text-xl font-medium italic text-gray-900 leading-relaxed line-clamp-5 flex-1">
          <span className="text-4xl font-serif leading-none text-gray-300 mr-0.5">&ldquo;</span>{story.content}<span className="text-4xl font-serif leading-none text-gray-300 ml-0.5">&rdquo;</span>
        </p>
      </div>

      <div className="mt-4 flex-shrink-0">
        <p className="text-sm font-black tracking-widest uppercase text-black">
          — {story.nickname}
        </p>
      </div>
    </motion.div>
  );
}
