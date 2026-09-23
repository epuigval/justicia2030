Quiero que planifiques el alcance completo de un MVP funcional de una aplicación web para facilitar un workshop presencial llamado «Justicia 2030» y que, en esta primera ejecución, implementes exclusivamente la Iteración 1 definida en esta especificación.



El repositorio está prácticamente vacío. Debes inspeccionarlo antes de modificarlo y preservar cualquier cambio ajeno que pudiera existir.



Esta especificación sustituye cualquier versión anterior. No solicites aclaraciones sobre decisiones ya resueltas aquí. Para decisiones técnicas menores no especificadas, elige la alternativa más sencilla, mantenible y compatible con esta arquitectura, y documéntala.



Primero debes crear la documentación de especificación y planificación. Después debes implementar y verificar exclusivamente la Iteración 1. Al terminar, debes detenerte y esperar validación manual. No debes iniciar, adelantar ni implementar parcialmente la Iteración 2 en esta ejecución.



\# Referencia visual



Usa la infografía adjunta únicamente como referencia visual y de composición. Si existe cualquier conflicto entre la infografía y esta especificación, prevalece siempre la especificación escrita. No deduzcas nuevas funcionalidades de botones, textos o elementos gráficos que no estén descritos explícitamente.



Ignora expresamente los nombres o números de equipo, fases bloqueadas, rankings, carruseles, logotipos y controles no especificados. No reutilices logotipos ni assets incrustados en la imagen.



\# 1. Documentación previa obligatoria



Antes de escribir el código de la aplicación, crea:



\- `docs/SPEC.md`

\- `docs/IMPLEMENTATION\_PLAN.md`



`docs/SPEC.md` debe describir el alcance completo del MVP, incluyendo Iteración 1 e Iteración 2, y distinguir claramente qué requisitos pertenecen a cada una.



Debe incluir:



\- alcance;

\- actores;

\- rutas;

\- flujos completos;

\- catálogo inicial del MVP;

\- reglas genéricas del motor;

\- modelo de datos;

\- reglas de selección;

\- persistencia y reinicio;

\- generación del prompt;

\- estados vacíos y de error;

\- seguridad y privacidad;

\- accesibilidad;

\- criterios de aceptación;

\- funcionalidades expresamente excluidas;

\- requisitos entregados en Iteración 1;

\- requisitos pendientes de Iteración 2.



`docs/IMPLEMENTATION\_PLAN.md` debe incluir:



\- arquitectura elegida;

\- estructura prevista de carpetas;

\- componentes y responsabilidades;

\- modelo de estado;

\- adaptador de persistencia;

\- funciones puras de dominio;

\- estrategia de pruebas;

\- orden de implementación;

\- comandos de verificación;

\- riesgos técnicos y mitigaciones;

\- un bloque completo para Iteración 1;

\- un bloque posterior para Iteración 2.



Durante esta ejecución solo debes ejecutar el bloque de Iteración 1.



Una vez creados ambos documentos, continúa con la implementación de la Iteración 1. Actualízalos si durante el desarrollo aparece alguna decisión técnica relevante, sin alterar los requisitos funcionales.



\# 2. Modelo de ejecución en dos iteraciones



La especificación contiene el alcance completo del MVP, pero su implementación se divide en dos iteraciones.



\## Iteración 1 — MVP funcional



Esta es la única iteración autorizada para la primera ejecución de Codex.



Debe incluir:



\- configuración central y catálogo inicial;

\- arquitectura data-driven;

\- rutas;

\- flujo del equipo;

\- flujo del dinamizador;

\- navegación;

\- filtros;

\- detalle de tarjetas;

\- selección y deselección;

\- máximo de tres tarjetas por fase;

\- bandeja de selecciones;

\- progreso;

\- Justicia 2030;

\- generación y copia del prompt;

\- separación entre equipo y dinamizador;

\- persistencia básica mediante `localStorage`;

\- hidratación correcta;

\- reinicio separado;

\- responsive básico;

\- accesibilidad básica;

\- pruebas de dominio;

\- pruebas de los componentes principales;

\- lint;

\- typecheck;

\- tests;

\- build;

\- compatibilidad de despliegue con Vercel.



Al finalizar esta iteración debes:



\- ejecutar `npm test`;

\- ejecutar `npm run lint`;

\- ejecutar `npm run typecheck`;

\- ejecutar `npm run build`;

\- corregir los errores correspondientes al alcance de Iteración 1;

\- informar del resultado exacto;

\- indicar qué se ha implementado;

\- enumerar claramente lo pendiente de Iteración 2;

\- detenerte;

\- esperar validación manual.



No debes comenzar automáticamente la Iteración 2 aunque todas las comprobaciones de Iteración 1 hayan terminado correctamente.



\## Iteración 2 — Hardening y QA final



Debe quedar completamente documentada, pero no debe implementarse en esta primera ejecución.



Incluirá:



\- normalización exhaustiva de estados corruptos;

\- recuperación selectiva de datos válidos;

\- tratamiento completo de fallos de `localStorage`;

\- degradación completamente validada a estado en memoria;

\- ampliación de pruebas defensivas;

\- revisión sistemática de accesibilidad;

\- QA responsive;

\- QA con contenidos largos;

\- cabeceras de seguridad;

\- CSP definitiva;

\- revisión de dependencias;

\- pruebas de todos los estados límite;

\- revisión final de documentación;

\- verificación final para producción.



Las tareas de Iteración 2 deben aparecer como trabajo posterior explícito. No deben confundirse con defectos o TODOs de Iteración 1.



\# 3. Objetivo



La aplicación permitirá que varios grupos independientes participen en un workshop presencial.



Cada grupo utilizará un dispositivo o perfil de navegador independiente. Todos los grupos verán el mismo catálogo, pero sus selecciones serán locales e independientes.



También existirá una vista separada para el dinamizador o facilitador, que realizará sus propias selecciones según el consenso verbal del workshop.



Después de seleccionar tres tarjetas en cada fase de selección configurada, tanto los equipos como el dinamizador podrán obtener un prompt de «Justicia 2030», mostrarlo y copiarlo para utilizarlo manualmente fuera de la aplicación.



En el catálogo inicial existen tres fases de selección. Por tanto, el resultado inicial utiliza nueve tarjetas: tres por cada fase.



El motor, los componentes y la estructura visual no deben depender rígidamente de que siempre existan tres fases, cuatro categorías o veinticuatro tarjetas.



\# 4. Stack y decisiones técnicas



Utiliza:



\- Next.js con App Router;

\- React;

\- TypeScript con modo estricto;

\- Tailwind CSS;

\- npm como gestor de paquetes;

\- `package-lock.json` versionado;

\- Vitest para pruebas;

\- React Testing Library y `user-event` cuando se necesiten pruebas de componentes;

