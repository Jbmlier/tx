import React, { useState, useEffect, useMemo } from 'react';
import { useClubConfig } from '@/hooks/useClubConfig';
import { useTimer } from '@/hooks/useTimer';
import { BLIND_PRESETS } from '@/config/presets';
import { getClubTemplates } from '@/config/clubs';
import type { TournamentTemplate } from '@/types';
import TimerDisplay from '@/components/timer/TimerDisplay';
import StatsPanel from '@/components/timer/StatsPanel';
import ControlsRow from '@/components/timer/ControlsRow';
import BlindTable from '@/components/timer/BlindTable';
import SettingsPanel from '@/components/timer/SettingsPanel';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

const TimerPage: React.FC = () => {
  const { club, loading } = useClubConfig();
  const navigate = useNavigate();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const {
    state,
    currentLevel,
    nextLevel,
    isUrgent,
    stats,
    controls,
  } = useTimer(club);

  // 获取该俱乐部的赛事模板
  const templates = useMemo(() => {
    if (!club) return [];
    return getClubTemplates(club.id);
  }, [club]);

  // 全屏功能
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // 重置确认
  const handleReset = () => {
    controls.resetTimer();
    setShowResetConfirm(false);
  };

  // 加载赛事模板
  const loadTemplate = (template: TournamentTemplate) => {
    controls.loadStructure(template.levels);
    setShowTemplateSelector(false);
  };

  // 应用主题变量
  useEffect(() => {
    if (!club) return;
    const root = document.documentElement;
    root.style.setProperty('--color-gold', club.theme.primaryColor);
    root.style.setProperty('--color-gold-glow', club.theme.primaryGlow);
    root.style.setProperty('--color-green', club.theme.accentColor);
    root.style.setProperty('--color-green-glow', club.theme.accentGlow);
    root.style.setProperty('--color-red', club.theme.dangerColor);
    root.style.setProperty('--color-red-glow', club.theme.dangerGlow);
    root.style.setProperty('--bg-gradient', club.theme.bgGradient);
  }, [club]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#070a13', color: '#fff' }}>
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!club || !state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#070a13', color: '#fff' }}>
        <div className="text-xl">⚠️ 未找到俱乐部配置</div>
        <p style={{ color: 'var(--text-muted)' }}>请检查 URL 参数，或前往管理后台配置。</p>
        <Button onClick={() => navigate('/admin')} style={{ background: 'var(--color-gold)', color: '#000' }}>
          前往管理后台
        </Button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{
        backgroundColor: '#070a13',
        backgroundImage: club.theme.bgGradient,
        color: '#f8fafc',
        paddingBottom: '2.5rem',
      }}
    >
      {/* 头部 */}
      <header
        className="flex justify-between items-center px-4 md:px-6 py-4 z-[100]"
        style={{
          background: 'rgba(7, 10, 19, 0.85)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: club.theme.primaryColor, fontSize: '1.5rem' }}>{club.logoEmoji}</span>
          <h1 className="text-base md:text-xl font-bold">
            {club.name} <span style={{ color: club.theme.primaryColor }}>MTT</span> 竞技盲注计时器
          </h1>
        </div>
        <div className="flex gap-2 md:gap-3">
          {templates.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs md:text-sm"
              style={{ background: 'rgba(251,191,36,0.1)', border: `1px solid ${club.theme.primaryColor}40`, color: club.theme.primaryColor }}
              onClick={() => setShowTemplateSelector(true)}
            >
              🏆 赛事模板
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-xs md:text-sm"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}
            onClick={toggleFullscreen}
          >
            ⛶ 全屏
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs md:text-sm"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#ef4444' }}
            onClick={() => setShowResetConfirm(true)}
          >
            🔄 重置
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs md:text-sm"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
            onClick={() => navigate('/admin')}
          >
            ⚙️ 管理
          </Button>
        </div>
      </header>

      {/* 主体内容 */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-5 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5"
        style={{ height: 'calc(100vh - 70px)' }}
      >
        {/* 左栏 */}
        <div className="flex flex-col gap-5 overflow-y-auto pr-1">
          <TimerDisplay
            remainingSeconds={state.remainingSeconds}
            currentLevel={currentLevel}
            nextLevel={nextLevel}
            isPlaying={state.isPlaying}
            isUrgent={isUrgent}
            theme={club.theme}
            onTimerClick={controls.handleTimerClick}
            onTimerDoubleClick={controls.handleTimerDoubleClick}
          />

          <ControlsRow
            isPlaying={state.isPlaying}
            theme={club.theme}
            onPrev={controls.prevLevel}
            onToggle={controls.togglePlayPause}
            onNext={controls.nextLevel}
          />

          <StatsPanel
            entries={state.entries}
            playersLeft={state.playersLeft}
            startingChips={state.startingChips}
            totalChips={stats.totalChips}
            avgChips={stats.avgChips}
            elapsed={stats.elapsed}
            onAdjust={controls.adjustStat}
          />
        </div>

        {/* 右栏 */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <BlindTable
            structure={state.structure}
            currentLevelIndex={state.currentLevelIndex}
            theme={club.theme}
            onUpdateCell={controls.updateCell}
            onDeleteRow={controls.deleteRow}
            onAddRow={controls.addRow}
            onLoadPreset={controls.loadStructure}
            presets={BLIND_PRESETS}
            clubTemplates={templates}
            onLoadTemplate={loadTemplate}
          />
          <SettingsPanel
            audioAlert={state.audioAlert}
            voiceAlert={state.voiceAlert}
            onToggle={controls.setSetting}
          />
        </div>
      </div>

      {/* 底部 */}
      <footer
        className="fixed bottom-0 left-0 right-0 px-4 md:px-6 py-2 z-50 flex justify-between items-center flex-wrap gap-1"
        style={{
          background: 'rgba(7, 10, 19, 0.9)',
          borderTop: '1px solid var(--border-color)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="flex items-center gap-2 text-xs md:text-sm" style={{ color: 'var(--text-muted)' }}>
          <span style={{ color: club.theme.primaryColor, fontWeight: 600 }}>{club.footer.authorName}</span>
          <span style={{ color: 'var(--text-dim)', opacity: 0.4 }}>|</span>
          <span>{club.footer.contact}</span>
        </div>
        <div className="text-xs hidden sm:block" style={{ color: 'var(--text-dim)' }}>
          {club.footer.copyright}
        </div>
      </footer>

      {/* 重置确认弹窗 */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="sm:max-w-md" style={{ background: 'var(--bg-panel-solid)', border: '1px solid var(--border-color)' }}>
          <DialogHeader>
            <DialogTitle className="text-white">⚠️ 确认重置</DialogTitle>
          </DialogHeader>
          <p className="text-sm py-2" style={{ color: 'var(--text-muted)' }}>
            确定要重置计时和选手数据吗？此操作无法撤销。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetConfirm(false)}>取消</Button>
            <Button style={{ background: '#ef4444', color: '#fff' }} onClick={handleReset}>确定重置</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 赛事模板选择弹窗 */}
      <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
        <DialogContent className="sm:max-w-lg" style={{ background: 'var(--bg-panel-solid)', border: '1px solid var(--border-color)' }}>
          <DialogHeader>
            <DialogTitle className="text-white">🏆 选择赛事模板</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto">
            {templates.map(template => (
              <div
                key={template.id}
                className="rounded-xl p-4 cursor-pointer transition-all hover:border-yellow-500/50"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                onClick={() => loadTemplate(template)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-sm">{template.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                    {template.levels.length} 级
                  </span>
                </div>
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{template.description}</p>
                <div className="flex gap-3 text-xs" style={{ color: 'var(--text-dim)' }}>
                  <span>起始: {template.levels[0]?.sb}/{template.levels[0]?.bb}</span>
                  <span>|</span>
                  <span>{template.levels.filter(l => l.isBreak).length} 个休息</span>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateSelector(false)}>取消</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimerPage;
