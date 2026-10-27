import { createServer } from 'vite';
import { spawn } from 'child_process';
import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

async function startDev() {
  console.log('[DayFlow Dev] Starting Vite dev server for UI...');
  const server = await createServer({
    root,
    configFile: path.resolve(root, 'vite.config.ts'),
    server: { port: 5173 },
  });
  await server.listen();
  console.log('[DayFlow Dev] Vite dev server ready on http://localhost:5173');

  console.log('[DayFlow Dev] Building Electron main & preload...');
  await build({
    root,
    configFile: path.resolve(root, 'vite.electron.config.ts'),
  });
  console.log('[DayFlow Dev] Electron build completed.');

  console.log('[DayFlow Dev] Spawning Electron runtime...');
  const electronPath = process.platform === 'win32'
    ? path.resolve(root, 'node_modules/.bin/electron.cmd')
    : path.resolve(root, 'node_modules/.bin/electron');

  const electronProcess = spawn(electronPath, ['.'], {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      VITE_DEV_SERVER_URL: 'http://localhost:5173',
    },
  });

  electronProcess.on('close', () => {
    console.log('[DayFlow Dev] Electron closed, stopping dev server.');
    server.close();
    process.exit(0);
  });
}

startDev().catch((err) => {
  console.error('[DayFlow Dev] Error starting dev runner:', err);
  process.exit(1);
});
