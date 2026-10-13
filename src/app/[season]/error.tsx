"use client";

import { useEffect } from "react";

export default function SeasonError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-accent">Bandeira vermelha</p>
      <h1 className="mt-2 text-3xl font-black uppercase">Não deu para carregar os dados</h1>
      <p className="mt-3 text-text-2">
        A Tiltados API não respondeu como esperado. Ela pode estar fora do ar ou com algum
        CSV inválido.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 rounded-full bg-text px-5 py-2 font-bold text-bg transition-opacity hover:opacity-90"
      >
        Tentar de novo
      </button>
    </div>
  );
}
