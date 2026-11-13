# Cuaderno de tareas
**Freddy Potes · Universidad Politécnica Salesiana · Aplicaciones Web · Unidad 3**

[Probar la demostración en GitHub Pages](https://efrain-svg.github.io/Potes_Freddy_AplWeb_U3/) · [API original de la unidad 2](https://github.com/efrain-svg/Potes_Freddy_AplWeb_U2)

## Recorrido de la demostración
1. Abre Mis tareas y filtra por estado. La edición web obtiene tres registros de ejemplo por HTTP.
2. Abre Nueva tarea, escribe un título y pulsa Guardar tarea. Filtra por su estado para localizarla. En Pages las nuevas tareas duran hasta recargar la pestaña. En ejecución local las conserva SQLite.
3. Visita Guía de uso. Tras la primera carga, activa el modo offline en las herramientas del navegador y recarga. La guía permanece disponible, el listado explica la desconexión y el formulario bloquea el envío. Al reconectar, el listado vuelve a solicitar datos.

## Ejecutar la versión con API real
Requiere Node.js 24.x y npm. Clona el repositorio (o extrae el ZIP del proyecto) y ejecuta en su carpeta raíz:
```sh
npm ci
npm test
npm start
```
Abre http://127.0.0.1:4173/ . Express sirve el cliente y la API de la unidad 2 desde el mismo origen. La base se crea en data/tareas.sqlite y persiste entre reinicios. El proyecto escucha en la interfaz local. Para empezar con datos propios, crea una tarea desde el formulario. Se puede cambiar el puerto con PORT y la base con DB_PATH.

## Organización y decisiones
- `app.js` gestiona rutas por fragmento, estado de lectura, conectividad y navegación con el historial.
- `componentes.js` define la lista, el selector de estado y el formulario. Los datos bajan por props y las acciones suben mediante eventos. El formulario conserva su borrador mientras muestra errores.
- `servicio.js` centraliza Fetch, comprueba response.ok y traduce los errores. El controlador cancela lecturas y descarta las respuestas obsoletas aunque la red ignore la cancelación.
- `api-app.js` contiene la API reutilizada de la unidad 2. GET /api/tasks devuelve la colección; POST /api/tasks crea una tarea y previene títulos duplicados (409). El cliente trabaja con id estable.
- `sw.js` y el manifest configuran la instalación y la caché de la interfaz. Solo se precarga una lista explícita de archivos locales. Las respuestas de la API, los ejemplos y las escrituras quedan fuera de Cache Storage. Vue 3.5.22 se distribuye con su licencia MIT.
- `cliente.test.js` verifica el contrato HTTP, los errores y las carreras. Para reproducir los ensayos de interfaz, sigue el recorrido anterior y envía dos títulos iguales en modo local. La lista se puede recorrer y el formulario se puede completar con teclado.

## Demostración publicada y datos
GitHub Pages sirve archivos estáticos. En ese dominio el mismo cliente consulta `ejemplos.json` y simula las altas en memoria sin transmitir los títulos escritos. Para probar estados HTTP de escritura y persistencia, ejecuta la versión local. El servidor únicamente publica los archivos del cliente incluidos en una lista explícita.
