# Especificación funcional — Justicia 2030

## 1. Propósito y alcance

Justicia 2030 es una aplicación web para apoyar un workshop presencial. Cada equipo explora un catálogo común, debate propuestas y selecciona hasta el máximo configurado de tarjetas por fase. El dinamizador dispone de un espacio separado para registrar el consenso verbal. Al completar tres tarjetas de una fase, el equipo puede enviar ese resultado automáticamente por correo; cada fase genera su propio email y no existe un envío final.

El MVP se divide en dos entregas. La Iteración 1 aporta el producto funcional completo; la Iteración 2 queda como hardening y QA final. Esta primera ejecución implementa exclusivamente la Iteración 1.

La infografía de `docs/infografia-justica-2030.png` es solo una referencia de composición. No forman parte del producto los logotipos, nombres o números de equipo, fases bloqueadas, rankings, carruseles ni controles no descritos aquí.

## 2. Actores y supuestos operativos

- **Equipo:** usa un dispositivo o perfil de navegador independiente y mantiene una única sesión local activa. La interfaz no solicita ni muestra nombre, número, alias, URL, QR ni identificador de equipo.
- **Dinamizador:** registra sus propias selecciones según el consenso del workshop. No recibe ni lee datos de los equipos.
- Si ambos roles comparten excepcionalmente un navegador, sus estados siguen separados.
- Las tarjetas, selecciones y prompts no contienen datos personales, expedientes ni información confidencial. El contenido empaquetado es público.
- `localStorage` es una ayuda operativa, no autenticación ni control de integridad. Dos equipos no deben compartir el mismo perfil simultáneamente.

## 3. Rutas

| Ruta | Finalidad |
| --- | --- |
| `/` | Entrada, inicio/continuación del equipo y acceso al dinamizador. |
| `/team` | Resumen, progreso y navegación libre por las fases. |
| `/team/phase/[phaseId]` | Exploración, filtros y selección de una fase. |
| `/team/phase/[phaseId]/card/[cardId]` | Detalle completo de una tarjeta de esa fase. |
| `/facilitator` | Flujo completo e independiente del dinamizador en una pantalla. |
| `POST /api/send-phase-result` | Validación y envío por Resend del resultado de una fase. |

No existen rutas con `teamId` ni parámetros para identificar grupos. Una fase o tarjeta desconocida, o una tarjeta que no pertenezca a la fase de la URL, produce la página 404.

## 4. Flujos completos

### 4.1 Equipo

1. En `/`, si no hay selecciones válidas guardadas, el usuario elige «Iniciar como equipo». Si ya hay selecciones, elige «Continuar partida» o confirma «Comenzar nueva partida».
2. `/team` muestra todas las fases y el progreso por fase. Ninguna fase está bloqueada.
3. En una fase, el filtro inicial es «Todas». El usuario filtra, abre detalles, selecciona o deselecciona tarjetas y puede quitar selecciones desde una bandeja siempre accesible.
4. Al alcanzar el máximo, las tarjetas no seleccionadas quedan deshabilitadas con una explicación visible; las seleccionadas siguen permitiendo deselección.
5. Al completar exactamente tres tarjetas, el resumen de esa fase permite enviarlas. El envío no bloquea la fase y una combinación modificada puede enviarse de nuevo.
6. Cuando las tres fases están completas y sus tres resultados se han enviado correctamente, aparece un modal centrado con «Resultado generado correctamente. Podrás verlo al final de la actividad».
7. «Volver a repetir la actividad» reinicia directamente el estado del equipo, crea y persiste un UUID de sesión nuevo y vuelve a la selección de colectivo.

### 4.2 Dinamizador

1. `/facilitator` muestra pestañas para todas las fases, filtros, tarjetas, detalle accesible, selecciones globales, progreso y Justicia 2030.
2. El dinamizador aplica las mismas reglas de selección que un equipo, pero con su propio contexto y clave de persistencia.
3. «Comenzar nueva sesión» pide confirmación, elimina solo su estado, activa la primera fase configurada y permanece en la ruta.
4. Nunca se leen, agregan ni simulan selecciones de equipos.

