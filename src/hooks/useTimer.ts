import { useState, useRef, useCallback, useEffect } from 'react';
import type { TimerState, BlindLevel, ClubConfig } from '@/types';
import { useLocalStorage } from './useLocalStorage';

function createInitialState(config: ClubConfig): TimerState {
  return {
    isPlaying: false,
    currentLevelIndex: 0,
    remainingSeconds: config.defaultBlindStructure[0]?.duration * 60 || 900,
    totalElapsedSeconds: 0,
    entries: config.defaultStats.entries,
    playersLeft: config.defaultStats.playersLeft,
    startingChips: config.defaultStats.startingChips,
    audioAlert: config.defaultSettings.audioAlert,
    voiceAlert: config.defaultSettings.voiceAlert,
    structure: JSON.parse(JSON.stringify(config.defaultBlindStructure)),
  };
}

export function useTimer(club: ClubConfig | null) {
  const storageKey = `poker_timer_state_${club?.id || 'default'}`;
  const [state, setState] = useLocalStorage<TimerState | null>(storageKey, null);
  const [isUrgent, setIsUrgent] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize state when club changes
  useEffect(() => {
    if (club && !state) {
      setState(createInitialState(club));
    }
  }, [club, state, setState]);

  const currentLevel = state?.structure[state.currentLevelIndex];
  const nextLevelData = state?.structure[state.currentLevelIndex + 1];

  const saveTimerState = useCallback((updater: (prev: TimerState) => TimerState) => {
    setState(prev => prev ? updater(prev) : prev);
  }, [setState]);

  // ============ 音效 ============
  const playTickSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch { /* ignore audio errors */ }
  }, []);

  const playLevelUpAlarm = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const now = ctx.currentTime;
      const frequencies = [880, 1100, 1320, 1100, 880];
      const volumes = [0.5, 0.6, 0.8, 0.6, 0.5];

      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + i * 0.18);
        gain.gain.setValueAtTime(0, now + i * 0.18);
        gain.gain.linearRampToValueAtTime(volumes[i], now + i * 0.18 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.18 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.18);
        osc.stop(now + i * 0.18 + 0.15);
      });

      const endOsc = ctx.createOscillator();
      const endGain = ctx.createGain();
      endOsc.type = 'sine';
      endOsc.frequency.setValueAtTime(440, now + 1.0);
      endGain.gain.setValueAtTime(0, now + 1.0);
      endGain.gain.linearRampToValueAtTime(0.4, now + 1.05);
      endGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
      endOsc.connect(endGain);
      endGain.connect(ctx.destination);
      endOsc.start(now + 1.0);
      endOsc.stop(now + 1.5);
    } catch { /* ignore audio errors */ }
  }, []);

  const speakLevelUp = useCallback((level: BlindLevel) => {
    if (!('speechSynthesis' in window)) return;
    let text = '升盲，';
    if (level.isBreak) {
      text += '进入中场休息';
    } else {
      text += `进入级别${level.id}，小盲${level.sb}，大盲${level.bb}`;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-CN';
    utter.rate = 1.1;
    window.speechSynthesis.speak(utter);
  }, []);

  // ============ 计时器核心 ============
  const tick = useCallback(() => {
    setState((prev: TimerState | null) => {
      if (!prev || !prev.isPlaying) return prev;

      if (prev.remainingSeconds > 0) {
        const newSeconds = prev.remainingSeconds - 1;
        // 最后10秒滴答声
        if (newSeconds <= 10 && newSeconds > 0 && prev.audioAlert) {
          playTickSound();
        }
        // 最后3秒视觉紧急
        if (newSeconds <= 3 && newSeconds > 0) {
          setIsUrgent(true);
        } else if (newSeconds > 10) {
          setIsUrgent(false);
        }
        return {
          ...prev,
          remainingSeconds: newSeconds,
          totalElapsedSeconds: prev.totalElapsedSeconds + 1,
        };
      } else {
        // 时间到，升盲
        setIsUrgent(false);
        if (prev.currentLevelIndex < prev.structure.length - 1) {
          const nextIdx = prev.currentLevelIndex + 1;
          const nextLvl = prev.structure[nextIdx];
          if (prev.audioAlert) playLevelUpAlarm();
          if (prev.voiceAlert) speakLevelUp(nextLvl);
          return {
            ...prev,
            currentLevelIndex: nextIdx,
            remainingSeconds: nextLvl.duration * 60,
            totalElapsedSeconds: prev.totalElapsedSeconds + 1,
          };
        }
        return { ...prev, isPlaying: false, remainingSeconds: 0 };
      }
    });
  }, [setState, playTickSound, playLevelUpAlarm, speakLevelUp]);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      tick();
    }, 1000);
  }, [tick]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  // 自动启动/停止
  useEffect(() => {
    if (state?.isPlaying) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [state?.isPlaying, startTimer, stopTimer]);

  // ============ 控制函数 ============
  const togglePlayPause = useCallback(() => {
    saveTimerState(prev => {
      if (!prev) return prev;
      if (prev.isPlaying) {
        return { ...prev, isPlaying: false };
      }
      if (prev.remainingSeconds <= 0 && prev.currentLevelIndex >= prev.structure.length - 1) {
        return prev;
      }
      return { ...prev, isPlaying: true };
    });
  }, [saveTimerState]);

  const prevLevel = useCallback(() => {
    saveTimerState(prev => {
      if (!prev || prev.currentLevelIndex <= 0) return prev;
      const newIdx = prev.currentLevelIndex - 1;
      return {
        ...prev,
        isPlaying: false,
        currentLevelIndex: newIdx,
        remainingSeconds: prev.structure[newIdx].duration * 60,
      };
    });
    setIsUrgent(false);
  }, [saveTimerState]);

  const nextLevelFn = useCallback(() => {
    saveTimerState(prev => {
      if (!prev || prev.currentLevelIndex >= prev.structure.length - 1) return prev;
      const newIdx = prev.currentLevelIndex + 1;
      return {
        ...prev,
        isPlaying: false,
        currentLevelIndex: newIdx,
        remainingSeconds: prev.structure[newIdx].duration * 60,
      };
    });
    setIsUrgent(false);
  }, [saveTimerState]);

  const manualSetTime = useCallback((minutes: number) => {
    saveTimerState(prev => {
      if (!prev) return prev;
      return { ...prev, remainingSeconds: Math.max(0, minutes * 60) };
    });
  }, [saveTimerState]);

  const resetTimer = useCallback(() => {
    if (!club) return;
    stopTimer();
    setIsUrgent(false);
    setState(createInitialState(club));
  }, [club, stopTimer, setState]);

  const adjustStat = useCallback((field: 'entries' | 'playersLeft' | 'startingChips', amount: number) => {
    saveTimerState(prev => {
      if (!prev) return prev;
      const newVal = Math.max(1, (prev[field] || 0) + amount);
      return { ...prev, [field]: newVal };
    });
  }, [saveTimerState]);

  const updateCell = useCallback((idx: number, field: string, val: number) => {
    saveTimerState(prev => {
      if (!prev) return prev;
      const newStructure = [...prev.structure];
      newStructure[idx] = { ...newStructure[idx], [field]: val };
      const updates: Partial<TimerState> = { structure: newStructure };
      if (idx === prev.currentLevelIndex && field === 'duration') {
        updates.remainingSeconds = val * 60;
      }
      return { ...prev, ...updates };
    });
  }, [saveTimerState]);

  const deleteRow = useCallback((idx: number) => {
    saveTimerState(prev => {
      if (!prev || prev.structure.length <= 1) return prev;
      const newStructure = prev.structure.filter((_, i) => i !== idx);
      let newIdx = prev.currentLevelIndex;
      if (idx < prev.currentLevelIndex) {
        newIdx--;
      } else if (idx === prev.currentLevelIndex) {
        newIdx = Math.min(newIdx, newStructure.length - 1);
      }
      return {
        ...prev,
        structure: newStructure,
        currentLevelIndex: newIdx,
        remainingSeconds: newStructure[newIdx]?.duration * 60 || 0,
      };
    });
  }, [saveTimerState]);

  const addRow = useCallback((isBreak: boolean) => {
    saveTimerState(prev => {
      if (!prev) return prev;
      const last = prev.structure[prev.structure.length - 1];
      const newRow: BlindLevel = {
        id: isBreak ? '休息' : (prev.structure.filter(r => !r.isBreak).length + 1),
        sb: isBreak ? 0 : (last ? last.sb * 2 : 100),
        bb: isBreak ? 0 : (last ? last.bb * 2 : 200),
        ante: isBreak ? 0 : (last ? last.ante * 2 : 200),
        duration: isBreak ? 10 : 15,
        isBreak: isBreak,
      };
      return { ...prev, structure: [...prev.structure, newRow] };
    });
  }, [saveTimerState]);

  const loadStructure = useCallback((levels: BlindLevel[]) => {
    saveTimerState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        structure: JSON.parse(JSON.stringify(levels)),
        currentLevelIndex: 0,
        remainingSeconds: levels[0]?.duration * 60 || 900,
        isPlaying: false,
      };
    });
  }, [saveTimerState]);

  const setSetting = useCallback((key: 'audioAlert' | 'voiceAlert', value: boolean) => {
    saveTimerState(prev => prev ? { ...prev, [key]: value } : prev);
  }, [saveTimerState]);

  const handleTimerClick = useCallback(() => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        togglePlayPause();
      }, 250);
    }
  }, [togglePlayPause]);

  const handleTimerDoubleClick = useCallback((minutes: number) => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    manualSetTime(minutes);
  }, [manualSetTime]);

  // 统计数据
  const totalChips = (state?.entries || 0) * (state?.startingChips || 0);
  const avgChips = (state?.playersLeft || 0) > 0 ? Math.floor(totalChips / (state?.playersLeft || 1)) : 0;
  const elapsedHrs = String(Math.floor((state?.totalElapsedSeconds || 0) / 3600)).padStart(2, '0');
  const elapsedMins = String(Math.floor(((state?.totalElapsedSeconds || 0) % 3600) / 60)).padStart(2, '0');
  const elapsedSecs = String((state?.totalElapsedSeconds || 0) % 60).padStart(2, '0');

  return {
    state,
    currentLevel,
    nextLevel: nextLevelData,
    isUrgent,
    stats: {
      totalChips,
      avgChips,
      elapsed: `${elapsedHrs}:${elapsedMins}:${elapsedSecs}`,
    },
    controls: {
      togglePlayPause,
      prevLevel,
      nextLevel: nextLevelFn,
      manualSetTime,
      resetTimer,
      adjustStat,
      updateCell,
      deleteRow,
      addRow,
      loadStructure,
      setSetting,
      handleTimerClick,
      handleTimerDoubleClick,
    },
  };
}
