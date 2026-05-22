import { useCallback, useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

const REMINDER_ENABLED_KEY = "mv_reminders_enabled";
const REMINDER_HOUR_KEY = "mv_reminders_hour";
const REMINDER_MINUTE_KEY = "mv_reminders_minute";
const REMINDER_IDS = [1001, 1002, 1003] as const;

const WEEKDAY_NOTIFICATIONS: { id: number; weekday: number; title: string }[] = [
  { id: 1001, weekday: 1, title: "Lunes — toca entrenar" },
  { id: 1002, weekday: 3, title: "Miércoles — toca entrenar" },
  { id: 1003, weekday: 5, title: "Viernes — toca entrenar" },
];

function readBool(key: string, fallback: boolean) {
  const v = localStorage.getItem(key);
  if (v === null) return fallback;
  return v === "true";
}

export function useWorkoutReminders() {
  const [enabled, setEnabled] = useState(() => readBool(REMINDER_ENABLED_KEY, false));
  const [hour, setHour] = useState(() => Number(localStorage.getItem(REMINDER_HOUR_KEY) ?? 18));
  const [minute, setMinute] = useState(() => Number(localStorage.getItem(REMINDER_MINUTE_KEY) ?? 0));
  const [native, setNative] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setNative(Capacitor.isNativePlatform());
  }, []);

  const scheduleReminders = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      setStatus("Recordatorios solo en la app instalada (Android/iOS).");
      return;
    }

    try {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== "granted") {
        setStatus("Permiso de notificaciones denegado.");
        return;
      }

      await LocalNotifications.cancel({ notifications: REMINDER_IDS.map((id) => ({ id })) });

      const notifications = WEEKDAY_NOTIFICATIONS.map((w) => {
        const at = new Date();
        const dayDiff = (w.weekday - at.getDay() + 7) % 7;
        at.setDate(at.getDate() + (dayDiff === 0 && at.getHours() >= hour ? 7 : dayDiff));
        at.setHours(hour, minute, 0, 0);
        return {
          id: w.id,
          title: "My Voice",
          body: w.title,
          schedule: { at, allowWhileIdle: true },
        };
      });

      await LocalNotifications.schedule({ notifications });
      setStatus("Recordatorios activos: Lun, Mié y Vie.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Error al programar recordatorios");
    }
  }, [hour, minute]);

  const disableReminders = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        await LocalNotifications.cancel({ notifications: REMINDER_IDS.map((id) => ({ id })) });
      } catch {
        /* ignore */
      }
    }
    setStatus(null);
  }, []);

  const toggleEnabled = useCallback(
    async (next: boolean) => {
      setEnabled(next);
      localStorage.setItem(REMINDER_ENABLED_KEY, String(next));
      if (next) {
        await scheduleReminders();
      } else {
        await disableReminders();
      }
    },
    [scheduleReminders, disableReminders]
  );

  const updateTime = useCallback(
    async (h: number, m: number) => {
      setHour(h);
      setMinute(m);
      localStorage.setItem(REMINDER_HOUR_KEY, String(h));
      localStorage.setItem(REMINDER_MINUTE_KEY, String(m));
      if (enabled) await scheduleReminders();
    },
    [enabled, scheduleReminders]
  );

  return { enabled, hour, minute, native, status, toggleEnabled, updateTime };
}