## 5. Catálogo inicial y configuración

El fixture inicial contiene, en orden:

- Fases: `justicia-actual` («Justicia Actual»), `justicia-conectada` («Justicia Conectada») y `justicia-inteligente` («Justicia Inteligente»).
- Categorías: `personas`, `procesos`, `tecnologia` y `gobernanza`.
- Ocho tarjetas por fase, dos por combinación fase/categoría y veinticuatro en total.
- Máximo centralizado: `maxSelectionsPerPhase: 3`.

Cada tarjeta tiene un ID slug globalmente único, fase, categoría, título, descripción breve, reto, solución, entre dos y cuatro beneficios y pregunta de debate. Todo el contenido es mock significativo en español, sin datos personales ni casos sensibles.

Los conteos anteriores son invariantes del fixture, no reglas del motor.

## 6. Reglas genéricas del motor

- Fases, categorías, tarjetas, textos, orden, filtros, primera fase, estado vacío, progreso, completitud y agrupación del prompt se derivan de configuración.
- El validador genérico verifica IDs únicos, campos requeridos y referencias válidas sin asumir conteos concretos.
- Cambiar la longitud u orden de fases, categorías o tarjetas no requiere modificar componentes ni funciones de dominio.
- El progreso total es `n / (número de fases × máximo configurado)`.
- El filtro «Todas» se añade a las categorías configuradas, no es una categoría, no se persiste y se reinicia al montar una vista de fase.

## 7. Modelo de datos y estado

```ts
interface WorkshopCard {
  id: string
  phaseId: string
  categoryId: string
  title: string
  shortDescription: string
  challenge: string
  solution: string
  benefits: string[]
  debateQuestion: string
}

type PersistedWorkshopStateV1 = {
  schemaVersion: 1
  selectionsByPhase: Record<string, string[]>
}

type PersistedWorkshopStateV3 = {
  schemaVersion: 3
  sessionId: string
  selectionsByPhase: Record<string, string[]>
  collectiveId: string | null
}
```

El estado cliente añade `hydrated`, un aviso no bloqueante, `sessionId`, selecciones y colectivo. Los filtros, pestaña activa y feedback de envío no se persisten. El correo siempre se deriva de la configuración y las selecciones en servidor.

## 8. Reglas de selección

- Se admiten entre cero y el máximo configurado por fase.
- Todas las tarjetas tienen el mismo peso; no hay orden, posición, numeración ni ranking.
- Seleccionar dos veces no crea duplicados. Solo se puede seleccionar una tarjeta de su propia fase.
- El límite se aplica en dominio además de reflejarse en la interfaz.
- Se puede deseleccionar desde la tarjeta, el detalle o la bandeja.
- Las selecciones se muestran en el orden canónico del catálogo, nunca por orden temporal de clic.
- Las fases son siempre navegables y no hay avance automático.

## 9. Persistencia, hidratación y reinicio

Claves exactas:

- Equipo: `justicia2030:v1:team`.
- Dinamizador: `justicia2030:v1:facilitator`.

Cada rol lee únicamente su clave en el cliente, muestra carga durante hidratación y no escribe antes de hidratar. V1 migra a V3 conservando selecciones; V2 conserva además un colectivo válido; ambos reciben un UUID nuevo. V3 conserva un `sessionId` UUID válido. Después de hidratar, el estado se persiste como V3. JSON ilegible, forma incompatible o una excepción de almacenamiento descartan el estado afectado, continúan en memoria con estado vacío y muestran un aviso no bloqueante.

Los reinicios eliminan únicamente la clave del rol mediante `removeItem`, generan otro UUID y persisten la sesión vacía nueva; nunca se usa `localStorage.clear()`. No se sincronizan pestañas: el último guardado gana.

## 10. Envío de resultados por correo

