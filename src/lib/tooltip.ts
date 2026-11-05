// Onde o balão do Tooltip (components/Tooltip.tsx) abre: dentro da janela, sem rolagem.

/** Folga mínima entre o balão e a borda da janela, em px. */
const EDGE = 16;
/** Largura máxima do balão, em px; encolhe até caber na janela. */
const MAX_WIDTH = 288;
/** Distância entre o card e o balão, em px (o `mt-2`/`mb-2` do balão). */
const TOOLTIP_GAP = 8;

export interface TooltipPlacement {
  /** Deslocamento do balão em relação à borda esquerda do card, em px. */
  left: number;
  /** Largura do balão, em px. */
  width: number;
  /** Se o balão abre acima do card, porque abaixo não cabe. */
  above: boolean;
}

/**
 * Posição do balão de um card: alinhado à esquerda do card e empurrado para dentro na
 * borda da janela; abaixo do card, ou acima quando abaixo não cabe. Se não cabe em
 * nenhum lado, abre para o lado com mais espaço. `card` vem do `getBoundingClientRect`.
 */
export function tooltipPlacement(
  card: { left: number; top: number; bottom: number },
  height: number,
  viewport: { width: number; height: number },
): TooltipPlacement {
  const width = Math.min(MAX_WIDTH, viewport.width - 2 * EDGE);
  const x = Math.min(Math.max(card.left, EDGE), viewport.width - EDGE - width);
  const needed = TOOLTIP_GAP + height + EDGE;
  const below = viewport.height - card.bottom;
  const above = below < needed && card.top > below;
  return { left: x - card.left, width, above };
}
