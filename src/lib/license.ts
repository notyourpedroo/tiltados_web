import type { LicenseStatus } from "./types";

export interface LicenseView {
  label: string;
  icon: string;
  /** Token de cor do status, para o medidor e o círculo do ícone. */
  color: string;
}

// Cores de status reservadas (tokens status-* em globals.css), sempre com ícone + rótulo.
const VIEWS: Record<LicenseStatus, LicenseView> = {
  Regular: { label: "Regular", icon: "✓", color: "var(--status-regular)" },
  Atencao: { label: "Atenção", icon: "!", color: "var(--status-atencao)" },
  "Alerta Critico": { label: "Alerta crítico", icon: "‼", color: "var(--status-alerta)" },
  Suspenso: { label: "Suspenso", icon: "⛔", color: "var(--status-suspenso)" },
  "Suspensao cumprida": { label: "Suspensão cumprida", icon: "↩", color: "var(--status-cumprida)" },
};

/**
 * Como o status da Superlicença de um piloto aparece no card. Um status que o site
 * não conhece aparece neutro, com o texto da API, em vez de cair num status falso.
 */
export function describeLicense(status: string): LicenseView {
  if (Object.hasOwn(VIEWS, status)) return VIEWS[status as LicenseStatus];
  return { label: status, icon: "?", color: "var(--muted)" };
}
