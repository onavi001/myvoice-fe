export type UsageFeature = "aiGenerate" | "aiImport" | "aiRegenerateExercise";

const LIMITS: Record<UsageFeature, number> = {
  aiGenerate: 5,
  aiImport: 3,
  aiRegenerateExercise: 15,
};

const PRO_KEY = "mv_pro_enabled";

type UsageMonth = Partial<Record<UsageFeature, number>>;

function monthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function usageStorageKey(): string {
  return `mv_usage_${monthKey()}`;
}

function readUsage(): UsageMonth {
  try {
    const raw = localStorage.getItem(usageStorageKey());
    return raw ? (JSON.parse(raw) as UsageMonth) : {};
  } catch {
    return {};
  }
}

function writeUsage(usage: UsageMonth) {
  localStorage.setItem(usageStorageKey(), JSON.stringify(usage));
}

export function isProUser(): boolean {
  return localStorage.getItem(PRO_KEY) === "true";
}

/** Solo desarrollo / pruebas — activar Pro sin pago */
export function setProEnabled(enabled: boolean) {
  if (enabled) localStorage.setItem(PRO_KEY, "true");
  else localStorage.removeItem(PRO_KEY);
}

export function getUsageCount(feature: UsageFeature): number {
  return readUsage()[feature] ?? 0;
}

export function getUsageLimit(feature: UsageFeature): number {
  return LIMITS[feature];
}

export function canUseFeature(feature: UsageFeature): boolean {
  if (isProUser()) return true;
  return getUsageCount(feature) < LIMITS[feature];
}

export function recordFeatureUsage(feature: UsageFeature): void {
  if (isProUser()) return;
  const usage = readUsage();
  usage[feature] = (usage[feature] ?? 0) + 1;
  writeUsage(usage);
}

export function freemiumBlockedMessage(feature: UsageFeature): string {
  const labels: Record<UsageFeature, string> = {
    aiGenerate: "generar rutinas con IA",
    aiImport: "importar rutinas con IA",
    aiRegenerateExercise: "regenerar ejercicios con IA",
  };
  return `Límite mensual gratis alcanzado para ${labels[feature]} (${LIMITS[feature]}/mes). My Voice Pro próximamente sin límites ni anuncios.`;
}

export function usageSummary(): string {
  if (isProUser()) return "My Voice Pro activo";
  return `IA este mes: ${getUsageCount("aiGenerate")}/${LIMITS.aiGenerate} generar · ${getUsageCount("aiImport")}/${LIMITS.aiImport} importar`;
}
