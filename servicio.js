export async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, { cache: 'no-store', ...options });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('No se pudo contactar con la API. Comprueba la conexión y vuelve a intentarlo.');
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error?.message || 'La API respondió con el estado ' + response.status + '.');
  }
  return (await response.json()).data;
}

export const demostracion = globalThis.location?.hostname.endsWith('.github.io') || false;
const altas = [];
export async function listTasks(signal) {
  const base = await request(demostracion ? './ejemplos.json' : './api/tasks', { signal });
  return demostracion ? [...base, ...altas] : base;
}
export async function createTask(task) {
  if (demostracion) {
    const current = await listTasks();
    if (current.some(t => t.title.toLocaleLowerCase() === task.title.toLocaleLowerCase())) {
      throw new Error('Ya existe una tarea con ese título.');
    }
    const created = { ...task, id: crypto.randomUUID() };
    altas.push(created);
    return created;
  }
  return request('./api/tasks', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task)
  });
}

export function latestRequest() {
  let current;
  return {
    async run(read, accept, reject) {
      current?.abort();
      const active = new AbortController();
      current = active;
      try {
        const result = await read(active.signal);
        if (current === active) accept(result);
      } catch (error) {
        if (current === active && !active.signal.aborted) reject(error);
      }
    },
    cancel() {
      current?.abort();
      current = undefined;
    }
  };
}
