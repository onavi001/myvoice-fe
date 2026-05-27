export type PreparedRoutineImport = {
  extractedText: string;
  fileNames: string[];
};

const MAX_FILES = 4;
const MAX_PDF_PAGES = 10;

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}`));
    reader.readAsText(file);
  });
}

async function loadPdfDocument(file: File) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
  const data = new Uint8Array(await file.arrayBuffer());
  return pdfjs.getDocument({ data }).promise;
}

export async function extractPdfText(file: File): Promise<string> {
  const pdf = await loadPdfDocument(file);
  const pageCount = Math.min(pdf.numPages, MAX_PDF_PAGES);
  const chunks: string[] = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item && typeof item.str === "string" ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (pageText) chunks.push(pageText);
  }

  return chunks.join("\n\n");
}

export function validateImportFiles(files: File[]): string | null {
  if (files.length === 0) return "Selecciona al menos un archivo.";
  if (files.length > MAX_FILES) return `Maximo ${MAX_FILES} archivos por importacion.`;

  for (const file of files) {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      if (file.size > 15 * 1024 * 1024) {
        return `"${file.name}" supera 15 MB.`;
      }
    } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      if (file.size > 2 * 1024 * 1024) {
        return `"${file.name}" supera 2 MB.`;
      }
    } else {
      return `"${file.name}" no es compatible. Usa PDF o TXT.`;
    }
  }

  return null;
}

export async function prepareRoutineImportFiles(files: File[]): Promise<PreparedRoutineImport> {
  const validationError = validateImportFiles(files);
  if (validationError) throw new Error(validationError);

  const textParts: string[] = [];
  const fileNames: string[] = [];

  for (const file of files) {
    fileNames.push(file.name);

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const pdfText = await extractPdfText(file);
      if (pdfText.trim()) {
        textParts.push(`--- ${file.name} ---\n${pdfText}`);
      }
      continue;
    }

    if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
      const txt = (await readFileAsText(file)).trim();
      if (txt) textParts.push(`--- ${file.name} ---\n${txt}`);
    }
  }

  const extractedText = textParts.join("\n\n").trim();

  if (!extractedText) {
    throw new Error(
      "No se detecto contenido util. Prueba otro PDF o un documento con texto."
    );
  }

  return { extractedText, fileNames };
}
