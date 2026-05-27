export type Vec2 = { x: number; y: number };

export type Entity = Vec2 & {
  id: number;
  radius: number;
};

export type Player = Entity & {
  cooldown: number;
  lives: number;
};

export type Bullet = Entity & {
  speed: number;
};

export type Enemy = Entity & {
  speed: number;
  drift: number;
};

export type Particle = Entity & {
  vx: number;
  vy: number;
  life: number;
};

export type GameSnapshot = {
  player: Player;
  bullets: Bullet[];
  enemies: Enemy[];
  particles: Particle[];
  score: number;
  bestScore: number;
  elapsed: number;
  running: boolean;
  paused: boolean;
  gameOver: boolean;
  nextId: number;
  spawnTimer: number;
};

export type InputState = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  shoot: boolean;
};

export const WORLD = {
  width: 420,
  height: 640,
  playerSpeed: 330,
  bulletSpeed: 620,
  bulletCooldown: 0.12,
  enemyBaseSpeed: 96,
  enemyMaxSpeedBonus: 210,
  enemySpawnBase: 0.78,
  enemySpawnMin: 0.22,
  maxBullets: 18,
  maxEnemies: 48,
  maxParticles: 72
} as const;

export const createInitialGame = (bestScore = 0): GameSnapshot => ({
  player: {
    id: 0,
    x: WORLD.width / 2,
    y: WORLD.height - 58,
    radius: 14,
    cooldown: 0,
    lives: 3
  },
  bullets: [],
  enemies: [],
  particles: [],
  score: 0,
  bestScore,
  elapsed: 0,
  running: false,
  paused: false,
  gameOver: false,
  nextId: 1,
  spawnTimer: 0.4
});

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const overlaps = (a: Entity, b: Entity): boolean => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distanceSq = dx * dx + dy * dy;
  const radius = a.radius + b.radius;
  return distanceSq <= radius * radius;
};

export const nextSpawnDelay = (elapsed: number): number =>
  clamp(WORLD.enemySpawnBase - elapsed * 0.015, WORLD.enemySpawnMin, WORLD.enemySpawnBase);

export const nextEnemySpeed = (elapsed: number): number =>
  WORLD.enemyBaseSpeed + clamp(elapsed * 4.5, 0, WORLD.enemyMaxSpeedBonus);

export const makeEnemy = (id: number, elapsed: number, random = Math.random): Enemy => {
  const radius = 13 + random() * 11;
  return {
    id,
    x: radius + random() * (WORLD.width - radius * 2),
    y: -radius,
    radius,
    speed: nextEnemySpeed(elapsed) * (0.78 + random() * 0.48),
    drift: (random() - 0.5) * 90
  };
};

export const makeExplosion = (enemy: Enemy, nextId: number, random = Math.random): { particles: Particle[]; nextId: number } => {
  const count = 5 + Math.floor(random() * 4);
  const particles: Particle[] = [];
  let id = nextId;

  for (let i = 0; i < count; i += 1) {
    const angle = random() * Math.PI * 2;
    const speed = 45 + random() * 140;
    particles.push({
      id,
      x: enemy.x,
      y: enemy.y,
      radius: 2 + random() * 3,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.34 + random() * 0.28
    });
    id += 1;
  }

  return { particles, nextId: id };
};
