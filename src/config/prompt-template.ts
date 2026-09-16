export const PROMPT_TEMPLATE = {
  introduction: [
    "Actúa como especialista en innovación y transformación del sistema de justicia.",
    "A partir de las nueve tarjetas incluidas a continuación, elabora una propuesta integrada de «Justicia 2030».",
  ],
  rulesTitle: "Reglas:",
  rules: [
    "Trata las nueve tarjetas con el mismo peso. Su orden de presentación no representa un ranking.",
    "No omitas ninguna tarjeta.",
    "Basa la propuesta únicamente en la información proporcionada.",
    "Si necesitas realizar algún supuesto, indícalo explícitamente.",
    "Identifica conexiones entre personas, procesos, tecnología y gobernanza.",
    "No inventes datos, normativa, plazos ni cifras.",
  ],
  structureTitle: "Estructura obligatoria de la respuesta:",
  structure: [
    "Visión integrada de Justicia 2030.",
    "Prioridades correspondientes a cada una de las tres fases.",
    "Sinergias y dependencias entre las prioridades.",
    "Iniciativas y próximos pasos.",
    "Riesgos y condiciones necesarias.",
    "Indicadores cualitativos y cuantitativos sugeridos.",
    "Preguntas abiertas para continuar el debate.",
  ],
  cardsTitle: "TARJETAS SELECCIONADAS",
} as const;

// Borrador funcional pendiente de validación por el equipo de Innovation.
