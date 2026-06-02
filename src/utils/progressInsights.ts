import { ProgressData } from "../models/Progress";
import { localDateKey } from "./planStreak";

export type DaySessionGroup = {
  dateKey: string;
  date: Date;
  label: string;
  dayName: string | null;
  entries: ProgressData[];
  exerciseCount: number;
};

export type ActivityStripDay = {
  dateKey: string;
  shortLabel: string;
  trained: boolean;
  isToday: boolean;
};

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatDayLabel(date: Date, now = new Date()): string {
  const d = startOfDay(date);
  const today = startOfDay(now);
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  return d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
}

export function formatLastWorkoutLabel(lastDate: Date | null, now = new Date()): string {
  if (!lastDate) return "Sin entrenos registrados";
  const d = startOfDay(lastDate);
  const today = startOfDay(now);
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Último entreno: hoy";
  if (diffDays === 1) return "Último entreno: ayer";
  if (diffDays < 7) return `Último entreno: hace ${diffDays} días`;
  return `Último entreno: ${d.toLocaleDateString("es-MX", { day: "numeric", month: "short" })}`;
}

export function getLastWorkoutDate(progress: ProgressData[]): Date | null {
  if (progress.length === 0) return null;
  let latest = 0;
  for (const entry of progress) {
    const t = new Date(entry.date).getTime();
    if (t > latest) latest = t;
  }
  return latest ? new Date(latest) : null;
}

export function getTopExerciseInPeriod(progress: ProgressData[]): string | null {
  const counts = new Map<string, number>();
  for (const entry of progress) {
    const name = entry.exerciseName.trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  let top: string | null = null;
  let max = 0;
  for (const [name, count] of counts) {
    if (count > max) {
      max = count;
      top = name;
    }
  }
  return top;
}

export function buildActivityStrip(
  progress: ProgressData[],
  spanDays = 14,
  now = new Date()
): ActivityStripDay[] {
  const trained = new Set<string>();
  for (const entry of progress) {
    if (!entry.completed) continue;
    trained.add(localDateKey(new Date(entry.date)));
  }

  const todayKey = localDateKey(now);
  const strip: ActivityStripDay[] = [];
  for (let i = spanDays - 1; i >= 0; i--) {
    const d = startOfDay(now);
    d.setDate(d.getDate() - i);
    const key = localDateKey(d);
    strip.push({
      dateKey: key,
      shortLabel: DAY_SHORT[d.getDay()],
      trained: trained.has(key),
      isToday: key === todayKey,
    });
  }
  return strip;
}

export function groupProgressByDay(entries: ProgressData[]): DaySessionGroup[] {
  const map = new Map<string, ProgressData[]>();
  for (const entry of entries) {
    const key = localDateKey(new Date(entry.date));
    const list = map.get(key) ?? [];
    list.push(entry);
    map.set(key, list);
  }

  return [...map.entries()]
    .map(([dateKey, list]) => {
      const sorted = [...list].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const date = new Date(sorted[0].date);
      return {
        dateKey,
        date,
        label: formatDayLabel(date),
        dayName: sorted[0].dayName?.trim() || null,
        entries: sorted,
        exerciseCount: sorted.length,
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function countTrainedDaysInStrip(strip: ActivityStripDay[]): number {
  return strip.filter((d) => d.trained).length;
}
