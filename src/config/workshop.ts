import type { WorkshopCard, WorkshopConfig } from "@/domain/types";

const cards: WorkshopCard[] = [
  {
    "id": "justicia-actual-tarjeta-1",
    "phaseId": "justicia-actual",
    "categoryId": "personas",
    "title": "Mejora de la atención a la ciudadanía",
    "shortDescription": "Ofrecer una atención más clara, accesible y homogénea durante toda la relación con la Justicia.",
    "challenge": "La ciudadanía se enfrenta a canales dispersos, lenguaje complejo y dificultades para saber qué hacer o a quién dirigirse.",
    "solution": "Rediseñar la atención con información comprensible, orientación por momentos del procedimiento y apoyo presencial y digital coordinado.",
    "benefits": [
      "Mayor comprensión y confianza",
      "Menos consultas repetitivas y desplazamientos",
      "Atención más inclusiva y homogénea"
    ],
    "debateQuestion": "¿Qué punto de la relación con la ciudadanía debería mejorarse primero y por qué?",
    "order": 1
  },
  {
    "id": "justicia-actual-tarjeta-2",
    "phaseId": "justicia-actual",
    "categoryId": "personas",
    "title": "Capacitación y adaptación de los profesionales",
    "shortDescription": "Acompañar a los profesionales para que los cambios organizativos y digitales se traduzcan en mejoras reales.",
    "challenge": "La transformación introduce nuevas herramientas, formas de trabajo y responsabilidades con ritmos de adopción desiguales.",
    "solution": "Implantar formación práctica, acompañamiento continuo y espacios para compartir buenas prácticas entre colectivos.",
    "benefits": [
      "Mayor adopción de nuevas formas de trabajo",
      "Reducción de errores y resistencias",
      "Más autonomía y colaboración entre perfiles"
    ],
    "debateQuestion": "¿Qué apoyo necesitan hoy los profesionales para trabajar mejor en un entorno de cambio?",
    "order": 2
  },
  {
    "id": "justicia-actual-tarjeta-3",
    "phaseId": "justicia-actual",
    "categoryId": "procesos",
    "title": "Simplificación procesal y operativa",
    "shortDescription": "Reducir pasos, duplicidades y tareas que no aportan valor en la tramitación diaria.",
    "challenge": "Persisten circuitos complejos, validaciones sucesivas y actividades manuales que alargan los tiempos de gestión.",
    "solution": "Revisar los procesos de extremo a extremo y eliminar, agrupar o estandarizar actuaciones innecesarias.",
    "benefits": [
      "Menores tiempos de tramitación",
      "Menos carga administrativa",
      "Procesos más claros y previsibles"
    ],
    "debateQuestion": "Si pudierais simplificar un proceso de vuestro día a día, ¿cuál tendría mayor impacto?",
    "order": 3
  },
  {
    "id": "justicia-actual-tarjeta-4",
    "phaseId": "justicia-actual",
    "categoryId": "procesos",
    "title": "Gestión eficiente de cargas y recursos",
    "shortDescription": "Organizar el trabajo con mayor flexibilidad para responder a cargas variables y necesidades reales.",
    "challenge": "Existen desequilibrios de carga, cuellos de botella y dificultades para reasignar recursos con agilidad.",
    "solution": "Definir criterios comunes de reparto, seguimiento de cargas y coordinación entre unidades y servicios comunes.",
    "benefits": [
      "Mejor equilibrio de cargas",
      "Mayor capacidad de respuesta",
      "Uso más eficiente de los recursos disponibles"
    ],
    "debateQuestion": "¿Dónde identificáis hoy el principal cuello de botella en la organización del trabajo?",
    "order": 4
  },
  {
    "id": "justicia-actual-tarjeta-5",
    "phaseId": "justicia-actual",
    "categoryId": "tecnologia",
    "title": "Puesto de trabajo digital integrado",
    "shortDescription": "Reducir la fragmentación de herramientas y accesos que dificulta el trabajo cotidiano.",
    "challenge": "Los profesionales pueden necesitar consultar varias aplicaciones, repositorios o canales para completar una misma tarea.",
    "solution": "Evolucionar hacia un entorno de trabajo más integrado, con accesos unificados y una experiencia coherente entre aplicaciones.",
    "benefits": [
      "Menos cambios entre herramientas",
      "Mayor productividad",
      "Reducción de errores por duplicidad"
    ],
    "debateQuestion": "¿Qué herramienta o acceso debería integrarse primero para simplificar vuestro trabajo?",
    "order": 5
  },
  {
    "id": "justicia-actual-tarjeta-6",
    "phaseId": "justicia-actual",
    "categoryId": "tecnologia",
    "title": "Calidad y disponibilidad del dato",
    "shortDescription": "Mejorar la información de partida para gestionar, medir y tomar decisiones con confianza.",
    "challenge": "Los datos pueden estar incompletos, duplicados, poco estructurados o distribuidos entre diferentes sistemas.",
    "solution": "Establecer controles de calidad, criterios comunes de registro y mecanismos para mantener datos completos y actualizados.",
    "benefits": [
      "Información más fiable",
      "Mejores indicadores de gestión",
      "Base sólida para futuras automatizaciones"
    ],
    "debateQuestion": "¿Qué dato os falta o genera más problemas para trabajar o decidir mejor?",
    "order": 6
  },
  {
    "id": "justicia-actual-tarjeta-7",
    "phaseId": "justicia-actual",
    "categoryId": "gobernanza",
    "title": "Coordinación entre actores de Justicia",
    "shortDescription": "Reforzar la coordinación entre órganos, oficinas, fiscalías y administraciones implicadas en un mismo servicio.",
    "challenge": "La diversidad de competencias y formas de trabajo puede generar dependencias, duplicidades y decisiones poco coordinadas.",
    "solution": "Establecer mecanismos estables de coordinación, responsabilidades claras y objetivos compartidos sobre procesos transversales.",
    "benefits": [
      "Menos fricciones entre unidades",
      "Mayor coherencia en la prestación del servicio",
      "Resolución más rápida de dependencias"
    ],
    "debateQuestion": "¿En qué ámbito sería más valioso reforzar la coordinación entre actores?",
    "order": 7
  },
  {
    "id": "justicia-actual-tarjeta-8",
    "phaseId": "justicia-actual",
    "categoryId": "gobernanza",
    "title": "Modelo común de seguimiento y mejora",
    "shortDescription": "Pasar de gestionar incidencias puntuales a mejorar de forma continua el funcionamiento del servicio.",
    "challenge": "No siempre existen indicadores compartidos para identificar problemas, comparar resultados y hacer seguimiento de las mejoras.",
    "solution": "Definir un marco común de indicadores, revisión periódica y priorización de acciones de mejora.",
    "benefits": [
      "Mayor visibilidad del desempeño",
      "Decisiones basadas en evidencias",
      "Mejora continua y rendición de cuentas"
    ],
    "debateQuestion": "¿Qué tres indicadores os permitirían saber si la Justicia está funcionando mejor?",
    "order": 8
  },
  {
    "id": "justicia-conectada-tarjeta-1",
    "phaseId": "justicia-conectada",
    "categoryId": "personas",
    "title": "Experiencia unificada para profesionales",
    "shortDescription": "Permitir que cada profesional acceda de forma sencilla a la información y servicios que necesita, con independencia del sistema de origen.",
    "challenge": "La fragmentación entre aplicaciones y administraciones obliga a realizar búsquedas y accesos separados.",
    "solution": "Ofrecer una experiencia integrada basada en perfiles, accesos federados y navegación coherente entre servicios.",
    "benefits": [
      "Menos tiempo buscando información",
      "Mayor continuidad en el trabajo",
      "Mejor experiencia de usuario profesional"
    ],
    "debateQuestion": "¿Qué información o servicio debería aparecer siempre en vuestro entorno de trabajo, sin tener que buscarlo?",
    "order": 9
  },
  {
    "id": "justicia-conectada-tarjeta-2",
    "phaseId": "justicia-conectada",
    "categoryId": "personas",
    "title": "Colaboración digital entre colectivos",
    "shortDescription": "Facilitar el trabajo coordinado entre jueces, fiscales, LAJ, gestores, profesionales externos y perfiles técnicos.",
    "challenge": "La colaboración suele depender de intercambios manuales, correos o canales no integrados en el flujo del expediente.",
    "solution": "Habilitar espacios y mecanismos seguros de colaboración vinculados al procedimiento y con trazabilidad.",
    "benefits": [
      "Coordinación más ágil",
      "Menos comunicaciones duplicadas",
      "Mayor trazabilidad de acuerdos y actuaciones"
    ],
    "debateQuestion": "¿Qué interacción entre colectivos debería digitalizarse o integrarse mejor?",
    "order": 10
  },
  {
    "id": "justicia-conectada-tarjeta-3",
    "phaseId": "justicia-conectada",
    "categoryId": "procesos",
    "title": "Interoperabilidad de extremo a extremo",
    "shortDescription": "Conseguir que la información fluya entre sistemas de Justicia sin reintroducir datos ni romper el proceso.",
    "challenge": "Los intercambios entre sistemas y territorios pueden requerir actuaciones manuales o transformaciones que ralentizan la tramitación.",
    "solution": "Extender interoperabilidades basadas en estándares comunes, datos estructurados y servicios reutilizables.",
    "benefits": [
      "Menos duplicidad de datos",
      "Procesos más rápidos",
      "Mayor continuidad entre administraciones"
    ],
    "debateQuestion": "¿Qué intercambio de información tendría mayor impacto si fuera completamente automático?",
    "order": 11
  },
  {
    "id": "justicia-conectada-tarjeta-4",
    "phaseId": "justicia-conectada",
    "categoryId": "procesos",
    "title": "Expediente judicial verdaderamente interoperable",
    "shortDescription": "Garantizar que documentos, datos e hitos del expediente puedan ser utilizados de forma coherente entre sistemas y territorios.",
    "challenge": "La información del expediente puede presentarse o estructurarse de forma diferente según el sistema de gestión procesal.",
    "solution": "Avanzar en metadatos, hitos y estructuras comunes que permitan compartir y reutilizar la información del expediente.",
    "benefits": [
      "Visión completa del procedimiento",
      "Menos reprocesos",
      "Mayor movilidad e interoperabilidad territorial"
    ],
    "debateQuestion": "¿Qué información del expediente debería ser común y reutilizable en cualquier territorio?",
    "order": 12
  },
  {
    "id": "justicia-conectada-tarjeta-5",
    "phaseId": "justicia-conectada",
    "categoryId": "tecnologia",
    "title": "Intercambio de datos con otras Administraciones",
    "shortDescription": "Obtener automáticamente la información necesaria desde fuentes públicas autorizadas, evitando pedirla de nuevo.",
    "challenge": "Muchos procedimientos requieren consultas a registros u organismos externos que pueden generar esperas o aportaciones repetidas.",
    "solution": "Priorizar integraciones con fuentes externas mediante servicios de consulta e intercambio de datos estructurados.",
    "benefits": [
      "Menos documentación solicitada",
      "Reducción de tiempos de espera",
      "Mayor calidad y actualización de la información"
    ],
    "debateQuestion": "Si pudierais conectar una nueva fuente de datos mañana, ¿cuál elegiríais?",
    "order": 13
  },
  {
    "id": "justicia-conectada-tarjeta-6",
    "phaseId": "justicia-conectada",
    "categoryId": "tecnologia",
    "title": "Identidad y acceso digital común",
    "shortDescription": "Facilitar un acceso seguro y coherente a servicios de Justicia para profesionales y ciudadanía.",
    "challenge": "La diversidad de credenciales, representaciones y permisos complica el acceso y la gestión de autorizaciones.",
    "solution": "Evolucionar hacia mecanismos interoperables de identidad, representación y control de acceso adaptados a cada perfil.",
    "benefits": [
      "Acceso más sencillo y seguro",
      "Menos incidencias de autenticación",
      "Mejor gestión de permisos y representación"
    ],
    "debateQuestion": "¿Qué problema de identidad, representación o acceso debería resolverse primero?",
    "order": 14
  },
  {
    "id": "justicia-conectada-tarjeta-7",
    "phaseId": "justicia-conectada",
    "categoryId": "gobernanza",
    "title": "Gobierno compartido del dato judicial",
    "shortDescription": "Acordar reglas comunes sobre significado, calidad, responsabilidad y uso de los datos de Justicia.",
    "challenge": "Sin criterios comunes, un mismo dato puede definirse, registrarse o interpretarse de forma diferente entre organizaciones.",
    "solution": "Establecer un modelo de gobierno con propietarios del dato, estándares, catálogo y reglas de calidad compartidas.",
    "benefits": [
      "Datos comparables y reutilizables",
      "Mayor confianza en indicadores",
      "Base común para interoperabilidad e IA"
    ],
    "debateQuestion": "¿Qué aspecto del gobierno del dato es hoy más urgente: calidad, definición, acceso o responsabilidad?",
    "order": 15
  },
  {
    "id": "justicia-conectada-tarjeta-8",
    "phaseId": "justicia-conectada",
    "categoryId": "gobernanza",
    "title": "Estándares comunes e interoperabilidad por diseño",
    "shortDescription": "Incorporar la interoperabilidad como requisito desde el diseño de nuevos servicios y sistemas.",
    "challenge": "Las integraciones creadas a posteriori incrementan costes, complejidad y dependencia entre soluciones.",
    "solution": "Aplicar estándares y requisitos comunes desde el inicio, con mecanismos de conformidad y reutilización de servicios.",
    "benefits": [
      "Menores costes de integración",
      "Mayor sostenibilidad tecnológica",
      "Evolución más rápida del ecosistema"
    ],
    "debateQuestion": "¿Qué requisito debería ser obligatorio desde el diseño de cualquier nuevo sistema de Justicia?",
    "order": 16
  },
  {
    "id": "justicia-inteligente-tarjeta-1",
    "phaseId": "justicia-inteligente",
    "categoryId": "personas",
    "title": "Asistente inteligente para profesionales",
    "shortDescription": "Ayudar a localizar, sintetizar y preparar información relevante sin sustituir el criterio profesional.",
    "challenge": "La revisión de expedientes extensos y la búsqueda de información consumen tiempo que podría dedicarse a tareas de mayor valor.",
    "solution": "Incorporar asistentes de IA para búsqueda, resumen, extracción y apoyo documental con supervisión humana y trazabilidad.",
    "benefits": [
      "Ahorro de tiempo en revisión",
      "Acceso más rápido a información relevante",
      "Mayor foco en tareas de valor añadido"
    ],
    "debateQuestion": "¿En qué tarea concreta os resultaría más útil un asistente inteligente?",
    "order": 17
  },
  {
    "id": "justicia-inteligente-tarjeta-2",
    "phaseId": "justicia-inteligente",
    "categoryId": "personas",
    "title": "Capacidades digitales e IA responsable",
    "shortDescription": "Preparar a los profesionales para utilizar sistemas inteligentes con criterio, seguridad y confianza.",
    "challenge": "El valor de la IA depende de que los usuarios comprendan sus posibilidades, límites, riesgos y responsabilidades.",
    "solution": "Desarrollar formación por perfiles, guías de uso y acompañamiento para una adopción responsable de la IA.",
    "benefits": [
      "Uso más seguro de la IA",
      "Mayor confianza de los profesionales",
      "Mejor aprovechamiento de las nuevas capacidades"
    ],
    "debateQuestion": "¿Qué debería saber cualquier profesional antes de utilizar IA en su trabajo?",
    "order": 18
  },
  {
    "id": "justicia-inteligente-tarjeta-3",
    "phaseId": "justicia-inteligente",
    "categoryId": "procesos",
    "title": "Automatización de tareas repetitivas",
    "shortDescription": "Liberar tiempo profesional automatizando actuaciones administrativas de bajo valor y alta repetición.",
    "challenge": "Persisten tareas previsibles como clasificación, extracción de datos, comprobaciones o generación de comunicaciones.",
    "solution": "Automatizar tareas y flujos donde existan reglas claras, datos suficientes y mecanismos de control y excepción.",
    "benefits": [
      "Reducción de carga manual",
      "Menores tiempos de tramitación",
      "Más tiempo para tareas complejas"
    ],
    "debateQuestion": "¿Qué tarea repetitiva eliminaríais mañana si pudierais automatizarla con garantías?",
    "order": 19
  },
  {
    "id": "justicia-inteligente-tarjeta-4",
    "phaseId": "justicia-inteligente",
    "categoryId": "procesos",
    "title": "Servicios proactivos y tramitación inteligente",
    "shortDescription": "Anticipar actuaciones y necesidades en lugar de esperar siempre una petición o intervención manual.",
    "challenge": "Muchos servicios reaccionan cuando se produce una solicitud, un vencimiento o una incidencia, aunque la información ya permita anticiparse.",
    "solution": "Diseñar avisos, propuestas de actuación y flujos proactivos basados en eventos y datos del procedimiento.",
    "benefits": [
      "Menos retrasos evitables",
      "Mayor anticipación",
      "Mejor experiencia para ciudadanía y profesionales"
    ],
    "debateQuestion": "¿Qué actuación debería activarse automáticamente cuando se produce un determinado hito?",
    "order": 20
  },
  {
    "id": "justicia-inteligente-tarjeta-5",
    "phaseId": "justicia-inteligente",
    "categoryId": "tecnologia",
    "title": "Analítica avanzada para la gestión judicial",
    "shortDescription": "Convertir datos operativos en información útil para anticipar cargas, detectar cuellos de botella y planificar recursos.",
    "challenge": "Los indicadores descriptivos explican lo ocurrido, pero ofrecen capacidad limitada para anticipar necesidades futuras.",
    "solution": "Aplicar analítica avanzada a cargas, tiempos, demanda y recursos, con modelos explicables y orientados a la gestión.",
    "benefits": [
      "Mejor planificación",
      "Detección temprana de saturaciones",
      "Decisiones de gestión basadas en evidencias"
    ],
    "debateQuestion": "¿Qué situación os gustaría poder anticipar con datos antes de que se convierta en un problema?",
    "order": 21
  },
  {
    "id": "justicia-inteligente-tarjeta-6",
    "phaseId": "justicia-inteligente",
    "categoryId": "tecnologia",
    "title": "IA para el tratamiento documental",
    "shortDescription": "Extraer valor de grandes volúmenes de documentos de forma rápida, segura y trazable.",
    "challenge": "La clasificación, búsqueda y lectura manual de documentación consume mucho tiempo y dificulta localizar información relevante.",
    "solution": "Aplicar IA para clasificar, extraer, resumir y relacionar información documental manteniendo siempre acceso al documento fuente.",
    "benefits": [
      "Búsquedas más rápidas",
      "Menos trabajo manual",
      "Mayor capacidad para analizar expedientes complejos"
    ],
    "debateQuestion": "¿Qué tipo de documento o información sería prioritario tratar de forma inteligente?",
    "order": 22
  },
  {
    "id": "justicia-inteligente-tarjeta-7",
    "phaseId": "justicia-inteligente",
    "categoryId": "gobernanza",
    "title": "Gobernanza y control de la IA",
    "shortDescription": "Asegurar que los sistemas inteligentes se utilicen con transparencia, supervisión, seguridad y respeto a los derechos.",
    "challenge": "La IA introduce riesgos de error, sesgo, falta de explicabilidad y uso inadecuado si no existe un marco de control claro.",
    "solution": "Establecer criterios de admisión de casos de uso, evaluación de impacto, supervisión humana, trazabilidad y seguimiento continuo.",
    "benefits": [
      "Mayor confianza y seguridad",
      "Reducción de riesgos",
      "Criterios homogéneos para escalar casos de uso"
    ],
    "debateQuestion": "¿Qué condición debería ser irrenunciable antes de desplegar un sistema de IA en Justicia?",
    "order": 23
  },
  {
    "id": "justicia-inteligente-tarjeta-8",
    "phaseId": "justicia-inteligente",
    "categoryId": "gobernanza",
    "title": "Cartera común de casos de uso y medición de valor",
    "shortDescription": "Priorizar la IA por impacto real y aprender de las experiencias antes de extenderlas a escala.",
    "challenge": "Las iniciativas aisladas pueden duplicar esfuerzos o avanzar sin métricas comunes de valor, riesgo y adopción.",
    "solution": "Gestionar una cartera compartida de casos de uso con criterios de priorización, pilotos medibles y mecanismos de reutilización.",
    "benefits": [
      "Inversión concentrada en casos de mayor valor",
      "Reutilización de aprendizajes y soluciones",
      "Escalado basado en resultados"
    ],
    "debateQuestion": "¿Con qué criterios decidiríais qué caso de uso de IA merece pasar de piloto a servicio estable?",
    "order": 24
  }
];

