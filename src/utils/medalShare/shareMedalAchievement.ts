import type { ProgressAchievement } from "../progressAchievements";
import { sharePngBlob, type SharePngResult } from "../shareImage/sharePngBlob";
import { APP_NAME, PLAY_STORE_URL } from "./constants";
import { buildMedalShareText, renderMedalShareImage } from "./renderMedalShareImage";

export type ShareMedalResult = SharePngResult;

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

    return sharePngBlob({
      blob,
      filename,
      title,
      shareText,
      dialogTitle: "Compartir medalla",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al compartir";
    return { ok: false, method: "error", message };
  }
}
