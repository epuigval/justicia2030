# Especificación funcional refinada — Juego de cocreación «Justicia 2030»

## 1. Objetivo

Desarrollar una aplicación web para dinamizar un workshop de visión de futuro sobre la transformación de la Justicia en la Generalitat Valenciana.

La dinámica ayuda a los participantes a reflexionar y consensuar prioridades en tres horizontes:

1. **Justicia actual**
2. **Justicia conectada**
3. **Justicia inteligente**

Como cierre, cada grupo formula una síntesis compartida en la fase **«Justicia 2030»**.

No es un juego competitivo: no existen respuestas correctas, puntuaciones ni cálculos automáticos de “mejores” tarjetas. El valor está en la conversación, la reflexión y el consenso presencial.

---

## 2. Alcance del piloto

### Incluido

- Soporte para **3–4 grupos simultáneos como máximo**.
- **Un dispositivo compartido por grupo** (tablet, portátil o iPad).
- Acceso directo por URL, **sin login, registro ni captura de datos personales**.
- Mismo conjunto de tarjetas precargadas para todos los grupos.
- Selección de hasta **3 tarjetas por fase**.
- Vista específica de grupo y vista global para el dinamizador.
- Posible actualización en tiempo real de la pantalla global al seleccionar tarjetas, siempre que no incremente de forma relevante el riesgo técnico.
- Campo final de texto abierto para el consenso de cada grupo en «Justicia 2030».
- Diseño visual inspirado en la referencia/maketación facilitada, sin abrir un proceso UX completo en esta primera iteración.

### Fuera de alcance del piloto

- Autenticación o gestión de usuarios.
- Recogida de edad, procedencia, perfil profesional u otros datos de participantes.
- Exportación de resultados.
- Histórico de sesiones o persistencia de resultados como requisito funcional.
- Analítica, dashboards, informes o generación de papers.
- Sincronización compleja de fases entre dispositivos.
- Generación automática integrada con IA de la frase final.

> La persistencia, exportación y explotación analítica se prevén como una **fase 2** cercana, pero no deben condicionar ni retrasar el piloto.

---

## 3. Participantes y roles

| Rol | Función |
|---|---|
| Participantes de grupo | Debaten y seleccionan tarjetas desde un único dispositivo compartido. |
| Persona de apoyo NTT en cada grupo | Ayuda a operar la herramienta y resuelve incidencias básicas durante la dinámica. |
| Dinamizador global | Conduce el workshop, coordina los tiempos, modera el consenso transversal y utiliza la pantalla global. |

Cada grupo trabaja de forma independiente y **no visualiza las decisiones ni la actividad de otros grupos** desde su pantalla.

---

## 4. Arquitectura funcional del piloto

La solución debe disponer de dos tipos de acceso:

1. **URL de grupo**  
   Una instancia por mesa o grupo. El equipo usa esta URL en su dispositivo compartido.

2. **URL de dinamizador**  
   Se muestra en una pantalla grande y sirve para acompañar la conversación global y registrar manualmente el consenso transversal.

Aunque se contemple una actualización visual en tiempo real de la pantalla del dinamizador, las partidas deben permanecer desacopladas: no debe haber una dependencia crítica entre la disponibilidad de la pantalla global y el funcionamiento de los grupos.

### Principio de simplicidad

El dinamizador indicará verbalmente cuándo se cambia de fase:

> “Cerramos Justicia actual; podéis comenzar Justicia conectada”.

No se requiere en el piloto un bloqueo/desbloqueo automático entre las pantallas de grupo y la del dinamizador. Si esta capacidad se implementa sin riesgo, podrá incorporarse como mejora; no es condición de aceptación.

---

## 5. Recorrido de grupo

El diseño de referencia define un recorrido de cuatro momentos.

### Pantalla 1. Inicio de fase / tablero del grupo

Muestra el itinerario completo:

- Justicia actual.
- Justicia conectada.
- Justicia inteligente.
- Justicia 2030.

Para cada fase se mostrará:

- Título.
- Breve descripción o pregunta guía configurable.
- Acción principal: **«Explorar»**.
- Estado de selección: por ejemplo, `0/3 tarjetas seleccionadas`.
- Resumen de las tarjetas que el grupo ya haya escogido en esa fase.

