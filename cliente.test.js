import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from './api-app.js';
import { request, latestRequest } from './servicio.js';

test('GET vacío, POST 201 y lectura del título con la API de la U2', async t => {
  const api = createApp({});
  const server = api.app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => { await new Promise(resolve => server.close(resolve)); api.close(); });
  const url = 'http://127.0.0.1:' + server.address().port + '/api/tasks';
  assert.deepEqual(await request(url), []);
  const options = {method:'POST', headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'Ensayar la demo'})};
  const result = await fetch(url, options);
  assert.equal(result.status, 201);
  assert.equal((await request(url))[0].title, 'Ensayar la demo');
  await assert.rejects(request(url, options), /Ya existe/);
});

test('una lectura lenta nunca sustituye un resultado más reciente', async () => {
  const latest = latestRequest(), seen = [];
  let release, firstSignal;
  const first = latest.run(signal => { firstSignal=signal; return new Promise(done => {release=done;}); }, x=>seen.push(x), assert.fail);
  await latest.run(async () => 'actual', x=>seen.push(x), assert.fail);
  release('anterior'); await first;
  assert.equal(firstSignal.aborted, true);
  assert.deepEqual(seen, ['actual']);
});

test('cancelar al salir descarta un error tardío', async () => {
  const latest = latestRequest();
  let fail;
  const pending = latest.run(() => new Promise((_, reject) => {fail=reject;}), assert.fail, assert.fail);
  latest.cancel(); fail(new Error('respuesta tardía')); await pending;
});
