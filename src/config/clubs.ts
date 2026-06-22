import type { ClubConfig, TournamentTemplate } from '@/types';
import { BLIND_PRESETS } from './presets';

const now = new Date().toISOString();

/** 默认赛事模板 */
const DEFAULT_TEMPLATES: TournamentTemplate[] = [
  {
    id: 'monday-regular',
    name: '周一常规赛',
    description: '15分钟/级，标准MTT结构，适合日常比赛',
    levels: JSON.parse(JSON.stringify(BLIND_PRESETS[0].levels)),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'wednesday-turbo',
    name: '周三快速赛',
    description: '8分钟/级，快节奏，适合时间紧张的比赛',
    levels: JSON.parse(JSON.stringify(BLIND_PRESETS[1].levels)),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'weekend-deep',
    name: '周末深筹赛',
    description: '20分钟/级，起始50/100，策略性更强',
    levels: JSON.parse(JSON.stringify(BLIND_PRESETS[2].levels)),
    createdAt: now,
    updatedAt: now,
  },
];

/** 默认俱乐部配置列表 */
export const DEFAULT_CLUBS: ClubConfig[] = [
  {
    id: '3bet',
    name: '3 Bet Poker Club',
    logoEmoji: '\u2663',
    theme: {
      primaryColor: '#fbbf24',
      primaryGlow: 'rgba(251, 191, 36, 0.35)',
      accentColor: '#10b981',
      accentGlow: 'rgba(16, 185, 129, 0.3)',
      dangerColor: '#ef4444',
      dangerGlow: 'rgba(239, 68, 68, 0.3)',
      bgGradient: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #070a13 75%)',
    },
    defaultBlindStructure: JSON.parse(JSON.stringify(BLIND_PRESETS[0].levels)),
    defaultStats: { entries: 10, playersLeft: 10, startingChips: 10000 },
    footer: {
      authorName: 'eden.deng 邓文超',
      contact: '联系方式: 13426870727',
      copyright: '版权所有 \u00a9 2026 eden.deng 个人所有 未经授权禁止转载'
    },
    defaultSettings: { audioAlert: true, voiceAlert: true },
    tournamentTemplates: JSON.parse(JSON.stringify(DEFAULT_TEMPLATES)),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'aceking',
    name: 'Ace King Poker Lounge',
    logoEmoji: '\u2660',
    theme: {
      primaryColor: '#60a5fa',
      primaryGlow: 'rgba(96, 165, 250, 0.35)',
      accentColor: '#34d399',
      accentGlow: 'rgba(52, 211, 153, 0.3)',
      dangerColor: '#f87171',
      dangerGlow: 'rgba(248, 113, 113, 0.3)',
      bgGradient: 'radial-gradient(circle at 50% 30%, #0f172a 0%, #020617 75%)',
    },
    defaultBlindStructure: JSON.parse(JSON.stringify(BLIND_PRESETS[1].levels)),
    defaultStats: { entries: 20, playersLeft: 20, startingChips: 20000 },
    footer: {
      authorName: 'Ace King Poker',
      contact: 'Tel: (555) 123-4567',
      copyright: '\u00a9 2026 Ace King Poker Lounge. All rights reserved.'
    },
    defaultSettings: { audioAlert: true, voiceAlert: false },
    tournamentTemplates: JSON.parse(JSON.stringify(DEFAULT_TEMPLATES)),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo',
    name: 'Demo Club 演示俱乐部',
    logoEmoji: '\ud83c\udfb0',
    theme: {
      primaryColor: '#c084fc',
      primaryGlow: 'rgba(192, 132, 252, 0.35)',
      accentColor: '#2dd4bf',
      accentGlow: 'rgba(45, 212, 191, 0.3)',
      dangerColor: '#fb7185',
      dangerGlow: 'rgba(251, 113, 133, 0.3)',
      bgGradient: 'radial-gradient(circle at 50% 30%, #2e1065 0%, #0f0720 75%)',
    },
    defaultBlindStructure: JSON.parse(JSON.stringify(BLIND_PRESETS[0].levels)),
    defaultStats: { entries: 6, playersLeft: 6, startingChips: 5000 },
    footer: {
      authorName: 'Demo Admin',
      contact: 'demo@example.com',
      copyright: '\u00a9 2026 Demo Club. For demonstration only.'
    },
    defaultSettings: { audioAlert: false, voiceAlert: false },
    tournamentTemplates: JSON.parse(JSON.stringify(DEFAULT_TEMPLATES)),
    createdAt: now,
    updatedAt: now,
  }
];

