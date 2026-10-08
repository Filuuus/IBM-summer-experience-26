# Bitácora de cambios de agentes

Este registro documenta las intervenciones de agentes. El historial de versiones
del código se consulta con Git. Agrega las entradas más recientes al inicio.

## 2026-10-08 — Codex — Header responsivo

- **Objetivo:** mejorar la distribución del header y evitar que sus opciones se compriman o encimen.
- **Archivos:** `frontend/src/app/shared/components/header/Header.html`, `Header.ts`,
  `Header.css`, `Header.spec.ts` en el mismo directorio y `AGENT_CHANGELOG.md`.
- **Cambios:** logo separado, enlaces sin saltos de línea, estilos de página activa,
  menú desplegable por debajo de 1400 px, distribución en dos columnas para tablet y
  una para móvil, acceso a sesión desde el menú móvil, temas claro/oscuro y permisos
  existentes. Enlaces con rutas reales, etiquetas accesibles, cierre con Escape y
  foco contenido/restaurado en el diálogo de cierre de sesión.
- **Verificación:** `npm run build` correcto (avisos existentes de Node 25 y CommonJS);
  `npm test -- --watch=false --include='src/app/shared/components/header/Header.spec.ts'`:
  3 pruebas aprobadas. Browser: revisión visual a 1440 y 375 px; tablet a 768 px,
  header sin desbordamiento horizontal, apertura/cierre del menú, Escape, tema oscuro
  y opciones de captura para la sesión de jefe existente. `git diff --check`: correcto.
- **Estado:** cambios locales en rama `arreglos`, sin commit; cambios previos conservados.
- **Pendientes / límites:** no se ejecutó auditoría AXE automatizada; no se repitió la
  suite completa por los fallos preexistentes de `window.matchMedia` documentados abajo.

## 2026-10-07 — Codex — Captura de datos de investigador y configuración de jefe

- **Objetivo:** conectar ambas vistas con la API y persistir muestreos y configuración en PostgreSQL.
- **Archivos:** `backend/api/models.py`, `backend/api/urls.py`, `backend/api/capture_schema.py`,
  `backend/api/capture_views.py`, `backend/api/migrations/0003_configuracioncaptura_registrocaptura.py`,
  `backend/api/test_capture.py`, `backend/core/test_settings.py`,
  `frontend/src/app/upload/services/form-config.service.ts` y su `.spec.ts`,
  los componentes `.ts`, `.html` y `.spec.ts` de `upload/investigador/` y `upload/jefe/`,
  `frontend/src/app/upload/styles_upload.css`, `README.md`, `AGENT_CHANGELOG.md`.
- **Cambios:** catálogos reales, formulario reactivo, responsable autenticado, validación numérica y
  de catálogos, registros persistentes con consultas por rol y páginas de 50, consulta y gráfica de
  rendimiento dentro de captura. Configuración de jefe con búsqueda, filtros, vista previa, borrador,
  restablecimiento y publicación independientes. Campos obligatorios protegidos y rechazo de
  formularios con versión antigua. Las mediciones de campo se almacenan aparte de los resultados
  de laboratorio; no cambian datasets, modelos ML, fórmulas ni gráficas históricas de analíticas.
- **Verificación:** `python manage.py test api --settings=core.test_settings`: 16 pruebas aprobadas
  en SQLite aislado; `npm test -- --watch=false --include='src/app/upload/**/*.spec.ts'`: 11 pruebas
  aprobadas; `npm run build`: correcto (avisos existentes de CommonJS y Node 25).
  `makemigrations --check --dry-run --settings=core.test_settings`: sin cambios pendientes.
  `git diff --check`: correcto. Migración `0003` aplicada correctamente en PostgreSQL configurado.
  Verificación adicional de catálogos, guardado de borrador, publicación, inserción y lectura real
  contra PostgreSQL mediante transacción revertida: aprobada; sin usuarios ni registros ficticios
  persistentes. Browser: formulario, catálogos, errores al enviar incompleto y consulta sin registros
  comprobados con la sesión de investigador existente.
- **Estado:** cambios locales en rama `arreglos`, sin commit. Migración aplicada en la base configurada.
- **Pendientes / límites:** la suite completa `npm test -- --watch=false` falla en las 2 pruebas
  preexistentes de `app.spec.ts` porque el entorno no implementa `window.matchMedia`.
  No se ejecutó auditoría AXE automatizada (no está instalada en el proyecto).
  La vista de jefe se verifica mediante pruebas de componente/API; no se usó una sesión de jefe
  en el navegador. Otros entornos deberán aplicar la migración al desplegar.

## 2026-10-07 — Codex — Instrucciones y control de cambios

- **Objetivo:** definir un procedimiento común para agentes y registrar sus cambios.
- **Archivos:** `AGENTS.md`, `AGENT_CHANGELOG.md`.
- **Cambios:** instrucciones generales, cuidado de cambios existentes, flujo de Git,
  validación y protección de secretos; referencia a las reglas de Angular existentes.
- **Verificación:** revisión de estructura, instrucciones existentes y diff de los
  archivos creados; sin pruebas de aplicación por tratarse de documentación.
- **Estado:** sin commit.
- **Pendientes:** ninguno para esta tarea.

## Plantilla para nuevas entradas

```markdown
## AAAA-MM-DD — Agente o herramienta — Descripción breve

- **Objetivo:** ...
- **Archivos:** `ruta/al/archivo`.
- **Cambios:** ...
- **Verificación:** comandos ejecutados y resultados, o motivo de no ejecución.
- **Estado:** sin commit / incluido en el commit de esta tarea / hash conocido.
- **Pendientes:** ninguno o limitaciones concretas.
```

## 2026-10-08 — Codex — Etiqueta del botón de análisis SMAP

- **Objetivo:** corregir los textos repetidos del botón al iniciar el análisis de parcela.
- **Archivos:** `frontend/src/app/soil-analysis/soil-analysis.component.html`,
  `frontend/src/app/soil-analysis/soil-analysis.component.spec.ts`, `AGENT_CHANGELOG.md`.
- **Cambios:** una única etiqueta interpolada para los estados normal y de carga;
  iconos alternados con `@if`/`@else`, tamaño protegido y animación sensible a
  movimiento reducido; atributo `aria-busy` durante la carga.
- **Verificación:** desde `frontend/`, `npm run build` correcto con avisos de
  Node 25 y dependencias CommonJS; `npm test -- --watch=false --include='src/app/soil-analysis/**/*.spec.ts'`:
  1 prueba aprobada, comprueba texto único, icono único y deshabilitación en cinco
  transiciones de estado. `git diff --check`: correcto.
- **Estado:** cambios locales en rama `arreglos`, sin commit.
- **Pendientes:** comprobación visual en navegador y auditoría AXE no ejecutadas.
