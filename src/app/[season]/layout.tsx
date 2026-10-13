import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SEASONS } from "@/lib/types";

export function generateStaticParams() {
  return SEASONS.map((season) => ({ season }));
}

// A data atual precisa ficar em cache para a página continuar pré-renderizada;
// o ano é recalculado uma vez por dia.
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export default function SeasonLayout({ children }: LayoutProps<"/[season]">) {
  return (
    <>
      <Suspense fallback={<div className="h-[97px] border-b border-line" />}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-8">
        {children}
      </main>
      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        Dados da Tiltados API | <CurrentYear />
      </footer>
    </>
  );
}
