export enum ScreenState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  ADMIN = 'ADMIN',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
  TERMS = 'TERMS',
  PRIVACY = 'PRIVACY'
}

export interface GameStats {
  score: number;
  uploadProgress: number; // 0 to 100
}

export interface Entity {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'PLAYER' | 'PROJECTILE' | 'COLLECTIBLE' | 'PROFESSOR';
  kind: 'GRADE_FAIL' | 'TASK_FILE' | 'PPT_SAVE';
  velocity: { x: number; y: number };
}

export interface Credentials {
  [username: string]: string;
}

export interface LeaderboardEntry {
  playerName: string;
  bestScore: number;
  games: number;
  wins: number;
  lastPlayedAt: string;
}

export interface LeaderboardResponse {
  topWeek: LeaderboardEntry[];
  topAllTime: LeaderboardEntry[];
}

export interface AdminUser {
  id: number;
  playerName: string;
  isAdmin: boolean;
  bestScore: number;
  games: number;
  createdAt: string;
  lastLoginAt: string | null;
  lastPlayedAt: string | null;
}

export interface TrafficEvent {
  id: number;
  playerId: number | null;
  playerName: string | null;
  eventType: string;
  path: string | null;
  method: string | null;
  statusCode: number | null;
  requestIp: string | null;
  userAgent: string | null;
  acceptLanguage: string | null;
  browserLanguage: string | null;
  browserTimezone: string | null;
  platform: string | null;
  screen: string | null;
  viewport: string | null;
  inputEvents: Array<{ type?: string; key?: string; code?: string; action?: string; at?: number }>;
  createdAt: string;
}
