import type { BlindPreset } from '@/types';

export const BLIND_PRESETS: BlindPreset[] = [
  {
    id: 'regular',
    name: '常规赛',
    description: '标准 MTT 节奏，适合大多数比赛',
    levels: [
      { id: 1, sb: 100, bb: 200, ante: 0, duration: 15, isBreak: false },
      { id: 2, sb: 200, bb: 400, ante: 0, duration: 15, isBreak: false },
      { id: 3, sb: 300, bb: 600, ante: 0, duration: 15, isBreak: false },
      { id: 4, sb: 400, bb: 800, ante: 0, duration: 15, isBreak: false },
      { id: 5, sb: 600, bb: 1200, ante: 0, duration: 15, isBreak: false },
      { id: 6, sb: 800, bb: 1600, ante: 0, duration: 15, isBreak: false },
      { id: 7, sb: 1000, bb: 2000, ante: 0, duration: 15, isBreak: false },
      { id: 8, sb: 1500, bb: 3000, ante: 0, duration: 15, isBreak: false },
      { id: '休息', sb: 0, bb: 0, ante: 0, duration: 10, isBreak: true },
      { id: 9, sb: 2000, bb: 4000, ante: 0, duration: 15, isBreak: false },
      { id: 10, sb: 4000, bb: 8000, ante: 0, duration: 15, isBreak: false },
      { id: 11, sb: 8000, bb: 16000, ante: 0, duration: 15, isBreak: false },
      { id: 12, sb: 15000, bb: 30000, ante: 0, duration: 15, isBreak: false },
      { id: 13, sb: 30000, bb: 60000, ante: 0, duration: 15, isBreak: false },
    ]
  },
  {
    id: 'turbo',
    name: '快速赛',
    description: '短时长、快节奏，适合时间紧张的比赛',
    levels: [
      { id: 1, sb: 100, bb: 200, ante: 200, duration: 8, isBreak: false },
      { id: 2, sb: 200, bb: 400, ante: 400, duration: 8, isBreak: false },
      { id: 3, sb: 300, bb: 600, ante: 600, duration: 8, isBreak: false },
      { id: '休息', sb: 0, bb: 0, ante: 0, duration: 5, isBreak: true },
      { id: 4, sb: 500, bb: 1000, ante: 1000, duration: 8, isBreak: false },
      { id: 5, sb: 800, bb: 1600, ante: 1600, duration: 8, isBreak: false },
      { id: 6, sb: 1200, bb: 2400, ante: 2400, duration: 8, isBreak: false },
      { id: 7, sb: 2000, bb: 4000, ante: 4000, duration: 8, isBreak: false },
      { id: 8, sb: 4000, bb: 8000, ante: 8000, duration: 8, isBreak: false },
      { id: 9, sb: 8000, bb: 16000, ante: 16000, duration: 8, isBreak: false },
    ]
  },
  {
    id: 'deep',
    name: '深筹赛',
    description: '起始筹码更深，策略性更强',
    levels: [
      { id: 1, sb: 50, bb: 100, ante: 0, duration: 20, isBreak: false },
      { id: 2, sb: 100, bb: 200, ante: 0, duration: 20, isBreak: false },
      { id: 3, sb: 150, bb: 300, ante: 0, duration: 20, isBreak: false },
      { id: 4, sb: 200, bb: 400, ante: 0, duration: 20, isBreak: false },
      { id: '休息', sb: 0, bb: 0, ante: 0, duration: 10, isBreak: true },
      { id: 5, sb: 300, bb: 600, ante: 0, duration: 20, isBreak: false },
      { id: 6, sb: 400, bb: 800, ante: 0, duration: 20, isBreak: false },
      { id: 7, sb: 600, bb: 1200, ante: 0, duration: 20, isBreak: false },
      { id: 8, sb: 1000, bb: 2000, ante: 0, duration: 20, isBreak: false },
      { id: 9, sb: 1500, bb: 3000, ante: 0, duration: 20, isBreak: false },
      { id: 10, sb: 2000, bb: 4000, ante: 0, duration: 20, isBreak: false },
      { id: 11, sb: 3000, bb: 6000, ante: 0, duration: 20, isBreak: false },
      { id: 12, sb: 5000, bb: 10000, ante: 0, duration: 20, isBreak: false },
    ]
  },
  {
    id: 'hyper',
    name: '超快速',
    description: '极速赛，5 分钟一级',
    levels: [
      { id: 1, sb: 100, bb: 200, ante: 200, duration: 5, isBreak: false },
      { id: 2, sb: 200, bb: 400, ante: 400, duration: 5, isBreak: false },
      { id: 3, sb: 400, bb: 800, ante: 800, duration: 5, isBreak: false },
      { id: 4, sb: 600, bb: 1200, ante: 1200, duration: 5, isBreak: false },
      { id: '休息', sb: 0, bb: 0, ante: 0, duration: 5, isBreak: true },
      { id: 5, sb: 1000, bb: 2000, ante: 2000, duration: 5, isBreak: false },
      { id: 6, sb: 2000, bb: 4000, ante: 4000, duration: 5, isBreak: false },
      { id: 7, sb: 4000, bb: 8000, ante: 8000, duration: 5, isBreak: false },
      { id: 8, sb: 8000, bb: 16000, ante: 16000, duration: 5, isBreak: false },
    ]
  }
];

export function getPresetById(id: string): BlindPreset | undefined {
  return BLIND_PRESETS.find(p => p.id === id);
}
