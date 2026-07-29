/* Server statico minimale per la verifica locale del frontend.
 *
 *   node tests/serve.mjs [porta] [host]
 *
 * Serve la radice del repository su http://localhost:8080 senza alcuna
 * dipendenza esterna e senza contattare nulla in rete. È pensato solo per
 * lo sviluppo e per i test con client mock: non è un server di produzione.
 *
 * Per impostazione predefinita ascolta solo su 127.0.0.1. Indicare un host
 * diverso (es. 0.0.0.0) espone il server sulla rete locale: farlo solo se
 * serve raggiungerlo da un browser in container o da un altro dispositivo.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const PORT = Number(process.argv[2] || 8080);
const HOST = process.argv[3] || '127.0.0.1';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.md':   'text/markdown; charset=utf-8'
};

createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const rel = normalize(urlPath === '/' ? '/index.html' : urlPath).replace(/^(\.\.[/\\])+/, '');
  const file = join(ROOT, rel);

  // Nessuna risalita fuori dalla radice del repository.
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not a file');
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    }).end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 ' + rel);
  }
}).listen(PORT, HOST, () => {
  console.log(`serving ${ROOT} on ${HOST}`);
  console.log(`http://localhost:${PORT}/`);
});
