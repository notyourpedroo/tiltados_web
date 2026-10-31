Carros das equipes: as renderizações laterais oficiais da CDN do site da Fórmula 1 (`media.formula1.com/image/upload/c_lfill,w_1200/.../common/f1/{ano}/{equipe}/{ano}{equipe}carright.png`), baixadas uma vez em 1200 px de largura e convertidas para WebP com transparência (cerca de 1200×260, 40 a 60 KB). A largura dá nitidez em tela retina no maior uso, uns 320 px de CSS no card do líder.

Ficam em `public/cars/<ano do Carro>/<slug>.webp`, com o mesmo slug das logos (`red-bull`, `racing-bulls`, `sauber`...). A pasta é a do **ano do Carro**, não da temporada: cada temporada é disputada num Jogo que traz os carros reais de um ano (2025 no F1 24, carros de 2024; 2026 no F1 25, carros de 2025), e duas temporadas no mesmo Jogo usam os mesmos arquivos. O Jogo de cada temporada e a lista de equipes com Carro em cada ano ficam em `src/lib/teams.ts`; `teamCar(nome, temporada)` devolve o endereço.

- 2024: Red Bull, Ferrari, Alpine, McLaren e Kick Sauber.
- 2025: essas cinco mais Mercedes e Racing Bulls.

A mesma imagem serve aos dois temas, sem versão clara e escura. Use só onde se "abre" um piloto ou uma equipe (card do líder, cabeçalho do perfil do piloto, linhas da Chance de título), sempre com o nome da equipe em texto por perto: o Carro é decorativo. Os cards da página Equipes, as tabelas, os resultados e a Superlicença ficam só com o logo. Equipe fora do Jogo da temporada não tem Carro e não ganha o de outro ano.
