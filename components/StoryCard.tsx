'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { X, Frown } from 'lucide-react';
import { useState } from 'react';

interface Story {
  id: number;
  content: string;
  nickname: string;
}

export default function StoryCard({ story, onVote }: { story: Story, onVote: (direction: 'left' | 'right') => void }) {
  const [exitX, setExitX] = useState<number | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  // Color changes based on drag direction
  const bg = useTransform(x, [-200, 0, 200], ["#f87171", "#ffffff", "#4ade80"]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      setExitX(200);
      onVote('right');
    } else if (info.offset.x < -100) {
      setExitX(-200);
      onVote('left');
    }
  };

  return (
    <motion.div
      drag={true}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // Lock vertical drag
      style={{ x, rotate, opacity, background: bg }}
      animate={exitX ? { x: exitX, opacity: 0 } : { x: 0, opacity: 1 }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: "grabbing" }}
      className="absolute w-full max-w-sm h-[60vh] p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl cursor-grab flex flex-col justify-between select-none touch-none"
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <span className="bg-black text-white px-3 py-1 font-bold text-xs uppercase tracking-widest">
            Date Disaster
          </span>
          <span className="text-4xl">💀</span>
        </div>

        <p className="text-2xl font-bold leading-tight uppercase font-sans mb-4">
          The Story:
        </p>
        <p className="text-xl font-medium italic text-gray-900 leading-relaxed">
          "{story.content}"
        </p>
      </div>

      <div className="mt-4">
        <p className="text-sm font-black tracking-widest uppercase text-gray-500">
          — {story.nickname}
        </p>

        {/* Visual Cues for Swipe */}
        <div className="flex justify-between mt-8 opacity-50 text-xs font-bold uppercase">
          <div className="flex items-center gap-1 text-red-600">
            <X size={16} /> I've Had Worse
          </div>
          <div className="flex items-center gap-1 text-green-600">
            That's Bad <Frown size={16} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
