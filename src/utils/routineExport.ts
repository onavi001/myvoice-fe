import { RoutineData } from "../models/Routine";
import { Capacitor } from "@capacitor/core";

const APP_NAME = "My Voice";
const PDF_COLORS = {
  brand: [52, 199, 89] as [number, number, number],
  text: [30, 30, 30] as [number, number, number],
  muted: [100, 100, 100] as [number, number, number],
  dayBg: [245, 245, 245] as [number, number, number],
  cardBg: [255, 255, 255] as [number, number, number],
  border: [210, 210, 210] as [number, number, number],
};

type Exercise = RoutineData["days"][number]["exercises"][number];

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "rutina";
}

function formatDurationValue(value: number, unit: "count" | "seconds"): string {
  if (unit !== "seconds") {
    return value === 1 ? "1 repetición" : `${value} repeticiones`;
  }
  if (value >= 3600) {
    const hours = Math.floor(value / 3600);
    const mins = Math.round((value % 3600) / 60);
    return mins > 0 ? `${hours} h ${mins} min` : `${hours} h`;
  }
  if (value >= 60) {
    const mins = Math.floor(value / 60);
    const secs = value % 60;
    return secs > 0 ? `${mins} min ${secs} seg` : `${mins} min`;
  }
  return `${value} seg`;
}

function formatRest(rest: string | undefined): string | null {
  if (!rest?.trim()) return null;
  const seconds = parseInt(rest, 10);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return formatDurationValue(seconds, "seconds");
}

function describeExerciseVolume(exercise: Exercise): string {
  const sets = Math.max(1, exercise.sets ?? 1);
  const unit = exercise.repsUnit ?? "count";
  const perSet = formatDurationValue(exercise.reps ?? 0, unit);
  const rest = formatRest(exercise.rest);
  const timed = unit === "seconds";

  if (sets === 1) {
    const base = timed ? `1 bloque de ${perSet}` : `1 serie de ${perSet}`;
    return rest ? `${base} · descanso ${rest} después` : base;
  }

  const base = timed ? `${sets} series de ${perSet} c/u` : `${sets} series × ${perSet}`;
  return rest ? `${base} · descanso ${rest} entre series` : base;
}

/** Normaliza texto para PDF (evita caracteres que rompen el render de jsPDF). */
function sanitizePdfText(text: string): string {
  return text
    .normalize("NFC")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u00A0/g, " ")
    .replace(/→/g, "->")
    .replace(/\s+/g, " ")
    .trim();
}

