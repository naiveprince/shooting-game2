import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const targetDirs = ['src', 'scripts', 'tests'];
const riskyPatterns = [
  { pattern: new RegExp('dangerouslySet' + 'InnerHTML', 'g'), reason: 'React の raw HTML 挿入' },
  { pattern: /\beval\s*\(/g, reason: 'eval の使用' },
  { pattern: /new Function\s*\(/g, reason: '動的 Function 生成' },
  { pattern: /innerHTML\s*=/g, reason: 'innerHTML への直接代入' },
  { pattern: /document\.write\s*\(/g, reason: 'document.write の使用' },
  { pattern: /localStorage\.setItem\([^,]+,(?!\s*(String\(|JSON\.stringify\())/g, reason: 'localStorage への非文字列保存' }
];

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (/\.(ts|tsx|js|mjs|css|html)$/.test(name)) files.push(path);
  }
};

for (const dir of targetDirs) walk(join(root, dir));
files.push(join(root, 'index.html'), join(root, 'vite.config.ts'));

const findings = [];
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  for (const { pattern, reason } of riskyPatterns) {
    const matches = source.match(pattern);
    if (matches) findings.push(`${file}: ${reason} (${matches.length})`);
  }
}

if (findings.length > 0) {
  console.error('Security check failed:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Security check passed: ${files.length} files scanned, no risky patterns found.`);