La navegación de fases estará disponible, pero el dinamizador será quien marque el ritmo de la sesión presencial.

### Pantalla 2. Exploración de tarjetas

Al pulsar **«Explorar»**, el grupo accede al catálogo o carrusel de tarjetas de la fase activa.

Cada tarjeta debe mostrar, como mínimo:

- Título.
- Elemento visual o icono, si está disponible.
- Acción **«Ver detalle»**.
- Estado de selección.

El grupo puede revisar las tarjetas libremente, debatirlas y abrir su detalle antes de decidir.

#### Reglas de selección

- Máximo: **3 tarjetas por fase**.
- Las tarjetas seleccionadas se mostrarán persistentemente en una zona inferior o lateral, conforme a la maqueta.
- Debe ser posible deseleccionar una tarjeta para sustituirla por otra antes de cerrar la conversación de fase.
- Al alcanzar tres selecciones, la interfaz debe indicarlo claramente.
- No hay validación de contenido, puntuación ni combinación ganadora.

### Pantalla 3. Detalle de tarjeta

Al abrir una tarjeta se presenta una ficha con:

- **Título**.
- **Reto**.
- **Solución**.
- **Beneficios**.
- Pregunta de debate:  
  **«¿Qué impacto tendría esta iniciativa en la Justicia valenciana?»**
- Acción para seleccionar o retirar la tarjeta.
- Acción para volver a la exploración.

La finalidad de esta pantalla es dar una base concreta a la conversación y evitar una reflexión excesivamente abstracta o dispersa.

### Pantalla 4. Justicia 2030

Tras completar las tres fases de reflexión, el grupo accede al cierre.

Debe incluir:

- Título: **«Justicia 2030»**.
- Contexto breve que invite a sintetizar la visión compartida.
- Resumen visible de las tarjetas elegidas por el grupo en las tres fases anteriores.
- Campo de texto abierto para redactar una frase consensuada.
- Orientación de extensión: **100–140 caracteres**.
- Contador de caracteres y validación visual de longitud recomendada.
- Acción de finalización, por ejemplo: **«Guardar reflexión»** o **«Finalizar»**.

En el piloto, el resultado puede redactarse directamente por el grupo. También puede introducirse manualmente una frase producida fuera de la herramienta mediante el prompt de IA ya definido.

---

## 6. Uso del prompt de IA en la fase final

Existe un prompt previamente definido que combina:

- Una estructura base.
- Las tarjetas seleccionadas en **Justicia actual**.
- Las tarjetas seleccionadas en **Justicia conectada**.
- Las tarjetas seleccionadas en **Justicia inteligente**.

### Piloto

La aplicación no necesita llamar a un modelo de IA de forma integrada. Se admite este flujo operativo:

1. Se recopilan las tarjetas seleccionadas.
2. El equipo o dinamizador usa el prompt en la herramienta de IA disponible.
3. La frase generada o acordada se copia y pega en el campo de «Justicia 2030».

### Evolución posterior

En una siguiente fase podrá añadirse el botón **«Generar la Justicia del futuro»**, conectando el prompt con un servicio GPT/Copilot y permitiendo revisar, editar y guardar la propuesta resultante.

---

## 7. Vista global del dinamizador

La pantalla global debe seguir el mismo recorrido visual de las tres fases y la síntesis final, pero con una finalidad distinta: apoyar la puesta en común entre mesas.

Por cada fase debe permitir visualizar y registrar las **tres prioridades consensuadas globalmente**.

### Comportamiento

1. Los grupos realizan su selección individual de tres tarjetas.
2. Se abre una conversación presencial entre todas las mesas.
3. El dinamizador recoge las prioridades compartidas.
4. El dinamizador selecciona manualmente las tres tarjetas que representan el consenso global en su pantalla.

La selección del dinamizador:

- No se calcula automáticamente a partir de votos.
- No reemplaza las selecciones de los grupos.
- No requiere que exista una tarjeta ganadora.
- Funciona como soporte visual para la facilitación y el consenso.

### Actualización de la vista global

La vista global puede reflejar en tiempo real las tarjetas seleccionadas por cada grupo, si ello es viable con una implementación sencilla y robusta.

Si este requisito añade complejidad, dependencia o riesgo para el piloto, debe mantenerse un modo alternativo plenamente funcional: el dinamizador recopila verbalmente las decisiones y marca manualmente las tarjetas globales.

