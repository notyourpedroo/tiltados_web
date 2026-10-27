"use client";

import { catchError } from "next/error";
import type { ReactNode } from "react";

/**
 * Troca o trecho por `fallback` (ou nada) se ele falhar, sem derrubar o resto da
 * página. Para dados opcionais, como a Chance de título na Visão geral e na página
 * do piloto. O erro continua registrado no log do servidor.
 */
export const HideOnError = catchError((props: { fallback?: ReactNode }) => props.fallback ?? null);
