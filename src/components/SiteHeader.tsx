"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SEASONS, isSeason } from "@/lib/types";
import { ThemeToggle } from "./ThemeToggle";

const SECTIONS = [
  { slug: "", label: "Visão geral" },
  { slug: "corridas", label: "Corridas" },
  { slug: "pilotos", label: "Pilotos" },
  { slug: "equipes", label: "Equipes" },
  { slug: "superlicenca", label: "Superlicença", only: "2026" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [, seasonPart = "", section = ""] = pathname.split("/");
  const season = isSeason(seasonPart) ? seasonPart : "2026";
  const sections = SECTIONS.filter((s) => !s.only || s.only === season);

  // Trocar de temporada mantém a seção, mas não o item (IDs mudam entre temporadas).
  const seasonHref = (target: string) => {
    const keep = SECTIONS.find((s) => s.slug === section);
    const ok = keep && (!keep.only || keep.only === target);
    return ok && keep.slug ? `/${target}/${keep.slug}` : `/${target}`;
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
      <div className="h-1 bg-accent" />
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href={`/${season}`} className="group flex items-center gap-2">
          <span className="-skew-x-12 bg-accent px-2 py-0.5 text-lg font-black italic tracking-tight">
            <span className="inline-block skew-x-12">TILTADOS</span>
          </span>
          <span className="text-lg font-black italic tracking-tight text-text-2 group-hover:text-text">
            F1
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <div
            className="flex rounded-full border border-line p-0.5 text-sm font-bold"
            role="group"
            aria-label="Temporada"
          >
            {SEASONS.map((s) => (
              <Link
                key={s}
                href={seasonHref(s)}
                aria-current={s === season ? "true" : undefined}
                className={`rounded-full px-3 py-1 transition-colors ${
                  s === season
                    ? "bg-text text-bg"
                    : "text-text-2 hover:text-text"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </div>

      <nav
        aria-label="Seções"
        className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 text-sm font-semibold"
      >
        {sections.map((s) => {
          const href = s.slug ? `/${season}/${s.slug}` : `/${season}`;
          const active = section === s.slug;
          return (
            <Link
              key={s.slug}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 px-3 pb-2.5 pt-1 transition-colors ${
                active
                  ? "border-accent text-text"
                  : "border-transparent text-muted hover:text-text"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
