import { Capacitor } from "@capacitor/core";

const MAX_GALLERY_PICK = 5;

function newTempId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function webPathToFile(webPath: string, index: number): Promise<File> {
  const response = await fetch(webPath);
  const blob = await response.blob();
  const type = blob.type || "image/jpeg";
  const ext = type.includes("png") ? "png" : "jpg";
  return new File([blob], `galeria-${index + 1}.${ext}`, { type });
}

/** Abre la galeria nativa (Android/iOS). En web devuelve lista vacia. */
export async function pickImagesFromNativeGallery(): Promise<File[]> {
  if (!Capacitor.isNativePlatform()) {
    return [];
  }

  const { Camera } = await import("@capacitor/camera");
  const result = await Camera.pickImages({
    quality: 90,
    limit: MAX_GALLERY_PICK,
  });

  const files: File[] = [];
  for (let i = 0; i < result.photos.length; i += 1) {
    const webPath = result.photos[i]?.webPath;
    if (!webPath) continue;
    files.push(await webPathToFile(webPath, files.length));
  }

  return files;
}

/** Toma una foto con la camara (solo nativo). */
export async function capturePhotoFromCamera(): Promise<File | null> {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
  const photo = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
  });

  if (!photo.webPath) return null;
  return webPathToFile(photo.webPath, 0);
}

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export { newTempId };