\- ESLint;

\- despliegue nativo de Next.js en Vercel.



Selecciona versiones estables y compatibles entre sí en el momento de implementar. Fija las versiones utilizadas, declara una versión LTS de Node compatible mediante `engines` y documenta los requisitos en el README.



Incluye al menos estos scripts:



\- `dev`;

\- `build`;

\- `start`;

\- `lint`;

\- `typecheck`;

\- `test`.



Sí se permiten las dependencias npm necesarias para el stack definido, incluyendo:



\- Next.js;

\- React;

\- Tailwind CSS;

\- Vitest;

\- React Testing Library;

\- `user-event`;

\- ESLint;

\- sus dependencias compatibles.



Mantén las dependencias al mínimo necesario, las versiones fijadas y el lockfile versionado.



No utilices Redux, Zustand ni otra librería global de estado. Un contexto React separado por ámbito, respaldado por `useReducer`, es suficiente.



Los Server Components de Next.js pueden utilizarse para renderizado y estructura, pero toda interacción y acceso a APIs del navegador debe estar en componentes cliente.



\# 5. Restricciones y funcionalidades excluidas



No implementes:



\- backend propio;

\- Route Handlers o API Routes;

\- Server Actions;

\- base de datos;

\- autenticación;

\- sincronización entre dispositivos;

\- sincronización en tiempo real;

\- comunicación entre equipos y dinamizador;

\- llamadas a APIs externas;

\- llamadas a OpenAI, ChatGPT, Copilot ni otros modelos;

\- CMS;

\- importación desde Excel;

\- analítica;

\- trackers;

\- PWA;

\- service worker;

\- soporte offline garantizado;

\- historial de partidas;

\- varias partidas simultáneas en un mismo perfil de navegador;

\- ranking de tarjetas;

\- drag and drop;

\- identificación nominal de equipos;

\- funcionalidades no descritas en esta especificación.



La aplicación funcionará online y se desplegará directamente en Vercel. No fuerces `output: "export"`; utiliza el despliegue estándar de Next.js.



\# 6. Supuestos operativos e identidad del equipo



\- Cada equipo utiliza un dispositivo o perfil de navegador independiente.

\- Solo se admite una sesión de equipo activa por perfil de navegador.

\- Dos equipos no deben utilizar simultáneamente el mismo perfil de navegador.

\- El dinamizador utiliza normalmente otro dispositivo.

\- Si equipo y dinamizador usan excepcionalmente el mismo navegador, sus estados deben seguir separados mediante claves distintas.

\- Las tarjetas y selecciones no contienen datos personales, expedientes ni información confidencial.

\- Todo el contenido incluido en el bundle se considera público.

\- La persistencia es una ayuda operativa, no un control de acceso.

\- No existe garantía de integridad frente a una persona con acceso al navegador o a DevTools.



`teamId` queda eliminado.



En esta primera versión tampoco se implementará:



\- nombre de equipo;

\- número de mesa;

\- selector de equipo;

\- alias local;

\- formulario para nombrar el grupo;

\- URL específica por equipo;

\- QR específico por equipo;

\- identificador persistido del equipo.



La interfaz utilizará únicamente expresiones genéricas como:



\- «Equipo»;

\- «Vista del equipo»;

\- «Selecciones del equipo».



No debe mostrar:



\- «Equipo 1»;

\- «Mesa 1»;

\- nombres o números generados;

\- textos equivalentes que impliquen una identidad nominal.



La identificación nominal de los equipos queda fuera del alcance de este MVP y podrá estudiarse en una versión posterior. No diseñes ni prepares ahora esa funcionalidad.



\# 7. Rutas definitivas



Implementa:



\- `/`;

\- `/team`;

\- `/team/phase/\[phaseId]`;

\- `/team/phase/\[phaseId]/card/\[cardId]`;

\- `/team/justicia-2030`;

\- `/facilitator`.



No implementes:



\- `/team/\[teamId]`;

\- rutas alternativas con identificadores de equipo;

\- parámetros de URL para identificar grupos.



\## `/`



Página de entrada con:



\- título «Justicia 2030»;

\- texto descriptivo del workshop;

\- acceso principal para equipos;

\- acceso secundario para el dinamizador.



Texto introductorio recomendado:



«Explorad las etapas del workshop, debatid las propuestas y seleccionad 3 tarjetas por etapa para construir una visión compartida de la Justicia 2030.»



Si no existe una sesión válida de equipo con selecciones:



\- mostrar «Iniciar como equipo».



Si existen selecciones de equipo guardadas:



\- mostrar «Continuar partida» como acción principal;

\- mostrar «Comenzar nueva partida» como acción secundaria.



Mostrar siempre un acceso secundario «Iniciar como dinamizador» que dirija a `/facilitator`.



No solicitar ni mostrar ningún dato identificativo del equipo.



\## `/team`



Vista resumen del equipo:



\- mostrar todas las fases configuradas;

\- mostrar el progreso `n/3` de cada fase;

\- permitir entrar libremente en cualquier fase;

\- mostrar acceso a Justicia 2030;

\- calcular dinámicamente el progreso total;

\- no bloquear Justicia 2030 aunque falten selecciones;

\- ofrecer «Comenzar nueva partida».



Con el catálogo inicial, el progreso total será `n/9`, pero la interfaz debe calcular el denominador utilizando las fases configuradas y el máximo de selecciones por fase.



\## `/team/phase/\[phaseId]`



Vista de exploración y selección de una fase.



\## `/team/phase/\[phaseId]/card/\[cardId]`



Vista completa de una tarjeta.



Debe comprobarse que:



\- la fase existe;

\- la tarjeta existe;

\- la tarjeta pertenece a la fase indicada.



Una fase o tarjeta desconocida, o una relación incoherente entre ambas, debe producir `notFound()`.



\## `/team/justicia-2030`



Vista del prompt final del equipo.



\## `/facilitator`



Pantalla global independiente del dinamizador. Contendrá:



\- acceso a todas las fases configuradas;

\- selección de fase mediante pestañas o control equivalente;

\- las mismas tarjetas y filtros que los equipos;

\- detalle completo de las tarjetas;

\- resumen de selecciones de todas las fases;

\- sección Justicia 2030;

\- prompt final del dinamizador;

\- acción «Comenzar nueva sesión».



No necesita rutas anidadas adicionales.



\# 8. Configuración inicial y reglas genéricas del motor



Los siguientes conteos describen exclusivamente el catálogo o fixture inicial del MVP:



\- 3 fases de selección;

\- 4 categorías;

\- 8 tarjetas por fase;

\- 2 tarjetas por categoría y fase;

\- 24 tarjetas en total.



Estos valores son criterios de aceptación del contenido inicial. No son restricciones permanentes de la arquitectura.



