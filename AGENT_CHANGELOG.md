# Bitácora de cambios de agentes

Este registro documenta las intervenciones de agentes. El historial de versiones
del código se consulta con Git. Agrega las entradas más recientes al inicio.

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
