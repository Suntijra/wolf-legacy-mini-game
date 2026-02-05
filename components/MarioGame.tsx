
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Platform, Coin, Enemy, LevelConfig } from '../types';
import { 
  playJumpSound, 
  playCoinSound, 
  playStompSound, 
  playHurtSound, 
  playLevelUpSound 
} from '../utils/soundEffects';

interface GameProps {
  onScoreUpdate: (score: number) => void;
  onLevelUpdate: (level: number) => void;
  onPlayingChange?: (isPlaying: boolean) => void;
  onControlHandlersReady?: (handlers: { setKey: (key: 'left' | 'right' | 'up', val: boolean) => void }) => void;
}

const LEVELS: LevelConfig[] = [
  {
    name: "Green Forest",
    backgroundColor: "#1e293b",
    platformColor: "#4a3728",
    enemyColor: "#8b0000",
    requiredCoins: 4,
    enemySpeedMultiplier: 1,
  },
  {
    name: "Midnight Woods",
    backgroundColor: "#0f172a",
    platformColor: "#1e1b4b",
    enemyColor: "#ef4444",
    requiredCoins: 8,
    enemySpeedMultiplier: 1.5,
  },
  {
    name: "Abyssal Cave",
    backgroundColor: "#020617",
    platformColor: "#334155",
    enemyColor: "#f87171",
    requiredCoins: 12,
    enemySpeedMultiplier: 2.2,
  }
];