El cliente llama a `POST /api/send-phase-result` únicamente con `sessionId`, `phaseId`, `collectiveId` y `selectedCardIds`. El servidor trata el payload como no confiable, exige un UUID válido, una fase y un colectivo configurados, exactamente `maxSelectionsPerPhase` IDs únicos y tarjetas existentes pertenecientes a esa fase. Fase, colectivo, orden y títulos proceden siempre de `workshopConfig`.

El email de texto plano usa el asunto `Justicia 2030 · {colectivo} · {fase}` y contiene el nombre del colectivo, el nombre de fase y los tres títulos en orden canónico. No contiene IDs, datos ampliados de tarjeta ni perfil. Remitente, destinatarios y `replyTo` proceden de variables de servidor.

Resend recibe una `idempotencyKey` menor de 256 caracteres, derivada mediante SHA-256 de sesión, colectivo, fase y selección canónica. La misma combinación no duplica el correo; cambiar tarjeta, colectivo, fase o sesión produce otra clave. Los errores de validación son 400 y los de configuración/proveedor son 500 con mensajes genéricos.

## 11. Justicia 2030 y prompt del dinamizador

La sección permanece accesible en la vista del dinamizador. Hasta que cada fase tenga exactamente el máximo configurado, se muestra progreso, fases incompletas y una explicación; no hay prompt parcial y «Copiar prompt» está deshabilitado.

Al completarse todas las fases, el generador puro recorre fases y tarjetas en orden canónico, emite una cabecera `##` por fase y una `###` por tarjeta, e incluye categoría, título, reto, solución, beneficios y pregunta. Omite IDs y `shortDescription`. El mismo conjunto siempre produce el mismo resultado y un cambio lo recalcula automáticamente.

La redacción vive íntegramente en `src/config/prompt-template.ts`. El borrador solicitado contiene las siete secciones metodológicas aprobadas, menciona las nueve tarjetas y las tres fases del fixture inicial, y **queda pendiente de validación por el equipo de Innovation**. Si cambia el número de fases, debe revisarse la redacción, no la mecánica genérica.

El prompt se muestra en un área de texto de solo lectura. La copia usa `navigator.clipboard.writeText` tras una acción explícita, anuncia éxito o el fallo principal con `aria-live` y permite selección manual. No se almacena el prompt ni se invoca ningún modelo o API.

## 12. Estados vacíos y de error

La Iteración 1 cubre: hidratación; fase sin tarjetas; filtro sin resultados; ninguna selección; fase o Justicia 2030 del dinamizador incompleta; estado persistido básico ilegible; fallo básico de lectura, escritura o borrado; fallo de portapapeles; 404; relación fase/tarjeta incoherente; y confirmación de reinicio. Los fallos recuperables no rompen la aplicación.

## 13. Seguridad y privacidad

