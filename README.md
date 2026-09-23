# Justicia 2030

Aplicación web para facilitar un workshop presencial: equipos independientes y un dinamizador exploran un catálogo común, seleccionan prioridades por fase y obtienen un prompt local de «Justicia 2030».

La Iteración 1 funcional está implementada. La Iteración 2 de hardening y QA final está documentada, pero no forma parte de esta entrega.

## Requisitos

- Node.js `>=20.9.0 <25` (se recomienda una versión LTS compatible).
- npm 10 o posterior.
- Navegador reciente Chrome, Edge o Safari.

Las versiones de dependencias están fijadas en `package.json` y `package-lock.json`.

Se fijan TypeScript 6 y ESLint 9 porque son las versiones verificadas compatibles con los plugins de TypeScript y React incluidos por la configuración actual de Next.js.

## Instalación y ejecución

```bash
npm install
copy .env.example .env.local
npm run dev
```

Completa en `.env.local` las credenciales y direcciones de Resend descritas más abajo y abre `http://localhost:3000`. El build no requiere estas variables; solo se validan cuando se atiende un envío.

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | Servidor local de desarrollo. |
| `npm run build` | Build de producción Next.js. |
| `npm start` | Sirve un build ya generado. |
| `npm test` | Suite Vitest de dominio y componentes. |
| `npm run lint` | ESLint con reglas Next.js y TypeScript. |
| `npm run typecheck` | TypeScript estricto sin emitir archivos. |

## Rutas

- `/`: entrada y continuación/inicio de equipo.
- `/team`: resumen de equipo.
- `/team/phase/[phaseId]`: exploración de una fase.
- `/team/phase/[phaseId]/card/[cardId]`: detalle de tarjeta.
- `/facilitator`: espacio independiente del dinamizador.
- `POST /api/send-phase-result`: valida y envía por Resend el resultado de una fase.

No existe `teamId`, ruta por equipo ni identificación nominal.

## Estructura

```text
src/app/             rutas, Route Handler, layouts, 404 y estilos
src/components/      UI reutilizable
src/config/          configuración, contenido y plantilla del prompt
src/context/         reducer y proveedor por ámbito
src/domain/          tipos y funciones puras
src/persistence/     adaptador localStorage V3 y migraciones V1/V2
src/server/          configuración, idempotencia y envío Resend
tests/domain/        catálogo, motor, email y persistencia
tests/components/    interacción principal
docs/                especificación y plan de las dos iteraciones
```

## Configuración y contenido

La fuente central es `src/config/workshop.ts`:

- `phases`: añade, elimina o reordena fases mediante `order`.
- `categories`: modifica categorías y su orden.
- `cards`: modifica las tarjetas y sus relaciones `phaseId`/`categoryId`.
- `maxSelectionsPerPhase`: cambia el máximo funcional por fase.
- `title` e `intro`: textos principales.

Los componentes, filtros, navegación, primera fase, estado vacío, progreso, completitud y agrupación recorren esta configuración. El catálogo inicial tiene exactamente tres fases, cuatro categorías y veinticuatro tarjetas —ocho por fase y dos por combinación fase/categoría—, pero esos conteos son invariantes del fixture, no restricciones del motor.

Los demás textos de interfaz viven junto a los componentes que describen acciones genéricas; los textos de negocio, nombres y contenido no se codifican dentro de tarjetas React.

## Plantilla de Justicia 2030

Toda la redacción está en `src/config/prompt-template.ts`. El generador puro en `src/domain/prompt.ts` recorre las fases y tarjetas en orden canónico, sin asumir sus conteos.

La plantilla actual es un borrador funcional **pendiente de validación por el equipo de Innovation**. Puede ajustarse en su archivo central sin cambiar componentes. Si cambia el número de fases o tarjetas requeridas, también debe revisarse la redacción provisional que actualmente menciona tres fases y nueve tarjetas.

En la vista del dinamizador, el prompt solo se genera cuando cada fase tiene exactamente el máximo configurado. No se almacena ni se envía: se muestra y se copia mediante la API del portapapeles. En `/team`, el modal de resultado aparece únicamente cuando las tres fases están completas y se han enviado correctamente; el equipo no accede al prompt durante la actividad.

## Envío de resultados por fase

Cuando una fase del equipo tiene exactamente tres tarjetas, su resumen muestra «Enviar resultados». El navegador envía únicamente `sessionId`, `phaseId`, `collectiveId` y `selectedCardIds` a `POST /api/send-phase-result`. El Route Handler valida los datos contra `workshopConfig`, ordena las tarjetas según el catálogo y construye en servidor un email de texto plano. Se envía un correo independiente por fase; no existe un correo final adicional.