Ningún componente, función de dominio, reducer, esquema de estado, generador, filtro o layout debe asumir que siempre existirán exactamente:



\- tres fases;

\- cuatro categorías;

\- ocho tarjetas por fase;

\- veinticuatro tarjetas.



La interfaz y la lógica deben derivar dinámicamente de la configuración central:



\- las fases;

\- las categorías;

\- sus nombres;

\- sus IDs;

\- el orden;

\- las tarjetas;

\- los filtros;

\- la navegación;

\- las pestañas;

\- la primera fase activa;

\- el estado inicial de selecciones;

\- el progreso por fase;

\- el progreso total;

\- la completitud;

\- la agrupación del prompt.



No utilices índices fijos como representación de las tres fases ni estructuras con tres propiedades codificadas manualmente.



No compruebes `length === 3`, `length === 4` o `length === 24` dentro del motor, los componentes o el validador genérico. Esos conteos solo deben comprobarse en las pruebas específicas del catálogo inicial.



El máximo de tres selecciones por fase sí es una regla funcional del MVP. Debe estar centralizado en configuración, por ejemplo mediante:



```ts

maxSelectionsPerPhase: 3

```



La lógica debe leer ese valor desde la configuración y no repetir el literal en distintos componentes.



\## 8.1 Catálogo inicial del MVP



Fases iniciales, en este orden:



1\. `justicia-actual` — «Justicia Actual»

2\. `justicia-conectada` — «Justicia Conectada»

3\. `justicia-inteligente` — «Justicia Inteligente»



Categorías iniciales, en este orden:



1\. `personas` — «Personas»

2\. `procesos` — «Procesos»

3\. `tecnologia` — «Tecnología»

4\. `gobernanza` — «Gobernanza»



El catálogo inicial contiene:



\- exactamente tres fases de selección;

\- exactamente cuatro categorías;

\- exactamente ocho tarjetas por fase;

\- exactamente dos tarjetas de cada categoría en cada fase;

\- exactamente veinticuatro tarjetas.



\## 8.2 Reglas genéricas del catálogo



La arquitectura debe admitir arrays de fases, categorías y tarjetas de longitud configurable.



Debe garantizar de forma genérica:



\- IDs únicos;

\- referencias válidas;

\- orden explícito y configurable;

\- campos requeridos;

\- relaciones válidas entre tarjetas, fases y categorías;

\- componentes dirigidos por datos;

\- filtros generados desde las categorías configuradas;

\- progreso calculado desde la configuración;

\- ausencia de dependencias rígidas de los conteos iniciales.



Cambiar las fases, categorías, tarjetas u orden en la configuración no debe requerir modificar componentes ni funciones de dominio.



Si en el futuro cambia el número de fases, debe revisarse también la redacción provisional de la plantilla de prompt, pero no la mecánica genérica del generador.



\# 9. Tarjetas y contenido mock



El fixture inicial incluye:



\- ocho tarjetas por fase;

\- dos tarjetas de cada categoría en cada fase;

\- veinticuatro tarjetas en total.



Cada tarjeta debe contener:



```ts

interface WorkshopCard {

&#x20; id: string

&#x20; phaseId: PhaseId

&#x20; categoryId: CategoryId

&#x20; title: string

&#x20; shortDescription: string

&#x20; challenge: string

&#x20; solution: string

&#x20; benefits: string\[]

&#x20; debateQuestion: string

}

```



Reglas genéricas:



\- los IDs serán slugs estables;

\- todos los IDs de tarjeta serán globalmente únicos;

\- ninguna tarjeta utilizará `all` o `todas` como categoría;

\- todos los campos serán no vacíos;

\- cada tarjeta tendrá al menos un beneficio;

\- las relaciones entre fase, categoría y tarjeta serán válidas;

\- el contenido estará en español;

\- no utilices lorem ipsum;

\- no incluyas datos personales ni referencias a casos reales sensibles.



Para el fixture inicial:



\- cada tarjeta tendrá entre dos y cuatro beneficios;

\- existirán exactamente dos tarjetas por combinación de fase y categoría;

\- el contenido será mock, significativo y relacionado con la transformación de la justicia.



Centraliza:



\- configuración del workshop;

\- fases;

\- categorías;

\- textos visibles;

\- máximo de selecciones;

\- tarjetas;

\- orden;

\- plantilla inicial del prompt.



No hardcodees tarjetas, fases, categorías ni textos de negocio dentro de componentes React.



\# 10. Filtros y reglas de selección



Debe existir el filtro «Todas», pero:



\- no es una categoría;

\- no debe aparecer como `categoryId`;

\- no se persiste;

\- es el filtro inicial;

\- se restablece al entrar de nuevo en una fase.



Los filtros deben generarse dinámicamente utilizando:



\- «Todas»;

\- las categorías configuradas, en el orden configurado.



En cada fase, tanto para equipos como para el dinamizador:



\- se pueden seleccionar entre cero y el máximo configurado;

\- el máximo inicial es tres;

\- las tarjetas seleccionadas tienen exactamente el mismo peso;

\- no hay posiciones primera, segunda o tercera;

\- no se muestra numeración ni ranking;

\- el orden de selección no tiene significado;

\- una tarjeta seleccionada puede deseleccionarse;

\- seleccionar repetidamente la misma tarjeta no crea duplicados;

\- una tarjeta solo puede seleccionarse en su propia fase;

\- si ya se ha alcanzado el máximo, no se puede seleccionar otra;

\- el límite debe aplicarse en la lógica de dominio, no solo deshabilitando botones;

\- cuando se alcance el máximo, las tarjetas no seleccionadas mostrarán su acción deshabilitada junto con una explicación como «Máximo 3 tarjetas. Quita una selección para elegir otra»;

\- las tarjetas seleccionadas deben seguir permitiendo deselección;

\- al deseleccionar una, las demás vuelven a estar disponibles.



La aplicación no debe:



\- bloquear fases;

\- desbloquear fases automáticamente;

\- cambiar de fase automáticamente al completar selecciones;

\- obligar a seguir un orden.



El dinamizador indicará verbalmente cuándo cambiar de fase. Técnicamente siempre se podrá navegar a cualquier fase y modificar elecciones anteriores.



Para mostrar selecciones:



\- utiliza el orden canónico definido en la configuración;

\- nunca utilices el orden temporal de clic;

\- muestra una lista o bandeja sin números ordinales;

\- permite quitar cada selección directamente desde esa bandeja;

\- mantén visible o inmediatamente accesible la bandeja en listado y detalle.



\# 11. Interfaz de tarjetas



En el listado, cada tarjeta mostrará al menos:



\- categoría;

\- título;

\- descripción breve;

\- estado seleccionado/no seleccionado;