La prioridad es la fiabilidad de la dinámica presencial, no la automatización.

---

## 8. Gestión de contenidos

Todos los grupos utilizarán el mismo conjunto de tarjetas y textos en el piloto de Valencia.

El cliente debe poder mantener el contenido sin depender del equipo de desarrollo. Para ello, se entregará una **plantilla de carga, preferentemente Excel**, que permita definir tarjetas, fases y textos visibles.

### Estructura mínima propuesta para la plantilla

| Campo | Descripción |
|---|---|
| `id_fase` | Identificador técnico de la fase. |
| `titulo_fase` | Ej.: Justicia actual. |
| `descripcion_fase` | Texto introductorio o pregunta guía. |
| `orden_fase` | Orden de aparición. |
| `id_tarjeta` | Identificador único de tarjeta. |
| `orden_tarjeta` | Orden de aparición dentro de la fase. |
| `titulo_tarjeta` | Nombre breve de la iniciativa. |
| `reto` | Problema u oportunidad que aborda. |
| `solucion` | Propuesta planteada. |
| `beneficios` | Impactos o beneficios esperados. |
| `recurso_visual` | Ruta, nombre o referencia de icono/imagen, si aplica. |
| `activa` | Indicador para mostrar u ocultar la tarjeta. |

También deben ser editables los textos transversales de la interfaz: títulos, subtítulos, preguntas de debate, llamadas a la acción y textos de ayuda.

---

## 9. Configurabilidad y reutilización

La solución debe construirse con vocación de reutilización en otros workshops, aunque sin sobredimensionar el piloto.

### Configurable desde contenido

- Títulos y descripciones de las fases.
- Textos de botones, instrucciones y preguntas.
- Tarjetas disponibles.
- Número de tarjetas por fase.
- Orden de las tarjetas.
- Número máximo de selecciones por fase.

### Evolutivo con intervención técnica

Debe evitarse una implementación rígida que obligue a rehacer el producto para:

- Añadir o eliminar fases.
- Pasar de tres fases a una, cuatro, siete u otro número.
- Modificar de manera sustancial la estructura visual de la dinámica.
- Crear una nueva edición para otro cliente, evento o temática.

No se exige autonomía total del cliente para rediseñar la estructura de fases. Sí se exige que la arquitectura prevea este tipo de evolución sin partir de cero.

---

## 10. Datos y persistencia

### Piloto

- No se solicitarán datos de participantes.
- No es obligatorio guardar resultados ni permitir su exportación.
- La sesión se concibe como una dinámica facilitada en vivo, con intervención manual del dinamizador cuando sea necesaria.

### Fase 2 prevista

La solución debería poder evolucionar hacia una base de datos externa que almacene, por partida o grupo:

- Identificador de sesión y evento.
- Fecha y contexto del workshop.
- Tarjetas seleccionadas por fase.
- Resultado final de «Justicia 2030».
- Metadatos de segmentación, cuando proceda: edad, perfil profesional, procedencia u otros.

Esto permitiría producir posteriormente:

- Exportaciones de resultados.
- Dashboards.
- Análisis por segmento.
- Síntesis de tendencias entre eventos.
- Informes o papers de conclusiones.

---

## 11. Criterios de aceptación del piloto

La primera versión estará lista si permite, de forma estable:

1. Abrir 3–4 grupos simultáneos desde URLs compartidas, sin login.
2. Navegar por las tres fases de tarjetas.
3. Consultar el detalle de cada tarjeta con reto, solución y beneficios.
4. Seleccionar, revisar y modificar hasta tres tarjetas por fase.
5. Mantener visibles las selecciones dentro de la experiencia de grupo.
6. Redactar una frase final en «Justicia 2030», con guía de 100–140 caracteres.
7. Operar una pantalla de dinamizador que permita reflejar manualmente el consenso global de cada fase.
8. Cargar el contenido de tarjetas desde una estructura editable por el cliente, preferiblemente Excel.
9. Mantener una apariencia coherente con el mockup de referencia.
10. Funcionar sin depender de automatismos de sincronización o bloqueo entre pantallas.

La actualización en tiempo real de la vista del dinamizador será una mejora deseable, pero no debe poner en riesgo estas condiciones esenciales.
