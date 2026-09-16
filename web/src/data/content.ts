import { WorkshopContent } from "@/types/workshop";

export const content: WorkshopContent = {
  appTitle: "Justicia 2030",
  appSubtitle: "Construyendo la justicia del futuro",
  debateQuestion: "Que impacto tendria esta iniciativa en la Justicia valenciana?",
  finalPrompt:
    "Sintetizad vuestra vision compartida en una frase clara y accionable.",
  finalRecommendedLength: {
    min: 100,
    max: 140,
  },
  maxSelectionsPerPhase: 3,
  phases: [
    {
      id: "justicia-actual",
      title: "Justicia actual",
      description:
        "Identificad iniciativas de impacto inmediato para mejorar la atencion a la ciudadania.",
      order: 1,
      cards: [
        {
          id: "actual-1",
          title: "Mejora de la atencion a la ciudadania",
          challenge: "Canales de atencion poco accesibles y tiempos de respuesta irregulares.",
          solution: "Implantar un modelo de atencion multicanal, inclusivo y orientado a necesidades reales.",
          benefits: [
            "Mejor experiencia ciudadana",
            "Reduccion de tiempos de espera",
            "Mayor confianza en el servicio publico",
          ],
          active: true,
        },
        {
          id: "actual-2",
          title: "Simplificacion procesal",
          challenge: "Procesos con excesiva carga administrativa y pasos redundantes.",
          solution: "Revisar tramites clave y eliminar duplicidades con criterios de simplificacion.",
          benefits: [
            "Menos friccion operativa",
            "Agilidad en la tramitacion",
            "Mayor claridad para profesionales y ciudadania",
          ],
          active: true,
        },
        {
          id: "actual-3",
          title: "Gestion del dato",
          challenge: "Informacion fragmentada entre sistemas y baja trazabilidad de expedientes.",
          solution: "Estandarizar estructuras de datos y habilitar cuadros de seguimiento operativos.",
          benefits: [
            "Mejores decisiones",
            "Deteccion temprana de cuellos de botella",
            "Mas transparencia interna",
          ],
          active: true,
        },
        {
          id: "actual-4",
          title: "Comunicacion clara",
          challenge: "Lenguaje tecnico complejo en comunicaciones dirigidas a la ciudadania.",
          solution: "Aplicar pautas de lenguaje claro y plantillas comprensibles en notificaciones.",
          benefits: [
            "Menos confusion",
            "Mayor cumplimiento de requerimientos",
            "Relacion mas cercana con la administracion",
          ],
          active: true,
        },
      ],
    },
    {
      id: "justicia-conectada",
      title: "Justicia conectada",
      description:
        "Priorizad capacidades para conectar actores, procesos y servicios de extremo a extremo.",
      order: 2,
      cards: [
        {
          id: "conectada-1",
          title: "Interoperabilidad institucional",
          challenge: "Baja coordinacion entre organismos implicados en los procedimientos.",
          solution: "Definir integraciones priorizadas y acuerdos de intercambio seguro de informacion.",
          benefits: [
            "Tramites mas fluidos",
            "Menos duplicidad documental",
            "Respuesta coordinada al ciudadano",
          ],
          active: true,
        },
        {
          id: "conectada-2",
          title: "Experiencia omnicanal",
          challenge: "Experiencias desconectadas entre atencion presencial, telefonica y digital.",
          solution: "Unificar criterios de atencion y seguimiento de casos en todos los canales.",
          benefits: [
            "Continuidad en la atencion",
            "Mayor accesibilidad",
            "Satisfaccion de usuarios y profesionales",
          ],
          active: true,
        },
        {
          id: "conectada-3",
          title: "Colaboracion profesional",
          challenge: "Barreras para coordinar actuaciones entre perfiles juridicos y tecnicos.",
          solution: "Implantar espacios de trabajo compartido con informacion contextualizada.",
          benefits: [
            "Decisiones mejor alineadas",
            "Menor retrabajo",
            "Incremento de productividad",
          ],
          active: true,
        },
        {
          id: "conectada-4",
          title: "Gobernanza de servicio",
          challenge: "Dificultad para priorizar mejoras con una vision transversal.",
          solution: "Establecer un marco de gobierno con indicadores y cadencias de mejora.",
          benefits: [
            "Priorizacion compartida",
            "Seguimiento continuo",
            "Mayor capacidad de adaptacion",
          ],
          active: true,
        },
      ],
    },
    {
      id: "justicia-inteligente",
      title: "Justicia inteligente",
      description:
        "Seleccionad iniciativas que aprovechen tecnologia y talento para un servicio mas predictivo.",
      order: 3,
      cards: [
        {
          id: "inteligente-1",
          title: "Asistentes de apoyo al trabajo",
          challenge: "Sobrecarga en tareas repetitivas de analisis documental y redaccion.",
          solution: "Incorporar asistentes de apoyo para preparar borradores y resaltar riesgos.",
          benefits: [
            "Ahorro de tiempo",
            "Mejor foco en tareas de mayor valor",
            "Reduccion de errores de forma",
          ],
          active: true,
        },
        {
          id: "inteligente-2",
          title: "Analitica predictiva",
          challenge: "Escasa anticipacion de saturaciones y demoras en el servicio.",
          solution: "Aplicar modelos de prediccion para planificar carga y recursos con antelacion.",
          benefits: [
            "Planificacion proactiva",
            "Mejor uso de recursos",
            "Disminucion de tiempos de resolucion",
          ],
          active: true,
        },
        {
          id: "inteligente-3",
          title: "Automatizacion responsable",
          challenge: "Procesos manuales con alto consumo de tiempo y variabilidad.",
          solution: "Automatizar tareas estandar con controles de calidad y supervision humana.",
          benefits: [
            "Eficiencia operativa",
            "Mayor consistencia",
            "Escalabilidad del servicio",
          ],
          active: true,
        },
        {
          id: "inteligente-4",
          title: "Capacitacion digital continua",
          challenge: "Brecha de competencias para aprovechar nuevas herramientas.",
          solution: "Crear itinerarios formativos por perfiles y practicas guiadas por casos reales.",
          benefits: [
            "Adopcion mas rapida",
            "Mayor autonomia profesional",
            "Cultura de mejora continua",
          ],
          active: true,
        },
      ],
    },
  ],
};

export const phaseById = Object.fromEntries(content.phases.map((phase) => [phase.id, phase]));

export const activeCardsByPhaseId = Object.fromEntries(
  content.phases.map((phase) => [
    phase.id,
    phase.cards.filter((card) => card.active),
  ]),
);
