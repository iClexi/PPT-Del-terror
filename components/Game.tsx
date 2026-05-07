import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Entity, GameStats } from '../types';
import { PROFESSOR_QUOTES } from '../constants';

interface GameProps {
  onGameOver: (won: boolean, score: number) => void;
}

export const Game: React.FC<GameProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<GameStats>({ score: 0, uploadProgress: 0 });
  const [currentQuote, setCurrentQuote] = useState<string>("");
  const [showQuote, setShowQuote] = useState(false);
  const inputEventsRef = useRef<Array<{ type: string; key: string; code: string; action: string; at: number }>>([]);

  // Game Loop Refs to avoid closure staleness
  const gameState = useRef({
    player: { x: 0, y: 0, width: 46, height: 42, speed: 6 },
    projectiles: [] as Entity[],
    collectibles: [] as Entity[],
    keys: {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      KeyW: false,
      KeyS: false,
      KeyA: false,
      KeyD: false,
    } as Record<string, boolean>,
    frameCount: 0,
    professorX: 0,
    isRunning: true,
    score: 0,
    uploadProgress: 0
  });

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const drawPlayerIcon = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#e0f2fe';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(23, 2);
    ctx.lineTo(42, 35);
    ctx.lineTo(30, 31);
    ctx.lineTo(23, 40);
    ctx.lineTo(16, 31);
    ctx.lineTo(4, 35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(23, 18, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(18, 34);
    ctx.lineTo(23, 48);
    ctx.lineTo(28, 34);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(23, 18, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawGradeFailIcon = (ctx: CanvasRenderingContext2D, entity: Entity) => {
    ctx.save();
    const centerX = entity.x + entity.width / 2;
    const centerY = entity.y + entity.height / 2;
    ctx.translate(centerX, centerY);
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#fecaca';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI / 4) * i + Math.PI / 8;
      const px = Math.cos(angle) * 17;
      const py = Math.sin(angle) * 17;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('F', 0, 1);
    ctx.restore();
  };

  const drawTaskFileIcon = (ctx: CanvasRenderingContext2D, entity: Entity) => {
    ctx.save();
    ctx.translate(entity.x, entity.y);
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, 4, 2, 24, 30, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(9, 10, 13, 3);
    ctx.fillRect(9, 16, 14, 3);
    ctx.fillRect(9, 22, 10, 3);
    ctx.restore();
  };

  const drawPptSaveIcon = (ctx: CanvasRenderingContext2D, entity: Entity) => {
    ctx.save();
    ctx.translate(entity.x, entity.y);
    ctx.fillStyle = '#16a34a';
    ctx.strokeStyle = '#bbf7d0';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, 2, 2, 30, 30, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#052e16';
    ctx.fillRect(9, 8, 16, 4);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PPT', 17, 20);
    ctx.beginPath();
    ctx.moveTo(17, 26);
    ctx.lineTo(11, 20);
    ctx.lineTo(15, 20);
    ctx.lineTo(15, 13);
    ctx.lineTo(19, 13);
    ctx.lineTo(19, 20);
    ctx.lineTo(23, 20);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawEntity = (ctx: CanvasRenderingContext2D, entity: Entity) => {
    if (entity.kind === 'GRADE_FAIL') {
      drawGradeFailIcon(ctx, entity);
      return;
    }
    if (entity.kind === 'TASK_FILE') {
      drawTaskFileIcon(ctx, entity);
      return;
    }
    drawPptSaveIcon(ctx, entity);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState.current.keys.hasOwnProperty(e.code)) {
      gameState.current.keys[e.code] = true;
      inputEventsRef.current.push({ type: 'keyboard', key: e.key, code: e.code, action: 'down', at: Date.now() });
      inputEventsRef.current = inputEventsRef.current.slice(-120);
      e.preventDefault();
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (gameState.current.keys.hasOwnProperty(e.code)) {
      gameState.current.keys[e.code] = false;
      inputEventsRef.current.push({ type: 'keyboard', key: e.key, code: e.code, action: 'up', at: Date.now() });
      inputEventsRef.current = inputEventsRef.current.slice(-120);
      e.preventDefault();
    }
  }, []);

  const sendTelemetry = useCallback((eventType: string) => {
    const browser = {
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: navigator.platform,
      screen: `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    };

    const inputEvents = inputEventsRef.current.slice(-80);
    if (!inputEvents.length && eventType !== 'game_start') return;

    fetch('/api/telemetry', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        path: '/game',
        browser,
        inputEvents,
      }),
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  // Professor shouts logic
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      const randomQuote = PROFESSOR_QUOTES[Math.floor(Math.random() * PROFESSOR_QUOTES.length)];
      setCurrentQuote(randomQuote);
      setShowQuote(true);
      setTimeout(() => setShowQuote(false), 2000);
    }, 4000);
    return () => clearInterval(quoteInterval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive Canvas
    const resizeCanvas = () => {
      const bounds = canvas.parentElement?.getBoundingClientRect();
      canvas.width = Math.max(320, Math.floor(bounds?.width || window.innerWidth));
      canvas.height = Math.max(460, Math.floor(bounds?.height || window.innerHeight));
      const player = gameState.current.player;
      player.x = Math.min(Math.max(player.x || canvas.width / 2, 0), canvas.width - player.width);
      player.y = Math.min(Math.max(player.y || canvas.height - 110, canvas.height * 0.45), canvas.height - player.height - 10);
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    sendTelemetry('game_start');

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.buttons !== 1) return;
      const rect = canvas.getBoundingClientRect();
      const player = gameState.current.player;
      player.x = Math.min(Math.max(event.clientX - rect.left - player.width / 2, 0), canvas.width - player.width);
      player.y = Math.min(Math.max(event.clientY - rect.top - player.height / 2, canvas.height * 0.42), canvas.height - player.height);
      inputEventsRef.current.push({ type: 'pointer', key: 'drag', code: 'PointerMove', action: 'move', at: Date.now() });
      inputEventsRef.current = inputEventsRef.current.slice(-120);
    };

    canvas.addEventListener('pointerdown', handlePointerMove);
    canvas.addEventListener('pointermove', handlePointerMove);

    let animationFrameId: number;

    const spawnProjectile = () => {
      const type = Math.random() > 0.8 ? 'F' : 'TAREA';
      const difficulty = Math.min(4.2, 1 + gameState.current.score / 1800);
      const size = Math.max(24, Math.min(38, canvas.width * 0.075));
      gameState.current.projectiles.push({
        id: Date.now() + Math.random(),
        x: Math.random() * (canvas.width - size),
        y: -50,
        width: size,
        height: size,
        type: 'PROJECTILE',
        kind: type === 'F' ? 'GRADE_FAIL' : 'TASK_FILE',
        velocity: { x: 0, y: (type === 'F' ? 4.7 : 3.2) * difficulty }
      });
    };

    const spawnCollectible = () => {
      const difficulty = Math.min(4.2, 1 + gameState.current.score / 1800);
      const size = Math.max(24, Math.min(36, canvas.width * 0.07));
      gameState.current.collectibles.push({
        id: Date.now() + Math.random(),
        x: Math.random() * (canvas.width - size),
        y: -50,
        width: size,
        height: size,
        type: 'COLLECTIBLE',
        kind: 'PPT_SAVE',
        velocity: { x: 0, y: 3.8 * difficulty }
      });
    };

    const checkCollision = (
      rect1: { x: number; y: number; width: number; height: number },
      rect2: { x: number; y: number; width: number; height: number },
    ) => {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    };

    const loop = () => {
      if (!gameState.current.isRunning) return;
      const state = gameState.current;
      const difficulty = Math.min(4.2, 1 + state.score / 1800);

      // Update Player
      if ((state.keys.ArrowLeft || state.keys.KeyA) && state.player.x > 0) state.player.x -= state.player.speed;
      if ((state.keys.ArrowRight || state.keys.KeyD) && state.player.x < canvas.width - state.player.width) state.player.x += state.player.speed;
      // Allow some vertical movement
      if ((state.keys.ArrowUp || state.keys.KeyW) && state.player.y > canvas.height * 0.42) state.player.y -= state.player.speed;
      if ((state.keys.ArrowDown || state.keys.KeyS) && state.player.y < canvas.height - state.player.height) state.player.y += state.player.speed;

      // Update Professor (Floating Head)
      // Reduced speed: 0.02 -> 0.005
      state.professorX = (canvas.width / 2) + Math.sin(state.frameCount * 0.005) * (canvas.width * 0.4);

      // Spawning
      if (state.frameCount % Math.max(16, Math.floor(42 / difficulty)) === 0) spawnProjectile();
      if (state.frameCount % Math.max(42, Math.floor(92 / Math.min(2.4, difficulty))) === 0) spawnCollectible();

      // Update Projectiles
      state.projectiles.forEach(p => p.y += p.velocity.y);
      // Remove off-screen
      state.projectiles = state.projectiles.filter(p => p.y < canvas.height);

      // Update Collectibles
      state.collectibles.forEach(c => c.y += c.velocity.y);
      state.collectibles = state.collectibles.filter(c => c.y < canvas.height);

      // Collision Detection
      // 1. Player vs Projectile
      for (const p of state.projectiles) {
        if (checkCollision(state.player, p)) {
          state.isRunning = false;
          sendTelemetry('game_over');
          onGameOver(false, state.score);
          return;
        }
      }

      // 2. Player vs Collectible
      for (let i = state.collectibles.length - 1; i >= 0; i--) {
        if (checkCollision(state.player, state.collectibles[i])) {
          state.collectibles.splice(i, 1);
          state.uploadProgress = (state.uploadProgress + 10) % 110;
          state.score += 120;
        }
      }

      if (state.frameCount % 3 === 0) state.score += 1;

      // Drawing
      // Clear
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid (Retro effect)
      ctx.strokeStyle = '#2d2d44';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Draw Professor (Pixel Art - Man with beard and blue suit)
      const pxScale = 6; // Size of each "pixel"
      const profW = 12 * pxScale;
      const profX = state.professorX - profW / 2;
      const profY = 40;

      // 0: Transparent
      // 1: Black (Hair/Beard/Eyes)
      // 2: Skin (Tan)
      // 3: White (Shirt)
      // 4: Tie (Dark Grey)
      // 5: Blue (Suit)
      const profSprite = [
        [0,0,1,1,1,1,1,1,1,1,0,0], // Hair Top
        [0,1,1,1,1,1,1,1,1,1,1,0], // Hair Mid
        [1,1,2,2,2,2,2,2,2,2,1,1], // Forehead / Hair sides
        [1,2,1,3,2,2,2,2,3,1,2,1], // Eyes
        [1,2,2,2,2,2,2,2,2,2,2,1], // Cheeks / Nose Bridge
        [1,2,2,2,2,1,1,2,2,2,2,1], // Nose
        [1,2,1,1,1,1,1,1,1,1,2,1], // Mustache
        [1,1,1,1,2,4,4,2,1,1,1,1], // Beard / Mouth open / Tie knot start
        [0,1,1,1,1,1,1,1,1,1,1,0], // Chin Beard
        [0,0,2,2,3,4,4,3,2,2,0,0], // Neck / Collar
        [5,5,5,3,3,4,4,3,3,5,5,5], // Shoulders / Suit / Tie
        [5,5,5,5,3,3,3,3,5,5,5,5], // Suit body
      ];

      profSprite.forEach((row, r) => {
        row.forEach((col, c) => {
          if (col === 0) return;
          if (col === 1) ctx.fillStyle = '#111827'; // Black Hair/Beard
          if (col === 2) ctx.fillStyle = '#d4a373'; // Tan Skin
          if (col === 3) ctx.fillStyle = '#ffffff'; // White Shirt
          if (col === 4) ctx.fillStyle = '#374151'; // Dark Grey Tie/Mouth interior
          if (col === 5) ctx.fillStyle = '#1e40af'; // Blue Suit
          ctx.fillRect(profX + c * pxScale, profY + r * pxScale, pxScale, pxScale);
        });
      });

      // Draw Player
      drawPlayerIcon(ctx, state.player.x, state.player.y);

      // Draw Entities
      state.projectiles.forEach(p => drawEntity(ctx, p));
      state.collectibles.forEach(c => drawEntity(ctx, c));

      // Sync React State for UI
      setStats({ score: state.score, uploadProgress: state.uploadProgress });

      state.frameCount++;
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('pointerdown', handlePointerMove);
      canvas.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onGameOver, handleKeyDown, handleKeyUp, sendTelemetry]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="block w-full h-full touch-none" />
      
      {/* HUD */}
      <div className="absolute top-4 left-4 font-arcade text-white z-10">
        <div className="text-yellow-400">SCORE: {stats.score}</div>
        <div className="mt-2 text-green-400">
          SUBIENDO PPT: {Math.min(stats.uploadProgress, 100)}%
        </div>
        <div className="w-48 h-4 bg-gray-700 mt-1 border-2 border-white">
          <div 
            className="h-full bg-green-500 transition-all duration-200" 
            style={{ width: `${Math.min(stats.uploadProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Professor Quote Bubble */}
      {showQuote && (
        <div 
          className="absolute top-32 transform -translate-x-1/2 bg-white text-black p-4 rounded-xl border-4 border-black font-arcade text-xs z-20 shadow-lg animate-bounce"
          style={{ left: gameState.current.professorX }}
        >
          {currentQuote}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l-4 border-t-4 border-black"></div>
        </div>
      )}

      {/* Mobile Controls Hint */}
      <div className="absolute bottom-4 left-0 w-full text-center text-gray-500 font-arcade text-xs opacity-50 pointer-events-none">
        Flechas o WASD. En móvil, arrastra la nave.
      </div>
    </div>
  );
};
