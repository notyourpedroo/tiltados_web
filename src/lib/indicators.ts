/**
 * Descrições dos indicadores, o texto do tooltip de cada card. Um registro por sujeito,
 * porque o mesmo rótulo muda de sentido entre piloto e equipe ("Vitórias" do piloto
 * mostra as de Sprint à parte). Uma ou duas frases para o torcedor, nos termos do
 * GLOSSARY.md.
 */

/** O que conta numa Sequência, como no GLOSSARY.md. */
const SEQUENCIA_COUNTS = "Só Corridas contam, e uma Corrida que ele não disputou quebra a Sequência.";
const SEQUENCIA_RULE = `${SEQUENCIA_COUNTS} O atual é a Sequência que chega à última Corrida da temporada.`;
/** A Pole é só de Corrida. */
const SPRINT_POLE = "largar em 1º numa Sprint não conta";

/** Indicadores do perfil do piloto. */
export const DRIVER_INDICATORS = {
  points:
    "Os pontos do piloto na temporada, Corridas e Sprints somadas. O subtítulo mostra a posição dele na classificação de pilotos.",
  wins: "As Corridas que o piloto venceu. As vitórias em Sprint não entram no número e aparecem à parte, no subtítulo.",
  podiums:
    "As vezes em que o piloto chegou entre os 3 primeiros, em Corridas e Sprints. O subtítulo mostra quantas Sessões ele disputou.",
  best: "A melhor posição de chegada do piloto numa Sessão, Corrida ou Sprint. O N× diz quantas vezes ele chegou nessa posição.",
  poles:
    `As Corridas em que o piloto largou em 1º; ${SPRINT_POLE}. A Conversão de pole diz quantas dessas Poles viraram vitória, como X de Y.`,
  fastestLaps:
    "As Sessões, Corrida ou Sprint, em que o piloto fez a Volta mais rápida: a melhor volta da Sessão entre todos os pilotos.",
  hatTricks: "As Corridas em que o piloto fez Pole, vitória e Volta mais rápida na mesma Corrida.",
  avgFinish: "A posição média de chegada do piloto nas Corridas que disputou. Sprints não contam.",
  gained:
    "O saldo, somado em todas as Sessões disputadas, entre a posição de largada e a de chegada do piloto; negativo quando ele perdeu posições.",
  recentForm:
    "Os pontos do piloto nas últimas 3 Etapas disputadas da temporada, Corrida e Sprint somadas; uma Etapa em que ele não correu conta zero.",
  ritmo:
    "Quanto, em média e em porcentagem, a melhor volta do piloto fica atrás da Volta mais rápida de cada Sessão em que ele marcou tempo. Quanto mais perto de 0%, mais rápido.",
  aproveitamento:
    "Os pontos por Sessão disputada do piloto e a parte das suas Sessões em que ele pontuou.",
  sequenciaScoring: `A maior Sequência de Corridas seguidas em que o piloto pontuou. ${SEQUENCIA_RULE}`,
  sequenciaPodium: `A maior Sequência de Corridas seguidas em que o piloto subiu ao pódio. ${SEQUENCIA_RULE}`,
  sequenciaWin: `A maior Sequência de Corridas seguidas em que o piloto venceu. ${SEQUENCIA_RULE}`,
} as const satisfies Record<string, string>;

const TIES = "Pilotos empatados aparecem juntos.";

/** O corte de MINIMUM_SESSIONS_SHARE (season-highlights.ts); o indicators.test.ts confere os dois. */
const REGULARS = "Só entra quem disputou ao menos metade das Sessões da temporada.";

/**
 * Destaques da visão geral da temporada. Os "Mais/Melhor X" reaproveitam o texto do
 * piloto e dizem quem entra na disputa e que empatados aparecem juntos.
 */
export const SEASON_HIGHLIGHT_INDICATORS = {
  rounds:
    "As Etapas disputadas na temporada: cada fim de semana de GP, com uma Corrida e, em alguns, uma Sprint. O subtítulo conta as Sprints.",
  poles: `O piloto com mais Poles: Corridas em que largou em 1º; ${SPRINT_POLE}. ${TIES}`,
  fastestLaps: `O piloto com mais Voltas mais rápidas. ${DRIVER_INDICATORS.fastestLaps} ${TIES}`,
  winSequencia: `O piloto com a maior Sequência de Corridas seguidas com vitória da temporada. ${SEQUENCIA_COUNTS} ${TIES}`,
  recentForm: `Os 3 pilotos com mais pontos na Forma recente. ${DRIVER_INDICATORS.recentForm} Quem não pontuou na janela fica de fora.`,
  ritmo: `O piloto com o melhor Ritmo. ${DRIVER_INDICATORS.ritmo} ${REGULARS} ${TIES}`,
  aproveitamento: `O piloto com mais pontos por Sessão disputada no Aproveitamento. ${REGULARS} ${TIES}`,
  hatTricks: `O piloto com mais Hat-tricks. ${DRIVER_INDICATORS.hatTricks} ${TIES}`,
} as const satisfies Record<string, string>;

/** Indicadores do perfil da equipe: contam o que os Pilotos da equipe fizeram correndo por ela. */
export const TEAM_INDICATORS = {
  points:
    "Os pontos que todos os Pilotos da equipe fizeram por ela na temporada, Corridas e Sprints somadas. O subtítulo mostra a posição dela na classificação de equipes.",
  wins: "As Corridas que um piloto da equipe venceu; conta só Corridas, as vitórias em Sprint ficam de fora.",
  podiums:
    "Os pódios dos Pilotos da equipe em Corridas e Sprints, um por piloto no pódio: dois pilotos no pódio da mesma Sessão contam dois.",
  oneTwos: "As Corridas em que os Pilotos da equipe chegaram em 1º e 2º. A Sprint não conta.",
  poles: `As Corridas em que um piloto da equipe largou em 1º; ${SPRINT_POLE}.`,
  fastestLaps:
    "As Sessões, Corrida ou Sprint, em que um piloto da equipe fez a Volta mais rápida: a melhor volta da Sessão entre todos os pilotos.",
  best: "A melhor posição de chegada de um piloto da equipe numa Sessão, Corrida ou Sprint. O N× diz quantas vezes um piloto dela chegou nessa posição.",
  bothScored:
    "As Sessões, Corrida ou Sprint, em que ao menos dois Pilotos da equipe pontuaram por ela.",
  recentForm:
    "Os pontos de todos os Pilotos da equipe nas últimas 3 Etapas disputadas da temporada, Corrida e Sprint somadas.",
  aproveitamento:
    "Os pontos da equipe por Sessão, na média por participação de piloto: uma Sessão em que dois Pilotos da equipe correram conta duas vezes.",
} as const satisfies Record<string, string>;
