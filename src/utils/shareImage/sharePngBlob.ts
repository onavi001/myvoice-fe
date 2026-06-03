import { Capacitor } from "@capacitor/core";

export type SharePngResult =
  | { ok: true; method: "native" | "file" | "download" | "clipboard" }
  | { ok: false; method: "cancelled" | "unsupported" | "error"; message?: string };

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function shareNativeImage(
  bytes: Uint8Array,
  filename: string,
  text: string,
  dialogTitle: string
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
    title: dialogTitle,
    text,
    url: uri,
    files: [uri],
    dialogTitle,
  });

  return true;
}

export async function sharePngBlob(options: {
  blob: Blob;
  filename: string;
  title: string;
  shareText: string;
  dialogTitle: string;
}): Promise<SharePngResult> {
  const { blob, filename, title, shareText, dialogTitle } = options;
  const bytes = new Uint8Array(await blob.arrayBuffer());

  if (await shareNativeImage(bytes, filename, shareText, dialogTitle)) {
    return { ok: true, method: "native" };
  }

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      const file = new File([blob], filename, { type: "image/png" });
      const canShareFile =
        typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

      if (canShareFile) {
        await navigator.share({ title, text: shareText, files: [file] });
        return { ok: true, method: "file" };
      }

      await navigator.share({ title, text: shareText });
      return { ok: true, method: "file" };
    } catch (err) {
      const error = err as Error;
      if (error.name === "AbortError") return { ok: false, method: "cancelled" };
    }
  }

  downloadBlob(blob, filename);

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(shareText);
    return { ok: true, method: "download" };
  }

  return { ok: true, method: "download" };
}
