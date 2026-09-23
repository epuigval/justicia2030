import { writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { readSheet } from "read-excel-file/node";

const source = process.argv[2];
if (!source) throw new Error("Uso: npm run import:content -- <ruta-al-excel>");

const phases = [
  { sheet: "Fase 1 - Justicia Actual", id: "justicia-actual", shortName: "Actual", accent: "orange" },
  { sheet: "Fase 2 - Justicia Conectada", id: "justicia-conectada", shortName: "Conectada", accent: "green" },
  { sheet: "Fase 3 - Justicia Inteligente", id: "justicia-inteligente", shortName: "Inteligente", accent: "blue" },
];
const categoryIds = new Map([
  ["personas", "personas"],
  ["procesos", "procesos"],
  ["tecnologia", "tecnologia"],
  ["gobernanza", "gobernanza"],
]);
const expectedHeaders = ["Titulo", "Descripcion", "El Reto", "La Solucion", "Beneficio 1", "Beneficio 2", "Beneficio 3", "Para el debate", "Categoria"];

function text(value, location) {
  const result = String(value ?? "").trim();
  if (!result) throw new Error(`Falta contenido obligatorio en ${location}.`);
  return result;
}

function normalized(value) {
  return text(value, "categoría").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function assertHeaders(row, sheet) {
  expectedHeaders.forEach((header, index) => {
    if (text(row[index], `${sheet}, cabecera ${index + 1}`) !== header) {
      throw new Error(`Cabecera inesperada en ${sheet}: se esperaba "${header}".`);
    }
  });
}

const cards = [];
const phaseConfig = [];
let order = 1;

for (const phase of phases) {
  const rows = await readSheet(source, phase.sheet);
  assertHeaders(rows[3], phase.sheet);
  const cardRows = rows.slice(4).filter((row) => row.some((cell) => cell !== null));
  if (cardRows.length !== 8) throw new Error(`${phase.sheet} debe contener exactamente 8 tarjetas; contiene ${cardRows.length}.`);

  const heading = text(rows[0][0], `${phase.sheet}, título`);
  const name = heading.replace(/^Fase\s+\d+\s*:\s*/, "");
  const description = text(rows[1][0], `${phase.sheet}, descripción`).split(". Completa ")[0] + ".";
  phaseConfig.push({
    id: phase.id,
    name,
    shortName: phase.shortName,
    description,
    order: phaseConfig.length + 1,
    accent: phase.accent,
  });

  cardRows.forEach((row, rowIndex) => {
    const values = row.slice(0, 9).map((value, columnIndex) => text(value, `${phase.sheet}, fila ${rowIndex + 5}, columna ${columnIndex + 1}`));
    const categoryId = categoryIds.get(normalized(values[8]));
    if (!categoryId) throw new Error(`Categoría desconocida "${values[8]}" en ${phase.sheet}, fila ${rowIndex + 5}.`);
    cards.push({
      id: `${phase.id}-tarjeta-${rowIndex + 1}`,
      phaseId: phase.id,
      categoryId,
      title: values[0],
      shortDescription: values[1],
      challenge: values[2],
      solution: values[3],
      benefits: values.slice(4, 7),
      debateQuestion: values[7],
      order: order++,
    });
  });
}

const profileRows = await readSheet(source, "Perfiles ");
const profileHeaders = profileRows[1].slice(1, 4).map(String);
if (JSON.stringify(profileHeaders) !== JSON.stringify(["Colectivo", "Perfil de referencia", "Criterios de priorización"])) {
  throw new Error("Las cabeceras de la pestaña Perfiles no coinciden con la plantilla esperada.");
}
const collectives = profileRows.slice(2).filter((row) => row[1] !== null).map((row, index) => ({
  id: `perfil-${index + 1}`,
  name: text(row[1], `Perfiles, fila ${index + 3}, colectivo`),
  description: text(row[2], `Perfiles, fila ${index + 3}, perfil`),
  prioritizationCriteria: text(row[3], `Perfiles, fila ${index + 3}, criterios`).split("·").map((criterion) => criterion.trim()),
}));
if (collectives.length === 0) throw new Error("La pestaña Perfiles debe contener al menos un colectivo.");

const serialize = (value) => JSON.stringify(value, null, 2);
const categories = [
  { id: "personas", name: "Personas", order: 1 },
  { id: "procesos", name: "Procesos", order: 2 },
  { id: "tecnologia", name: "Tecnología", order: 3 },
  { id: "gobernanza", name: "Gobernanza", order: 4 },
];
const output = `import type { WorkshopCard, WorkshopConfig } from "@/domain/types";\n\nconst cards: WorkshopCard[] = ${serialize(cards)};\n\nexport const workshopConfig: WorkshopConfig = {\n  title: "Justicia 2030",\n  intro: "Explorad las etapas del workshop, debatid las propuestas y seleccionad 3 tarjetas por etapa para construir una visión compartida de la Justicia 2030.",\n  maxSelectionsPerPhase: 3,\n  collectives: ${serialize(collectives)},\n  phases: ${serialize(phaseConfig)},\n  categories: ${serialize(categories)},\n  cards,\n};\n\nexport const storageKeys = {\n  team: "justicia2030:v1:team",\n  facilitator: "justicia2030:v1:facilitator",\n} as const;\n`;

const destination = path.resolve("src/config/workshop.ts");
await writeFile(destination, output, "utf8");
console.log(`Importados ${cards.length} tarjetas y ${collectives.length} perfiles en ${destination}.`);