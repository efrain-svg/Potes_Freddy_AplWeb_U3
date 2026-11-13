import express from 'express';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './api-app.js';

const dbPath = resolve(process.env.DB_PATH || 'data/tareas.sqlite');
mkdirSync(dirname(dbPath), { recursive: true });
const api = createApp({ dbPath });
const server = express();
const assets = new Set(['/', '/index.html', '/app.js', '/componentes.js', '/servicio.js', '/style.css',
  '/sw.js', '/vue.esm-browser.prod.js', '/ejemplos.json', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png']);
const files = express.static(fileURLToPath(new URL('./', import.meta.url)));
server.use((req, res, next) => assets.has(req.path) ? files(req, res, next) : next());
server.use(api.app);
const port = Number(process.env.PORT || 4173);
const socket = server.listen(port, '127.0.0.1', () => {
  console.log('Cuaderno disponible en http://127.0.0.1:' + socket.address().port);
});
function stop() {
  api.events.close();
  socket.close(() => api.repo.close());
  socket.closeIdleConnections();
}
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