Resend se usa solo en servidor. Remitente, destinatarios, asunto, texto y nombre del colectivo nunca proceden directamente del cliente. Una clave SHA-256 determinista basada en sesión, colectivo, fase y selección canónica se entrega a Resend como `idempotencyKey`, evitando duplicados para la misma combinación. El colectivo validado aparece en el asunto y el cuerpo del email.

## Persistencia, continuación y reinicio

La aplicación guarda únicamente `schemaVersion`, `sessionId`, los IDs seleccionados y `collectiveId`:

- Equipo: `justicia2030:v1:team`.
- Dinamizador: `justicia2030:v1:facilitator`.

El contrato actual es V3. Los estados V1 migran conservando selecciones; los V2 conservan además un colectivo válido; ambos reciben un UUID nuevo y se persisten como V3. Un V3 válido conserva su `sessionId`.

Cada rol tiene una instancia separada de contexto/reducer. La hidratación se realiza en cliente y no se escribe el estado vacío antes de completarla. Un error básico de lectura o escritura muestra un aviso y permite continuar en memoria.

Cuando existen selecciones de equipo, `/` ofrece «Continuar partida». «Comenzar nueva partida» elimina solo el estado del equipo y persiste una sesión nueva; «Comenzar nueva sesión» hace lo mismo únicamente para el dinamizador. Ambos requieren confirmación y nunca se usa `localStorage.clear()`.

Cada equipo debe usar su propio dispositivo o perfil. Solo hay una sesión de equipo activa por perfil. No existe sincronización entre equipos, con el dinamizador ni entre pestañas; si se abren varias pestañas, gana el último guardado. Borrar manualmente los datos del sitio desde el navegador elimina ambos estados de ese navegador.

## Seguridad, privacidad y funcionamiento

- La aplicación funciona online y no garantiza modo offline.
- No carga recursos visuales remotos en runtime: usa fuentes del sistema y assets locales.
- La única integración externa en runtime es Resend desde el Route Handler; no hay llamadas a IA, analítica ni trackers.
- La API key y las direcciones se leen únicamente en servidor y nunca deben incluirse en logs o respuestas.
- Las dependencias npm se descargan en instalación/build; esto no introduce cargas remotas durante el uso.
- `localStorage` no es un control de acceso ni protege frente a una persona con DevTools.
- No deben introducirse datos personales, expedientes ni información confidencial en las tarjetas.

## Pruebas y build

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

La suite separa invariantes específicas del fixture y reglas genéricas. Incluye una configuración sintética con cantidades distintas para evitar acoplamiento a 3/4/24.

## Despliegue en Vercel

Importa el repositorio en Vercel y utiliza la detección automática de Next.js. No configures `output: "export"`; el Route Handler requiere el runtime estándar de Next.js. El comando de build es `npm run build`.

Configura estas variables tanto en Preview como en Production y vuelve a desplegar después de añadirlas:

- `RESEND_API_KEY`: API key propia de esta aplicación.
- `RESEND_FROM_EMAIL`: remitente de un dominio verificado, por ejemplo `Justicia 2030 <resultados@justicia2030.party>`.
- `RESULTS_EMAIL_TO`: uno o varios destinatarios separados por comas.
- `RESULTS_REPLY_TO`: dirección de respuesta opcional.

Para desarrollo, copia `.env.example` a `.env.local`. `.env.local` está ignorado por Git y nunca debe versionarse. En Resend hay que verificar el dominio remitente y crear una API key independiente para esta aplicación; el mismo dominio verificado puede utilizarse desde otras aplicaciones con sus propias claves.

## Limitaciones del MVP

Salvo el Route Handler de envío por Resend, no incluye backend adicional, autenticación, sincronización, comunicación entre roles, tiempo real, IA, CMS, Excel, analítica, PWA, offline garantizado, historial, múltiples partidas por perfil, ranking, drag and drop ni identidad nominal de equipo. Una identificación nominal podría estudiarse en una versión posterior, pero no está diseñada ni preparada en este MVP.

## Iteración 2 pendiente

- Normalización exhaustiva y recuperación selectiva de estados corruptos.
- Matriz completa de errores de lectura, escritura y borrado; almacenamiento bloqueado, cuota y fallback en memoria validado.
- Pruebas defensivas de todos los estados límite y portapapeles.
- Auditoría sistemática de accesibilidad, teclado, foco, contraste y lectores de pantalla.
- QA manual responsive, navegadores objetivo y contenidos largos.
- Cabeceras de seguridad y CSP definitiva verificadas con Next.js/Vercel.
- Revisión de dependencias y vulnerabilidades.
- Revisión final de documentación y verificación de producción.

Consulta [la especificación](docs/SPEC.md) y [el plan](docs/IMPLEMENTATION_PLAN.md) para el detalle completo y la separación formal entre iteraciones.
