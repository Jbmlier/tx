import React from 'react';
import type { ClubTheme } from '@/types';
import { Button } from '@/components/ui/button';

interface ControlsRowProps {
  isPlaying: boolean;
  theme: ClubTheme;
  onPrev: () => void;
  onToggle: () => void;
  onNext: () => void;
}

const ControlsRow: React.FC<ControlsRowProps> = ({ isPlaying, theme, onPrev, onToggle, onNext }) => {
  return (
    <div className="flex justify-center items-center gap-5 my-2">
      <Button
        variant="outline"
        size="icon"
        className="w-13 h-13 rounded-full text-lg"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}
        onClick={onPrev}
        title="上一级别"
      >
        ⏮️
      </Button>
      <Button
        className="w-18 h-18 rounded-full text-2xl border-none cursor-pointer"
        size="icon"
        style={{
          background: isPlaying ? theme.dangerColor : theme.accentColor,
          boxShadow: `0 4px 15px ${isPlaying ? theme.dangerGlow : theme.accentGlow}`,
          color: '#fff',
        }}
        onClick={onToggle}
        title="播放/暂停"
      >
        {isPlaying ? '❚❚' : '▶'}
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="w-13 h-13 rounded-full text-lg"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}
        onClick={onNext}
        title="下一级别"
      >
        ⏭️
      </Button>
    </div>
  );
};

export default ControlsRow;
