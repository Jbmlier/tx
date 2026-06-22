import React from 'react';

interface StatsPanelProps {
  entries: number;
  playersLeft: number;
  startingChips: number;
  totalChips: number;
  avgChips: number;
  elapsed: string;
  onAdjust: (field: 'entries' | 'playersLeft' | 'startingChips', amount: number) => void;
}

const StatCard: React.FC<{
  label: string;
  value: string;
  gold?: boolean;
  controls?: React.ReactNode;
}> = ({ label, value, gold, controls }) => (
  <div
    className="rounded-xl p-3 flex flex-col"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
  >
    <span className="text-xs mb-1 flex justify-between items-center" style={{ color: 'var(--text-muted)' }}>
      {label}
      {controls}
    </span>
    <span className={`text-xl md:text-2xl font-bold ${gold ? 'text-[var(--color-gold)]' : 'text-white'}`}>
      {value}
    </span>
  </div>
);

const AdjustBtn: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="w-6 h-6 rounded text-xs font-bold flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: 'white' }}
  >
    {label}
  </button>
);

const StatsPanel: React.FC<StatsPanelProps> = ({
  entries,
  playersLeft,
  startingChips,
  totalChips,
  avgChips,
  elapsed,
  onAdjust,
}) => {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'var(--bg-panel)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
      }}
    >
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
        <span>📊</span> 赛事筹码分析
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
        <StatCard
          label="总买入人次"
          value={String(entries)}
          controls={
            <span className="flex gap-1">
              <AdjustBtn label="-" onClick={() => onAdjust('entries', -1)} />
              <AdjustBtn label="+" onClick={() => onAdjust('entries', 1)} />
            </span>
          }
        />
        <StatCard
          label="剩余人数"
          value={String(playersLeft)}
          controls={
            <span className="flex gap-1">
              <AdjustBtn label="-" onClick={() => onAdjust('playersLeft', -1)} />
              <AdjustBtn label="+" onClick={() => onAdjust('playersLeft', 1)} />
            </span>
          }
        />
        <StatCard
          label="初始筹码"
          value={startingChips.toLocaleString()}
          controls={
            <span className="flex gap-1">
              <AdjustBtn label="-1k" onClick={() => onAdjust('startingChips', -1000)} />
              <AdjustBtn label="+1k" onClick={() => onAdjust('startingChips', 1000)} />
            </span>
          }
        />
        <StatCard label="平均筹码" value={avgChips.toLocaleString()} gold />
      </div>
      <div className="flex gap-2 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        <div className="flex-1 p-2 rounded-md" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)' }}>
          总筹码量: <span className="text-white font-bold">{totalChips.toLocaleString()}</span>
        </div>
        <div className="flex-1 p-2 rounded-md" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)' }}>
          赛事总耗时: <span className="text-white font-bold">{elapsed}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
