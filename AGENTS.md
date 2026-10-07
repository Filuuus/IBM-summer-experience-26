# Instrucciones para agentes

## Alcance y proyecto

Estas instrucciones aplican a todo el repositorio Sentineli / CropAnalytics.
Lee también el `AGENTS.md` más cercano a los archivos que vayas a modificar;
por ejemplo, `frontend/AGENTS.md` contiene las reglas específicas de Angular.
Las instrucciones explícitas del usuario tienen prioridad.

- `backend/`: API con Django y Django REST Framework, base de datos PostGIS y lógica de recomendaciones.
- `frontend/`: aplicación Angular con TypeScript y Tailwind CSS.
- `data/` y `backend/data/`: datos y documentación de las fuentes.
- Consulta `README.md` para entender la arquitectura y la ejecución local.

## Antes de modificar archivos

1. Revisa `git status --short` y la rama actual con `git branch --show-current`.
2. Identifica los cambios existentes del usuario o de otros agentes. No los reviertas,
   sobrescribas ni incluyas en un commit como si fueran tuyos.
3. Lee las instrucciones aplicables y el código relacionado con la tarea.
4. Delimita el cambio solicitado. Evita refactorizaciones o actualizaciones de
   dependencias ajenas a la tarea.

## Control de versiones con Git

Git conserva el historial del código; este archivo define el procedimiento de trabajo.
`AGENT_CHANGELOG.md` registra el contexto y las verificaciones de cada intervención.

- Trabaja en la rama indicada por el usuario. Si la tarea requiere una rama nueva,
  usa `agent/<descripcion-breve>` y créala antes de editar, sin trasladar ni descartar
  cambios existentes de forma inadvertida.
- No crees commits, publiques ramas ni abras o fusiones PR sin que la solicitud lo autorice.
- Cuando un commit esté autorizado, agrupa únicamente cambios relacionados con la
  tarea y agrega archivos explícitos con `git add <ruta>`; evita `git add .`.
- Revisa `git diff` y, antes de un commit, `git diff --cached` para comprobar su alcance.
- Usa mensajes como `feat(api): agrega filtro por municipio`,
  `fix(frontend): corrige validación de coordenadas` o
  `docs(agents): documenta flujo de trabajo`.
- No ejecutes `git reset --hard`, `git clean`, pushes forzados ni reescribas el historial
  sin autorización explícita para esa operación.
- Si aparece un conflicto con trabajo ajeno, conserva ese trabajo y comunica el
  conflicto antes de tomar una decisión que pueda descartarlo.

## Registro de intervenciones

Al terminar una tarea que cambie archivos, agrega una entrada a `AGENT_CHANGELOG.md`.
No registres tareas de solo consulta ni ejecuciones sin cambios.

Incluye la fecha, el agente o herramienta realmente utilizado, el objetivo, los
archivos modificados, las verificaciones y las limitaciones pendientes. Indica
`sin commit` si todavía no hay un commit. No inventes resultados ni identificadores.
Si el commit incluye la bitácora, no intentes incluir su propio hash en esa entrada:
el historial de Git permite encontrarlo.

## Implementación y validación

- Respeta los patrones del código existente y las reglas de `frontend/AGENTS.md`.
- No alteres modelos entrenados, datasets o fórmulas de recomendación salvo que
  formen parte de la tarea; documenta el impacto si se modifican.
- Si cambias modelos de Django, revisa si corresponde generar una migración.
- Para cambios de backend, ejecuta pruebas relevantes desde `backend/`, por ejemplo
  `python manage.py test api`, usando el entorno del proyecto.
- Para cambios de frontend, ejecuta desde `frontend/` `npm run build` y las pruebas
  relevantes con `npm test -- --watch=false` cuando corresponda.
- Para cambios solo de documentación, revisa las rutas, comandos y el diff;
  no es necesario ejecutar toda la suite.
- Si una validación no puede ejecutarse, registra el motivo concreto. No declares
  que pasó si no se ejecutó correctamente.

## Secretos y archivos locales

- No publiques ni copies valores de `.env`, tokens, contraseñas o credenciales a
  respuestas, bitácoras, commits o archivos de documentación.
- Usa nombres de variables y valores ficticios al documentar configuración.
- No incluyas entornos virtuales, `node_modules`, builds o archivos temporales
  generados en los commits.

## Entrega

Resume qué cambió, qué se verificó y qué queda pendiente. Enumera los archivos
relevantes e indica si los cambios quedaron locales o se creó un commit autorizado.
