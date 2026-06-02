/** Compara semver simple (major.minor.patch). Devuelve -1 si a < b, 0 si igual, 1 si a > b. */
export function compareSemver(a: string, b: string): number {
  const parse = (v: string) =>
    v
      .trim()
      .split(".")
      .map((part) => Number.parseInt(part.replace(/[^0-9].*$/, ""), 10) || 0);

  const pa = parse(a);
  const pb = parse(b);
  const len = Math.max(pa.length, pb.length, 3);

  for (let i = 0; i < len; i += 1) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da > db) return 1;
    if (da < db) return -1;
  }
  return 0;
}

export function parseVersionCode(value: string | number | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number.parseInt(String(value).trim(), 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
