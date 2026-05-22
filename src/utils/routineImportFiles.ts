export type PreparedRoutineImport = {
  images: string[];
  extractedText: string;
  fileNames: string[];
};

const MAX_IMAGES = 5;
const MAX_PDF_PAGES = 10;
const MAX_IMAGE_DIMENSION = 1400;
const JPEG_QUALITY = 0.82;

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}`));
    reader.readAsText(file);
  });
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Imagen invalida: ${file.name}`));
    };
    img.src = url;
  });
}

/** Comprime imagen para envio a la API (evita payloads enormes). */
export async function compressImageToDataUrl(file: File): Promise<string> {
  const img = await loadImageFromFile(file);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen");

  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
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

/** PDF escaneado: renderiza paginas como JPEG para enviarlas a vision. */
export async function renderPdfPagesAsImages(file: File, maxPages = 3): Promise<string[]> {
  const pdf = await loadPdfDocument(file);
  const pageCount = Math.min(pdf.numPages, maxPages);
  const images: string[] = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum += 1) {
    if (images.length >= MAX_IMAGES) break;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.4 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    await page.render({ canvasContext: ctx, viewport }).promise;
    images.push(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
  }

  return images;
}

export function validateImportFiles(files: File[]): string | null {
  if (files.length === 0) return "Selecciona al menos un archivo.";
  if (files.length > 8) return "Maximo 8 archivos por importacion.";

  let imageCount = 0;
  for (const file of files) {
    if (file.type.startsWith("image/")) {
      imageCount += 1;
      if (file.size > 12 * 1024 * 1024) {
        return `"${file.name}" es demasiado grande (max 12 MB por imagen).`;
      }
    } else if (file.type === "application/pdf") {
      if (file.size > 15 * 1024 * 1024) {
        return `"${file.name}" supera 15 MB.`;
      }
    } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      if (file.size > 2 * 1024 * 1024) {
        return `"${file.name}" supera 2 MB.`;
      }
    } else {
      return `"${file.name}" no es compatible. Usa JPG, PNG, PDF o TXT.`;
    }
  }

  if (imageCount > MAX_IMAGES) {
    return `Maximo ${MAX_IMAGES} imagenes.`;
  }

  return null;
}

export async function prepareRoutineImportFiles(files: File[]): Promise<PreparedRoutineImport> {
  const validationError = validateImportFiles(files);
  if (validationError) throw new Error(validationError);

  const images: string[] = [];
  const textParts: string[] = [];
  const fileNames: string[] = [];

  for (const file of files) {
    fileNames.push(file.name);

    if (file.type.startsWith("image/")) {
      if (images.length >= MAX_IMAGES) continue;
      const dataUrl = await compressImageToDataUrl(file);
      images.push(dataUrl);
      continue;
    }

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const pdfText = await extractPdfText(file);
      if (pdfText.trim()) {
        textParts.push(`--- ${file.name} ---\n${pdfText}`);
      } else {
        const pageImages = await renderPdfPagesAsImages(
          file,
          Math.max(1, MAX_IMAGES - images.length)
        );
        if (pageImages.length > 0) {
          images.push(...pageImages);
        }
      }
      continue;
    }

    if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
      const txt = (await readFileAsText(file)).trim();
      if (txt) textParts.push(`--- ${file.name} ---\n${txt}`);
    }
  }

  const extractedText = textParts.join("\n\n").trim();

  if (images.length === 0 && !extractedText) {
    throw new Error(
      "No se detecto contenido util. Prueba fotos mas nitidas, otro PDF o un documento con texto."
    );
  }

  return { images, extractedText, fileNames };
}
