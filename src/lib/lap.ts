// Conversão do tempo de volta que vem da API ("1:30.123" ou "90.123").

/** Tempo de volta em milissegundos; null quando não é um tempo válido. */
export function lapToMs(lap: string): number | null {
  const m = /^(?:(\d+):)?(\d+(?:\.\d+)?)$/.exec(lap.trim());
  if (!m) return null;
  return (Number(m[1] ?? 0) * 60 + Number(m[2])) * 1000;
}
