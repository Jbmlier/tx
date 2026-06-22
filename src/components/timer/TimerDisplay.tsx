import React, { useState } from 'react';
import type { BlindLevel, ClubTheme } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TimerDisplayProps {
  remainingSeconds: number;
  currentLevel: BlindLevel | undefined;
  nextLevel: BlindLevel | undefined;
  isPlaying: boolean;
  isUrgent: boolean;
  theme: ClubTheme;
  onTimerClick: () => void;
  onTimerDoubleClick: (minutes: number) => void;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  remainingSeconds,
  currentLevel,
  nextLevel,
  isUrgent,
  theme,
  onTimerClick,
  onTimerDoubleClick,
}) => {
  const [showSetTime, setShowSetTime] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  const m = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
  const s = String(remainingSeconds % 60).padStart(2, '0');

  const handleDoubleClick = () => {
    const curMins = Math.floor(remainingSeconds / 60);
    setCustomMinutes(String(curMins));
    setShowSetTime(true);
  };

  const handleSetTime = () => {
    const mins = parseInt(customMinutes);
    if (!isNaN(mins) && mins >= 0 && mins <= 999) {
      onTimerDoubleClick(mins);
      setShowSetTime(false);
    }
  };

  const getNextText = () => {
    if (!nextLevel) return '— 已到达最后一个级别 —';
    if (nextLevel.isBreak) return `下一级别: ☕ 中场休息 • ${nextLevel.duration} 分钟`;
    return `下一级别: 级别 ${nextLevel.id} • 盲注 ${nextLevel.sb} / ${nextLevel.bb} • 前注 ${nextLevel.ante}`;
  };

  return (
    <>
      <div
        className="rounded-2xl p-6 md:p-10 text-center flex flex-col items-center justify-center gap-4 relative"
        style={{
          background: 'var(--bg-panel)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={onTimerClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* 状态指示 */}
        <div
          className="absolute top-4 right-5 flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)' }}
        >
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{
              background: isUrgent ? theme.dangerColor : theme.accentColor,
              boxShadow: isUrgent ? theme.dangerGlow : `0 0 8px ${theme.accentColor}`,
            }}
          />
          <span style={{ color: 'var(--text-muted)' }}>
            {isUrgent ? '危急' : '计时中'}
          </span>
        </div>

        {/* 级别标签 */}
        <div
          className="px-4 py-1 rounded-full text-sm font-bold mb-1"
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
          }}
        >
          {currentLevel?.isBreak ? '☕ COFFEE BREAK' : `级别 ${currentLevel?.id}`}
        </div>

        {/* 大计时器 */}
        <div
          className="font-mono font-bold leading-none select-none transition-transform active:scale-[0.97]"
          style={{
            fontSize: 'clamp(4.5rem, 12vw, 7.5rem)',
            letterSpacing: '-2px',
            color: isUrgent ? theme.dangerColor : (currentLevel?.isBreak ? theme.accentColor : 'var(--text-main)'),
            textShadow: isUrgent
              ? `0 0 20px ${theme.dangerGlow}`
              : currentLevel?.isBreak
                ? `0 0 15px ${theme.accentGlow}`
                : '0 0 15px rgba(255,255,255,0.1)',
          }}
        >
          {m}:{s}
        </div>

        {/* 盲注显示 */}
        <div className="w-full">
          {currentLevel?.isBreak ? (
            <div className="text-3xl md:text-5xl font-extrabold" style={{ color: theme.accentColor, textShadow: `0 0 12px ${theme.accentGlow}` }}>
              中场休息
            </div>
          ) : (
            <>
              <div
                className="text-2xl md:text-4xl font-extrabold mb-2"
                style={{ color: theme.primaryColor, textShadow: `0 0 12px ${theme.primaryGlow}` }}
              >
                {currentLevel?.sb} / {currentLevel?.bb}
              </div>
              <div
                className="inline-block px-5 py-1.5 rounded-lg text-base font-semibold"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}
              >
                前注: {currentLevel?.ante}
              </div>
            </>
          )}
        </div>

        {/* 下一级别预览 */}
        <div
          className="w-full mt-4 pt-3 text-sm"
          style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}
        >
          {getNextText()}
        </div>
      </div>

      {/* 设置时间弹窗 */}
      <Dialog open={showSetTime} onOpenChange={setShowSetTime}>
        <DialogContent className="sm:max-w-md" style={{ background: 'var(--bg-panel-solid)', border: '1px solid var(--border-color)' }}>
          <DialogHeader>
            <DialogTitle className="text-white">设置倒计时</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-muted)' }}>
              设置当前级别剩余时间（分钟）：
            </label>
            <Input
              type="number"
              min={0}
              max={999}
              value={customMinutes}
              onChange={e => setCustomMinutes(e.target.value)}
              className="text-lg"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }}
              onKeyDown={e => e.key === 'Enter' && handleSetTime()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetTime(false)}>取消</Button>
            <Button
              onClick={handleSetTime}
              style={{ background: theme.primaryColor, color: '#000' }}
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimerDisplay;
