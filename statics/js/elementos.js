/**
 * ELEMENTOS.JS — Fonte única dos "tipos" do Pokémania.
 *
 * Os tipos são os ELEMENTOS do Avatar (Ficha de RPG). As cores (cor/cor2)
 * são exatamente as mesmas usadas na Ficha (ELEMENT_VISUAL do avatar_ui.js),
 * pra manter a identidade visual entre os dois projetos.
 *
 * Use sempre as CHAVES (ex: "fogo") nos dados dos Pokémon (data/pokedex.json).
 * Pra exibir na tela, leia window.ELEMENTOS[chave].nome / .cor / .cor2.
 */
(function () {
    window.ELEMENTOS = {
        // ── Principais ──────────────────────────────────────────
        fogo:            { nome: 'Fogo',            cor: '#ff4500', cor2: '#ff8c00' },
        agua:            { nome: 'Água',            cor: '#0066ff', cor2: '#00bfff' },
        ar:              { nome: 'Ar',              cor: '#c8d8ff', cor2: '#ffffff' },
        terra:           { nome: 'Terra',           cor: '#8b4513', cor2: '#d2691e' },
        raio:            { nome: 'Raio',            cor: '#00ffee', cor2: '#ffe600' },
        vida:            { nome: 'Vida',            cor: '#00cc44', cor2: '#7fff00' },
        luz:             { nome: 'Luz',             cor: '#ffd700', cor2: '#ffffff' },

        // ── Subelementos dos Principais ────────────────────────────────────────
        fogo_verdadeiro: { nome: 'Fogo Verdadeiro', cor: '#fff7d4', cor2: '#ffd700' },
        agua_verdadeira: { nome: 'Água Verdadeira', cor: '#b8e0ff', cor2: '#00bfff' },
        ar_verdadeiro:   { nome: 'Ar Verdadeiro',   cor: '#e0f4f8', cor2: '#ffffff' },
        terra_verdadeira: { nome: 'Terra Verdadeira', cor: '#d2691e', cor2: '#8b4513' },

        // ── Subelementos ────────────────────────────────────────
        fumaca:          { nome: 'Fumaça',          cor: '#8b7d8b', cor2: '#d0c0d0' },
        lava:            { nome: 'Lava',            cor: '#cc2900', cor2: '#ff6b00' },
        gelo:            { nome: 'Gelo',            cor: '#a8dce8', cor2: '#e0f4f8' },
        sangue:          { nome: 'Sangue',          cor: '#8b0000', cor2: '#cc1100' },
        gas:             { nome: 'Gás',             cor: '#7fff00', cor2: '#ccff44' },
        atm:             { nome: 'ATM',             cor: '#4b0082', cor2: '#9400d3' },
        metal:           { nome: 'Metal',           cor: '#b8b8b8', cor2: '#f0f0f0' },
        cristal:         { nome: 'Cristal',         cor: '#9b59b6', cor2: '#00bcd4' },
        morte:           { nome: 'Morte',           cor: '#2d0a4e', cor2: '#660066' },
        escuridao:       { nome: 'Escuridão',       cor: '#1a0033', cor2: '#440066' },

        // ── Especial ────────────────────────────────────────────
        energia:         { nome: 'Energia',         cor: '#00d4ff', cor2: '#80e8ff' },
    };

    /**
     * RARIDADES — define a cor/borda e o brilho de cada raridade.
     * Usadas pelos cards (Pokédex, Coleção, Equipe).
     */
    window.RARIDADES = {
        comum:    { nome: 'Comum',    cor: '#9e9e9e', estrelas: '★'    },
        inicial:     { nome: 'Inicial',     cor: '#2196f3', estrelas: '★★'   },
        mitico:   { nome: 'Místico',   cor: '#9c27b0', estrelas: '★★★' },
        lendario: { nome: 'Lendário', cor: '#ffb300', estrelas: '★★★★'  },
    };

    // ── Helpers ─────────────────────────────────────────────────
    window.elNome = function (chave) {
        return (window.ELEMENTOS[chave] && window.ELEMENTOS[chave].nome) || chave;
    };
    window.elCor = function (chave) {
        return (window.ELEMENTOS[chave] && window.ELEMENTOS[chave].cor) || '#888';
    };
    window.raridadeInfo = function (chave) {
        return window.RARIDADES[chave] || window.RARIDADES.comum;
    };
})();
