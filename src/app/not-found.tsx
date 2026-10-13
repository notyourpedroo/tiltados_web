import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-accent">404 · Fora da pista</p>
      <h1 className="mt-2 text-3xl font-black uppercase">Página não encontrada</h1>
      <p className="mt-3 text-text-2">Essa corrida, piloto ou temporada não existe.</p>
      <Link
        href="/2026"
        className="mt-6 rounded-full bg-text px-5 py-2 font-bold text-bg transition-opacity hover:opacity-90"
      >
        Voltar para o início
      </Link>
    </main>
  );
}
