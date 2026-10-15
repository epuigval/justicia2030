import type { WorkshopCollectiveAssets } from "@/domain/types";
import { workshopConfig } from "./workshop";

export interface IndividualCollectivePresentation {
  description: string;
  assets?: WorkshopCollectiveAssets;
}

function existingCollectiveAssets(collectiveId: string): WorkshopCollectiveAssets | undefined {
  return workshopConfig.collectives.find((collective) => collective.id === collectiveId)?.assets;
}

export const individualCollectivePresentations: Record<string, IndividualCollectivePresentation> = {
  "universidad-talento-joven": {
    description: "Estudiante, docente o investigador interesado en el ámbito de la Justicia y en cómo la innovación, el conocimiento y las nuevas tecnologías pueden contribuir a su evolución.",
  },
  "profesionales-juridicos": {
    description: "Profesional que representa o acompaña a ciudadanos y empresas y se relaciona de forma continua con órganos judiciales y tribunales.",
    assets: existingCollectiveAssets("perfil-2"),
  },
  "profesionales-administracion-justicia": {
    description: "Profesional que desarrolla su actividad en órganos, oficinas judiciales o Fiscalía y participa directamente en la gestión, tramitación, análisis o resolución de procedimientos.",
    assets: existingCollectiveAssets("perfil-3"),
  },
  "otros-operadores-justicia": {
    description: "Profesional que interviene, colabora o presta apoyo especializado en el ecosistema de Justicia, participando en la resolución de conflictos, aportando conocimiento experto o relacionándose con órganos judiciales y Administraciones.",
    assets: existingCollectiveAssets("perfil-5"),
  },
  "tecnologia-transformacion-digital": {
    description: "Profesional responsable de diseñar, desarrollar, gobernar o evolucionar sistemas, datos y servicios digitales que soportan el funcionamiento y la transformación de la Justicia.",
  },
};

export function getIndividualCollectivePresentation(collectiveId: string): IndividualCollectivePresentation | undefined {
  return individualCollectivePresentations[collectiveId];
}