\- acción para seleccionar o deseleccionar;

\- acción diferenciada para abrir el detalle.



Evita elementos interactivos anidados incorrectamente.



El detalle mostrará:



\- fase;

\- categoría;

\- título;

\- descripción breve;

\- reto;

\- solución;

\- beneficios;

\- pregunta de debate;

\- estado de selección;

\- acción seleccionar/deseleccionar;

\- acción para volver a la fase.



En el dinamizador, el detalle puede presentarse mediante un panel accesible dentro de `/facilitator`, sin crear otra ruta.



Las listas, pestañas, filtros y bloques de progreso deben renderizarse recorriendo la configuración. No deben existir tres componentes manuales específicos para las tres fases iniciales.



\# 12. Persistencia



Implementa `localStorage` desde la Iteración 1.



Claves exactas:



\- equipo: `justicia2030:v1:team`;

\- dinamizador: `justicia2030:v1:facilitator`.



Estructura persistida:



```ts

type PersistedWorkshopStateV1 = {

&#x20; schemaVersion: 1

&#x20; selectionsByPhase: Record<PhaseId, CardId\[]>

}

```



La estructura real de `selectionsByPhase` debe construirse recorriendo las fases configuradas. No debe declararse manualmente con tres propiedades fijas.



Persistir únicamente:



\- versión del esquema;

\- IDs de tarjetas seleccionadas por fase.



No persistir:



\- tarjetas completas;

\- prompt generado;

\- filtros;

\- pestaña activa;

\- mensajes de interfaz;

\- estado de copiado;

\- nombre, número, alias o identificador del equipo.



Utiliza instancias separadas del contexto/reducer para equipo y dinamizador. Ningún flujo de equipo debe leer o modificar la clave del dinamizador y viceversa.



\## 12.1 Persistencia básica — Iteración 1



La Iteración 1 debe incluir:



\- lectura de la clave correspondiente únicamente en cliente;

\- estado explícito `hydrated: false`;

\- estado visual de carga mientras se hidrata;

\- prohibición de persistir el estado vacío antes de terminar la hidratación;

\- restauración de un estado V1 válido;

\- guardado después de cambios válidos;

\- supervivencia a recargas;

\- separación de claves;

\- reinicio independiente;

\- encapsulación de los accesos a almacenamiento;

\- protección mínima mediante `try/catch`.



Si el JSON es claramente ilegible, la forma básica no coincide con V1 o una operación lanza una excepción:



\- la aplicación no debe romperse;

\- debe descartar el estado afectado completo;

\- debe continuar en memoria con estado vacío para ese rol;

\- debe mostrar un aviso genérico no bloqueante.



Este comportamiento básico no equivale al hardening completo de Iteración 2.



\## 12.2 Hardening de persistencia — Iteración 2



Debe quedar planificado, pero no implementarse en esta ejecución.



Incluirá:



\- validación exhaustiva de `schemaVersion`;

\- validación exhaustiva de la estructura;

\- detección de fases desconocidas;

\- detección de tarjetas inexistentes;

\- detección de tarjetas pertenecientes a otra fase;

\- eliminación de duplicados;

\- tratamiento de más selecciones que el máximo;

\- eliminación de IDs obsoletos;

\- ordenación canónica;

\- recuperación selectiva de valores válidos;

\- persistencia del estado normalizado;

\- avisos específicos;

\- tratamiento completo de errores de lectura;

\- tratamiento completo de errores de escritura;

\- tratamiento de almacenamiento bloqueado;

\- tratamiento de cuota agotada;

\- tratamiento de errores al eliminar;

\- degradación completamente probada a estado en memoria.



No implementes sincronización entre pestañas mediante el evento `storage`. Si la misma sesión se abre en varias pestañas, el último guardado gana; esta situación queda fuera del flujo recomendado.



\# 13. Continuar y reiniciar



\## Equipo



Si existe alguna selección válida guardada, `/` mostrará:



\- «Continuar partida»;

\- «Comenzar nueva partida».



También debe existir «Comenzar nueva partida» dentro de `/team`.



Al activarla, mostrar confirmación:



«Se eliminarán las selecciones del equipo guardadas en este navegador. No afectará al dinamizador ni a otros dispositivos. Esta acción no se puede deshacer.»



Acciones:



\- «Cancelar»;

\- «Borrar y empezar».



Al confirmar:



\- eliminar exclusivamente `justicia2030:v1:team`;

\- reiniciar el estado de equipo recorriendo las fases configuradas;

\- navegar a `/team`;

\- no modificar el estado del dinamizador.



\## Dinamizador



Dentro de `/facilitator`, mostrar «Comenzar nueva sesión».



Confirmación:



«Se eliminarán las selecciones del dinamizador guardadas en este navegador. No afectará a los equipos ni a otros dispositivos. Esta acción no se puede deshacer.»



Al confirmar:



\- eliminar exclusivamente `justicia2030:v1:facilitator`;

\- reiniciar el estado del dinamizador;

\- permanecer en `/facilitator`;

\- activar la primera fase según el orden configurado;

\- no modificar el estado de equipo.



No implementes un botón «Borrar todos los datos» y no uses `localStorage.clear()`.



El README debe explicar que borrar manualmente los datos del sitio desde el navegador sí elimina ambos estados de ese navegador.



\# 14. Justicia 2030



La sección Justicia 2030 estará siempre accesible.



Antes de completar las selecciones:



\- mostrar progreso por fase;

\- mostrar qué fases están incompletas;

\- calcular el progreso total desde la configuración;

\- no mostrar un prompt parcial;

\- mantener «Copiar prompt» deshabilitado;

\- explicar que se necesitan exactamente tres selecciones en cada fase configurada.



La condición de completitud debe calcularse recorriendo las fases configuradas y verificando que cada una tiene exactamente el máximo de selecciones configurado.



Con el catálogo inicial:



\- existen tres fases;

\- el máximo es tres;

\- se utilizan nueve tarjetas.



Cuando todas las fases configuradas estén completas:



\- generar automáticamente el prompt;

\- no añadir botón «Generar»;

\- mostrar el texto completo;

\- habilitar «Copiar prompt».



Si posteriormente cambia una selección:



\- recalcular el prompt automáticamente;

\- no conservar una versión antigua.



El equipo utiliza sus selecciones. El dinamizador utiliza sus propias selecciones. Ambos utilizan exactamente la misma función y plantilla.



La función del generador no debe asumir internamente que existen tres fases. Debe recorrer las fases configuradas. La plantilla inicial puede mencionar tres fases y nueve tarjetas porque describe el fixture inicial y está pendiente de validación por Innovation.



\# 15. Plantilla inicial configurable del prompt



La mecánica funcional de Justicia 2030 está aprobada:



\- se utilizan las nueve tarjetas del catálogo inicial seleccionadas;

\- son tres tarjetas por cada una de las tres fases iniciales;

\- todas tienen el mismo peso;

\- el prompt se genera localmente;

\- no se llama a ningún modelo de IA;

\- el prompt se muestra;

\- el prompt puede copiarse;

\- el prompt se recalcula si cambian las selecciones.



La redacción exacta y la estructura metodológica de la plantilla todavía deben ser validadas por el equipo de Innovation.



Por tanto:



\- conserva la plantilla siguiente como borrador funcional;

\- indica en `docs/SPEC.md` que está pendiente de validación por Innovation;

\- indica en el README que está pendiente de validación por Innovation;

\- centraliza toda su redacción en un único archivo:

&#x20; - `src/config/prompt-template.ts`;

\- no distribuyas fragmentos literales de la plantilla entre componentes;

\- documenta claramente dónde modificarla;

\- no inventes nuevas secciones metodológicas;

\- no conectes ninguna API de IA;

\- no acoples las pruebas palabra por palabra a toda su redacción provisional.



Implementa el generador como una función pura fuera de los componentes.



\## 15.1 Borrador funcional de la plantilla



El contenido inicial será:



\---

Actúa como especialista en innovación y transformación del sistema de justicia.



A partir de las nueve tarjetas incluidas a continuación, elabora una propuesta integrada de «Justicia 2030».



Reglas:

\- Trata las nueve tarjetas con el mismo peso. Su orden de presentación no representa un ranking.

\- No omitas ninguna tarjeta.

\- Basa la propuesta únicamente en la información proporcionada.

\- Si necesitas realizar algún supuesto, indícalo explícitamente.

\- Identifica conexiones entre personas, procesos, tecnología y gobernanza.

\- No inventes datos, normativa, plazos ni cifras.



Estructura obligatoria de la respuesta:

1\. Visión integrada de Justicia 2030.

2\. Prioridades correspondientes a cada una de las tres fases.

3\. Sinergias y dependencias entre las prioridades.

4\. Iniciativas y próximos pasos.

5\. Riesgos y condiciones necesarias.

6\. Indicadores cualitativos y cuantitativos sugeridos.

7\. Preguntas abiertas para continuar el debate.



TARJETAS SELECCIONADAS



\[Tarjetas agrupadas por fase]

\---



No añadas nuevas secciones al borrador.



\## 15.2 Agrupación de fases y tarjetas



El generador debe producir una sola cabecera de fase y, dentro de ella, los bloques de todas las tarjetas seleccionadas de esa fase.



La estructura será:



```text

\## {nombre de la fase}



\### {título de la tarjeta 1}

Categoría: {nombre de la categoría}



Reto:

{challenge}



Solución:

{solution}



Beneficios:

\- {beneficio 1}

\- {beneficio 2}



Pregunta para el debate:

{debateQuestion}



\### {título de la tarjeta 2}

Categoría: {nombre de la categoría}



Reto:

{challenge}



Solución:

{solution}



Beneficios:

\- {beneficio 1}

\- {beneficio 2}



Pregunta para el debate:

{debateQuestion}



\### {título de la tarjeta 3}

Categoría: {nombre de la categoría}



Reto:

{challenge}



Solución:

{solution}



Beneficios:

\- {beneficio 1}

\- {beneficio 2}



Pregunta para el debate:

{debateQuestion}



\## {nombre de la siguiente fase}



...

```



No debe repetirse:



```text

\## {nombre de la fase}

```



antes de cada tarjeta.



Reglas del generador:



\- emitir exactamente una cabecera `##` por fase configurada;

\- emitir exactamente una cabecera `###` por tarjeta seleccionada;

\- agrupar cada tarjeta debajo de su fase;

\- recorrer las fases en el orden de la configuración;

\- recorrer las tarjetas en el orden canónico del catálogo;

\- nunca ordenar por el momento de selección;

\- no incluir IDs internos;

\- no incluir `shortDescription`;

\- utilizar saltos de línea deterministas;

\- producir el mismo resultado para el mismo conjunto de selecciones;

\- devolver ausencia de prompt si alguna fase configurada no contiene exactamente maxSelectionsPerPhase selecciones.

\- derivar la agrupación recorriendo la configuración;

\- no codificar manualmente tres bloques de fase.



\# 16. Copiado al portapapeles



Mostrar el prompt en un área de texto de solo lectura que permita selección manual.



El botón «Copiar prompt»:



\- utilizará `navigator.clipboard.writeText`;

\- solo se ejecutará mediante acción explícita del usuario;

\- mostrará «Prompt copiado» únicamente después de resolverse correctamente;

\- anunciará el resultado mediante una región accesible `aria-live`;

\- mostrará el éxito durante un tiempo suficiente para ser percibido;

\- gestionará el fallo principal de la API;

\- si falla, mostrará «No se pudo copiar automáticamente. Selecciona el texto y cópialo manualmente»;

\- no utilizará APIs externas;

\- no utilizará `document.execCommand`.



La cobertura exhaustiva de todos los estados límite del portapapeles puede ampliarse en Iteración 2. El flujo principal de éxito y error debe estar implementado y probado en Iteración 1.



\# 17. Pantalla del dinamizador



`/facilitator` debe:



\- utilizar el mismo catálogo que los equipos;

\- mostrar dinámicamente todas las fases configuradas;

\- permitir cambiar libremente entre ellas;

\- incluir los mismos filtros;

\- mostrar el detalle completo;

\- aplicar la misma regla de selección;

\- mostrar progreso `n/3` por fase con el máximo inicial configurado;

\- mantener visibles las selecciones de todas las fases;

\- permitir quitar o cambiar selecciones;

\- generar su prompt cuando todas las fases estén completas;

\- permitir copiarlo;

\- persistir exclusivamente en la clave del dinamizador;

\- no leer datos de equipos;

\- no simular recepción de datos;

\- no presentar rankings;

\- estar especialmente optimizada para pantalla grande.



Las pestañas, el progreso y la primera fase activa deben derivarse de la configuración.



\# 18. Arquitectura mínima esperada



Separa como mínimo:



\- tipos de dominio;

\- configuración y contenido;

\- invariantes genéricas del catálogo;

\- invariantes específicas del fixture inicial;

\- funciones puras de selección y deselección;

\- adaptador de almacenamiento;

\- validación básica de estado de Iteración 1;

\- normalización exhaustiva planificada para Iteración 2;

\- reducer/contexto de equipo;

\- reducer/contexto de dinamizador;

\- generador puro del prompt;

\- configuración única de la plantilla;

\- componentes de tarjetas;

\- filtros;

\- detalle;

\- bandeja de selecciones;

\- progreso;

\- confirmación de reinicio;

\- área y botón de copiado;

