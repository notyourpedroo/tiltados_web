/**
 * Descrições dos indicadores, o texto do tooltip de cada card. Um registro por sujeito,
 * porque o mesmo rótulo muda de sentido entre piloto e equipe ("Vitórias" do piloto
 * mostra as de Sprint à parte). Uma ou duas frases para o torcedor, nos termos do
 * GLOSSARY.md.
 */

const SEQUENCIA_RULE =
  "Só Corridas contam, e uma Corrida que ele não disputou quebra a Sequência. O atual é a Sequência que chega à última Corrida da temporada.";

/** Indicadores do perfil do piloto. */
export const DRIVER_INDICATORS = {
  points:
    "Os pontos do piloto na temporada, Corridas e Sprints somadas. O subtítulo mostra a posição dele na classificação de pilotos.",
  wins: "As Corridas que o piloto venceu. As vitórias em Sprint não entram no número e aparecem à parte, no subtítulo.",
  podiums:
    "As vezes em que o piloto chegou entre os 3 primeiros, em Corridas e Sprints. O subtítulo mostra quantas Sessões ele disputou.",
  best: "A melhor posição de chegada do piloto numa Sessão, Corrida ou Sprint. O N× diz quantas vezes ele chegou nessa posição.",
  poles:
    "As Corridas em que o piloto largou em 1º; largar em 1º numa Sprint não conta. A Conversão de pole diz quantas dessas Poles viraram vitória, como X de Y.",
  fastestLaps:
    "As Sessões, Corrida ou Sprint, em que o piloto fez a Volta mais rápida: a melhor volta da Sessão entre todos os pilotos.",
  hatTricks: "As Corridas em que o piloto fez Pole, vitória e Volta mais rápida na mesma Corrida.",
  avgFinish: "A posição média de chegada do piloto nas Corridas que disputou. Sprints não contam.",
  gained:
    "O saldo, somado em todas as Sessões disputadas, entre a posição de largada e a de chegada do piloto; negativo quando ele perdeu posições.",
  recentForm:
    "Os pontos do piloto nas últimas 3 Etapas disputadas da temporada, Corrida e Sprint somadas; uma Etapa em que ele não correu conta zero.",
  ritmo:
    "Quanto, em média, a melhor volta do piloto fica atrás da Volta mais rápida de cada Sessão em que ele marcou tempo. Quanto mais perto de 0%, mais rápido.",
  aproveitamento:
    "Os pontos por Sessão disputada do piloto e a parte das suas Sessões em que ele pontuou.",
  sequenciaScoring: `A maior Sequência de Corridas seguidas em que o piloto pontuou. ${SEQUENCIA_RULE}`,
  sequenciaPodium: `A maior Sequência de Corridas seguidas em que o piloto subiu ao pódio. ${SEQUENCIA_RULE}`,
  sequenciaWin: `A maior Sequência de Corridas seguidas em que o piloto venceu. ${SEQUENCIA_RULE}`,
} as const satisfies Record<string, string>;
