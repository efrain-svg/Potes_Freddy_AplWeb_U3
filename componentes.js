export const estados = { pending: 'Pendiente', in_progress: 'En curso', done: 'Terminada' };

export const ListaTareas = {
  props: { tareas: { type: Array, required: true } },
  data: () => ({ estados }),
  template: `<ul class="tasks"><li v-for="t in tareas" :key="t.id">
    <div><strong>{{t.title}}</strong><p v-if="t.description">{{t.description}}</p></div>
    <span class="tag" :class="t.status">{{estados[t.status]}}</span>
  </li></ul>`
};

export const FiltroTareas = {
  props: { estado: String }, emits: ['filtrar'],
  data: () => ({ estados }),
  template: `<label class="filter">Filtrar por estado
    <select :value="estado" @change="$emit('filtrar', $event.target.value)">
    <option value="">Todos los estados</option>
    <option v-for="(label, value) in estados" :key="value" :value="value">{{label}}</option></select></label>`
};

export const FormularioTarea = {
  props: { ocupado: Boolean, conectado: Boolean, error: String }, emits: ['guardar'],
  data: () => ({ title: '', description: '', status: 'pending', estados, aviso: '' }),
  methods: {
    enviar() {
      if (!this.title.trim()) { this.aviso = 'Escribe un título para la tarea.'; this.$refs.titulo.focus(); return; }
      this.aviso = '';
      this.$emit('guardar', { title: this.title.trim(), description: this.description.trim(), status: this.status });
    }
  },
  template: `<form class="panel form" @submit.prevent="enviar">
    <label>Título de la tarea<input ref="titulo" v-model="title" required maxlength="120" autocomplete="off"></label>
    <label>Descripción (opcional)<textarea v-model="description" maxlength="1000" rows="3"></textarea></label>
    <label>Estado inicial<select v-model="status"><option v-for="(label, value) in estados" :key="value" :value="value">{{label}}</option></select></label>
    <p v-if="aviso || error" role="alert" class="warning">{{aviso || error}}</p>
    <button class="primary" :disabled="ocupado || !conectado">{{ocupado ? 'Guardando…' : 'Guardar tarea'}}</button>
  </form>`
};
