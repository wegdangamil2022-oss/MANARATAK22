import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('npm run dev serves the public app with hoisted workspace dependencies', { timeout: 40_000 }, async t => {
  assert.ok(process.env.npm_execpath, 'Run this test with npm run test:startup');
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const { port } = reservation.address();
  await new Promise(resolve => reservation.close(resolve));

  const windows = process.platform === 'win32';
  const child = spawn(process.execPath, [process.env.npm_execpath, 'run', 'dev', '--', `--port=${port}`], {
    cwd: fileURLToPath(new URL('../../', import.meta.url)),
    detached: !windows,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NO_COLOR: '1' },
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { output += chunk; });
  t.after(async () => {
    if (child.exitCode !== null) return;
    if (windows) spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true });
    else process.kill(-child.pid, 'SIGTERM');
    await once(child, 'close');
  });

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    assert.equal(child.exitCode, null, `Development command exited before serving the app:\n${output}`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/ar`, { signal: AbortSignal.timeout(1500) });
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /text\/html/);
      assert.match(await response.text(), /src="\/src\/main\.tsx"/);
      return;
    } catch (error) {
      if (error.name === 'AssertionError') throw error;
      await delay(100);
    }
  }
  assert.fail(`Development command did not serve the public app:\n${output}`);
});
