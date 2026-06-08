# Como adicionar Pokémon (guia do Mestre)

Este projeto **não usa a PokéAPI**. Todos os Pokémon são criados pelo mestre e ficam
guardados aqui na pasta `data/`. Há dois arquivos importantes:

| Arquivo | Para que serve | Quem mexe |
|---|---|---|
| `pokedex.json` | **Catálogo completo** — TODOS os Pokémon do mundo do RPG. | Mestre (com a ajuda do dev) |
| `liberados.json` | Lista do que já foi **descoberto** e pode ser revelado aos jogadores. | Mestre distribui aos jogadores |

---

## 1. Cadastrar um Pokémon no catálogo (`pokedex.json`)

Cada Pokémon é um objeto dentro da lista `"pokemons"`. Modelo:

```json
{
  "numero": 4,
  "nome": "Nome do Pokémon",
  "imagem": "nome-do-arquivo.png",
  "elementos": ["fogo"],
  "raridade": "comum",
  "descricao": "A lore/descrição que aparece no card.",
  "stats": { "vida": 50, "ataque": 55, "defesa": 40, "velocidade": 60 }
}
```

### Campos

- **numero** — número único e crescente (igual ao "Nº" da Pokédex).
- **nome** — nome que aparece no card.
- **imagem** — nome do arquivo de imagem. Coloque a imagem em
  `statics/uploads/pokemon/`. Pode ser `.png`, `.webp`, `.jpg` ou `.gif`.
  Deixe `""` (vazio) se ainda não tiver imagem.
- **elementos** — 1 ou 2 elementos (os "tipos"). Use as **chaves** da tabela abaixo.
- **raridade** — `comum`, `raro`, `lendario` ou `mitico`.
- **descricao** — texto livre.
- **stats** — quatro atributos de 0 a ~200: `vida`, `ataque`, `defesa`, `velocidade`.

### Elementos disponíveis (use a CHAVE, não o nome)

| Chave | Nome | | Chave | Nome |
|---|---|---|---|---|
| `fogo` | Fogo | | `gelo` | Gelo |
| `agua` | Água | | `sangue` | Sangue |
| `ar` | Ar | | `gas` | Gás |
| `terra` | Terra | | `atm` | ATM |
| `raio` | Raio | | `metal` | Metal |
| `vida` | Vida | | `cristal` | Cristal |
| `luz` | Luz | | `morte` | Morte |
| `fogo_verdadeiro` | Fogo Verdadeiro | | `escuridao` | Escuridão |
| `fumaca` | Fumaça | | `energia` | Energia |
| `lava` | Lava | | | |

> A lista oficial fica em `statics/js/elementos.js`. Se quiser um elemento novo,
> é só me avisar que eu adiciono lá (com cor e nome).

---

## 2. Liberar Pokémon para os jogadores (`liberados.json`)

A Pokédex mostra **todos** os Pokémon do catálogo, mas como **cards escuros/bloqueados**
("???") até serem descobertos. Para revelar, o mestre distribui um `liberados.json`
e cada jogador **importa** esse arquivo na página da Pokédex (botão **Importar**).

Formato:

```json
{
  "tipo": "pokemania-liberados",
  "liberados": [1, 2, 5, 8]
}
```

Basta listar os **números** dos Pokémon que devem ficar visíveis. Veja
`liberados.exemplo.json` como modelo. Cada jogador também pode **Exportar** o que já
tem liberado (backup), igual ao importar/exportar da Ficha de RPG.

---

## Resumo do fluxo

1. Mestre pensa nos Pokémon → preenche `pokedex.json` + coloca as imagens.
2. Conforme os jogadores descobrem mons no RPG, o mestre manda um `liberados.json`.
3. Cada jogador importa o arquivo na Pokédex → os mons liberados deixam de ser "???".
