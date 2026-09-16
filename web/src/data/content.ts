import { Card, CategoryId, WorkshopContent } from "@/types/workshop";

const debateQuestion =
  "Que impacto tendria esta iniciativa en la Justicia valenciana?";

function card(
  id: string,
  categoryId: CategoryId,
  title: string,
  summary: string,
  challenge: string,
  solution: string,
  benefits: string[],
): Card {
  return {
    id,
    categoryId,
    title,
    summary,
    challenge,
    solution,
    benefits,
    debateQuestion,
    active: true,
  };
}

export const content: WorkshopContent = {
  appTitle: "Justicia 2030",
  appSubtitle: "Construyendo hoy la justicia del futuro",
  finalIntroduction:
    "Genera un prompt con las nueve decisiones del equipo y copialo en la herramienta de IA acordada.",
  promptTemplate:
    "Actua como especialista en innovacion publica y transformacion de la Justicia. A partir de las iniciativas seleccionadas en Justicia actual, Justicia conectada y Justicia inteligente, redacta una vision compartida de la Justicia valenciana en 2030. Sintetiza prioridades, impacto esperado y principios de implantacion. Evita rankings: todas las iniciativas tienen la misma importancia.",
  maxSelectionsPerPhase: 3,
  categories: [
    { id: "personas", label: "Personas", order: 1 },
    { id: "procesos", label: "Procesos", order: 2 },
    { id: "tecnologia", label: "Tecnologia", order: 3 },
    { id: "gobernanza", label: "Gobernanza", order: 4 },
  ],
  phases: [
    {
      id: "justicia-actual",
      title: "Justicia actual",
      description: "Entendemos la situacion actual y priorizamos mejoras inmediatas.",
      order: 1,
      cards: [
        card("actual-personas-1", "personas", "Mejora de la atencion a la ciudadania", "Una atencion accesible, clara y cercana.", "Los canales no siempre responden a necesidades diversas.", "Implantar un modelo multicanal, inclusivo y orientado a necesidades reales.", ["Mejor experiencia", "Menos espera", "Mayor confianza"]),
        card("actual-personas-2", "personas", "Capacitacion de profesionales", "Competencias actualizadas para un servicio eficaz.", "La evolucion normativa y digital exige aprendizaje continuo.", "Crear itinerarios formativos por perfiles y casos reales.", ["Autonomia", "Adopcion", "Calidad"]),
        card("actual-procesos-1", "procesos", "Simplificacion procesal", "Tramites mas simples, comprensibles y agiles.", "Existen pasos redundantes y carga administrativa elevada.", "Revisar tramites y eliminar duplicidades.", ["Agilidad", "Menos friccion", "Claridad"]),
        card("actual-procesos-2", "procesos", "Lenguaje juridico claro", "Comunicaciones comprensibles para la ciudadania.", "El lenguaje tecnico dificulta atender resoluciones y requerimientos.", "Aplicar lenguaje claro y plantillas comprensibles.", ["Menos errores", "Mejor cumplimiento", "Accesibilidad"]),
        card("actual-tecnologia-1", "tecnologia", "Gestion del dato", "Informacion consistente para decidir mejor.", "Los datos estan fragmentados y tienen baja trazabilidad.", "Estandarizar datos y habilitar cuadros de seguimiento.", ["Mejores decisiones", "Trazabilidad", "Anticipacion"]),
        card("actual-tecnologia-2", "tecnologia", "Puesto de trabajo digital", "Herramientas coherentes para el trabajo diario.", "La dispersion de aplicaciones genera retrabajo.", "Unificar accesos y priorizar herramientas por tareas.", ["Productividad", "Menos errores", "Coherencia"]),
        card("actual-gobernanza-1", "gobernanza", "Indicadores de servicio", "Medir resultados para mejorar continuamente.", "Falta una vision compartida del rendimiento del servicio.", "Definir indicadores comunes de calidad, tiempos y experiencia.", ["Transparencia", "Priorizacion", "Seguimiento"]),
        card("actual-gobernanza-2", "gobernanza", "Coordinacion institucional", "Decisiones alineadas entre actores de la Justicia.", "Las responsabilidades distribuidas dificultan una respuesta coordinada.", "Establecer foros de decision y protocolos estables.", ["Alineamiento", "Rapidez", "Responsabilidad"]),
      ],
    },
    {
      id: "justicia-conectada",
      title: "Justicia conectada",
      description: "Conectamos personas, procesos e instituciones para avanzar juntos.",
      order: 2,
      cards: [
        card("conectada-personas-1", "personas", "Experiencia omnicanal", "Continuidad entre atencion presencial, telefonica y digital.", "Los canales ofrecen experiencias desconectadas.", "Unificar criterios de atencion y seguimiento.", ["Continuidad", "Accesibilidad", "Satisfaccion"]),
        card("conectada-personas-2", "personas", "Colaboracion profesional", "Espacios compartidos para perfiles juridicos y tecnicos.", "Existen barreras para coordinar actuaciones multidisciplinares.", "Implantar espacios de trabajo con informacion contextualizada.", ["Alineamiento", "Menos retrabajo", "Productividad"]),
        card("conectada-procesos-1", "procesos", "Expediente de extremo a extremo", "Seguimiento continuo entre organismos.", "Los cambios de organismo rompen la trazabilidad.", "Definir un flujo compartido con estados y responsables comunes.", ["Trazabilidad", "Menos demoras", "Coordinacion"]),
        card("conectada-procesos-2", "procesos", "Tramitacion proactiva", "Avisos anticipados para evitar bloqueos.", "Los retrasos se detectan cuando ya afectan al plazo.", "Activar alertas preventivas basadas en hitos.", ["Prevencion", "Agilidad", "Menos incidencias"]),
        card("conectada-tecnologia-1", "tecnologia", "Interoperabilidad institucional", "Intercambio seguro de informacion.", "Los sistemas aislados obligan a repetir aportaciones.", "Priorizar integraciones y acuerdos de intercambio seguro.", ["Menos duplicidad", "Fluidez", "Coordinacion"]),
        card("conectada-tecnologia-2", "tecnologia", "Identidad y firma integradas", "Accesos y firmas coherentes en el ecosistema.", "La diversidad de mecanismos dificulta el uso continuado.", "Unificar identidad, permisos y firma.", ["Seguridad", "Facilidad", "Continuidad"]),
        card("conectada-gobernanza-1", "gobernanza", "Gobernanza del dato compartido", "Reglas comunes para datos fiables.", "No siempre esta claro quien mantiene cada dato.", "Asignar propietarios, calidad y condiciones de uso.", ["Confianza", "Calidad", "Uso responsable"]),
        card("conectada-gobernanza-2", "gobernanza", "Gobernanza de servicio", "Una vision transversal para priorizar mejoras.", "Las mejoras locales no siempre optimizan el servicio completo.", "Establecer gobierno, indicadores y cadencias comunes.", ["Priorizacion", "Seguimiento", "Adaptacion"]),
      ],
    },
    {
      id: "justicia-inteligente",
      title: "Justicia inteligente",
      description: "Usamos tecnologia y conocimiento para ser mas eficientes.",
      order: 3,
      cards: [
        card("inteligente-personas-1", "personas", "Asistentes de apoyo al trabajo", "Apoyo inteligente en analisis y redaccion.", "Las tareas repetitivas reducen el tiempo para labores de valor.", "Incorporar asistentes supervisados para borradores y riesgos.", ["Ahorro de tiempo", "Mejor foco", "Menos errores"]),
        card("inteligente-personas-2", "personas", "Capacitacion digital continua", "Aprendizaje conectado con casos reales.", "La brecha de competencias limita nuevas soluciones.", "Crear itinerarios por perfiles con practica guiada.", ["Adopcion", "Autonomia", "Mejora continua"]),
        card("inteligente-procesos-1", "procesos", "Automatizacion responsable", "Tareas estandar con supervision humana.", "Los procesos manuales consumen tiempo y generan variabilidad.", "Automatizar tareas con controles y trazabilidad.", ["Eficiencia", "Consistencia", "Escalabilidad"]),
        card("inteligente-procesos-2", "procesos", "Clasificacion inteligente", "Documentos encaminados desde el primer momento.", "La clasificacion manual produce esperas y reasignaciones.", "Proponer clasificaciones mediante modelos con revision humana.", ["Rapidez", "Menos reasignaciones", "Calidad"]),
        card("inteligente-tecnologia-1", "tecnologia", "Analitica predictiva", "Anticipacion de cargas y demoras.", "La planificacion reacciona tarde a cambios en la demanda.", "Aplicar modelos predictivos para planificar recursos.", ["Planificacion", "Mejor uso de recursos", "Menos demoras"]),
        card("inteligente-tecnologia-2", "tecnologia", "Busqueda juridica aumentada", "Acceso rapido a informacion relevante.", "Localizar antecedentes exige consultar multiples fuentes.", "Combinar busqueda semantica, filtros y fuentes verificables.", ["Rapidez", "Cobertura", "Trazabilidad"]),
        card("inteligente-gobernanza-1", "gobernanza", "Marco de IA responsable", "Criterios para adoptar IA con garantias.", "La IA plantea riesgos juridicos, eticos y operativos.", "Definir principios, evaluaciones y responsabilidades.", ["Confianza", "Cumplimiento", "Transparencia"]),
        card("inteligente-gobernanza-2", "gobernanza", "Evaluacion continua de algoritmos", "Control de calidad, sesgos e impacto.", "El rendimiento de los modelos cambia con el tiempo.", "Monitorizar resultados y establecer revision y retirada.", ["Calidad", "Equidad", "Control"]),
      ],
    },
  ],
};

export const phaseById = Object.fromEntries(
  content.phases.map((phase) => [phase.id, phase]),
);

export const activeCardsByPhaseId = Object.fromEntries(
  content.phases.map((phase) => [phase.id, phase.cards.filter((item) => item.active)]),
);

export const categoryById = Object.fromEntries(
  content.categories.map((category) => [category.id, category]),
);