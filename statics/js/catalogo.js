/**
 * CATALOGO.JS — Camada de dados do Pokémania (estático, sem servidor).
 *
 * - Catálogo dos Pokémon: lido de data/pokedex.json (conteúdo do mestre).
 * - Estado do jogador (descobertos, coleção, equipe, perfil): localStorage.
 *
 * Funciona em hospedagem estática (GitHub Pages), sem banco de dados.
 * Detecta se a página está em /templates/ para montar os caminhos certos.
 */
(function () {
    // '../' quando dentro de templates/, '' quando na raiz (index.html)
    const BASE = window.location.pathname.includes('/templates/') ? '../' : '';

    const LS = {
        descobertos: 'pokemania_descobertos', // [numero, ...] revelados via importação
        colecao:     'pokemania_colecao',     // [numero, ...] capturados pelo jogador
        equipe:      'pokemania_equipe',       // [numero, ...] (máx. 6)
        perfil:      'pokemania_perfil',       // { nome, avatar }
    };

    function _get(key, fallback) {
        try {
            const v = JSON.parse(localStorage.getItem(key));
            return v === null || v === undefined ? fallback : v;
        } catch (e) { return fallback; }
    }
    function _set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

    // Carrega o catálogo uma única vez (cacheia a promessa)
    let _catalogoPromise = null;
    function carregar() {
        if (!_catalogoPromise) {
            _catalogoPromise = fetch(BASE + 'data/pokedex.json')
                .then(r => r.json())
                .then(d => d.pokemons || [])
                .catch(e => { console.error('Erro ao carregar data/pokedex.json:', e); return []; });
        }
        return _catalogoPromise;
    }

    window.Catalogo = {
        base: BASE,
        carregar,
        porNumero(lista, n) { return lista.find(p => p.numero === n); },

        // Caminho da imagem de um Pokémon (com fallback para a pokébola)
        imagem(p) {
            return p && p.imagem
                ? BASE + 'statics/uploads/pokemon/' + p.imagem
                : BASE + 'statics/uploads/utilidade/poke-ball.png';
        },

        // ── Descobertos (revelados na Pokédex) ──────────────────
        getDescobertos() { return _get(LS.descobertos, []); },
        estaDescoberto(n) { return this.getDescobertos().includes(n); },
        liberar(nums) {
            const set = new Set(this.getDescobertos());
            nums.forEach(n => set.add(Number(n)));
            _set(LS.descobertos, [...set].sort((a, b) => a - b));
        },

        // ── Coleção ─────────────────────────────────────────────
        getColecao() { return _get(LS.colecao, []); },
        naColecao(n) { return this.getColecao().includes(n); },
        addColecao(n) {
            const c = this.getColecao();
            if (!c.includes(n)) { c.push(n); _set(LS.colecao, c); }
        },
        removeColecao(n) { _set(LS.colecao, this.getColecao().filter(x => x !== n)); },

        // ── Equipe (máx. 6) ─────────────────────────────────────
        getEquipe() { return _get(LS.equipe, []); },
        naEquipe(n) { return this.getEquipe().includes(n); },
        addEquipe(n) {
            const e = this.getEquipe();
            if (e.includes(n)) return { ok: false, msg: 'Já está na equipe!' };
            if (e.length >= 6) return { ok: false, msg: 'Equipe cheia (máximo 6)!' };
            e.push(n); _set(LS.equipe, e); return { ok: true };
        },
        removeEquipe(n) { _set(LS.equipe, this.getEquipe().filter(x => x !== n)); },

        // ── Perfil local ────────────────────────────────────────
        getPerfil() { return _get(LS.perfil, { nome: 'Treinador', avatar: '' }); },
        setPerfil(p) { _set(LS.perfil, p); },
    };
})();
