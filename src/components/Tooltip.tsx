"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
} from "react";

/** Folga mínima entre o tooltip e a borda da janela, em px. */
const EDGE = 16;
/** Largura máxima do tooltip, em px; encolhe até caber na janela. */
const MAX_WIDTH = 288;

// O critério é o dispositivo ter hover (mouse), não a largura da janela.
const HOVER_QUERY = "(hover: hover)";
function subscribeHover(onChange: () => void) {
  const query = window.matchMedia(HOVER_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const hasHover = () => window.matchMedia(HOVER_QUERY).matches;
// No servidor, supõe hover: a página sai igual e o toque só depende do cliente.
const hasHoverOnServer = () => true;

// Sem hover, só um tooltip aberto por vez na página: abrir um fecha o anterior.
let closeOpen: (() => void) | null = null;

/**
 * Card com um tooltip de descrição. Com hover, abre ao passar o mouse ou focar pelo
 * teclado e fecha ao sair; sem hover, abre e fecha com toque, fecha com toque fora e
 * só um fica aberto por vez. Tocar num link dentro do card navega sem abrir o
 * tooltip. Esc fecha. A descrição liga ao card por `aria-describedby`.
 */
export function Tooltip({
  description,
  children,
  className = "",
}: {
  description: string;
  children: ReactNode;
  /** Classes do card que recebe o tooltip (borda, fundo, espaço). */
  className?: string;
}) {
  const id = useId();
  const hover = useSyncExternalStore(subscribeHover, hasHover, hasHoverOnServer);
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState(0);
  const [width, setWidth] = useState(MAX_WIDTH);
  const card = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  const show = useCallback(() => {
    if (closeOpen && closeOpen !== close) closeOpen();
    closeOpen = close;
    setOpen(true);
  }, [close]);

  // Encaixa o tooltip na janela: alinhado ao card e empurrado para dentro na borda.
  useLayoutEffect(() => {
    if (!open || !card.current) return;
    const rect = card.current.getBoundingClientRect();
    const viewport = document.documentElement.clientWidth;
    const w = Math.min(MAX_WIDTH, viewport - 2 * EDGE);
    const x = Math.min(Math.max(rect.left, EDGE), viewport - EDGE - w);
    setWidth(w);
    setLeft(x - rect.left);
  }, [open]);

  // Sem hover, um toque fora do card fecha.
  useEffect(() => {
    if (!open || hover) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!card.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, hover, close]);

  useEffect(
    () => () => {
      if (closeOpen === close) closeOpen = null;
    },
    [close],
  );

  const onClick = (event: MouseEvent) => {
    if (hover) return;
    if ((event.target as Element).closest("a")) return;
    if (open) close();
    else show();
  };

  return (
    <div
      ref={card}
      tabIndex={0}
      aria-describedby={id}
      className={`relative outline-none focus-visible:ring-2 focus-visible:ring-text-2 ${hover ? "" : "cursor-pointer"} ${className}`}
      onMouseEnter={hover ? show : undefined}
      onMouseLeave={hover ? close : undefined}
      onFocus={hover ? show : undefined}
      onBlur={hover ? close : undefined}
      onClick={onClick}
      onKeyDown={(event) => event.key === "Escape" && close()}
    >
      {children}
      <div
        id={id}
        role="tooltip"
        hidden={!open}
        className="absolute top-full z-20 mt-2 rounded-lg border border-line bg-bg/95 p-3 text-sm font-normal normal-case tracking-normal text-text shadow-xl"
        style={{ left, width }}
      >
        {description}
      </div>
    </div>
  );
}

/** Ícone ⓘ ao lado do rótulo de um card com Tooltip. Decorativo: o tooltip já descreve o card. */
export function InfoIcon() {
  return (
    <span aria-hidden className="ml-1 align-middle text-sm font-normal not-italic">
      ⓘ
    </span>
  );
}
