"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  HOVER_OPEN_DELAY,
  openTimer,
  tooltipPlacement,
  type TooltipPlacement,
} from "@/lib/tooltip";

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
 * Card com um tooltip de descrição. O comportamento (hover, teclado, toque, Esc, posição)
 * está na ficha `design-system/components/Tooltip/README.md`: mudou aqui, muda lá.
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
  const [placement, setPlacement] = useState<TooltipPlacement>({ left: 0, width: 0, above: false });
  const card = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  const show = useCallback(() => {
    if (closeOpen && closeOpen !== close) closeOpen();
    closeOpen = close;
    setOpen(true);
  }, [close]);
  const timer = useMemo(() => openTimer(show, HOVER_OPEN_DELAY), [show]);
  useEffect(() => () => timer.dispose(), [timer]);

  // Encaixa o balão na janela ao abrir e a cada rolagem ou redimensionamento.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      if (!card.current || !bubble.current) return;
      const viewport = {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      };
      const rect = card.current.getBoundingClientRect();
      // A altura depende da largura: mede o balão já na largura em que vai abrir.
      const { width } = tooltipPlacement(rect, 0, viewport);
      bubble.current.style.width = `${width}px`;
      setPlacement(tooltipPlacement(rect, bubble.current.offsetHeight, viewport));
    };
    place();
    window.addEventListener("resize", place);
    // Captura: a rolagem de um contêiner também move o card.
    window.addEventListener("scroll", place, { capture: true, passive: true });
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, { capture: true });
    };
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

  // Sair do card e apertar Esc fecham na hora e cancelam a abertura marcada.
  const cancelAndClose = () => {
    timer.mouseLeave();
    close();
  };
  // Só o foco pelo teclado abre: o que vem de um clique deixa o hover seguir o seu tempo.
  // O scripts/rolagem.mjs abre os balões com card.focus(), que no Chrome headless casa
  // com :focus-visible; mudar este critério pode quebrar a varredura.
  const onFocus = (event: FocusEvent) => {
    if ((event.target as Element).matches(":focus-visible")) timer.keyboardFocus();
  };

  const onClick = (event: MouseEvent) => {
    if (hover) return;
    if (open || (event.target as Element).closest("a")) close();
    else show();
  };

  return (
    <div
      ref={card}
      tabIndex={0}
      aria-describedby={id}
      className={`relative outline-none focus-visible:ring-2 focus-visible:ring-text-2 ${hover ? "" : "cursor-pointer"} ${className}`}
      onMouseEnter={hover ? timer.mouseEnter : undefined}
      onMouseLeave={hover ? cancelAndClose : undefined}
      onFocus={hover ? onFocus : undefined}
      onBlur={hover ? close : undefined}
      onClick={onClick}
      onKeyDown={(event) => event.key === "Escape" && cancelAndClose()}
    >
      {children}
      <div
        ref={bubble}
        id={id}
        role="tooltip"
        hidden={!open}
        className={`absolute z-20 ${placement.above ? "bottom-full mb-2" : "top-full mt-2"} rounded-lg border border-line bg-bg/95 p-3 text-sm font-normal normal-case tracking-normal text-text shadow-xl`}
        style={{ left: placement.left, width: placement.width }}
      >
        {description}
      </div>
    </div>
  );
}

/** Rótulo de um card com Tooltip, seguido do ícone ⓘ. */
export function TooltipLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wider text-muted">
      {children}
      <InfoIcon />
    </p>
  );
}

/** Ícone ⓘ do rótulo. Decorativo: o tooltip já descreve o card. */
function InfoIcon() {
  return (
    <span aria-hidden className="ml-1 align-middle text-sm font-normal not-italic">
      ⓘ
    </span>
  );
}
