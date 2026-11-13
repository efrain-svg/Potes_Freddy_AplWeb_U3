import { createApp, ref, computed, nextTick, onMounted, onUnmounted } from './vue.esm-browser.prod.js';
import { listTasks, createTask, latestRequest, demostracion } from './servicio.js';
import { ListaTareas, FiltroTareas, FormularioTarea } from './componentes.js';

const views = { tareas: 'Mis tareas', nueva: 'Nueva tarea', guia: 'Guía de uso' };
function readRoute() {
  const route = location.hash.slice(2);
  return Object.hasOwn(views, route) ? route : 'tareas';
}
const App = {
  components: { ListaTareas, FiltroTareas, FormularioTarea },
  setup() {
    const route = ref(readRoute()), state = ref('carga'), tasks = ref([]), filter = ref('');
    const online = ref(navigator.onLine), saving = ref(false), notice = ref(''), error = ref(''), formError = ref('');
    const visible = computed(() => tasks.value.filter(t => !filter.value || t.status === filter.value));
    const reads = latestRequest();
    async function load() {
      state.value = 'carga';
      await reads.run(listTasks, data => { tasks.value = data; state.value = 'éxito'; },
        e => { tasks.value = []; error.value = e.message; state.value = 'error'; });
    }
    function connection() {
      online.value = navigator.onLine;
      if (!online.value) { reads.cancel(); tasks.value = []; notice.value = ''; }
      else if (route.value === 'tareas') load();
    }
    function navigate() {
      route.value = readRoute();
      formError.value = '';
      if (route.value === 'tareas' && online.value) load();
      else reads.cancel();
      document.title = views[route.value] + ' · Cuaderno';
      nextTick(() => document.querySelector('h1').focus());
    }
    async function save(task) {
      if (saving.value || !online.value) return;
      saving.value = true; formError.value = ''; notice.value = '';
      try {
        const created = await createTask(task);
        notice.value = 'Tarea guardada: ' + created.title;
        filter.value = '';
        location.hash = '/tareas';
      } catch (e) { formError.value = e.message; }
      finally { saving.value = false; }
    }
    onMounted(() => {
      document.title = views[route.value] + ' · Cuaderno';
      if (online.value && route.value === 'tareas') load();
      window.addEventListener('hashchange', navigate);
      window.addEventListener('online', connection);
      window.addEventListener('offline', connection);
      if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
    onUnmounted(() => {
      reads.cancel();
      window.removeEventListener('hashchange', navigate);
      window.removeEventListener('online', connection);
      window.removeEventListener('offline', connection);
    });
    return { route, state, tasks, filter, online, saving, notice, error, formError, visible, load, save, views, demostracion };
  },
  template: `<header><div class="wrap bar"><a class="brand" href="#/tareas"><img src="./icon-192.png" alt="">Cuaderno</a>
    <nav aria-label="Principal"><a v-for="(label, key) in views" :key="key" :href="'#/'+key" :aria-current="route===key?'page':null">{{label}}</a></nav></div></header>
    <main id="contenido" tabindex="-1" class="wrap"><div class="eyebrow">Aplicaciones Web · Unidad 3</div>
    <h1 tabindex="-1">{{views[route]}}</h1><p v-if="!online" role="status" class="warning">Sin conexión. La guía está disponible. Las tareas requieren acceso a la API.</p>
    <p v-if="demostracion" class="demo">Demostración con ejemplos. Las tareas que añadas duran hasta recargar esta pestaña.</p>
    <section v-if="route==='tareas'" aria-label="Listado">
      <p v-if="notice && online" role="status" class="notice">{{notice}}</p>
      <div class="toolbar"><FiltroTareas :estado="filter" @filtrar="filter=$event"/><button @click="load" :disabled="!online">Actualizar lista</button></div>
      <div class="panel" aria-live="polite" aria-atomic="false">
      <p v-if="!online">Vuelve a conectarte para consultar el listado.</p>
      <p v-else-if="state==='carga'" role="status">Cargando tareas…</p>
      <div v-else-if="state==='error'"><p role="alert">{{error}}</p><button @click="load">Reintentar</button></div>
      <template v-else><p class="count">{{visible.length}} {{visible.length===1?'tarea':'tareas'}}</p>
      <ListaTareas v-if="visible.length" :tareas="visible"/>
      <p v-else-if="tasks.length">Ninguna tarea coincide con este estado.</p>
      <p v-else>Tu cuaderno está vacío. <a href="#/nueva">Crea la primera tarea</a>.</p></template></div>
    </section>
    <FormularioTarea v-else-if="route==='nueva'" :ocupado="saving" :conectado="online" :error="formError" @guardar="save"/>
    <article v-else class="panel guide"><h2>Organizar las tareas</h2><p>En Nueva tarea escribe un título y elige su estado. Después de guardar, la tarea aparece en Mis tareas. El filtro permite ver solo las pendientes, en curso o terminadas.</p>
    <h2>Instalar el cuaderno</h2><p>Abre el menú de un navegador compatible y elige instalar la aplicación o añadirla a la pantalla de inicio.</p>
    <h2>Trabajar sin conexión</h2><p>Tras una primera visita con conexión, puedes volver a abrir la interfaz y esta guía. Consulta o crea tareas cuando la API esté disponible. Los envíos pendientes no se guardan.</p></article></main>`
};
createApp(App).mount('#app');
