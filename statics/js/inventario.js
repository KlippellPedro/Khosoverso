/**
 * INVENTARIO.JS — Mochila do jogador (itens relacionados aos Khosōs).
 *
 * Lê o catálogo de itens do mestre (data/itens.json). O jogador controla a
 * quantidade de cada item (− / +), salva no localStorage e entra no save de
 * progresso. Filtro por categoria.
 */
(async function () {
    const cont = document.getElementById('inventario-conteudo');
    const base = (window.Catalogo && Catalogo.base) || '';

    let data;
    try {
        data = await fetch(base + 'data/itens.json').then(r => r.json());
    } catch (e) {
        cont.innerHTML = '<p class="lista-vazia">Não foi possível carregar os itens.</p>';
        return;
    }

    const ITENS = data.itens || [];
    const CATS = data.categorias || {};
    let filtro = 'todos';

    const icone = it => it.icone ? base + 'statics/uploads/itens/' + it.icone : '';
    const catInfo = c => CATS[c] || { nome: c, cor: '#888' };

    function cardItem(it) {
        const q = Catalogo.getItemQtd(it.id);
        const ci = catInfo(it.categoria);
        return `<div class="inv-card ${q > 0 ? 'tem' : ''}" style="--cc:${ci.cor}">
            <div class="inv-icone">${it.icone ? `<img src="${icone(it)}" alt="">` : ''}</div>
            <div class="inv-body">
                <div class="inv-top">
                    <span class="inv-nome">${it.nome}</span>
                    <span class="inv-cat" style="background:${ci.cor}">${ci.nome}</span>
                </div>
                <p class="inv-desc">${it.descricao || ''}</p>
            </div>
            <div class="inv-stepper">
                <button class="inv-btn" data-id="${it.id}" data-d="-1" aria-label="Tirar 1">&minus;</button>
                <input class="inv-qtd" type="text" inputmode="numeric" value="${q}" data-id="${it.id}" aria-label="Quantidade" title="Digite a quantidade">
                <button class="inv-btn" data-id="${it.id}" data-d="1" aria-label="Adicionar 1">+</button>
            </div>
        </div>`;
    }

    function render() {
        const lista = filtro === 'todos' ? ITENS : ITENS.filter(i => i.categoria === filtro);
        const totalUnid = ITENS.reduce((s, i) => s + Catalogo.getItemQtd(i.id), 0);
        const totalTipos = ITENS.filter(i => Catalogo.getItemQtd(i.id) > 0).length;

        const chips = ['todos', ...Object.keys(CATS)].map(c => {
            const nome = c === 'todos' ? 'Todos' : catInfo(c).nome;
            const cor = c === 'todos' ? 'var(--primary)' : catInfo(c).cor;
            return `<button class="inv-chip ${filtro === c ? 'ativo' : ''}" data-cat="${c}" style="--cc:${cor}">${nome}</button>`;
        }).join('');

        const cards = lista.map(cardItem).join('') || '<p class="lista-vazia">Nenhum item nesta categoria.</p>';

        cont.innerHTML = `
            <p class="pokedex-contador"><b>${totalUnid}</b> itens &middot; ${totalTipos} tipos diferentes</p>
            <p class="inv-dica">Use − e + ou digite a quantidade que você tem de cada item.</p>
            <div class="inv-filtros">${chips}</div>
            <div class="inv-grid">${cards}</div>`;
        wire();
    }

    function wire() {
        cont.querySelectorAll('.inv-chip').forEach(b => b.addEventListener('click', () => { filtro = b.dataset.cat; render(); }));
        cont.querySelectorAll('.inv-btn').forEach(b => b.addEventListener('click', () => {
            const id = Number(b.dataset.id), d = Number(b.dataset.d);
            Catalogo.setItemQtd(id, Catalogo.getItemQtd(id) + d);
            render();
        }));
        cont.querySelectorAll('.inv-qtd').forEach(inp => {
            const aplicar = () => {
                const q = parseInt(inp.value, 10);
                if (!isNaN(q)) { Catalogo.setItemQtd(Number(inp.dataset.id), q); render(); }
            };
            inp.addEventListener('change', aplicar);
            inp.addEventListener('keydown', e => { if (e.key === 'Enter') aplicar(); });
        });
    }

    render();
})();