const STORAGE_KEY_CLUBS = 'poker_timer_clubs';

/** 初始化：将默认俱乐部写入 localStorage（如果不存在） */
export function initClubs(): void {
  const existing = localStorage.getItem(STORAGE_KEY_CLUBS);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY_CLUBS, JSON.stringify(DEFAULT_CLUBS));
  }
}

/** 获取所有俱乐部配置 */
export function getAllClubs(): ClubConfig[] {
  initClubs();
  const raw = localStorage.getItem(STORAGE_KEY_CLUBS);
  return raw ? JSON.parse(raw) : [];
}

/** 根据 ID 获取俱乐部配置 */
export function getClubById(id: string): ClubConfig | undefined {
  const clubs = getAllClubs();
  return clubs.find(c => c.id === id);
}

/** 新增/更新俱乐部 */
export function saveClub(club: ClubConfig): void {
  const clubs = getAllClubs();
  const idx = clubs.findIndex(c => c.id === club.id);
  club.updatedAt = new Date().toISOString();
  if (idx >= 0) {
    clubs[idx] = club;
  } else {
    clubs.push(club);
  }
  localStorage.setItem(STORAGE_KEY_CLUBS, JSON.stringify(clubs));
}

/** 删除俱乐部 */
export function deleteClub(id: string): void {
  const clubs = getAllClubs().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY_CLUBS, JSON.stringify(clubs));
}

/** 生成唯一 ID */
export function generateClubId(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const clubs = getAllClubs();
  let id = base;
  let i = 1;
  while (clubs.find(c => c.id === id)) {
    id = `${base}-${i}`;
    i++;
  }
  return id;
}

/** 从 URL 参数获取 club id */
export function getClubIdFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('club') || params.get('c') || '';
}

// ==================== 赛事模板管理 ====================

/** 获取俱乐部的赛事模板 */
export function getClubTemplates(clubId: string): TournamentTemplate[] {
  const club = getClubById(clubId);
  return club?.tournamentTemplates || [];
}

/** 保存赛事模板到俱乐部 */
export function saveTournamentTemplate(clubId: string, template: TournamentTemplate): void {
  const clubs = getAllClubs();
  const club = clubs.find(c => c.id === clubId);
  if (!club) return;
  
  const idx = club.tournamentTemplates.findIndex(t => t.id === template.id);
  template.updatedAt = new Date().toISOString();
  if (idx >= 0) {
    club.tournamentTemplates[idx] = template;
  } else {
    club.tournamentTemplates.push(template);
  }
  club.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY_CLUBS, JSON.stringify(clubs));
}

/** 删除赛事模板 */
export function deleteTournamentTemplate(clubId: string, templateId: string): void {
  const clubs = getAllClubs();
  const club = clubs.find(c => c.id === clubId);
  if (!club) return;
  
  club.tournamentTemplates = club.tournamentTemplates.filter(t => t.id !== templateId);
  club.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY_CLUBS, JSON.stringify(clubs));
}

/** 生成赛事模板唯一 ID */
export function generateTemplateId(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${base}-${Date.now()}`;
}

/** 获取当前活跃的 club id */
export function getActiveClubId(): string {
  return localStorage.getItem('poker_timer_active_club') || '3bet';
}

/** 保存当前活跃的 club id */
export function setActiveClubId(id: string): void {
  localStorage.setItem('poker_timer_active_club', id);
}