\- páginas y layouts.



La lógica de selección no debe depender de React ni de `localStorage`.



La persistencia debe depender de una interfaz pequeña o funciones encapsuladas para poder probarla de forma aislada.



El prompt debe derivarse siempre de:



\- configuración;

\- plantilla central;

\- selecciones válidas.



No debe almacenarse como estado independiente.



Evita duplicar lógica entre equipo y dinamizador. Reutiliza dominio, almacenamiento parametrizado, componentes y generador; mantén separados únicamente el ámbito, la clave y la instancia de estado.



El estado vacío debe construirse recorriendo las fases configuradas.



Añadir, quitar o reordenar una fase o categoría en la configuración no debe exigir modificar componentes o funciones de dominio.



El progreso total debe calcularse a partir de:



\- las fases configuradas;

\- el máximo de selecciones configurado por fase.



No utilices el valor nueve como constante del motor. Nueve es únicamente el resultado del fixture inicial: tres fases multiplicadas por tres selecciones.



\# 19. UX, responsive y accesibilidad



Prioriza funcionalidad, claridad y estructura limpia. No se requiere diseño pixel-perfect.



Diseña para:



\- tablet horizontal;

\- iPad con Safari reciente;

\- Surface o portátil;

\- desktop;

\- pantalla grande para el dinamizador.



La aplicación debe ser utilizable en versiones recientes de Chrome, Edge y Safari.



\## 19.1 Iteración 1 — Base responsive y accesible



Debe incluir:



\- interfaz en español;

\- diseño neutro y profesional;

\- fuentes del sistema;

\- assets locales;

\- controles táctiles de al menos 44 × 44 px;

\- navegación por teclado en los controles principales;

\- foco visible;

\- contraste razonable;

\- HTML semántico;

\- estados seleccionados que no dependan únicamente del color;

\- filtros con estado accesible, por ejemplo `aria-pressed`;

\- mensajes de guardado, copiado y error anunciados accesiblemente;

\- botones deshabilitados acompañados de explicación visible;

\- ausencia de dependencia de hover;

\- ausencia de desbordamientos en los tamaños objetivo;

\- responsive básico para tablet horizontal, portátil y pantalla grande.



En vistas de fase:



\- en pantallas amplias, utiliza grid de tarjetas y bandeja lateral sticky;

\- en tablet horizontal, adapta las columnas sin ocultar las selecciones;

\- las selecciones deben seguir disponibles aunque el filtro oculte su tarjeta original.



En el dinamizador:



\- utiliza el espacio adicional para mostrar progreso y resumen global;

\- limita la anchura de textos largos para mantener legibilidad.



\## 19.2 Iteración 2 — Revisión sistemática



Debe quedar planificada, pero no implementarse ahora.



Incluirá:



\- revisión sistemática de accesibilidad;

\- auditoría más completa de navegación por teclado;

\- revisión de foco;

\- revisión de contraste;

\- revisión de lectores de pantalla;

\- QA responsive manual;

\- QA con contenido largo;

\- QA en los navegadores objetivo;

\- revisión de todos los estados límite visuales.



\# 20. Seguridad, privacidad y restricción de terceros



\## 20.1 Requisitos estructurales desde Iteración 1



No se permite cargar durante el funcionamiento de la aplicación:



\- recursos remotos;

\- CDNs;

\- Google Fonts u otras fuentes externas;

\- imágenes remotas;

\- widgets externos;

\- scripts remotos;

\- trackers;

\- analítica;

\- servicios de terceros;

\- APIs de terceros.



La aplicación utilizará:



\- fuentes del sistema;

\- assets locales;

\- dependencias npm empaquetadas por el proceso de build;

\- recursos servidos desde el mismo origen.



La instalación de dependencias npm necesarias durante el desarrollo y build está permitida. Su utilización no se considera una carga remota en runtime cuando quedan empaquetadas en la aplicación.



Mantén:



\- `package-lock.json` versionado;

\- versiones fijadas;

\- ausencia de peticiones externas durante el funcionamiento;

\- ausencia de llamadas a APIs externas.



Además:



\- no utilices `dangerouslySetInnerHTML`;

\- no utilices `innerHTML`;

\- no utilices `eval`;

\- renderiza todo el contenido como texto;

\- no incluyas secretos;

\- no añadas variables de entorno innecesarias;

\- no envíes selecciones ni el prompt por URL;

\- no envíes selecciones ni el prompt por query strings;

\- no envíes selecciones ni el prompt por telemetría;

\- no envíes selecciones ni el prompt mediante peticiones;

\- no almacenes el prompt en `localStorage`;

\- trata `localStorage` como entrada no confiable;

\- no persistas ningún identificador de equipo.



\## 20.2 Iteración 2 — Hardening de seguridad



Debe quedar planificado, pero no implementarse ahora.



Incluirá:



\- cabeceras de seguridad;

\- CSP definitiva;

\- comprobación de compatibilidad con Next.js y Vercel;

\- verificación de que la CSP no rompe producción;

\- revisión de dependencias;

\- evaluación de vulnerabilidades;

\- resolución o justificación documentada de vulnerabilidades relevantes.



Las cabeceras previstas incluirán como mínimo:



\- `X-Content-Type-Options: nosniff`;

\- `Referrer-Policy: strict-origin-when-cross-origin`;

\- `X-Frame-Options: DENY`;

\- `Permissions-Policy: camera=(), microphone=(), geolocation=()`;

\- una CSP compatible que incluya al menos:

&#x20; - `object-src 'none'`;

&#x20; - `base-uri 'self'`;

&#x20; - `frame-ancestors 'none'`;

&#x20; - `form-action 'self'`.



No implementes todavía las cabeceras ni la CSP definitiva durante Iteración 1.



\# 21. Estados vacíos y errores



\## 21.1 Iteración 1



Implementa estados claros para:



\- fase sin tarjetas;

\- filtro sin resultados;

\- ninguna selección;

\- fase incompleta;

\- Justicia 2030 incompleta;

\- carga durante hidratación;

\- estado persistido básico ilegible;

\- fallo básico de almacenamiento;

\- fallo de portapapeles;

\- ruta desconocida;

\- tarjeta que no pertenece a la fase;

\- confirmación de reinicio.



Los errores recuperables principales no deben romper la aplicación.



\## 21.2 Iteración 2



Amplía y verifica de forma exhaustiva:



\- todas las variantes de corrupción de estado;

\- todas las excepciones de `localStorage`;

\- almacenamiento deshabilitado;

\- cuota agotada;

\- errores de lectura, escritura y borrado;

\- recuperación parcial;

\- contenido extremadamente largo;

\- combinaciones límite de filtros, navegación y selección;

\- estados límite de accesibilidad y responsive.



\# 22. Pruebas



