export enum ScreenState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
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
  emoji: string;
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
