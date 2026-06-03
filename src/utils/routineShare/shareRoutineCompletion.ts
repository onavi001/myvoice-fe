import { APP_NAME, PLAY_STORE_URL } from "../medalShare/constants";
import { sharePngBlob } from "../shareImage/sharePngBlob";
import { buildRoutineShareText, type RoutineShareContext } from "./routineShareCopy";
import { renderRoutineShareImage } from "./renderRoutineShareImage";

export type ShareRoutineResult = Awaited<ReturnType<typeof sharePngBlob>>;

function slugify(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "rutina"
  );
}

export async function shareRoutineCompletion(ctx: RoutineShareContext): Promise<ShareRoutineResult> {
  try {
    const blob = await renderRoutineShareImage(ctx);
    const filename = `myvoice-sesion-${slugify(ctx.dayName)}.png`;
    const shareText = `${buildRoutineShareText(ctx)}\n\n${PLAY_STORE_URL}`;
    const title = `Sesión completada · ${APP_NAME}`;

    return sharePngBlob({
      blob,
      filename,
      title,
      shareText,
      dialogTitle: "Compartir rutina",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al compartir";
    return { ok: false, method: "error", message };
  }
}