/** Convierte notas con flechas (->) en líneas cortas legibles. */
function expandNotesToLines(raw: string): string[] {
  const text = sanitizePdfText(raw);
  if (!text.includes("->")) {
    return text
      .split(/(?<=\.)\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const parts = text.split(/\s*->\s*/).map((p) => p.trim()).filter(Boolean);
  const lines: string[] = [];
  let head = parts[0];
  const colonIdx = head.indexOf(":");

  if (colonIdx !== -1) {
    lines.push(head.slice(0, colonIdx + 1).trim());
    head = head.slice(colonIdx + 1).trim().replace(/\.$/, "");
    if (head) lines.push(`   1) ${head}`);
  } else {
    lines.push(head.replace(/\.$/, ""));
  }

  const startStep = colonIdx !== -1 ? 2 : 1;
  parts.slice(1).forEach((part, idx) => {
    const stepNum = startStep + idx;
    const isLast = idx === parts.length - 2;
    const dotSpace = part.indexOf(". ");

    if (isLast && dotSpace > 0) {
      lines.push(`   ${stepNum}) ${part.slice(0, dotSpace).trim()}`);
      const tail = part.slice(dotSpace + 1).trim();
      if (tail) lines.push(tail);
    } else {
      lines.push(`   ${stepNum}) ${part.replace(/\.$/, "")}`);
    }
  });

  return lines;
}

function buildExerciseSummary(exercise: Exercise, index: number): string[] {
  const lines: string[] = [];
  lines.push(`${index + 1}. ${exercise.name}`);
  lines.push(`   ${describeExerciseVolume(exercise)}`);

  if (exercise.weight > 0) {
    lines.push(`   Peso sugerido: ${exercise.weight} ${exercise.weightUnit ?? "kg"}`);
  }
  if (exercise.muscleGroup?.length) {
    lines.push(`   Músculos: ${exercise.muscleGroup.join(", ")}`);
  }
  if (exercise.circuitId?.trim()) {
    lines.push(`   Circuito: ${exercise.circuitId}`);
  }
  exercise.tips?.filter(Boolean).forEach((tip) => lines.push(`   • ${tip}`));
  if (exercise.notes?.trim()) {
    lines.push("   Nota:");
    expandNotesToLines(exercise.notes).forEach((noteLine) => lines.push(`   ${noteLine}`));
  }
  return lines;
}

export function buildRoutinePlainText(routine: RoutineData): string {
  const lines: string[] = [
    "══════════════════════════════════════",
    routine.name.toUpperCase(),
    `Plan de entrenamiento · ${APP_NAME}`,
    `Generado: ${new Date().toLocaleString("es-ES", { dateStyle: "long", timeStyle: "short" })}`,
    "══════════════════════════════════════",
    "",
  ];

  const days = routine.days ?? [];
  if (days.length === 0) {
    lines.push("Esta rutina aún no tiene días configurados.");
    return lines.join("\n");
  }

  days.forEach((day, dayIndex) => {
    lines.push(`▸ ${day.dayName || `Día ${dayIndex + 1}`}`);
    lines.push("──────────────────────────────────────");
    if (day.musclesWorked?.length) {
      lines.push(`Enfoque: ${day.musclesWorked.join(" · ")}`);
    }
    if (day.warmupOptions?.length) {
      lines.push(`Calentamiento sugerido: ${day.warmupOptions.join(" · ")}`);
    }
    if (day.explanation?.trim()) {
      lines.push(day.explanation.trim());
    }
    lines.push("");

    const exercises = day.exercises ?? [];
    if (exercises.length === 0) {
      lines.push("  (Sin ejercicios en este día)");
    } else {
      exercises.forEach((exercise, i) => {
        buildExerciseSummary(exercise, i).forEach((line) => lines.push(line));
        lines.push("");
      });
    }
    lines.push("");
  });

  return lines.join("\n").trim();
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

async function saveAndShareNativeFile(
  bytes: Uint8Array,
  filename: string,
  title: string
): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  const [{ Filesystem, Directory }, { Share }] = await Promise.all([
    import("@capacitor/filesystem"),
    import("@capacitor/share"),
  ]);

  const { uri } = await Filesystem.writeFile({
    path: filename,
    data: toBase64(bytes),
    directory: Directory.Cache,
    recursive: true,
  });

  await Share.share({
    title,
    text: `${APP_NAME} · ${title}`,
    url: uri,
    dialogTitle: "Guardar o compartir archivo",
  });

  return true;
}

export function downloadRoutineAsText(routine: RoutineData) {
  const text = buildRoutinePlainText(routine);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, `${slugify(routine.name)}.txt`);
}

type PdfLine = {
  text: string;
  fontSize: number;
  /** Espacio extra (mm) después de este bloque de texto */
  spacingAfter: number;
  color?: [number, number, number];
  bold?: boolean;
};

/** Altura por línea de texto en mm (compacto pero legible) */
const LINE_HEIGHT_RATIO = 0.36;

function measurePdfLineHeight(
  doc: import("jspdf").jsPDF,
  text: string,
  maxWidth: number,
  fontSize: number,
  spacingAfter: number
): number {
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", "normal");
  const wrapped = doc.splitTextToSize(text, maxWidth) as string[];
  const lineCount = Math.max(1, wrapped.length);
  return lineCount * fontSize * LINE_HEIGHT_RATIO + spacingAfter;
}

function measureBlockHeight(doc: import("jspdf").jsPDF, lines: PdfLine[], maxWidth: number): number {
  return lines.reduce(
    (sum, line) =>
      sum +
      measurePdfLineHeight(doc, line.text, maxWidth, line.fontSize, line.spacingAfter),
    0
  );
}

/** Dibuja texto envuelto sin { maxWidth } en text() (evita espaciado forzado entre letras). */
function drawPdfWrappedText(
  doc: import("jspdf").jsPDF,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  fontSize: number,
  options?: { color?: [number, number, number]; bold?: boolean; spacingAfter?: number }
): number {
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", options?.bold ? "bold" : "normal");
  doc.setTextColor(...(options?.color ?? PDF_COLORS.text));
  const wrapped = doc.splitTextToSize(text, maxWidth) as string[];
  const spacingAfter = options?.spacingAfter ?? 0;
  let cursorY = startY;
  wrapped.forEach((wline, i) => {
    doc.text(wline, x, cursorY);
    const isLast = i === wrapped.length - 1;
    cursorY += fontSize * LINE_HEIGHT_RATIO + (isLast ? spacingAfter : 0);
  });
  doc.setTextColor(...PDF_COLORS.text);
  return cursorY;
}

function drawPdfLines(
  doc: import("jspdf").jsPDF,
  lines: PdfLine[],
  x: number,
  startY: number,
  maxWidth: number
): number {
  let cursorY = startY;
  lines.forEach((line) => {
    cursorY = drawPdfWrappedText(doc, line.text, x, cursorY, maxWidth, line.fontSize, {
      color: line.color,
      bold: line.bold,
      spacingAfter: line.spacingAfter,
    });
  });
  return cursorY;
}

function buildDayMetaPdfLines(day: RoutineData["days"][number]): PdfLine[] {
  const S = { body: 0.8, note: 0.5 } as const;
  const lines: PdfLine[] = [];

  if (day.musclesWorked?.length) {
    lines.push({
      text: sanitizePdfText(`Enfoque: ${day.musclesWorked.join(" · ")}`),
      fontSize: 9,
      spacingAfter: S.body,
      color: PDF_COLORS.muted,
    });
  }

  const warmups = day.warmupOptions?.map((o) => sanitizePdfText(o)).filter(Boolean) ?? [];
  if (warmups.length > 0) {
    lines.push({
      text: "Calentamiento:",
      fontSize: 9,
      spacingAfter: 0.35,
      color: PDF_COLORS.muted,
      bold: true,
    });
    warmups.forEach((opt, i) => {
      lines.push({
        text: `• ${opt}`,
        fontSize: 8.5,
        spacingAfter: i === warmups.length - 1 ? S.body : S.note,
        color: PDF_COLORS.muted,
      });
    });
  }

  if (day.explanation?.trim()) {
    const parts = sanitizePdfText(day.explanation.trim())
      .split(/(?<=\.)\s+/)
      .map((p) => p.trim())
      .filter(Boolean);
    parts.forEach((part, i) => {
      lines.push({
        text: part,
        fontSize: 9,
        spacingAfter: i === parts.length - 1 ? S.body : S.note,
        color: PDF_COLORS.muted,
      });
    });
  }

  return lines;
}

function buildExercisePdfLines(exercise: Exercise): PdfLine[] {
  const S = { body: 0.9, note: 0.5, section: 1.2 } as const;
  const lines: PdfLine[] = [
    { text: describeExerciseVolume(exercise), fontSize: 9.5, spacingAfter: S.section },
  ];
  if (exercise.weight > 0) {
    lines.push({
      text: `Peso sugerido: ${exercise.weight} ${exercise.weightUnit ?? "kg"}`,
      fontSize: 9.5,
      spacingAfter: S.body,
    });
  }
  if (exercise.muscleGroup?.length) {
    lines.push({
      text: `Músculos: ${exercise.muscleGroup.join(", ")}`,
      fontSize: 9.5,
      spacingAfter: S.body,
    });
  }
  if (exercise.circuitId?.trim()) {
    lines.push({
      text: `Parte del circuito ${exercise.circuitId}`,
      fontSize: 9.5,
      spacingAfter: S.body,
    });
  }
  const tips = exercise.tips?.filter(Boolean) ?? [];
  if (tips.length === 1) {
    lines.push({
      text: `Consejo: ${sanitizePdfText(tips[0])}`,
      fontSize: 9.5,
      spacingAfter: S.body,
    });
  } else if (tips.length > 1) {
    lines.push({ text: "Consejos:", fontSize: 9.5, spacingAfter: 0.4 });
    tips.forEach((tip, i) => {
      lines.push({
        text: `• ${sanitizePdfText(tip)}`,
        fontSize: 9,
        spacingAfter: i === tips.length - 1 ? S.body : S.note,
      });
    });
  }
  if (exercise.notes?.trim()) {
    lines.push({
      text: "Nota:",
      fontSize: 9,
      spacingAfter: 0.4,
      color: PDF_COLORS.muted,
      bold: true,
    });
    const noteLines = expandNotesToLines(exercise.notes);
    noteLines.forEach((noteLine, i) => {
      lines.push({
        text: noteLine,
        fontSize: 8.5,
        spacingAfter: i === noteLines.length - 1 ? S.body : S.note,
        color: PDF_COLORS.muted,
      });
    });
  }
  return lines;
}

export async function buildRoutinePdfBlob(routine: RoutineData): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 16;
  const pageWidth = 210;
  const contentWidth = pageWidth - margin * 2;
  const cardPaddingX = 5;
  const cardInnerWidth = contentWidth - cardPaddingX * 2;
  let y = 18;

  const newPageIfNeeded = (height: number) => {
    if (y + height > 282) {
      doc.addPage();
      y = 18;
    }
  };

  // Cabecera
  doc.setFillColor(...PDF_COLORS.brand);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(routine.name, contentWidth) as string[];
  doc.text(titleLines, margin, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${APP_NAME} · ${new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
    margin,
    22
  );
  doc.setTextColor(...PDF_COLORS.text);
  y = 36;

  const days = routine.days ?? [];
  if (days.length === 0) {
    newPageIfNeeded(10);
    doc.setFontSize(11);
    doc.text("Esta rutina aún no tiene días configurados.", margin, y);
    return doc.output("blob");
  }

  days.forEach((day, dayIndex) => {
    newPageIfNeeded(24);

    // Bloque del día
    const dayTitle = day.dayName || `Día ${dayIndex + 1}`;
    const dayMetaLines = buildDayMetaPdfLines(day);
    const dayMetaWidth = contentWidth - 12;
    const titleBlockHeight = measurePdfLineHeight(doc, dayTitle, dayMetaWidth, 13, 1);
    const metaBlockHeight = measureBlockHeight(doc, dayMetaLines, dayMetaWidth);
    const dayHeaderHeight = 6 + titleBlockHeight + metaBlockHeight + 4;

    doc.setFillColor(...PDF_COLORS.dayBg);
    doc.setDrawColor(...PDF_COLORS.border);
    doc.roundedRect(margin, y, contentWidth, dayHeaderHeight, 2, 2, "FD");

    doc.setFillColor(...PDF_COLORS.brand);
    doc.rect(margin, y, 3, dayHeaderHeight, "F");

    let dayY = y + 6;
    dayY = drawPdfWrappedText(doc, dayTitle, margin + 6, dayY, dayMetaWidth, 13, {
      bold: true,
      spacingAfter: 1,
    });
    drawPdfLines(doc, dayMetaLines, margin + 6, dayY, dayMetaWidth);

    y += dayHeaderHeight + 5;

    const exercises = day.exercises ?? [];
    if (exercises.length === 0) {
      newPageIfNeeded(8);
      doc.setFontSize(10);
      doc.setTextColor(...PDF_COLORS.muted);
      doc.text("Sin ejercicios en este día.", margin, y);
      doc.setTextColor(...PDF_COLORS.text);
      y += 8;
      return;
    }

    exercises.forEach((exercise, index) => {
      const title = `${index + 1}. ${exercise.name}`;
      const bodyLines = buildExercisePdfLines(exercise);
      const padTop = 5;
      const padBottom = 5;
      const titleHeight = measurePdfLineHeight(doc, title, cardInnerWidth, 11, 1);
      const bodyHeight = measureBlockHeight(doc, bodyLines, cardInnerWidth);
      const cardHeight = padTop + titleHeight + bodyHeight + padBottom;

      newPageIfNeeded(cardHeight + 4);

      const cardTop = y;
      doc.setFillColor(...PDF_COLORS.cardBg);
      doc.setDrawColor(...PDF_COLORS.border);
      doc.roundedRect(margin, cardTop, contentWidth, cardHeight, 2, 2, "FD");

      let cardY = cardTop + padTop;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...PDF_COLORS.text);
      cardY = drawPdfWrappedText(doc, title, margin + cardPaddingX, cardY, cardInnerWidth, 11, {
        bold: true,
        spacingAfter: 1,
      });

      drawPdfLines(doc, bodyLines, margin + cardPaddingX, cardY, cardInnerWidth);

      y = cardTop + cardHeight + 4;
    });

    y += 3;
  });

  return doc.output("blob");
}

