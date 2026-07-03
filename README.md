# Pokémania — Supremacia do Protesto

Site **estático** (HTML/CSS/JS puro, sem servidor nem banco) dos Pokémon criados pelo
mestre do RPG. Os dados do jogador ficam no **localStorage** do navegador e o conteúdo
do mestre vem de arquivos **JSON** — então dá pra hospedar de graça no **GitHub Pages**.

## Como funciona

- A **Pokédex** lista todos os Pokémon do catálogo do mestre, mas como cards
  **escuros/"???"** até serem descobertos.
- O mestre distribui um **JSON de liberados**; cada jogador **importa** esse arquivo na
  Pokédex para revelar os Pokémon (igual ao importar/exportar da Ficha de RPG).
- A partir dos descobertos, o jogador monta sua **Coleção** e sua **Equipe** (máx. 6).
- Os **tipos** são os elementos do Avatar da Ficha (Fogo, Água, Raio, Luz...).

## Estrutura

```
index.html              → página inicial (Início)
templates/              → demais páginas (pokedex, equipe, colecao, social, perfil)
data/                   → catálogo do mestre
  pokedex.json          → TODOS os Pokémon (o mestre preenche)
  liberados.exemplo.json→ modelo do JSON de liberados
  COMO_ADICIONAR_POKEMON.md → guia do mestre
statics/css/            → estilos
statics/js/             → elementos.js, catalogo.js, menu.js + JS por página
statics/uploads/pokemon → imagens dos Pokémon
```

## Rodar localmente

Qualquer servidor estático serve. Duas opções:

```bash
# Node (igual à Ficha)
npm install
npm run dev        # http://localhost:5500

# ou Python (sem instalar nada)
python -m http.server 5500
```

> Abrir o `index.html` direto pelo `file://` não funciona (o navegador bloqueia o
> `fetch` do JSON). Use um dos servidores acima.

## Adicionar Pokémon

O mestre edita `data/pokedex.json` e coloca as imagens em `statics/uploads/pokemon/`.
Passo a passo em [`data/COMO_ADICIONAR_POKEMON.md`](data/COMO_ADICIONAR_POKEMON.md).
