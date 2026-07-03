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
    const pathname = window.location.pathname;
    const BASE = (pathname.includes('/templates/') || pathname.endsWith('/templates')) ? '../' : '';

    const LS = {
        descobertos: 'pokemania_descobertos', // [numero, ...] revelados via importação
        colecao: 'pokemania_colecao',     // [numero, ...] capturados pelo jogador
        equipe: 'pokemania_equipe',       // [numero, ...] (máx. 6)
        inventario: 'pokemania_inventario', // { itemId: quantidade }
        equipados: 'pokemania_equipados', // { numero: [itemId, ...] } itens de reforço
        hp: 'pokemania_hp',               // { numero: vidaAtual }
        khoso: 'pokemania_khoso',         // { numero: { apelido, nota } }
        ataques: 'pokemania_ataques',     // { numero: [{ nome, elemento, tipo, descricao }] }
        perfil: 'pokemania_perfil',       // { nome, avatar }
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

        // Filtra uma lista de Pokémon por geração
        filtrarPorGeracao(lista, gen) {
            if (!gen || gen === 'todas') return lista;
            return lista.filter(p => String(p.geracao || 1) === String(gen));
        },

        // Retorna um array com os números de todas as gerações únicas no catálogo
        getGeracoesExistentes(lista) {
            const gens = lista.map(p => p.geracao || 1);
            return [...new Set(gens)].sort((a, b) => a - b);
        },

        // Caminho da imagem de um Pokémon (com fallback para a pokébola)
        imagem(p) {
            if (!p || !p.imagem) return BASE + 'statics/uploads/utilidade/ultra-ball.png';
            if (p.imagem.startsWith('http') || p.imagem.startsWith('data:')) return p.imagem;

            const pastaGen = p.geracao ? `gen_${p.geracao}` : 'gen_1';
            let arquivo = p.imagem;

            // Se o nome no JSON não tiver extensão (ponto), adiciona .svg por padrão
            if (!arquivo.includes('.')) {
                arquivo += '.svg';
            }

            return `${BASE}statics/uploads/pokemon/${pastaGen}/${arquivo}`;
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

        // ── Inventário (itens × quantidade) ─────────────────────
        getInventario() { return _get(LS.inventario, {}); },
        getItemQtd(id) { return this.getInventario()[id] || 0; },
        setItemQtd(id, q) {
            const inv = this.getInventario();
            q = Math.max(0, q | 0);
            if (q === 0) delete inv[id]; else inv[id] = q;
            _set(LS.inventario, inv);
        },
        addItem(id, n) { this.setItemQtd(id, this.getItemQtd(id) + (n || 1)); },

        // ── Itens de reforço equipados por Khosō ────────────────
        getEquipados(n) { return (_get(LS.equipados, {})[n]) || []; },
        equipar(n, itemId) {
            const e = _get(LS.equipados, {});
            const arr = e[n] || [];
            if (!arr.includes(itemId)) { arr.push(itemId); e[n] = arr; _set(LS.equipados, e); }
        },
        desequipar(n, itemId) {
            const e = _get(LS.equipados, {});
            e[n] = (e[n] || []).filter(x => x !== itemId);
            if (!e[n].length) delete e[n];
            _set(LS.equipados, e);
        },

        // ── HP atual (barra de vida da equipe) ──────────────────
        getHp(n) { return _get(LS.hp, {})[n]; },
        setHp(n, v) { const h = _get(LS.hp, {}); h[n] = Math.max(0, v | 0); _set(LS.hp, h); },

        // ── Apelido + anotação por Khosō ────────────────────────
        getKhoso(n) { return _get(LS.khoso, {})[n] || { apelido: '', nota: '' }; },
        setKhoso(n, obj) { const k = _get(LS.khoso, {}); k[n] = obj; _set(LS.khoso, k); },
        apelidoOuNome(p) { const a = this.getKhoso(p.numero).apelido; return a ? a.trim() || p.nome : p.nome; },

        // ── Ataques criados pelo jogador ────────────────────────
        getAtaques(n) { return _get(LS.ataques, {})[n] || []; },
        addAtaque(n, atk) { const a = _get(LS.ataques, {}); a[n] = a[n] || []; a[n].push(atk); _set(LS.ataques, a); },
        removeAtaque(n, idx) {
            const a = _get(LS.ataques, {});
            if (a[n]) { a[n].splice(idx, 1); if (!a[n].length) delete a[n]; _set(LS.ataques, a); }
        },

        // ── Perfil local ────────────────────────────────────────
        getPerfil() { return _get(LS.perfil, { nome: 'Treinador', avatar: '' }); },
        setPerfil(p) { _set(LS.perfil, p); },

        // ── Save único de progresso (liberados + coleção + equipe) ──
        exportarProgresso() {
            const pacote = {
                tipo: 'pokemania-progresso',
                exportadoEm: new Date().toLocaleString('pt-BR'),
                descobertos: this.getDescobertos(),
                colecao: this.getColecao(),
                equipe: this.getEquipe(),
                inventario: this.getInventario(),
                equipados: _get(LS.equipados, {}),
                hp: _get(LS.hp, {}),
                khoso: _get(LS.khoso, {}),
                ataques: _get(LS.ataques, {}),
            };
            const blob = new Blob([JSON.stringify(pacote, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'pokemania_progresso.json';
            a.click();
            if (window.notificar) notificar('Progresso exportado.', 'ok');
        },
        importarProgresso(texto) {
            try {
                const d = JSON.parse(texto);
                const temCampos = ('descobertos' in d) || ('colecao' in d) || ('equipe' in d);
                if (d.tipo !== 'pokemania-progresso' && !temCampos) {
                    return { ok: false, msg: 'Não é um arquivo de progresso do Pokémania.' };
                }
                if (Array.isArray(d.descobertos)) _set(LS.descobertos, d.descobertos.map(Number));
                if (Array.isArray(d.colecao)) _set(LS.colecao, d.colecao.map(Number));
                if (Array.isArray(d.equipe)) _set(LS.equipe, d.equipe.slice(0, 6).map(Number));
                if (d.inventario && typeof d.inventario === 'object') _set(LS.inventario, d.inventario);
                if (d.equipados && typeof d.equipados === 'object') _set(LS.equipados, d.equipados);
                if (d.hp && typeof d.hp === 'object') _set(LS.hp, d.hp);
                if (d.khoso && typeof d.khoso === 'object') _set(LS.khoso, d.khoso);
                if (d.ataques && typeof d.ataques === 'object') _set(LS.ataques, d.ataques);
                return { ok: true };
            } catch (e) {
                return { ok: false, msg: 'Arquivo inválido.' };
            }
        },
    };

    // ── Toast global (usado pelo menu e pelas páginas) ──────────
    window.notificar = function (msg, tipo) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.className = 'toast-show' +
            (tipo === 'erro' ? ' toast-erro' : tipo === 'ok' ? ' toast-ok' : '');
        clearTimeout(window.notificar._t);
        window.notificar._t = setTimeout(() => { toast.className = ''; }, 3200);
    };
})();
