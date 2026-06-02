import { Capacitor } from "@capacitor/core";
import type { ProgressAchievement } from "../progressAchievements";
import { APP_NAME, PLAY_STORE_URL } from "./constants";
import { buildMedalShareText, renderMedalShareImage } from "./renderMedalShareImage";

export type ShareMedalResult =
  | { ok: true; method: "native" | "file" | "download" | "clipboard" }
  | { ok: false; method: "cancelled" | "unsupported" | "error"; message?: string };

function slugify(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "medalla"
  );
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

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function shareNativeImage(bytes: Uint8Array, filename: string, text: string): Promise<boolean> {
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
    title: `${APP_NAME} · Medalla`,
    text,
    url: uri,
    files: [uri],
    dialogTitle: "Compartir medalla",
  });

  return true;
}

export async function shareMedalAchievement(
  achievement: ProgressAchievement
): Promise<ShareMedalResult> {
  if (!achievement.unlocked) {
    return { ok: false, method: "error", message: "Solo puedes compartir medallas desbloqueadas." };
  }

  try {
    const blob = await renderMedalShareImage(achievement);
    const filename = `myvoice-medalla-${slugify(achievement.title)}.png`;
    const shareText = `${buildMedalShareText(achievement)}\n\n${PLAY_STORE_URL}`;
    const title = `${achievement.title} · ${APP_NAME}`;
    const bytes = new Uint8Array(await blob.arrayBuffer());

    if (await shareNativeImage(bytes, filename, shareText)) {
      return { ok: true, method: "native" };
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const file = new File([blob], filename, { type: "image/png" });
        const canShareFile =
          typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

        if (canShareFile) {
          await navigator.share({
            title,
            text: shareText,
            files: [file],
          });
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al compartir";
    return { ok: false, method: "error", message };
  }
}
