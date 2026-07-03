/**
 * SOCIAL.JS — Minigame "Adivinhe o Khosō" (estático, catálogo local).
 *
 * Só usa Khosōs DESCOBERTOS pelo jogador. Dois modos:
 *  - Clássico: compara elemento, raridade, geração e velocidade (estilo Pokédle).
 *  - Silhueta: a imagem aparece como sombra; acerte o nome para revelar.
 * Alvo diário (determinístico pela data) + botão "Novo Khosō" (aleatório).
 */
(async function () {
    const cont = document.getElementById('social-conteudo');
    const CAT = await Catalogo.carregar();
    const POOL = CAT.filter(p => Catalogo.estaDescoberto(p.numero)).sort((a, b) => a.numero - b.numero);

    if (POOL.length < 1) {
        cont.innerHTML = '<p class="page-intro">Descubra Khosōs na Khosōdex para jogar. Importe o arquivo de liberados do mestre primeiro.</p>';
        return;
    }

    const MAX = 6;
    const ORDEM_RAR = { inicial: 0, comum: 1, mitico: 2, lendario: 3 };
    let modo = 'classico';
    let estado;

    function seedDiario(offset) {
        const d = new Date();
        const n = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
        let h = ((n + offset * 7919) * 2654435761) >>> 0;
        return h % POOL.length;
    }

    function novoJogo(aleatorio) {
        const idx = aleatorio ? Math.floor(Math.random() * POOL.length) : seedDiario(modo === 'silhueta' ? 1 : 0);
        estado = { alvo: POOL[idx], tentativas: [], fim: false, venceu: false };
        render();
    }

    // ── Comparações ─────────────────────────────────────────────
    function classeElementos(g, t) {
        const iguais = g.elementos.length === t.elementos.length && g.elementos.every(x => t.elementos.includes(x));
        if (iguais) return 'verde';
        if (g.elementos.some(x => t.elementos.includes(x))) return 'amarelo';
        return 'vermelho';
    }
    function seta(gv, tv) { return gv === tv ? '' : (tv > gv ? ' ▲' : ' ▼'); }
    function classeNum(gv, tv, tol) { return gv === tv ? 'verde' : (Math.abs(gv - tv) <= tol ? 'amarelo' : 'vermelho'); }
    function badges(p) {
        return p.elementos.map(e => `<span class="mini-badge" style="background:${elCor(e)}">${elNome(e)}</span>`).join('');
    }

    function linhaClassica(g) {
        const t = estado.alvo;
        const elC = classeElementos(g, t);
        const rarC = g.raridade === t.raridade ? 'verde' : 'vermelho';
        const gg = g.geracao || 1, tg = t.geracao || 1;
        const genC = gg === tg ? 'verde' : (Math.abs(gg - tg) === 1 ? 'amarelo' : 'vermelho');
        const gs = (g.stats || {}).speed || 0, ts = (t.stats || {}).speed || 0;
        const spdC = classeNum(gs, ts, 15);
        return `<div class="g-row">
            <div class="g-cell g-sprite"><img src="${Catalogo.imagem(g)}" alt=""></div>
            <div class="g-cell g-nome">${g.nome}</div>
            <div class="g-cell ${elC}"><div class="g-badges">${badges(g)}</div></div>
            <div class="g-cell ${rarC}">${raridadeInfo(g.raridade).nome}${seta(ORDEM_RAR[g.raridade] || 0, ORDEM_RAR[t.raridade] || 0)}</div>
            <div class="g-cell ${genC}">Ger ${gg}${seta(gg, tg)}</div>
            <div class="g-cell ${spdC}">${gs}${seta(gs, ts)}</div>
        </div>`;
    }

    function linhaSilhueta(g) {
        const certo = g.numero === estado.alvo.numero;
        return `<div class="g-simples">
            <img src="${Catalogo.imagem(g)}" alt="">
            <span>${g.nome}</span>
            <span class="g-tag ${certo ? 'ok' : 'no'}">${certo ? 'CERTO' : 'ERRADO'}</span>
        </div>`;
    }

    // ── Render ──────────────────────────────────────────────────
    function render() {
        const t = estado.alvo;
        const restantes = MAX - estado.tentativas.length;
        const cabecalho = modo === 'classico'
            ? `<div class="g-row g-head"><div class="g-cell"></div><div class="g-cell">Nome</div><div class="g-cell">Elemento</div><div class="g-cell">Raridade</div><div class="g-cell">Geração</div><div class="g-cell">Veloc.</div></div>`
            : '';

        const silhueta = modo === 'silhueta'
            ? `<div class="silhueta-box"><img id="silhueta-img" src="${Catalogo.imagem(t)}" class="${estado.fim ? 'revelada' : ''}" alt=""></div>`
            : '';

        const linhas = estado.tentativas.map(g => modo === 'classico' ? linhaClassica(g) : linhaSilhueta(g)).join('');

        cont.innerHTML = `
            <div class="social-tabs">
                <button class="social-tab ${modo === 'classico' ? 'ativo' : ''}" data-modo="classico">Clássico</button>
                <button class="social-tab ${modo === 'silhueta' ? 'ativo' : ''}" data-modo="silhueta">Silhueta</button>
            </div>
            ${silhueta}
            <p class="social-status">${estado.fim ? '' : `Tentativas restantes: <b>${restantes}</b>`}</p>
            <div class="social-busca ${estado.fim ? 'hidden' : ''}">
                <div class="add-input-wrap">
                    <input type="text" id="social-input" placeholder="Digite o nome de um Khosō descoberto..." autocomplete="off" />
                    <div id="social-sug" class="sugestoes"></div>
                </div>
                <button id="social-btn" class="btn">Tentar</button>
            </div>
            <div class="guesses">${cabecalho}${linhas}</div>
            ${estado.fim ? resultadoHtml() : ''}`;
        wire();
    }

    function resultadoHtml() {
        const t = estado.alvo;
        return `<div class="social-resultado ${estado.venceu ? 'venceu' : 'perdeu'}">
            <img src="${Catalogo.imagem(t)}" alt="${t.nome}">
            <h2>${estado.venceu ? 'Acertou!' : 'Fim de jogo'}</h2>
            <p>${estado.venceu ? `Em ${estado.tentativas.length} tentativa(s).` : 'O Khosō era'} <b>${t.nome}</b></p>
            <button id="social-novo" class="btn">Novo Khosō</button>
        </div>`;
    }

    // ── Lógica de palpite ───────────────────────────────────────
    function tentar(nome) {
        if (estado.fim) return;
        const v = nome.trim().toLowerCase();
        const g = POOL.find(p => p.nome.toLowerCase() === v || String(p.numero) === v);
        if (!g) { notificar('Khosō não encontrado entre os descobertos.', 'erro'); return; }
        if (estado.tentativas.some(x => x.numero === g.numero)) { notificar('Você já tentou esse.', 'erro'); return; }

        estado.tentativas.push(g);
        if (g.numero === estado.alvo.numero) { estado.fim = true; estado.venceu = true; }
        else if (estado.tentativas.length >= MAX) { estado.fim = true; }
        render();
    }

    function wire() {
        cont.querySelectorAll('.social-tab').forEach(b => b.addEventListener('click', () => {
            modo = b.dataset.modo; novoJogo(false);
        }));
        const novo = document.getElementById('social-novo');
        if (novo) novo.addEventListener('click', () => novoJogo(true));

        const input = document.getElementById('social-input');
        const sug = document.getElementById('social-sug');
        const btn = document.getElementById('social-btn');
        if (!input) return;

        input.addEventListener('input', () => {
            const v = input.value.trim().toLowerCase();
            sug.innerHTML = '';
            if (!v) return;
            POOL.filter(p => !estado.tentativas.some(x => x.numero === p.numero))
                .filter(p => p.nome.toLowerCase().includes(v))
                .slice(0, 8)
                .forEach(p => {
                    const d = document.createElement('div');
                    d.innerHTML = `<img src="${Catalogo.imagem(p)}"><span>${p.nome}</span>`;
                    d.addEventListener('mousedown', ev => { ev.preventDefault(); input.value = ''; sug.innerHTML = ''; tentar(p.nome); });
                    sug.appendChild(d);
                });
        });
        input.addEventListener('keydown', e => { if (e.key === 'Enter') { sug.innerHTML = ''; tentar(input.value); input.value = ''; } });
        btn.addEventListener('click', () => { tentar(input.value); input.value = ''; });
        document.addEventListener('click', e => { if (e.target !== input) sug.innerHTML = ''; });
    }

    novoJogo(false);
})();
