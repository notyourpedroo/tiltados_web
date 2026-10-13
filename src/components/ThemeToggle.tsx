"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY as STORAGE_KEY } from "@/lib/theme";

type Pref = "system" | "light" | "dark";

const CHANGE_EVENT = "themechange";
const NEXT: Record<Pref, Pref> = { system: "light", light: "dark", dark: "system" };
const LABEL: Record<Pref, string> = {
  system: "automático (segue o sistema)",
  light: "claro",
  dark: "escuro",
};

function readPref(): Pref {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function applyPref(pref: Pref) {
  const root = document.documentElement;
  if (pref === "system") delete root.dataset.theme;
  else root.dataset.theme = pref;
}

function subscribe(onChange: () => void) {
  // "storage" chega quando o tema muda em outra aba.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    applyPref(readPref());
    onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function Icon({ pref }: { pref: Pref }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (pref === "light")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  if (pref === "dark")
    return (
      <svg {...common}>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    );
  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

export function ThemeToggle() {
  const pref = useSyncExternalStore(subscribe, readPref, () => "system" as Pref);

  const cycle = () => {
    const next = NEXT[pref];
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    applyPref(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Tema ${LABEL[pref]}. Trocar para ${LABEL[NEXT[pref]]}`}
      title={`Tema ${LABEL[pref]}`}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-text-2 transition-colors hover:text-text"
    >
      <Icon pref={pref} />
    </button>
  );
}
