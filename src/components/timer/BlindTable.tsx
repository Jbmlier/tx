import React, { useState } from 'react';
import type { BlindLevel, ClubTheme, TournamentTemplate } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BlindTableProps {
  structure: BlindLevel[];
  currentLevelIndex: number;
  theme: ClubTheme;
  onUpdateCell: (idx: number, field: string, val: number) => void;
  onDeleteRow: (idx: number) => void;
  onAddRow: (isBreak: boolean) => void;
  onLoadPreset: (levels: BlindLevel[]) => void;
  presets: { id: string; name: string; levels: BlindLevel[] }[];
  clubTemplates?: TournamentTemplate[];
  onLoadTemplate?: (template: TournamentTemplate) => void;
}

const BlindTable: React.FC<BlindTableProps> = ({
  structure,
  currentLevelIndex,
  theme,
  onUpdateCell,
  onDeleteRow,
  onAddRow,
  onLoadPreset,
  presets,
  clubTemplates = [],
  onLoadTemplate,
}) => {
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkMinutes, setBulkMinutes] = useState('15');
  const [genDialogOpen, setGenDialogOpen] = useState(false);
  const [genLevels, setGenLevels] = useState('8');
  const [genBaseSb, setGenBaseSb] = useState('100');
  const [genDuration, setGenDuration] = useState('15');
  const [genBreakAfter, setGenBreakAfter] = useState('4');
  const [selectedPreset, setSelectedPreset] = useState('custom');

  const handleLoadPreset = (presetId: string) => {
    if (presetId === 'custom') return;
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    onLoadPreset(preset.levels);
    setSelectedPreset('custom');
  };

  const handleBulkApply = () => {
    const mins = parseInt(bulkMinutes);
    if (isNaN(mins) || mins < 1) return;
    structure.forEach((row, idx) => {
      if (!row.isBreak) onUpdateCell(idx, 'duration', mins);
    });
    setBulkDialogOpen(false);
  };

  const handleGenerate = () => {
    const n = parseInt(genLevels);
    if (isNaN(n) || n < 1) return;
    const baseSb = parseInt(genBaseSb) || 100;
    const baseDuration = parseInt(genDuration) || 15;
    const breakAfter = parseInt(genBreakAfter) || 0;

    const newStructure: BlindLevel[] = [];
    let sb = baseSb;
    let id = 1;
    for (let i = 0; i < n; i++) {
      newStructure.push({
        id: id++,
        sb,
        bb: sb * 2,
        ante: sb * 2,
        duration: baseDuration,
        isBreak: false,
      });
      sb *= 2;
      if (breakAfter > 0 && (i + 1) % breakAfter === 0 && i < n - 1) {
        newStructure.push({ id: '休息', sb: 0, bb: 0, ante: 0, duration: 10, isBreak: true });
      }
    }
    onLoadPreset(newStructure);
    setGenDialogOpen(false);
  };

  return (
    <>
      <div
        className="rounded-2xl p-5 flex flex-col flex-1 overflow-hidden"
        style={{
          background: 'var(--bg-panel)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        }}
      >
        {/* 表头 */}
        <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <span>⏳</span> 盲注结构编辑
          </h3>
          <div className="flex gap-2">
            {clubTemplates.length > 0 && onLoadTemplate && (
              <select
                className="text-sm rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                style={{ background: 'rgba(251,191,36,0.1)', border: `1px solid ${theme.primaryColor}40`, color: theme.primaryColor }}
                onChange={e => {
                  const t = clubTemplates.find(tmpl => tmpl.id === e.target.value);
                  if (t) onLoadTemplate(t);
                  e.target.value = '';
                }}
                defaultValue=""
              >
                <option value="" disabled>🏆 赛事模板</option>
                {clubTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
            <select
              className="text-sm rounded-lg px-3 py-1.5 outline-none cursor-pointer"
              style={{ background: 'var(--bg-panel-solid)', border: '1px solid var(--border-color)', color: 'white' }}
              value={selectedPreset}
              onChange={e => {
                setSelectedPreset(e.target.value);
                handleLoadPreset(e.target.value);
              }}
            >
              <option value="custom">自定义结构</option>
              {presets.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 表格 */}
        <div className="flex-1 overflow-y-auto rounded-lg mb-4" style={{ border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.25)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#0f172a' }}>
                <th className="w-[10%] text-center py-2 px-2 sticky top-0 z-10 text-xs" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>级</th>
                <th className="w-[22%] text-left py-2 px-2 sticky top-0 z-10 text-xs" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>小盲 (SB)</th>
                <th className="w-[22%] text-left py-2 px-2 sticky top-0 z-10 text-xs" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>大盲 (BB)</th>
                <th className="w-[18%] text-left py-2 px-2 sticky top-0 z-10 text-xs" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>前注</th>
                <th className="w-[14%] text-left py-2 px-2 sticky top-0 z-10 text-xs" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>时间(分)</th>
                <th className="w-[10%] text-center py-2 px-2 sticky top-0 z-10 text-xs" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>✕</th>
              </tr>
            </thead>
            <tbody>
              {structure.map((row, idx) => {
                const isActive = idx === currentLevelIndex;
                const isBreak = row.isBreak;
                return (
                  <tr
                    key={idx}
                    className="transition-colors"
                    style={{
                      background: isActive ? `${theme.primaryColor}15` : isBreak ? `${theme.accentColor}08` : 'transparent',
                      borderLeft: isActive ? `3px solid ${theme.primaryColor}` : '3px solid transparent',
                    }}
                  >
                    <td className="text-center py-1.5 px-2 font-medium" style={{ color: isActive ? theme.primaryColor : isBreak ? theme.accentColor : 'inherit' }}>
                      {row.id}
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="number"
                        value={row.sb}
                        disabled={isBreak}
                        onChange={e => onUpdateCell(idx, 'sb', parseInt(e.target.value) || 0)}
                        className="w-full bg-transparent border border-transparent rounded px-1 py-0.5 text-sm focus:outline-none focus:bg-[var(--bg-panel-solid)] focus:border-[var(--color-gold)] disabled:opacity-30"
                        style={{ color: 'inherit' }}
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="number"
                        value={row.bb}
                        disabled={isBreak}
                        onChange={e => onUpdateCell(idx, 'bb', parseInt(e.target.value) || 0)}
                        className="w-full bg-transparent border border-transparent rounded px-1 py-0.5 text-sm focus:outline-none focus:bg-[var(--bg-panel-solid)] focus:border-[var(--color-gold)] disabled:opacity-30"
                        style={{ color: 'inherit' }}
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="number"
                        value={row.ante}
                        disabled={isBreak}
                        onChange={e => onUpdateCell(idx, 'ante', parseInt(e.target.value) || 0)}
                        className="w-full bg-transparent border border-transparent rounded px-1 py-0.5 text-sm focus:outline-none focus:bg-[var(--bg-panel-solid)] focus:border-[var(--color-gold)] disabled:opacity-30"
                        style={{ color: 'inherit' }}
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="number"
                        value={row.duration}
                        onChange={e => onUpdateCell(idx, 'duration', parseInt(e.target.value) || 0)}
                        className="w-full bg-transparent border border-transparent rounded px-1 py-0.5 text-sm focus:outline-none focus:bg-[var(--bg-panel-solid)] focus:border-[var(--color-gold)]"
                        style={{ color: 'inherit' }}
                      />
                    </td>
                    <td className="text-center py-1 px-1">
                      <button
                        onClick={() => onDeleteRow(idx)}
                        className="text-sm hover:text-red-500 transition-colors"
                        style={{ color: 'var(--text-dim)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => onAddRow(false)}>
            + 增加一级
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => onAddRow(true)}>
            ☕ 增加休息
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setBulkDialogOpen(true)}>
            🕐 批量设时
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setGenDialogOpen(true)}>
            ⚡ 自动生成
          </Button>
        </div>
      </div>

      {/* 批量设时弹窗 */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="sm:max-w-md" style={{ background: 'var(--bg-panel-solid)', border: '1px solid var(--border-color)' }}>
          <DialogHeader>
            <DialogTitle className="text-white">批量设置时长</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-muted)' }}>
              请输入每个级别的时长（分钟）：
            </label>
            <Input
              type="number"
              min={1}
              value={bulkMinutes}
              onChange={e => setBulkMinutes(e.target.value)}
              className="text-lg"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }}
              onKeyDown={e => e.key === 'Enter' && handleBulkApply()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>取消</Button>
            <Button style={{ background: theme.primaryColor, color: '#000' }} onClick={handleBulkApply}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 自动生成弹窗 */}
      <Dialog open={genDialogOpen} onOpenChange={setGenDialogOpen}>
        <DialogContent className="sm:max-w-md" style={{ background: 'var(--bg-panel-solid)', border: '1px solid var(--border-color)' }}>
          <DialogHeader>
            <DialogTitle className="text-white">自动生成盲注结构</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>级别数量</label>
              <Input type="number" min={1} value={genLevels} onChange={e => setGenLevels(e.target.value)} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>起始小盲</label>
              <Input type="number" min={1} value={genBaseSb} onChange={e => setGenBaseSb(e.target.value)} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>每级时长(分钟)</label>
              <Input type="number" min={1} value={genDuration} onChange={e => setGenDuration(e.target.value)} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>每几级休息 (0=不休息)</label>
              <Input type="number" min={0} value={genBreakAfter} onChange={e => setGenBreakAfter(e.target.value)} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenDialogOpen(false)}>取消</Button>
            <Button style={{ background: theme.primaryColor, color: '#000' }} onClick={handleGenerate}>生成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BlindTable;
