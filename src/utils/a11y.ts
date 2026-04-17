// Accesibilidad: helpers para aria-labels y roles

export function ariaLabel(label: string) {
  return { "aria-label": label };
}

export function ariaRole(role: string) {
  return { role };
}