export async function downloadRoutineAsPdf(routine: RoutineData) {
  const blob = await buildRoutinePdfBlob(routine);
  const filename = `${slugify(routine.name)}.pdf`;

  if (Capacitor.isNativePlatform()) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    await saveAndShareNativeFile(bytes, filename, `Rutina ${routine.name}`);
    return;
  }

  downloadBlob(blob, filename);
}

export type ShareRoutineResult =
  | { ok: true; method: "file" | "text" | "clipboard" }
  | { ok: false; method: "cancelled" | "unsupported" };

export async function shareRoutine(routine: RoutineData): Promise<ShareRoutineResult> {
  const text = buildRoutinePlainText(routine);
  const title = `Rutina: ${routine.name}`;

  if (Capacitor.isNativePlatform()) {
    try {
      const pdfBlob = await buildRoutinePdfBlob(routine);
      const bytes = new Uint8Array(await pdfBlob.arrayBuffer());
      const filename = `${slugify(routine.name)}.pdf`;
      await saveAndShareNativeFile(bytes, filename, title);
      return { ok: true, method: "file" };
    } catch {
      // Fallback to text sharing below.
    }
  }

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      const pdfBlob = await buildRoutinePdfBlob(routine);
      const file = new File([pdfBlob], `${slugify(routine.name)}.pdf`, {
        type: "application/pdf",
      });
      const canShareFile =
        typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

      if (canShareFile) {
        await navigator.share({ title, text: `${routine.name}\n\n(adjunto PDF)`, files: [file] });
        return { ok: true, method: "file" };
      }

      await navigator.share({ title, text });
      return { ok: true, method: "text" };
    } catch (err) {
      const error = err as Error;
      if (error.name === "AbortError") return { ok: false, method: "cancelled" };
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return { ok: true, method: "clipboard" };
  }

  return { ok: false, method: "unsupported" };
}