const MarioGame: React.FC<GameProps> = ({ onScoreUpdate, onLevelUpdate, onPlayingChange, onControlHandlersReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  
  const gameState = useRef({
    level: 0,
    score: 0,
    coinsCollected: 0,
    wolf: { x: 50, y: 300, width: 44, height: 32, dy: 0, speed: 5, facingRight: true },
    platforms: [] as Platform[],
    coins: [] as Coin[],
    enemies: [] as Enemy[],
    keys: { left: false, right: false, up: false },
    gravity: 0.8,
    jumpForce: -15,
    animFrame: 0,
  });

  const setupLevel = useCallback((levelIdx: number) => {
    const level = LEVELS[levelIdx];
    const gs = gameState.current;
    gs.level = levelIdx;
    gs.wolf = { ...gs.wolf, x: 50, y: 300, dy: 0, speed: 5 + levelIdx };
    gs.coinsCollected = 0;
    
    if (levelIdx === 0) {
      gs.platforms = [
        { x: 0, y: 380, w: 800, h: 20 },
        { x: 150, y: 300, w: 100, h: 20 },
        { x: 350, y: 220, w: 150, h: 20 },
        { x: 550, y: 300, w: 100, h: 20 },
        { x: 100, y: 150, w: 100, h: 20 },
      ];
      gs.coins = [
        { x: 200, y: 270, collected: false },
        { x: 400, y: 190, collected: false },
        { x: 600, y: 270, collected: false },
        { x: 150, y: 120, collected: false },
      ];
      gs.enemies = [
        { x: 400, y: 350, w: 30, h: 30, speed: 2 * level.enemySpeedMultiplier, dir: 1 },
      ];
    } else if (levelIdx === 1) {
      gs.platforms = [
        { x: 0, y: 380, w: 200, h: 20 },
        { x: 250, y: 380, w: 200, h: 20 },
        { x: 500, y: 380, w: 300, h: 20 },
        { x: 100, y: 280, w: 80, h: 20 },
        { x: 300, y: 220, w: 80, h: 20 },
        { x: 500, y: 180, w: 80, h: 20 },
        { x: 700, y: 250, w: 80, h: 20 },
      ];
      gs.coins = Array.from({ length: 8 }, (_, i) => ({ x: 80 + i * 90, y: 150 + (i % 3) * 60, collected: false }));
      gs.enemies = [
        { x: 300, y: 350, w: 30, h: 30, speed: 2 * level.enemySpeedMultiplier, dir: 1 },
        { x: 600, y: 350, w: 30, h: 30, speed: 1.8 * level.enemySpeedMultiplier, dir: -1 },
      ];
    } else {
      gs.platforms = [
        { x: 0, y: 380, w: 100, h: 20 },
        { x: 150, y: 320, w: 60, h: 20 },
        { x: 250, y: 260, w: 60, h: 20 },
        { x: 400, y: 200, w: 60, h: 20 },
        { x: 550, y: 260, w: 60, h: 20 },
        { x: 700, y: 320, w: 60, h: 20 },
        { x: 350, y: 380, w: 100, h: 20 },
      ];
      gs.coins = Array.from({ length: 12 }, (_, i) => ({ x: 50 + i * 60, y: 100 + (i % 4) * 40, collected: false }));
      gs.enemies = [
        { x: 350, y: 350, w: 30, h: 30, speed: 2 * level.enemySpeedMultiplier, dir: 1 },
        { x: 10, y: 350, w: 30, h: 30, speed: 2.5 * level.enemySpeedMultiplier, dir: 1 },
      ];
    }
    onLevelUpdate(levelIdx + 1);
  }, [onLevelUpdate]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') gameState.current.keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') gameState.current.keys.right = true;
    if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') gameState.current.keys.up = true;
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') gameState.current.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') gameState.current.keys.right = false;
    if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') gameState.current.keys.up = false;
  }, []);

  const setKey = (key: 'left' | 'right' | 'up', val: boolean) => {
    gameState.current.keys[key] = val;
  };

  // Expose control handlers and playing state to parent component
  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  useEffect(() => {
    onControlHandlersReady?.({ setKey });
  }, [onControlHandlersReady]);


  const update = useCallback(() => {
    const { wolf, keys, platforms, coins, enemies, gravity, jumpForce, level } = gameState.current;

    let isMoving = false;
    if (keys.left) {
      wolf.x -= wolf.speed;
      wolf.facingRight = false;
      isMoving = true;
    }
    if (keys.right) {
      wolf.x += wolf.speed;
      wolf.facingRight = true;
      isMoving = true;
    }
    
    if (isMoving) {
      gameState.current.animFrame += 0.2;
    } else {
      gameState.current.animFrame += 0.05;
    }

    if (wolf.x < 0) wolf.x = 0;
    if (wolf.x > 760) wolf.x = 760;

    wolf.dy += gravity;
    wolf.y += wolf.dy;

    let onGround = false;
    platforms.forEach(p => {
      if (
        wolf.x < p.x + p.w &&
        wolf.x + wolf.width > p.x &&
        wolf.y + wolf.height > p.y &&
        wolf.y + wolf.height < p.y + p.h + wolf.dy
      ) {
        wolf.y = p.y - wolf.height;
        wolf.dy = 0;
        onGround = true;
      }
    });

    if (onGround && keys.up) {
      wolf.dy = jumpForce;
      playJumpSound();
    }

    coins.forEach(c => {
      if (!c.collected) {
        const dist = Math.sqrt(Math.pow(wolf.x + 20 - c.x, 2) + Math.pow(wolf.y + 16 - c.y, 2));
        if (dist < 30) {
          c.collected = true;
          gameState.current.score += 10;
          gameState.current.coinsCollected += 1;
          onScoreUpdate(gameState.current.score);
          playCoinSound();

          const levelConfig = LEVELS[level];
          if (gameState.current.coinsCollected >= levelConfig.requiredCoins) {
            if (level < LEVELS.length - 1) {
              const nextLevel = level + 1;
              setCurrentLevelIdx(nextLevel);
              setupLevel(nextLevel);
              playLevelUpSound();
            } else {
              setGameEnded(true);
              setIsPlaying(false);
              playLevelUpSound();
            }
          }
        }
      }
    });

    enemies.forEach(en => {
      en.x += en.speed * en.dir;
      if (en.x > 770 || en.x < 10) en.dir *= -1;

      const headOn = wolf.x < en.x + en.w && wolf.x + wolf.width > en.x &&
                   wolf.y + wolf.height > en.y && wolf.y + wolf.height < en.y + 12;
      
      const sideOn = wolf.x < en.x + en.w && wolf.x + wolf.width > en.x &&
                    wolf.y + wolf.height > en.y && wolf.y < en.y + en.h;

      if (headOn && wolf.dy > 0) {
        en.y = -1000;
        wolf.dy = jumpForce / 1.5;
        gameState.current.score += 50;
        onScoreUpdate(gameState.current.score);
        playStompSound();
      } else if (sideOn) {
        setIsPlaying(false);
        playHurtSound();
      }
    });

    if (wolf.y > 450) {
      setIsPlaying(false);
      playHurtSound();
    }
  }, [onScoreUpdate, setupLevel]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const { wolf, platforms, coins, enemies, level, animFrame, keys } = gameState.current;
    const config = LEVELS[level];
    
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, 800, 400);

    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.font = "bold 40px Arial";
    ctx.fillText(config.name, 40, 60);

    ctx.fillStyle = config.platformColor;
    platforms.forEach(p => {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(p.x, p.y, p.w, 4);
        ctx.fillStyle = config.platformColor;
    });

    ctx.fillStyle = '#fbbf24';
    coins.forEach(c => {
      if (!c.collected) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.fillRect(c.x - 4, c.y - 4, 3, 3);
        ctx.fillStyle = '#fbbf24';
      }
    });

    ctx.fillStyle = config.enemyColor;
    enemies.forEach(en => {
        ctx.fillRect(en.x, en.y, en.w, en.h);
        ctx.fillStyle = "white";
        ctx.fillRect(en.dir === 1 ? en.x + 20 : en.x + 5, en.y + 5, 5, 5);
        ctx.fillStyle = config.enemyColor;
    });

    ctx.save();
    ctx.translate(wolf.x + wolf.width / 2, wolf.y + wolf.height / 2);
    if (!wolf.facingRight) ctx.scale(-1, 1);

    const isMoving = keys.left || keys.right;
    const isJumping = wolf.dy !== 0;

    let legOffset1 = 0, legOffset2 = 0, bodyYOffset = 0, tailAngle = 0;

    if (isJumping) {
      legOffset1 = 10; legOffset2 = -10; bodyYOffset = -2; tailAngle = 0.5;
    } else if (isMoving) {
      legOffset1 = Math.sin(animFrame) * 12; legOffset2 = -Math.sin(animFrame) * 12;
      bodyYOffset = Math.abs(Math.sin(animFrame)) * 2; tailAngle = Math.sin(animFrame * 2) * 0.3;
    } else {
      bodyYOffset = Math.sin(animFrame) * 1.5; tailAngle = Math.sin(animFrame * 0.5) * 0.1;
    }

    const drawX = -wolf.width / 2;
    const drawY = -wolf.height / 2 + bodyYOffset;

    ctx.save();
    ctx.translate(drawX + 4, drawY + 18);
    ctx.rotate(tailAngle);
    ctx.fillStyle = '#475569';
    ctx.fillRect(-10, -4, 12, 8);
    ctx.restore();

    ctx.fillStyle = '#475569';
    ctx.fillRect(drawX + 8 + legOffset2, drawY + 20, 6, 12);
    ctx.fillRect(drawX + wolf.width - 14 + legOffset1, drawY + 20, 6, 12);

    ctx.fillStyle = '#64748b';
    ctx.fillRect(drawX + 5, drawY + 10, wolf.width - 10, 20);
    
    ctx.fillStyle = '#64748b';
    ctx.fillRect(drawX + 12 + legOffset1, drawY + 20, 6, 12);
    ctx.fillRect(drawX + wolf.width - 10 + legOffset2, drawY + 20, 6, 12);

    ctx.save();
    ctx.translate(drawX + wolf.width - 10, drawY + 5);
    if (isJumping) ctx.rotate(-0.2);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-5, -5, 18, 16);
    ctx.fillRect(8, 2, 8, 8);
    ctx.beginPath();
    ctx.moveTo(-2, -5); ctx.lineTo(2, -15); ctx.lineTo(6, -5); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(8, -5); ctx.lineTo(12, -15); ctx.lineTo(16, -5); ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.fillRect(8, 2, 4, 4);
    ctx.restore();
    ctx.restore();
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      if (isPlaying) {
        update();
        draw(ctx);
      }
      animationId = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [handleKeyDown, handleKeyUp, update, draw, isPlaying]);

  const startGame = () => {
    gameState.current.score = 0;
    gameState.current.coinsCollected = 0;
    gameState.current.animFrame = 0;
    setGameEnded(false);
    setCurrentLevelIdx(0);
    setupLevel(0);
    setIsPlaying(true);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto bg-slate-900 rounded-2xl overflow-hidden border-4 border-slate-700 shadow-2xl touch-none select-none"
    >
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 flex flex-wrap gap-2 md:gap-4 pointer-events-none">
        <div className="bg-black/60 px-2 py-1 md:px-3 md:py-1 rounded text-[10px] md:text-xs font-pixel text-indigo-300 backdrop-blur-sm">
          LVL {currentLevelIdx + 1}: {LEVELS[currentLevelIdx].name}
        </div>
        <div className="bg-black/60 px-2 py-1 md:px-3 md:py-1 rounded text-[10px] md:text-xs font-pixel text-yellow-400 backdrop-blur-sm">
          GOAL: {gameState.current.coinsCollected}/{LEVELS[currentLevelIdx].requiredCoins} COINS
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        width={800} 
        height={400} 
        className="block w-full h-auto"
      />


      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 backdrop-blur-sm p-4">
          <div className="text-center p-6 md:p-8 bg-slate-800/90 border-2 border-indigo-500 rounded-2xl shadow-2xl animate-in zoom-in duration-300 max-w-sm">
            <h2 className="text-2xl md:text-4xl font-pixel text-white mb-4">
              {gameEnded ? "WOLF LEGEND" : "AI WOLF"}
            </h2>
            <p className="text-slate-400 mb-8 font-pixel text-[10px] md:text-xs leading-relaxed">
              {gameEnded ? "FOREST PEACE RESTORED!" : "COLLECT COINS & STOMP ENEMIES TO LEVEL UP"}
            </p>
            <button 
              onClick={startGame}
              className="w-full px-6 py-4 md:px-10 md:py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-pixel text-sm md:text-base rounded-xl transform hover:scale-105 transition-all shadow-lg shadow-indigo-500/40"
            >
              {gameEnded ? "RESTART" : "RUN"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarioGame;