export const workshopConfig: WorkshopConfig = {
  title: "Justicia 2030",
  intro: "Explora las etapas del workshop, debate las propuestas y selecciona tres tarjetas por etapa para construir una visión compartida de la Justicia 2030.",
  maxSelectionsPerPhase: 3,
  collectives: [
  {
    "id": "perfil-1",
    "name": "Ciudadanía",
    "description": "Soy una persona que necesita realizar un trámite o está involucrada en un procedimiento judicial. No conozco necesariamente cómo funciona la Justicia ni su lenguaje y necesito saber qué tengo que hacer, acceder fácilmente a la información y entender en qué situación se encuentra mi procedimiento. Valoro especialmente la sencillez, la accesibilidad, la rapidez y una atención clara y cercana.",
    "prioritizationCriteria": [
      "Accesibilidad y sencillez",
      "Reducción de tiempos y trámites",
      "Transparencia y comprensión",
      "Calidad de la atención y confianza"
    ]
  },
  {
    "id": "perfil-2",
    "name": "Operadores Jurídicos — Abogados y Procuradores",
    "description": "Soy un profesional que representa y acompaña a ciudadanos o empresas en su relación con la Justicia. Presento escritos, consulto expedientes, recibo notificaciones y me relaciono diariamente con distintos órganos y sistemas. Necesito trabajar de forma ágil, disponer de información actualizada y evitar duplicidades, diferencias entre sistemas y trámites innecesarios.",
    "prioritizationCriteria": [
      "Agilidad en la tramitación",
      "Acceso a información y expedientes",
      "Interoperabilidad y reducción de duplicidades",
      "Seguridad y homogeneidad en la relación digital"
    ]
  },
  {
    "id": "perfil-3",
    "name": "Profesionales de la Administración de Justicia",
    "description": "Trabajo diariamente en un órgano u oficina judicial y participo directamente en la tramitación de procedimientos. Gestiono expedientes, documentación, comunicaciones, señalamientos y numerosas tareas administrativas. Necesito herramientas que simplifiquen mi trabajo, reduzcan tareas repetitivas y me permitan dedicar más tiempo a actuaciones de mayor valor.",
    "prioritizationCriteria": [
      "Reducción de carga de trabajo",
      "Simplificación y automatización de tareas",
      "Mejora de herramientas e información disponible",
      "Impacto en la eficiencia y calidad de la tramitación"
    ]
  },
  {
    "id": "perfil-4",
    "name": "Fiscalía",
    "description": "Soy fiscal e intervengo en distintos procedimientos para el ejercicio de las funciones que tengo atribuidas. Necesito analizar expedientes, acceder a información procedente de diferentes fuentes y coordinar mis actuaciones con órganos judiciales y otros organismos. Valoro especialmente disponer de información completa, fiable y accesible y de herramientas que agilicen el análisis y las actuaciones.",
    "prioritizationCriteria": [
      "Acceso a información completa y fiable",
      "Agilidad de las actuaciones",
      "Interoperabilidad y coordinación",
      "Apoyo al análisis y toma de decisiones"
    ]
  },
  {
    "id": "perfil-5",
    "name": "Otros operadores jurídicos — Peritos, Graduados Sociales, SSJJ de Ayuntamientos…",
    "description": "Soy un profesional que interviene o colabora con la Justicia desde fuera del órgano judicial. Aporto informes, documentación, conocimiento especializado o participo en determinadas actuaciones y necesito relacionarme con diferentes órganos y sistemas. Busco una relación sencilla, ágil y segura con la Justicia, con menos duplicidades y mejores mecanismos para intercambiar información.",
    "prioritizationCriteria": [
      "Facilidad de relación con la Justicia",
      "Intercambio ágil de información y documentación",
      "Interoperabilidad y reducción de duplicidades",
      "Accesibilidad y seguridad de los servicios digitales"
    ]
  }
],
  phases: [
  {
    "id": "justicia-actual",
    "name": "Justicia Actual",
    "shortName": "Actual",
    "description": "Contenido de las 8 tarjetas sobre la situacion actual de la Justicia.",
    "order": 1,
    "accent": "orange"
  },
  {
    "id": "justicia-conectada",
    "name": "Justicia Conectada",
    "shortName": "Conectada",
    "description": "Contenido de las 8 tarjetas sobre una Justicia conectada.",
    "order": 2,
    "accent": "green"
  },
  {
    "id": "justicia-inteligente",
    "name": "Justicia Inteligente",
    "shortName": "Inteligente",
    "description": "Contenido de las 8 tarjetas sobre una Justicia inteligente.",
    "order": 3,
    "accent": "blue"
  }
],
  categories: [
  {
    "id": "personas",
    "name": "Personas",
    "order": 1
  },
  {
    "id": "procesos",
    "name": "Procesos",
    "order": 2
  },
  {
    "id": "tecnologia",
    "name": "Tecnología",
    "order": 3
  },
  {
    "id": "gobernanza",
    "name": "Gobernanza",
    "order": 4
  }
],
  cards,
};

export const storageKeys = {
  team: "justicia2030:v1:team",
  facilitator: "justicia2030:v1:facilitator",
} as const;
