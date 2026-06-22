/** 盲注级别定义 */
export interface BlindLevel {
  id: number | string;
  sb: number;
  bb: number;
  ante: number;
  duration: number; // 分钟
  isBreak: boolean;
}

/** 赛事模板 */
export interface TournamentTemplate {
  id: string;           // 唯一标识
  name: string;         // 赛事名称，如 "周一常规赛"
  description: string;  // 描述，如 "15分钟/级，深筹结构"
  levels: BlindLevel[]; // 盲注结构
  createdAt: string;
  updatedAt: string;
}

/** 主题配置 */
export interface ClubTheme {
  primaryColor: string;      // 主色调（金色等）
  primaryGlow: string;       // 主色发光
  accentColor: string;       // 强调色
  accentGlow: string;        // 强调色发光
  dangerColor: string;       // 危险/暂停色
  dangerGlow: string;        // 危险色发光
  bgGradient: string;        // 背景渐变
  timerTextColor?: string;   // 计时器文字颜色（可选覆盖）
}

/** 默认统计数据 */
export interface DefaultStats {
  entries: number;
  playersLeft: number;
  startingChips: number;
}

/** 底部署名配置 */
export interface FooterConfig {
  authorName: string;
  contact: string;
  copyright: string;
}

/** 应用设置 */
export interface AppSettings {
  audioAlert: boolean;
  voiceAlert: boolean;
}

/** 俱乐部配置 */
export interface ClubConfig {
  id: string;           // URL 参数标识，如 "3bet"
  name: string;         // 俱乐部名称
  logoEmoji: string;    // Logo 表情符号
  theme: ClubTheme;     // 主题配置
  defaultBlindStructure: BlindLevel[];
  defaultStats: DefaultStats;
  footer: FooterConfig;
  defaultSettings: AppSettings;
  tournamentTemplates: TournamentTemplate[]; // 赛事模板列表
  createdAt: string;
  updatedAt: string;
}

/** 计时器运行状态 */
export interface TimerState {
  isPlaying: boolean;
  currentLevelIndex: number;
  remainingSeconds: number;
  totalElapsedSeconds: number;
  entries: number;
  playersLeft: number;
  startingChips: number;
  audioAlert: boolean;
  voiceAlert: boolean;
  structure: BlindLevel[];
}

/** 预设盲注结构模板 */
export interface BlindPreset {
  id: string;
  name: string;
  description: string;
  levels: BlindLevel[];
}