- Existe un único Route Handler de backend para el envío; no hay Server Actions, base de datos ni autenticación.
- Resend es el único servicio externo en runtime. Su SDK y sus variables se usan solo en servidor.
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESULTS_EMAIL_TO` y el `RESULTS_REPLY_TO` opcional se validan al atender la petición, por lo que el build funciona sin ellas.
- No hay recursos, fuentes, imágenes, scripts, widgets, analítica ni trackers externos.
- Se usan fuentes del sistema, recursos locales y dependencias npm empaquetadas, con versiones fijas y lockfile.
- No se usan `dangerouslySetInnerHTML`, `innerHTML` ni `eval`; el contenido se renderiza como texto.
- Selecciones y prompt no salen por URL, query string, telemetría ni peticiones.
- `localStorage` se trata como entrada no confiable y no contiene identidad de equipo.

Las cabeceras de seguridad y CSP definitivas pertenecen expresamente a Iteración 2.

## 14. Accesibilidad y responsive

La Iteración 1 usa interfaz española, HTML semántico, fuentes del sistema, controles táctiles de al menos 44×44 px, foco visible, contraste razonable, navegación por teclado en controles principales, `aria-pressed` en filtros, estados seleccionados no basados solo en color, explicaciones junto a acciones deshabilitadas y regiones `aria-live` para avisos. No depende de hover.

El layout evita desbordamientos y adapta grids y bandejas para tablet horizontal, portátil y pantalla grande. En vistas amplias la bandeja es lateral y sticky; las selecciones siguen visibles aunque un filtro oculte la tarjeta. El dinamizador aprovecha anchura adicional sin crear líneas de texto excesivas.

La auditoría sistemática de accesibilidad y QA manual multidispositivo/navegador quedan para Iteración 2.

## 15. Criterios de aceptación

1. Existen esta especificación, el plan y un README del proyecto.
2. Están disponibles las seis rutas definitivas y las relaciones inválidas de fase/tarjeta devuelven 404.
3. No existe `teamId` ni identidad nominal de equipo.
4. El fixture contiene 3 fases, 4 categorías, 24 tarjetas, 8 por fase y 2 por combinación.
5. Conteos, filtros, navegación, progreso y orden se derivan de configuración; el máximo está centralizado.
6. Equipo y dinamizador seleccionan entre cero y el máximo sin duplicados, ranking ni orden temporal.
7. La persistencia sobrevive a recarga, no escribe antes de hidratación, usa claves separadas y permite reinicios independientes.
8. El prompt solo aparece con todas las fases completas; el fixture produce 9 tarjetas, una cabecera por fase y una por tarjeta, agrupadas y ordenadas de forma determinista.
9. Ambos roles pueden copiar su prompt y reciben feedback accesible de éxito o error.
10. El único servicio externo en runtime es Resend y queda encapsulado en servidor.
11. La interfaz aporta accesibilidad y responsive básicos.
12. Pruebas de dominio/componentes, lint, typecheck y build pasan; el build es desplegable de forma nativa en Vercel.

## 16. Funcionalidades expresamente excluidas

Backend adicional al Route Handler descrito, Server Actions, base de datos, autenticación, sincronización entre dispositivos o roles, tiempo real, APIs externas distintas de Resend o IA, CMS, Excel, analítica, trackers, PWA, service worker, offline garantizado, historial, varias partidas por perfil, ranking, drag and drop, identidad nominal, URLs/QR por equipo y cualquier funcionalidad no descrita. No se fuerza exportación estática.

## 17. Entrega

Incluye configuración y fixture, arquitectura data-driven, rutas, ambos flujos, navegación, filtros, detalle, selección, bandeja, progreso, Justicia 2030, prompt/copia, persistencia e hidratación básicas, reinicio separado, responsive/accesibilidad básicos, pruebas, lint, typecheck, build y compatibilidad Vercel.

## 18. Backlog deliberado de Iteración 2

- Validación y normalización exhaustivas de versión, forma, fases y tarjetas obsoletas/inexistentes o cruzadas, duplicados, exceso de selecciones y orden canónico.
- Recuperación selectiva y persistencia del estado normalizado.
- Matriz completa de errores en `getItem`, `setItem` y `removeItem`, almacenamiento bloqueado/cuota agotada y fallback en memoria completamente validado.
- Ampliación defensiva de pruebas y estados límite de portapapeles, filtros, navegación y selección.
- Auditoría sistemática de accesibilidad: teclado, foco, contraste y lectores de pantalla.
- QA manual responsive, navegadores objetivo y contenidos extremadamente largos.
- Cabeceras `nosniff`, `strict-origin-when-cross-origin`, `DENY`, Permissions-Policy y CSP definitiva compatible con Next.js/Vercel, incluidas `object-src`, `base-uri`, `frame-ancestors` y `form-action`.
- Revisión de dependencias y vulnerabilidades, con resolución o justificación.
- Revisión final de documentación y verificación integral para producción.

Estas tareas no son defectos pendientes de la Iteración 1 y no se implementan en esta ejecución.
