import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { get } from 'node:http';
import assert from 'node:assert/strict';
import { test } from 'node:test';

test('production server renders local routes and rejects untrusted hosts', { timeout: 30_000 }, async (t) => {
  const server = spawn(process.execPath, ['dist/radici-san-giovanni-lipioni/server/server.mjs'], {
    env: { ...process.env, PORT: '4188', NG_ALLOWED_HOSTS: '' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  server.stderr.on('data', (chunk) => { output += chunk; });
  t.after(async () => {
    if (server.exitCode === null && server.signalCode === null) {
      const exited = once(server, 'exit');
      server.kill();
      await exited;
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.once('exit', (code) => reject(new Error(`Server exited (${code}): ${output}`)));
    server.stdout.on('data', (chunk) => {
      output += chunk;
      if (output.includes('Node Express server listening')) resolve();
    });
  });

  for (const [route, heading] of [
    ['/esplora', 'Esplora la mappa di San Giovanni Lipioni'],
    ['/cronologia', 'Cronologia di San Giovanni Lipioni'],
    ['/fonti', 'Fonti consultate'],
  ]) {
    const response = await fetch(`http://127.0.0.1:4188${route}`);
    assert.equal(response.status, 200, `${route}: ${await response.clone().text()}`);
    assert.ok((await response.text()).includes(`<h1>${heading}</h1>`), `${route}: missing heading`);
  }

  const untrustedStatus = await new Promise((resolve, reject) => {
    get('http://127.0.0.1:4188/cronologia', { headers: { Host: 'untrusted.invalid' } }, (response) => {
      response.resume();
      resolve(response.statusCode);
    }).on('error', reject);
  });
  assert.equal(untrustedStatus, 400);
});
