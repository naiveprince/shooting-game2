import assert from 'node:assert/strict';
import { test } from 'node:test';

const WORLD = {
  width: 420,
  height: 640,
  enemySpawnBase: 0.78,
  enemySpawnMin: 0.22,
  enemyBaseSpeed: 96,
  enemyMaxSpeedBonus: 210
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const overlaps = (a, b) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const radius = a.radius + b.radius;
  return dx * dx + dy * dy <= radius * radius;
};
const nextSpawnDelay = (elapsed) => clamp(WORLD.enemySpawnBase - elapsed * 0.015, WORLD.enemySpawnMin, WORLD.enemySpawnBase);
const nextEnemySpeed = (elapsed) => WORLD.enemyBaseSpeed + clamp(elapsed * 4.5, 0, WORLD.enemyMaxSpeedBonus);

test('clamp keeps values inside bounds', () => {
  assert.equal(clamp(10, 0, 5), 5);
  assert.equal(clamp(-2, 0, 5), 0);
  assert.equal(clamp(3, 0, 5), 3);
});

test('collision detection uses circular hit boxes', () => {
  assert.equal(overlaps({ x: 0, y: 0, radius: 5 }, { x: 9, y: 0, radius: 4 }), true);
  assert.equal(overlaps({ x: 0, y: 0, radius: 5 }, { x: 10.1, y: 0, radius: 4 }), false);
});

test('difficulty ramps but stays capped for performance', () => {
  assert.equal(nextSpawnDelay(0), WORLD.enemySpawnBase);
  assert.equal(nextSpawnDelay(999), WORLD.enemySpawnMin);
  assert.equal(nextEnemySpeed(999), WORLD.enemyBaseSpeed + WORLD.enemyMaxSpeedBonus);
});