Separa conceptualmente y en la organización de las pruebas:



\- invariantes del catálogo inicial;

\- reglas genéricas de arquitectura y dominio.



\## 22.1 Invariantes del catálogo inicial



Estas pruebas verifican exclusivamente el fixture inicial:



\- existen exactamente tres fases de selección;

\- existen exactamente cuatro categorías;

\- existen exactamente veinticuatro tarjetas;

\- existen exactamente ocho tarjetas por fase;

\- existen exactamente dos tarjetas por combinación de categoría y fase;

\- los campos requeridos contienen datos;

\- el contenido inicial cumple las reglas definidas.



Estas cantidades no deben formar parte del validador genérico ni del motor.



\## 22.2 Reglas genéricas de arquitectura y dominio



Prueba:



\- IDs únicos;

\- relaciones válidas;

\- configuración data-driven;

\- orden configurable;

\- filtros derivados de configuración;

\- progreso derivado de configuración;

\- estado inicial derivado de configuración;

\- componentes sin dependencias rígidas de tres fases, cuatro categorías o veinticuatro tarjetas;

\- generador que recorre las fases configuradas;

\- máximo de selecciones leído desde configuración.



Utiliza cuando sea útil una configuración sintética de prueba con cantidades diferentes para demostrar que dominio, progreso, filtros y renderizado no dependen de los conteos del fixture inicial. Esta configuración sintética solo pertenece a las pruebas y no añade funcionalidad visible al MVP.



\## 22.3 Pruebas obligatorias de Iteración 1



\### Selección



\- seleccionar de cero al máximo configurado;

\- impedir una cuarta selección con la configuración inicial;

\- no crear duplicados;

\- deseleccionar;

\- independencia entre fases;

\- rechazo de una tarjeta de otra fase;

\- orden canónico independiente del orden de clic;

\- igualdad de peso;

\- ausencia de ranking.



\### Persistencia básica



\- serialización de un estado V1 válido;

\- restauración de un estado V1 válido;

\- claves separadas de equipo y dinamizador;

\- reiniciar equipo no modifica dinamizador;

\- reiniciar dinamizador no modifica equipo;

\- supervivencia a recarga simulada;

\- ausencia de escritura antes de hidratación;

\- JSON claramente ilegible no rompe la aplicación;

\- excepción básica de almacenamiento no rompe la aplicación.



\### Prompt



\- no generar si alguna fase configurada no alcanza exactamente el máximo de selecciones configurado. Con el fixture inicial, ese máximo es 3;

\- generar nueve tarjetas con el fixture inicial completo;

\- emitir una sola línea de cabecera exacta `## {nombre de fase}` por fase;

\- no confundir una cabecera `###` de tarjeta con una cabecera `##` de fase;

\- emitir una sola cabecera `### {título}` por tarjeta seleccionada;

\- incluir cada tarjeta seleccionada una sola vez;

\- agrupar cada tarjeta debajo de su fase;

\- incluir fase, categoría, título, reto, solución, beneficios y pregunta;

\- omitir `shortDescription`;

\- declarar el mismo peso para todas;

\- respetar el orden de fases configurado;

\- respetar el orden canónico de tarjetas;

\- ignorar el orden temporal de selección;

\- no incluir IDs;

\- producir un resultado determinista;

\- utilizar la plantilla central de `src/config/prompt-template.ts`.



No utilices un snapshot literal de toda la redacción provisional.



Para comprobar el uso de la plantilla central, utiliza marcadores estructurales o una configuración controlada. Las pruebas deben permitir que Innovation modifique la redacción sin obligar a reescribir toda la suite, siempre que se mantengan las reglas funcionales y estructurales.



\### Componentes principales



\- filtro «Todas»;

\- filtros generados desde las categorías;

\- filtro por categoría;

\- deshabilitación al alcanzar el máximo;

\- deselección desde la bandeja;

\- estado incompleto de Justicia 2030;

\- progreso derivado de configuración;

\- copia correcta;

\- error principal de portapapeles;

\- feedback accesible;

\- confirmación de nueva partida;

\- confirmación de nueva sesión;

\- uso de textos genéricos de equipo;

\- ausencia de controles de identificación.



\### Rutas



\- rutas válidas principales;

\- fase inexistente;

\- tarjeta inexistente;

\- tarjeta que no pertenece a la fase;

\- ausencia de rutas con `teamId`.



\## 22.4 Pruebas de Iteración 2



Deben quedar planificadas, pero no implementarse ahora.



Incluirán la matriz exhaustiva de:



\- versión desconocida;

\- forma persistida inválida;

\- fases obsoletas;

\- tarjetas inexistentes;

\- tarjetas en fase incorrecta;

\- duplicados;

\- más selecciones que el máximo;

\- normalización determinista;

\- recuperación parcial;

\- errores en `getItem`;

\- errores en `setItem`;

\- errores en `removeItem`;

\- almacenamiento bloqueado;

\- cuota agotada;

\- degradación completa a memoria;

\- estados límite de portapapeles;

\- contenido largo;

\- accesibilidad;

\- responsive;

\- seguridad;

\- cabeceras;

\- CSP.



No añadas Playwright ni una suite E2E en Iteración 1 salvo que resulte imprescindible. Para esta iteración son suficientes pruebas unitarias y de componentes bien enfocadas.



\# 23. Verificación



\## 23.1 Verificación obligatoria de Iteración 1



Antes de detenerte, ejecuta:



```text

npm test

npm run lint

npm run typecheck

npm run build

```



Corrige todos los errores correspondientes a Iteración 1.



No des por completada la Iteración 1 si alguno de estos comandos falla.



Revisa además:



\- que el build no dependa de variables de entorno;

\- que no existan llamadas externas en runtime;

\- que no existan recursos remotos;

\- que las dependencias npm permitidas estén empaquetadas mediante el build;

\- que equipo y dinamizador utilicen claves distintas;

\- que las rutas inválidas principales estén controladas;

\- que recargar restaure un estado V1 válido;

\- que reiniciar un rol no afecte al otro;

\- que no exista identificación de equipo;

\- que el progreso se derive de la configuración;

\- que el prompt solo aparezca cuando todas las fases configuradas estén completas;

\- que el fixture inicial produzca tres tarjetas por cada una de sus tres fases;

\- que exista una sola cabecera por fase en el prompt;

\- que todas las rutas funcionen mediante navegación directa;

\- que la interfaz sea usable en tablet horizontal, portátil y pantalla grande;

\- que el build sea compatible con despliegue en Vercel.



No se exige en Iteración 1:



\- verificación final para producción;

\- auditoría exhaustiva de dependencias;

\- CSP definitiva;

\- cabeceras finales;

\- matriz completa de corrupción y fallos;

\- QA sistemático de Iteración 2.



