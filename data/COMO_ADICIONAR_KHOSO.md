# Como adicionar Khosō (guia do Mestre)

Todos os Khosōs são criados pelo mestre e ficam guardados aqui na pasta `data/`. Há dois arquivos importantes:

| Arquivo           | Para que serve                                                        | Quem mexe                      |
| ------------------ | --------------------------------------------------------------------- | ------------------------------ |
| `khosodex.json`   | **Catálogo completo** — TODOS os Khosōs do mundo do RPG.              |
| `liberados.json` | Lista do que já foi **descoberto** e pode ser revelado aos jogadores. | Mestre distribui aos jogadores |

---

## 1. Cadastrar um Khosō no catálogo (`khosodex.json`)

Cada Khosō é um objeto dentro da lista `"khosos"`. Modelo:

```json
{
  "numero": 4,
  "nome": "Nome do Khosō",
  "geracao": 1,
  "imagem": "nome-do-arquivo.png, .webp, .jpg ou .gif ou etc.",
  "elementos": ["fogo"],
  "raridade": "comum",
  "descricao": "A lore/descrição que aparece no card.",
  "stats": { "vida": 50, "ataque_m": 55, "ataque_f": 55, "defesa_m": 40, "defesa_f": 40, "speed": 60 }
}
```

### Campos

- **numero** — número único e crescente (igual ao "Nº" da Khosōdex).
- **nome** — nome que aparece no card.
- **imagem** — nome do arquivo de imagem. Coloque a imagem em
  `statics/uploads/khoso/gen`. Pode ser `.png`, `.webp`, `.jpg` ou `.gif`.
  Deixe `""` (vazio) se ainda não tiver imagem.
- **elementos** — 1 ou 2 elementos (os "tipos"). Use as **chaves** da tabela abaixo.
- **raridade** — `inicial`, `comum`, `mitico` ou `lendario`.
- **descricao** — texto livre.
- **stats** — quatro atributos de 0 a ~200: `vida`, `ataque_m`, `ataque_f`, `defesa_m`, `defesa_f`, `speed`.

### Elementos disponíveis (use a CHAVE, não o nome)

| Chave              | Nome             |     | Chave       | Nome      |
| ------------------ | ---------------- | --- | ----------- | --------- |
| `fogo`             | Fogo             |     | `gelo`      | Gelo      |
| `agua`             | Água             |     | `sangue`    | Sangue    |
| `ar`               | Ar               |     | `gas`       | Gás       |
| `terra`            | Terra            |     | `atm`       | ATM       |
| `raio`             | Raio             |     | `metal`     | Metal     |
| `vida`             | Vida             |     | `cristal`   | Cristal   |
| `luz`              | Luz              |     | `morte`     | Morte     |
| `fogo_verdadeiro`  | Fogo Verdadeiro  |     | `escuridao` | Escuridão |
| `agua_verdadeira`  | Água Verdadeira  |     | `fumaca`    | Fumaça    |
| `ar_verdadeiro`    | Ar Verdadeiro    |     | `lava`      | Lava      |
| `terra_verdadeira` | Terra Verdadeira |     | `energia`   | Energia   |

> A lista oficial fica em `statics/js/elementos.js`. Se quiser um elemento novo,
> é só me avisar que eu adiciono lá (com cor e nome).

---

## 2. Liberar Khosōs para os jogadores (`liberados.json`)

A Khosōdex mostra **todos** os Khosōs do catálogo, mas como **cards escuros/bloqueados**
("???") até serem descobertos. Para revelar, o mestre distribui um `liberados.json`
e cada jogador **importa** esse arquivo na página da Khosōdex (botão **Importar**).

Formato:

```json
{
  "tipo": "khosoverso-liberados",
  "liberados": [1, 2, 5, 8]
}
```

Basta listar os **números** dos Khosōs que devem ficar visíveis. Veja
`liberados.exemplo.json` como modelo. Cada jogador também pode **Exportar** o que já
tem liberado (backup), igual ao importar/exportar da Ficha de RPG.

---

## Resumo do fluxo

1. Mestre pensa nos Khosōs → preenche `khosodex.json` + coloca as imagens.
2. Conforme os jogadores descobrem mons no RPG, o mestre manda um `liberados.json`.
3. Cada jogador importa o arquivo na Khosōdex → os mons liberados deixam de ser "???".
