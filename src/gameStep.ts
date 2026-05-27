import {
  Bullet,
  GameSnapshot,
  InputState,
  Particle,
  WORLD,
  clamp,
  makeEnemy,
  makeExplosion,
  nextSpawnDelay,
  overlaps
} from './gameLogic';

export const stepGame = (
  snapshot: GameSnapshot,
  rawDelta: number,
  input: InputState,
  random = Math.random
): GameSnapshot => {
  if (!snapshot.running || snapshot.paused || snapshot.gameOver) {
    return snapshot;
  }

  const delta = clamp(rawDelta, 0, 1 / 30);
  let nextId = snapshot.nextId;
  const elapsed = snapshot.elapsed + delta;
  const player = { ...snapshot.player, cooldown: Math.max(0, snapshot.player.cooldown - delta) };

  const dx = Number(input.right) - Number(input.left);
  const dy = Number(input.down) - Number(input.up);
  const length = Math.hypot(dx, dy) || 1;
  player.x = clamp(player.x + (dx / length) * WORLD.playerSpeed * delta, player.radius, WORLD.width - player.radius);
  player.y = clamp(player.y + (dy / length) * WORLD.playerSpeed * delta, WORLD.height * 0.35, WORLD.height - player.radius);

  let bullets: Bullet[] = snapshot.bullets
    .map((bullet) => ({ ...bullet, y: bullet.y - bullet.speed * delta }))
    .filter((bullet) => bullet.y + bullet.radius > 0);

  if (input.shoot && player.cooldown <= 0 && bullets.length < WORLD.maxBullets) {
    bullets = [
      ...bullets,
      { id: nextId, x: player.x, y: player.y - player.radius - 6, radius: 4, speed: WORLD.bulletSpeed }
    ];
    nextId += 1;
    player.cooldown = WORLD.bulletCooldown;
  }

  let spawnTimer = snapshot.spawnTimer - delta;
  let enemies = snapshot.enemies
    .map((enemy) => ({ ...enemy, x: enemy.x + enemy.drift * delta, y: enemy.y + enemy.speed * delta }))
    .filter((enemy) => enemy.y - enemy.radius < WORLD.height + 20);

  if (spawnTimer <= 0 && enemies.length < WORLD.maxEnemies) {
    enemies = [...enemies, makeEnemy(nextId, elapsed, random)];
    nextId += 1;
    spawnTimer += nextSpawnDelay(elapsed);
  }

  let score = snapshot.score;
  let particles: Particle[] = snapshot.particles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx * delta,
      y: particle.y + particle.vy * delta,
      life: particle.life - delta
    }))
    .filter((particle) => particle.life > 0);

  const remainingBullets: Bullet[] = [];
  const destroyedEnemyIds = new Set<number>();

  for (const bullet of bullets) {
    const hit = enemies.find((enemy) => !destroyedEnemyIds.has(enemy.id) && overlaps(bullet, enemy));
    if (hit) {
      destroyedEnemyIds.add(hit.id);
      score += Math.round(100 + hit.radius * 3);
      const explosion = makeExplosion(hit, nextId, random);
      nextId = explosion.nextId;
      particles = [...particles, ...explosion.particles].slice(-WORLD.maxParticles);
    } else {
      remainingBullets.push(bullet);
    }
  }

  enemies = enemies.filter((enemy) => !destroyedEnemyIds.has(enemy.id));

  const enemyHitPlayer = enemies.some((enemy) => overlaps(enemy, player));
  if (enemyHitPlayer) {
    player.lives -= 1;
    enemies = enemies.filter((enemy) => !overlaps(enemy, player));
  }

  const gameOver = player.lives <= 0;
  const bestScore = Math.max(snapshot.bestScore, score);

  return {
    ...snapshot,
    player,
    bullets: remainingBullets,
    enemies,
    particles,
    score,
    bestScore,
    elapsed,
    gameOver,
    running: !gameOver,
    nextId,
    spawnTimer
  };
};
