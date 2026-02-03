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

  // Game Loop Refs to avoid closure staleness
  const gameState = useRef({
    player: { x: 0, y: 0, width: 40, height: 40, speed: 5 },
    projectiles: [] as Entity[],
    collectibles: [] as Entity[],
    keys: { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false } as Record<string, boolean>,
    frameCount: 0,
    professorX: 0,
    isRunning: true,
    score: 0,
    uploadProgress: 0
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState.current.keys.hasOwnProperty(e.code)) {
      gameState.current.keys[e.code] = true;
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (gameState.current.keys.hasOwnProperty(e.code)) {
      gameState.current.keys[e.code] = false;
    }
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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Reset player position to bottom center on resize start
      gameState.current.player.x = canvas.width / 2;
      gameState.current.player.y = canvas.height - 100;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationFrameId: number;

    const spawnProjectile = () => {
      const type = Math.random() > 0.8 ? 'F' : 'TAREA'; // F is harder/faster
      const size = 30;
      gameState.current.projectiles.push({
        id: Date.now() + Math.random(),
        x: Math.random() * (canvas.width - size),
        y: -50,
        width: size,
        height: size,
        type: 'PROJECTILE',
        emoji: type === 'F' ? '❌' : '📝',
        velocity: { x: 0, y: type === 'F' ? 5 : 3 }
      });
    };

    const spawnCollectible = () => {
      const size = 30;
      gameState.current.collectibles.push({
        id: Date.now() + Math.random(),
        x: Math.random() * (canvas.width - size),
        y: -50,
        width: size,
        height: size,
        type: 'COLLECTIBLE',
        emoji: '💾', // Floppy disk implies PPT save
        velocity: { x: 0, y: 4 }
      });
    };

    const checkCollision = (rect1: any, rect2: any) => {
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

      // Update Player
      if (state.keys.ArrowLeft && state.player.x > 0) state.player.x -= state.player.speed;
      if (state.keys.ArrowRight && state.player.x < canvas.width - state.player.width) state.player.x += state.player.speed;
      // Allow some vertical movement
      if (state.keys.ArrowUp && state.player.y > canvas.height / 2) state.player.y -= state.player.speed;
      if (state.keys.ArrowDown && state.player.y < canvas.height - state.player.height) state.player.y += state.player.speed;

      // Update Professor (Floating Head)
      // Reduced speed: 0.02 -> 0.005
      state.professorX = (canvas.width / 2) + Math.sin(state.frameCount * 0.005) * (canvas.width * 0.4);

      // Spawning
      if (state.frameCount % 40 === 0) spawnProjectile();
      if (state.frameCount % 90 === 0) spawnCollectible();

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
          onGameOver(false, state.score);
          return;
        }
      }

      // 2. Player vs Collectible
      for (let i = state.collectibles.length - 1; i >= 0; i--) {
        if (checkCollision(state.player, state.collectibles[i])) {
          state.collectibles.splice(i, 1);
          state.uploadProgress += 10;
          state.score += 100;
          
          if (state.uploadProgress >= 100) {
            state.isRunning = false;
            onGameOver(true, state.score);
            return;
          }
        }
      }

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
      ctx.font = "40px Arial";
      ctx.fillText("🎓", state.player.x + 20, state.player.y + 35);

      // Draw Entities
      ctx.font = "30px Arial";
      state.projectiles.forEach(p => ctx.fillText(p.emoji, p.x + 15, p.y + 25));
      state.collectibles.forEach(c => ctx.fillText(c.emoji, c.x + 15, c.y + 25));

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
      cancelAnimationFrame(animationFrameId);
    };
  }, [onGameOver, handleKeyDown, handleKeyUp]);

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
        Usa las flechas del teclado para moverte
      </div>
    </div>
  );
};