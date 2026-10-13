import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SEASONS } from "@/lib/types";

export function generateStaticParams() {
  return SEASONS.map((season) => ({ season }));
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
        Dados da Tiltados API · liga de F1 virtual entre amigos
      </footer>
    </>
  );
}
