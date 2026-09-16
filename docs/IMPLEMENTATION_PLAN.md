# Plan de implementación — Justicia 2030

## 1. Arquitectura elegida

- Next.js App Router con TypeScript estricto y despliegue estándar en Vercel.
- Server Components para páginas y validación de parámetros; Client Components para interacción, contextos y APIs del navegador.
- Tailwind CSS para estilos, sin fuentes ni assets remotos.
- Configuración central y componentes data-driven.
- Un proveedor React reutilizable basado en `useReducer`, instanciado por separado para `team` y `facilitator`.
- Dominio puro, sin dependencias de React ni `localStorage`.
- Persistencia encapsulada detrás de un adaptador pequeño y parametrizado por clave.
- Vitest + React Testing Library + user-event; ESLint y `tsc --noEmit`.

Decisiones menores: compatibilidad con Node 20.19 o LTS posteriores admitidas por Next.js; TypeScript 6 y ESLint 9 son las versiones compatibles verificadas con `typescript-eslint` y `eslint-plugin-react` incluidos por Next.js; filtros y paneles de detalle son estado efímero local; el detalle del dinamizador es un panel semántico en la misma ruta; no se incorpora librería de iconos ni de estado.

## 2. Estructura prevista

```text
src/
  app/                         páginas, layouts, 404 y estilos
  components/                  shell, tarjetas, filtros, detalle, bandeja,
                               progreso, prompt y confirmación
  config/                      workshop, contenidos, textos y prompt-template
  context/                     provider/reducer reutilizable por ámbito
  domain/                      tipos, catálogo, selección, progreso y prompt
  persistence/                 adaptador y validación básica V1
  test/                        configuración de Vitest
tests/
  domain/                      invariantes genéricas y del fixture, selección,
                               progreso, prompt y persistencia
  components/                  interacción y accesibilidad principal
docs/                          especificación, plan y referencia visual
```

## 3. Componentes y responsabilidades

- `AppShell`: cabecera local, navegación y ancho de lectura.
- `WorkshopProvider`: hidrata, reduce, persiste y reinicia solo el ámbito recibido.
- `PhaseExplorer`: filtro efímero, grid de tarjetas y bandeja de selección.
- `CardTile`: resumen, estado y acciones separadas de detalle/selección.
- `CardDetail`: campos completos y acción de selección.
- `CategoryFilters`: «Todas» + categorías configuradas con `aria-pressed`.
- `SelectionTray`: selección canónica, visible aunque el filtro oculte tarjetas.
- `ProgressSummary`: progreso derivado por fase y total.
- `Justicia2030`: estado incompleto o prompt completo derivado.
- `PromptArea`: textarea de solo lectura, copia y feedback accesible.
- `ResetDialog`: confirmación nativa accesible mediante `<dialog>` controlado.
- `TeamLandingState`: inspección básica de la clave del equipo en `/`.
- `FacilitatorWorkspace`: pestaña activa, explorador, detalle, resumen y prompt.

## 4. Modelo de estado

```ts
type WorkshopState = {
  hydrated: boolean
  selectionsByPhase: Record<PhaseId, CardId[]>
  storageNotice: string | null
}
```

Acciones: `hydrate`, `toggle`, `reset`, `storage-error` y `dismiss-notice`. El reducer delega la mutación de selecciones en funciones puras y conserva orden canónico. Cada proveedor recibe `scope`, clave y configuración; nunca comparte estado con el otro rol.

## 5. Adaptador de persistencia

`createLocalStorageAdapter(key)` expone `read`, `write` y `remove`. La validación V1 de Iteración 1 acepta solo un objeto con `schemaVersion: 1`, un objeto `selectionsByPhase` y arrays de strings para las fases configuradas. Cualquier fallo descarta el estado completo para ese rol y devuelve un resultado de error recuperable.

La hidratación ocurre en `useEffect`. Otro efecto persiste solo cuando `hydrated === true`, evitando sobrescribir datos con el estado SSR vacío. El reinicio elimina únicamente la clave del proveedor actual.

## 6. Funciones puras de dominio