\## 23.2 Verificación futura de Iteración 2



La Iteración 2 volverá a ejecutar todas las comprobaciones y añadirá:



\- matriz defensiva completa;

\- validación completa del fallback en memoria;

\- revisión sistemática de accesibilidad;

\- QA responsive;

\- QA de contenido largo;

\- revisión de dependencias;

\- comprobación de cabeceras;

\- comprobación de CSP;

\- verificación final para producción.



\# 24. README



Sustituye el README genérico por documentación del proyecto.



En Iteración 1 debe incluir:



\- descripción;

\- requisitos;

\- instalación;

\- ejecución local;

\- scripts;

\- pruebas;

\- build;

\- estructura;

\- cómo modificar fases;

\- cómo modificar categorías;

\- cómo modificar tarjetas;

\- cómo modificar textos;

\- cómo modificar el orden;

\- cómo modificar el máximo de selecciones;

\- diferencia entre conteos del catálogo inicial y reglas genéricas del motor;

\- cómo modificar la plantilla en `src/config/prompt-template.ts`;

\- indicación de que la plantilla está pendiente de validación por Innovation;

\- cómo desplegar en Vercel;

\- cómo funciona `localStorage`;

\- claves utilizadas;

\- cómo continuar;

\- cómo comenzar una nueva partida;

\- separación equipo/dinamizador;

\- supuesto de un equipo por dispositivo o perfil;

\- ausencia de sincronización;

\- comportamiento de varias pestañas;

\- funcionamiento online;

\- ausencia de cargas remotas en runtime;

\- dependencias npm permitidas;

\- limitaciones del MVP;

\- ausencia de identidad nominal de equipo;

\- posibilidad futura de añadir identificación nominal, sin diseñarla ahora;

\- advertencia de que borrar datos del sitio elimina ambos estados de ese navegador;

\- requisitos pendientes de Iteración 2.



La revisión final de producción del README pertenece a Iteración 2.



\# 25. Criterios de aceptación



\## 25.1 Criterios de aceptación de Iteración 1



La Iteración 1 se considera terminada únicamente cuando:



1\. Existen `docs/SPEC.md` y `docs/IMPLEMENTATION\_PLAN.md`.

2\. Ambos documentos describen las dos iteraciones.

3\. Solo se ha implementado Iteración 1.

4\. Existen las rutas definitivas.

5\. No existe `teamId`.

6\. No existe nombre, número, alias, selector ni identificador persistido de equipo.

7\. La interfaz utiliza textos genéricos para el equipo.

8\. El catálogo inicial contiene exactamente tres fases, cuatro categorías y veinticuatro tarjetas.

9\. El catálogo inicial contiene ocho tarjetas por fase.

10\. El catálogo inicial contiene dos tarjetas por combinación de fase y categoría.

11\. Los conteos anteriores solo son invariantes del fixture inicial.

12\. La arquitectura no depende rígidamente de tres fases, cuatro categorías o veinticuatro tarjetas.

13\. Las fases, categorías, tarjetas, filtros, orden y progreso se derivan de configuración.

14\. El máximo de tres selecciones está centralizado en configuración.

15\. Se muestran y navegan todas las fases configuradas.

16\. Equipo y dinamizador pueden seleccionar de cero al máximo por fase.

17\. Nunca se admite una cuarta selección con la configuración inicial.

18\. No existe ranking ni orden de preferencia.

19\. Las selecciones sobreviven a recargas.

20\. Equipo y dinamizador usan claves y estados separados.

21\. Reiniciar uno no afecta al otro.

22\. El dinamizador no recibe datos de equipos.

23\. Justicia 2030 solo genera el prompt cuando todas las fases configuradas están completas.

24\. Con el fixture inicial, el prompt contiene exactamente nueve tarjetas.

25\. El prompt se genera automáticamente y de forma determinista.

26\. Cada fase aparece una sola vez como cabecera `##`.

27\. Cada tarjeta aparece una sola vez como cabecera `###`.

28\. Las tarjetas están correctamente agrupadas por fase.

29\. La redacción del prompt está centralizada en `src/config/prompt-template.ts`.

30\. SPEC y README indican que la plantilla está pendiente de validación por Innovation.

31\. Equipo y dinamizador pueden copiar su propio prompt.

32\. No se realiza ninguna llamada a un modelo o API externa.

33\. No se cargan recursos remotos durante el runtime.

34\. Las dependencias npm necesarias están permitidas, fijadas y recogidas en el lockfile.

35\. El contenido y la plantilla están desacoplados de los componentes.

36\. La hidratación no sobrescribe el estado persistido.

37\. La interfaz cuenta con responsive y accesibilidad básicos.

38\. Los tests de Iteración 1 terminan correctamente.

39\. Lint, typecheck y build terminan correctamente.

40\. El build puede desplegarse en Vercel.

41\. README y documentación reflejan lo implementado y lo pendiente.



\## 25.2 Criterios de aceptación final de Iteración 2



La Iteración 2 se considerará terminada cuando, además de mantenerse todos los criterios anteriores:



\- el estado corrupto se normalice de forma exhaustiva y determinista;

\- se recupere selectivamente la información válida;

\- todos los fallos de almacenamiento estén tratados y probados;

\- el fallback en memoria esté completamente validado;

\- se haya completado la ampliación de pruebas defensivas;

\- se haya realizado la revisión sistemática de accesibilidad;

\- se haya completado el QA responsive y de contenido largo;

\- estén configuradas y verificadas las cabeceras;

\- esté configurada y verificada la CSP definitiva;

\- se hayan revisado las dependencias;

\- se hayan comprobado todos los estados límite;

\- la documentación esté preparada para producción;

\- se haya completado la verificación final para producción.



Estos criterios no deben implementarse ni exigirse para cerrar la primera ejecución.



\# 26. Entrega de la primera ejecución



Al concluir la Iteración 1, informa de forma concisa:



\- qué se ha implementado;

\- principales decisiones técnicas;

\- rutas disponibles;

\- ubicación de la configuración y contenidos;

\- ubicación de la plantilla inicial;

\- funcionamiento de persistencia y reinicio;

\- número y tipo de pruebas;

\- resultado exacto de `npm test`;

\- resultado exacto de `npm run lint`;

\- resultado exacto de `npm run typecheck`;

\- resultado exacto de `npm run build`;

\- limitaciones conocidas;

\- lista explícita y completa de tareas pendientes de Iteración 2.



Entrega la Iteración 1 completa y verificada, sin TODOs dentro de su alcance.



La lista de Iteración 2 es backlog deliberado y documentado, no deuda oculta de Iteración 1.



Después de presentar el resultado:



\- detente;

\- no modifiques más código;

\- no comiences Iteración 2;

\- espera validación manual.

