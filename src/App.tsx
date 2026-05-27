import { useCallback, useEffect, useRef, useState } from 'react';
import { GameSnapshot, InputState, WORLD, createInitialGame } from './gameLogic';
import { stepGame } from './gameStep';

const BEST_SCORE_KEY = 'shooting-game2.bestScore';
const initialInput: InputState = { left: false, right: false, up: false, down: false, shoot: false };

const loadBestScore = (): number => {
  try {
    const stored = window.localStorage.getItem(BEST_SCORE_KEY);
    return stored ? Number.parseInt(stored, 10) || 0 : 0;
  } catch {
    return 0;
  }
};

const drawGame = (context: CanvasRenderingContext2D, game: GameSnapshot): void => {
  context.clearRect(0, 0, WORLD.width, WORLD.height);

  const gradient = context.createLinearGradient(0, 0, 0, WORLD.height);
  gradient.addColorStop(0, '#071326');
  gradient.addColorStop(1, '#101827');
  context.fillStyle = gradient;
  context.fillRect(0, 0, WORLD.width, WORLD.height);

  context.save();
  context.globalAlpha = 0.4;
  context.fillStyle = '#93c5fd';
  for (let i = 0; i < 54; i += 1) {
    const x = (i * 73 + Math.floor(game.elapsed * 16)) % WORLD.width;
    const y = (i * 131 + Math.floor(game.elapsed * 120)) % WORLD.height;
    context.fillRect(x, y, 2, 2);
  }
  context.restore();

  context.fillStyle = '#38bdf8';
  for (const bullet of game.bullets) {
    context.beginPath();
    context.roundRect(bullet.x - 2, bullet.y - 12, 4, 16, 3);
    context.fill();
  }

  for (const enemy of game.enemies) {
    context.fillStyle = '#f97316';
    context.beginPath();
    context.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#fed7aa';
    context.beginPath();
    context.arc(enemy.x - enemy.radius * 0.25, enemy.y - enemy.radius * 0.25, enemy.radius * 0.28, 0, Math.PI * 2);
    context.fill();
  }

  for (const particle of game.particles) {
    context.globalAlpha = Math.max(0, particle.life * 2);
    context.fillStyle = '#fde68a';
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;

  const { player } = game;
  context.fillStyle = '#22c55e';
  context.beginPath();
  context.moveTo(player.x, player.y - player.radius - 4);
  context.lineTo(player.x - player.radius, player.y + player.radius);
  context.lineTo(player.x, player.y + player.radius * 0.45);
  context.lineTo(player.x + player.radius, player.y + player.radius);
  context.closePath();
  context.fill();

  context.strokeStyle = '#bbf7d0';
  context.lineWidth = 2;
  context.stroke();

  if (!game.running || game.paused || game.gameOver) {
    context.save();
    context.fillStyle = 'rgba(2, 6, 23, 0.68)';
    context.fillRect(0, 0, WORLD.width, WORLD.height);
    context.fillStyle = '#e5e7eb';
    context.textAlign = 'center';
    context.font = '700 28px system-ui, sans-serif';
    context.fillText(game.gameOver ? 'GAME OVER' : game.paused ? 'PAUSED' : 'SHOOTING GAME', WORLD.width / 2, WORLD.height / 2 - 18);
    context.font = '500 15px system-ui, sans-serif';
    context.fillText('Enter / タップで開始・再開', WORLD.width / 2, WORLD.height / 2 + 18);
    context.restore();
  }
};

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<InputState>({ ...initialInput });
  const gameRef = useRef<GameSnapshot>(createInitialGame(0));
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const [game, setGame] = useState<GameSnapshot>(() => createInitialGame(typeof window === 'undefined' ? 0 : loadBestScore()));

  const syncGame = useCallback((next: GameSnapshot) => {
    gameRef.current = next;
    setGame(next);
  }, []);

  const startGame = useCallback(() => {
    const current = gameRef.current;
    if (current.gameOver) {
      syncGame({ ...createInitialGame(current.bestScore), running: true });
      return;
    }
    syncGame({ ...current, running: true, paused: false });
  }, [syncGame]);

  const togglePause = useCallback(() => {
    const current = gameRef.current;
    if (!current.gameOver && current.running) {
      syncGame({ ...current, paused: !current.paused });
    }
  }, [syncGame]);

  useEffect(() => {
    const gameLoop = (time: number) => {
      const delta = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = time;
      const next = stepGame(gameRef.current, delta, inputRef.current);
      gameRef.current = next;

      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (context) {
        drawGame(context, next);
      }

      setGame((previous) => (previous === next ? previous : next));
      frameRef.current = window.requestAnimationFrame(gameLoop);
    };

    frameRef.current = window.requestAnimationFrame(gameLoop);
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(BEST_SCORE_KEY, String(game.bestScore));
    } catch {
      // localStorage が利用できない環境でもゲームを継続する。
    }
  }, [game.bestScore]);

  useEffect(() => {
    const updateKey = (event: KeyboardEvent, pressed: boolean) => {
      const key = event.key.toLowerCase();
      if (['arrowleft', 'a'].includes(key)) inputRef.current.left = pressed;
      if (['arrowright', 'd'].includes(key)) inputRef.current.right = pressed;
      if (['arrowup', 'w'].includes(key)) inputRef.current.up = pressed;
      if (['arrowdown', 's'].includes(key)) inputRef.current.down = pressed;
      if (key === ' ') inputRef.current.shoot = pressed;
      if (key === 'enter' && pressed) startGame();
      if (key === 'p' && pressed) togglePause();
    };

    const handleKeyDown = (event: KeyboardEvent) => updateKey(event, true);
    const handleKeyUp = (event: KeyboardEvent) => updateKey(event, false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startGame, togglePause]);

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * WORLD.width;
    const y = ((event.clientY - rect.top) / rect.height) * WORLD.height;
    const player = gameRef.current.player;
    inputRef.current.left = x < player.x - 10;
    inputRef.current.right = x > player.x + 10;
    inputRef.current.up = y < player.y - 10;
    inputRef.current.down = y > player.y + 10;
  };

  const stopPointerInput = () => {
    inputRef.current = { ...inputRef.current, left: false, right: false, up: false, down: false, shoot: false };
  };

  return (
    <main className="shell">
      <section className="game-card" aria-label="ブラウザシューティングゲーム">
        <div className="score-bar">
          <span>スコア: {game.score}</span>
          <span>ベスト: {game.bestScore}</span>
          <span>ライフ: {'♥'.repeat(Math.max(0, game.player.lives))}</span>
        </div>
        <canvas
          ref={canvasRef}
          width={WORLD.width}
          height={WORLD.height}
          className="game-canvas"
          aria-label="ゲーム画面"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            inputRef.current.shoot = true;
            startGame();
            handlePointerMove(event);
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={stopPointerInput}
          onPointerCancel={stopPointerInput}
        />
        <div className="controls">
          <button type="button" onClick={startGame}>{game.gameOver ? 'リスタート' : 'スタート'}</button>
          <button type="button" onClick={togglePause}>一時停止</button>
        </div>
        <p className="help">移動: WASD / 矢印キー、ショット: Space、開始: Enter、停止: P。スマホではドラッグしながらショットできます。</p>
      </section>
    </main>
  );
};
