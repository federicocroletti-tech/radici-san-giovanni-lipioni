import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const root = resolve('dist/radici-san-giovanni-lipioni/browser');
const indexFile = resolve(root, 'index.html');
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
};
const port = Number(process.env['PORT'] ?? 4000);

createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end();
    return;
  }

  let file = resolve(root, `.${pathname}`);
  if (file !== root && !file.startsWith(`${root}${sep}`)) {
    response.writeHead(403).end();
    return;
  }

  try {
    if (statSync(file).isDirectory()) file = resolve(file, 'index.html');
    statSync(file);
  } catch {
    if (extname(pathname)) {
      response.writeHead(404).end();
      return;
    }
    file = indexFile;
  }

  response.setHeader(
    'Content-Type',
    contentTypes[extname(file)] ?? 'application/octet-stream',
  );
  createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`Static preview listening on http://127.0.0.1:${port}`);
});
