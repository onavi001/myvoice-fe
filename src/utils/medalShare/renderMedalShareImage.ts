import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import MedalSvg from "../../components/progress/medals/MedalSvg";
import type { ProgressAchievement } from "../progressAchievements";
import {
  APP_NAME,
  HAPPY_COACH_SHARE_URL,
  MEDAL_SHARE_HEIGHT,
  MEDAL_SHARE_WIDTH,
} from "./constants";
import { canvasToBlob, loadImage, svgMarkupToImage } from "./imageLoader";

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
) {
  lines.forEach((line, i) => {
    ctx.fillText(line, centerX, startY + i * lineHeight);
  });
}

export async function renderMedalShareImage(achievement: ProgressAchievement): Promise<Blob> {
  const medalW = 480;
  const medalH = Math.round(medalW * (96 / 80));

  const svgMarkup = renderToStaticMarkup(
    createElement(MedalSvg, {
      achievementId: achievement.id,
      tier: achievement.tier,
      unlocked: true,
      width: medalW,
      height: medalH,
      idSuffix: "share",
    })
  );

  const [medalImg, coachImg] = await Promise.all([
    svgMarkupToImage(svgMarkup, medalW, medalH),
    loadImage(HAPPY_COACH_SHARE_URL),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = MEDAL_SHARE_WIDTH;
  canvas.height = MEDAL_SHARE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");

  const cx = MEDAL_SHARE_WIDTH / 2;

  const bg = ctx.createLinearGradient(0, 0, 0, MEDAL_SHARE_HEIGHT);
  bg.addColorStop(0, "#1A1A1A");
  bg.addColorStop(0.45, "#141414");
  bg.addColorStop(1, "#0A0A0A");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, MEDAL_SHARE_WIDTH, MEDAL_SHARE_HEIGHT);

  const glowGreen = ctx.createRadialGradient(cx, 420, 0, cx, 420, 520);
  glowGreen.addColorStop(0, "rgba(52, 199, 89, 0.22)");
  glowGreen.addColorStop(1, "rgba(52, 199, 89, 0)");
  ctx.fillStyle = glowGreen;
  ctx.fillRect(0, 0, MEDAL_SHARE_WIDTH, MEDAL_SHARE_HEIGHT);

  const glowCyan = ctx.createRadialGradient(cx, 1200, 0, cx, 1200, 400);
  glowCyan.addColorStop(0, "rgba(93, 212, 247, 0.12)");
  glowCyan.addColorStop(1, "rgba(93, 212, 247, 0)");
  ctx.fillStyle = glowCyan;
  ctx.fillRect(0, 0, MEDAL_SHARE_WIDTH, MEDAL_SHARE_HEIGHT);

  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  ctx.font = "bold 56px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillStyle = "#34C759";
  ctx.fillText(APP_NAME, cx, 72);

  ctx.font = "600 32px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillStyle = "#5DD4F7";
  ctx.fillText("Nueva medalla desbloqueada", cx, 140);

  const medalX = cx - medalW / 2;
  const medalY = 220;
  ctx.shadowColor = "rgba(52, 199, 89, 0.45)";
  ctx.shadowBlur = 48;
  ctx.drawImage(medalImg, medalX, medalY, medalW, medalH);
  ctx.shadowBlur = 0;

  const titleY = medalY + medalH + 56;
  ctx.font = "bold 64px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  const titleLines = wrapLines(ctx, achievement.title, MEDAL_SHARE_WIDTH - 120);
  drawCenteredLines(ctx, titleLines, cx, titleY, 72);

  const descY = titleY + titleLines.length * 72 + 24;
  ctx.font = "400 40px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillStyle = "#B0B0B0";
  const descLines = wrapLines(ctx, achievement.description, MEDAL_SHARE_WIDTH - 120);
  drawCenteredLines(ctx, descLines, cx, descY, 52);

  const coachMaxH = 720;
  const coachScale = Math.min(
    (MEDAL_SHARE_WIDTH - 80) / coachImg.width,
    coachMaxH / coachImg.height
  );
  const coachW = coachImg.width * coachScale;
  const coachH = coachImg.height * coachScale;
  const coachX = cx - coachW / 2;
  const coachY = MEDAL_SHARE_HEIGHT - coachH - 140;
  ctx.drawImage(coachImg, coachX, coachY, coachW, coachH);

  ctx.font = "600 28px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillStyle = "#888888";
  ctx.fillText("Entrena con constancia · myvoicefit", cx, MEDAL_SHARE_HEIGHT - 72);

  return canvasToBlob(canvas);
}

export function buildMedalShareText(achievement: ProgressAchievement): string {
  return `🏅 ${achievement.title}\n\n${achievement.description}\n\nLogro desbloqueado en ${APP_NAME}`;
}
