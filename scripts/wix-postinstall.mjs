import { spawnSync } from 'node:child_process';

if (process.env.CI || process.env.SKIP_WIX_SYNC_TYPES === '1') {
  console.log('Skipping `wix sync-types` in CI.');
  process.exit(0);
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(command, ['wix', 'sync-types'], { stdio: 'inherit' });

process.exit(result.status ?? 1);
