# Tiltados F1

Site da liga de F1 entre amigos: mostra os resultados, as classificações, a Superlicença e as chances de título de cada temporada. Os termos seguem o glossário da Tiltados API, de onde vêm os dados.

## Calendário

**Etapa**:
Um fim de semana de GP (ex.: GP de São Paulo), com uma Corrida e, opcionalmente, uma Sprint.
_Avoid_: GP (quando se quer dizer o fim de semana), rodada

**Sessão**:
Uma Corrida ou uma Sprint de uma Etapa. É a unidade que gera pontos.
_Avoid_: race (para falar das duas), prova

**Corrida**:
A Sessão principal de uma Etapa, a que conta como vitória em GP.
_Avoid_: GP, race principal

**Sprint**:
A Sessão curta de uma Etapa, com pontuação menor.

**Sessão pendente**:
Uma Sessão prevista na temporada que ainda não tem resultado registrado, mesmo que a data já tenha passado.
_Avoid_: sessão futura

## Campeonato

**Campeão**:
O piloto em 1º na classificação de pilotos depois da última Sessão da temporada, com desempate por pontos, depois vitórias em Corridas, depois pódios. Passa a ser chamado Campeão assim que nenhum rival alcança mais os seus pontos.
_Avoid_: vencedor da temporada

**Campeão de Construtores**:
A equipe em 1º na classificação de construtores depois da última Sessão da temporada, com o mesmo desempate do Campeão. Numa frase sobre a equipe, concorda com ela: "Campeã de Construtores", "campeã".

**Pontos máximos**:
Os pontos atuais de um piloto ou equipe somados a tudo que ainda dá para ganhar nas Sessões pendentes.
_Avoid_: teto, pontuação possível

**Eliminado**:
Piloto ou equipe cujos Pontos máximos são menores que os pontos atuais do líder; não pode mais ser campeão.

**Na disputa**:
Piloto ou equipe que ainda não é campeão nem Eliminado pela matemática.

**Chance de título**:
A estimativa, em porcentagem, de um piloto ou equipe terminar como campeão, obtida simulando as Sessões pendentes.
_Avoid_: previsão, odds, probabilidade de campeão

**Motivo da Chance de título**:
A frase que explica por que um piloto ou equipe tem a sua Chance de título. No dia a dia, só "Motivo".
_Avoid_: justificativa, explicação

## Superlicença

**Superlicença**:
O saldo disciplinar de cada piloto na temporada: começa com 12 pontos e perde pontos a cada punição.
_Avoid_: carteira, licença

**Suspensão**:
A próxima Corrida que um piloto perde por ter a Superlicença zerada.
_Avoid_: ban, gancho
