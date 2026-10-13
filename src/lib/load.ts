import "server-only";
import { notFound } from "next/navigation";
import { getSeason } from "./season";
import { isSeason } from "./types";

/** Valida o segmento [season] da URL e carrega a temporada (404 se inválido). */
export async function loadSeason(seasonParam: string) {
  if (!isSeason(seasonParam)) notFound();
  return getSeason(seasonParam);
}
