# Tiltados F1

Site da liga de F1 entre amigos: mostra os resultados, as classificações, a Superlicença e as chances de título de cada temporada. Os termos seguem o glossário da Tiltados API, de onde vêm os dados.

## Temporada

**Jogo**:
A edição do jogo de F1 em que a liga disputa uma temporada (ex.: F1 24 em 2025, F1 25 em 2026).
_Avoid_: game, versão

**Carro**:
O carro de uma equipe no Jogo da temporada, que é o carro real da F1 do ano do Jogo, não o do ano da temporada. Uma equipe que não existe no Jogo não tem Carro.
_Avoid_: carro do ano

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

## Equipes

**Piloto da equipe**:
Numa temporada, todo piloto que disputou ao menos uma Sessão pela equipe. Quem troca de equipe no meio da temporada é piloto das duas, e cada uma conta só os pontos que ele fez por ela.
_Avoid_: dupla (para falar de todos os pilotos que passaram pela equipe)

**Dupla**:
Os pilotos que a equipe tem no cadastro da liga. Numa temporada encerrada, é a dupla com que ela terminou.
_Avoid_: pilotos atuais, line-up

**Dobradinha**:
O 1º e o 2º lugar de uma Corrida feitos por pilotos da mesma equipe. Uma Sprint não conta.
_Avoid_: 1-2, dobrada

## Superlicença

**Superlicença**:
O saldo disciplinar de cada piloto na temporada: começa com 12 pontos e perde pontos a cada punição.
_Avoid_: carteira, licença

**Suspensão**:
A próxima Corrida que um piloto perde por ter a Superlicença zerada; cumprida, ele volta sem nova Suspensão até sofrer outra punição.
_Avoid_: ban, gancho

**Suspensão a cumprir**:
A Suspensão de um piloto cuja Superlicença zerou e que ainda não teve uma Corrida disputada depois da Sessão da punição que a zerou. Uma Sprint não cumpre a Suspensão. É a mesma na Superlicença e na Chance de título.

**Suspensão cumprida**:
A Suspensão de um piloto que já teve uma Corrida disputada depois da Sessão da punição que zerou a Superlicença. O saldo continua zerado, então a próxima punição gera uma nova Suspensão a cumprir.