- Crear estado vacío recorriendo fases.
- Validar configuración genérica (IDs, texto, referencias y beneficios).
- Obtener filtros, fases, categorías y tarjetas ordenadas.
- Seleccionar, deseleccionar y alternar con límite y validación de pertenencia.
- Ordenar selecciones por orden canónico, sin orden temporal ni duplicados.
- Calcular progreso por fase/total y completitud.
- Validar invariantes concretas del fixture en pruebas separadas.
- Generar el prompt desde configuración, plantilla y selecciones completas.

## 7. Estrategia de pruebas

- **Fixture:** conteos iniciales y contenido requerido.
- **Arquitectura genérica:** configuración sintética con cantidades distintas para demostrar derivación de estado, filtros, progreso, orden y prompt.
- **Dominio:** selección 0..máximo, rechazo de exceso/cruce, duplicados, deselección, independencia, orden canónico e igualdad de peso.
- **Persistencia:** V1 válido, claves separadas, hidratación/recarga, ausencia de escritura previa, JSON ilegible, excepción básica y reinicios independientes.
- **Prompt:** completitud, nueve tarjetas del fixture, cabeceras no confundidas, agrupación, campos, omisiones, orden, ausencia de IDs y determinismo sin snapshot literal completo.
- **Componentes:** filtros, límite, bandeja, progreso, estado incompleto, copia, error, feedback, reinicios y ausencia de identidad.
- **Rutas:** páginas principales y validación de fase/tarjeta mediante funciones de resolución y build de App Router.

No se añade Playwright en Iteración 1.

## 8. Orden de implementación

### Iteración 1 — ejecutar ahora

1. Crear `SPEC.md` y este plan.
2. Inicializar toolchain con versiones fijas y lockfile.
3. Crear tipos, configuración, 24 tarjetas y plantilla.
4. Implementar validación, selección, progreso y generador puro.
5. Implementar persistencia básica, reducer y proveedores por ámbito.
6. Crear componentes reutilizables y estilos responsive/accesibles.
7. Crear las seis rutas, 404 y validación de relaciones.
8. Sustituir el README genérico.
9. Añadir pruebas de fixture, dominio, persistencia, prompt y componentes.
10. Ejecutar y corregir `npm test`, `npm run lint`, `npm run typecheck` y `npm run build`.
11. Revisar recursos externos, claves, reinicios, rutas y ausencia de identidad.
12. Detenerse y solicitar validación manual.

### Iteración 2 — documentar, no ejecutar ahora

1. Diseñar normalizador exhaustivo y recuperación selectiva.
2. Cubrir matriz de corrupción y todos los errores de almacenamiento/fallback.
3. Ampliar pruebas defensivas y estados límite.
4. Auditar accesibilidad y corregir hallazgos.
5. Ejecutar QA manual responsive, navegadores y contenido largo.
6. Definir, configurar y verificar cabeceras y CSP en producción Vercel.
7. Auditar dependencias y vulnerabilidades.
8. Revisar documentación y ejecutar verificación final de producción.

## 9. Comandos de verificación

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Comprobaciones complementarias: búsqueda de URLs/recursos remotos y APIs prohibidas; revisión de claves; navegación directa; fixture y prompt; inspección responsive manual básica.

## 10. Riesgos y mitigaciones

| Riesgo | Mitigación de Iteración 1 |
| --- | --- |
| SSR y `localStorage` | Acceso solo en efectos cliente, estado `hydrated` y bloqueo de escritura previa. |
| Datos persistidos no confiables | Parseo/forma V1 básicos con descarte completo y aviso; hardening queda explícito para I2. |
| Acoplamiento a 3/4/24 | Configuración iterable y tests con fixture sintético. |
| Límite aplicado solo en UI | Funciones puras y reducer rechazan exceso y tarjetas cruzadas. |
| Orden de clic interpretado como ranking | Orden canónico al guardar/renderizar/generar y textos de igual peso. |
| Prompt provisional | Plantilla única, tests estructurales y aviso de validación de Innovation. |
| Confusión entre roles | Instancias de proveedor y claves distintas; tests de reinicio independiente. |
| Fallo de portapapeles | Mensaje accionable y textarea seleccionable manualmente. |
| Responsive sin E2E | CSS mobile/tablet-first y revisión manual básica; matriz sistemática en I2. |
| CSP prematura incompatible | No se configura en I1; se diseña y verifica en I2. |

## 11. Estado del plan

- Iteración 1: autorizada para esta ejecución.
- Iteración 2: backlog deliberado, no autorizado en esta ejecución.
