
export interface GameState {
  score: number;
  lives: number;
  gameOver: boolean;
  gameStarted: boolean;
  level: number;
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Coin {
  x: number;
  y: number;
  collected: boolean;
}

export interface Enemy {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  dir: number;
}

export interface LevelConfig {
  name: string;
  backgroundColor: string;
  platformColor: string;
  enemyColor: string;
  requiredCoins: number;
  enemySpeedMultiplier: number;
}

// Added missing types used by the Gemini services and UI components
export interface Message {
  role: 'user' | 'model';
  text: string;
}

export type ImageSize = '1K' | '2K' | '4K';
