import {
  HAPPY_COACH_SHARE_URL,
  MEDAL_SHARE_HEIGHT,
  MEDAL_SHARE_WIDTH,
} from "../medalShare/constants";
import { canvasToBlob, loadImage } from "../medalShare/imageLoader";
import { getRoutineShareCopy, type RoutineShareContext } from "./routineShareCopy";

export type { RoutineShareContext };

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCenteredLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  centerX: number,
  startY: number,
  lineHeight: number
): number {
  lines.forEach((line, i) => {
    ctx.fillText(line, centerX, startY + i * lineHeight);
  });
  return startY + lines.length * lineHeight;
}

export async function renderRoutineShareImage(ctx: RoutineShareContext): Promise<Blob> {
  const copy = getRoutineShareCopy(ctx);
  const coachImg = await loadImage(HAPPY_COACH_SHARE_URL);

  const canvas = document.createElement("canvas");
  canvas.width = MEDAL_SHARE_WIDTH;
  canvas.height = MEDAL_SHARE_HEIGHT;
  const c = canvas.getContext("2d");
  if (!c) throw new Error("Canvas no disponible");

  const cx = MEDAL_SHARE_WIDTH / 2;
  const textMaxW = MEDAL_SHARE_WIDTH - 100;

  const bg = c.createLinearGradient(0, 0, 0, MEDAL_SHARE_HEIGHT);
  bg.addColorStop(0, "#1A1A1A");
  bg.addColorStop(0.45, "#141414");
  bg.addColorStop(1, "#0A0A0A");
  c.fillStyle = bg;
  c.fillRect(0, 0, MEDAL_SHARE_WIDTH, MEDAL_SHARE_HEIGHT);

  const glowGreen = c.createRadialGradient(cx, 420, 0, cx, 420, 520);
  glowGreen.addColorStop(0, "rgba(52, 199, 89, 0.28)");
  glowGreen.addColorStop(1, "rgba(52, 199, 89, 0)");
  c.fillStyle = glowGreen;
  c.fillRect(0, 0, MEDAL_SHARE_WIDTH, MEDAL_SHARE_HEIGHT);

  c.textAlign = "center";
  c.textBaseline = "top";

  const gapAfterText = 24;
  const gapAfterCoach = 16;
  const footerLineH = 32;
  const verticalPad = 56;

  c.font = "600 40px system-ui, -apple-system, Segoe UI, sans-serif";
  const headlineH = 56;
  c.font = "bold 52px system-ui, -apple-system, Segoe UI, sans-serif";
  const celebrateLines = wrapLines(c, copy.celebrateImage, textMaxW);
  const celebrateH = celebrateLines.length * 60 + 28;
  c.font = "500 44px system-ui, -apple-system, Segoe UI, sans-serif";
  const dayLines = wrapLines(c, copy.dayLine, textMaxW);
  const dayH = dayLines.length * 54 + 24;
  c.font = "400 34px system-ui, -apple-system, Segoe UI, sans-serif";
  const ctaLines = wrapLines(c, copy.cta, textMaxW);
  const ctaH = ctaLines.length * 46;

  const textBlockH = headlineH + celebrateH + dayH + ctaH + 8;
  const maxCoachH =
    MEDAL_SHARE_HEIGHT - verticalPad * 2 - textBlockH - gapAfterText - gapAfterCoach - footerLineH;
  const coachScale = Math.min(
    (MEDAL_SHARE_WIDTH - 48) / coachImg.width,
    maxCoachH / coachImg.height
  );
  const coachH = coachImg.height * coachScale;
  const coachW = coachImg.width * coachScale;

  const contentH =
    textBlockH + gapAfterText + coachH + gapAfterCoach + footerLineH;
  let y = Math.max(verticalPad, Math.round((MEDAL_SHARE_HEIGHT - contentH) / 2));

  c.font = "600 40px system-ui, -apple-system, Segoe UI, sans-serif";
  c.fillStyle = "#5DD4F7";
  c.fillText(copy.headline, cx, y);
  y += headlineH;

  c.font = "bold 52px system-ui, -apple-system, Segoe UI, sans-serif";
  c.fillStyle = "#FFFFFF";
  y = drawCenteredLines(c, celebrateLines, cx, y, 60) + 28;

  c.font = "500 44px system-ui, -apple-system, Segoe UI, sans-serif";
  c.fillStyle = "#B0B0B0";
  y = drawCenteredLines(c, dayLines, cx, y, 54) + 24;

  c.font = "400 34px system-ui, -apple-system, Segoe UI, sans-serif";
  c.fillStyle = "#888888";
  y = drawCenteredLines(c, ctaLines, cx, y, 46);

  const textBottom = y + 8;
  const coachX = cx - coachW / 2;
  const coachY = textBottom + gapAfterText;
  const footerY = coachY + coachH + gapAfterCoach;

  const glowCy = coachY + coachH * 0.45;
  const glowGreenCoach = c.createRadialGradient(cx, glowCy, 0, cx, glowCy, Math.max(coachH, coachW) * 0.55);
  glowGreenCoach.addColorStop(0, "rgba(52, 199, 89, 0.22)");
  glowGreenCoach.addColorStop(1, "rgba(52, 199, 89, 0)");
  c.fillStyle = glowGreenCoach;
  c.fillRect(0, coachY - 16, MEDAL_SHARE_WIDTH, coachH + 32);

  c.shadowColor = "rgba(52, 199, 89, 0.35)";
  c.shadowBlur = 40;
  c.drawImage(coachImg, coachX, coachY, coachW, coachH);
  c.shadowBlur = 0;

  c.font = "600 26px system-ui, -apple-system, Segoe UI, sans-serif";
  c.fillStyle = "#666666";
  c.fillText("myvoicefit", cx, footerY);

  return canvasToBlob(canvas);
}

export { buildRoutineShareText } from "./routineShareCopy";
