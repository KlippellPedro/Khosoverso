/**
 * POKEDEX.JS — Pokédex com mecânica de DESCOBERTA (versão estática).
 *
 * - Mostra TODOS os Pokémon do catálogo (data/pokedex.json).
 * - Os não descobertos aparecem como card escuro/"???".
 * - O mestre distribui um JSON de "liberados"; o jogador IMPORTA aqui para
 *   revelar (igual ao importar/exportar da Ficha). Estado fica no localStorage.
 * - O jogador pode adicionar Pokémon revelados à sua Coleção.
 */

const grid       = document.getElementById('pokedex-list');
const inputBusca = document.getElementById('pokemon-input');
const filtroEl   = document.getElementById('filtro-elemento');
const filtroRar  = document.getElementById('filtro-raridade');
const btnLimpar  = document.getElementById('btn-limpar');
const btnImport  = document.getElementById('btn-importar');
const btnExport  = document.getElementById('btn-exportar');
const inputFile  = document.getElementById('import-file');
const contador   = document.getElementById('pokedex-contador');

let CATALOGO = [];

// ── Toast simples ───────────────────────────────────────────────
function notificar(msg, erro) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = 'toast-show' + (erro ? ' toast-erro' : '');
    clearTimeout(notificar._t);
    notificar._t = setTimeout(() => { toast.className = ''; }, 3200);
}

// ── Preenche os selects de filtro a partir de elementos.js ──────
function preencherFiltros() {
    Object.keys(window.ELEMENTOS).forEach(k => {
        const o = document.createElement('option');
        o.value = k; o.textContent = window.ELEMENTOS[k].nome;
        filtroEl.appendChild(o);
    });
    Object.keys(window.RARIDADES).forEach(k => {
        const o = document.createElement('option');
        o.value = k; o.textContent = window.RARIDADES[k].nome;
        filtroRar.appendChild(o);
    });
}

function imagemDe(p) {
    return p.imagem
        ? 'statics/uploads/pokemon/' + p.imagem
        : 'statics/uploads/utilidade/poke-ball.png';
}

// ── Cards ───────────────────────────────────────────────────────
function cardBloqueado(p) {
    const card = document.createElement('div');
    card.className = 'pokemon-card bloqueado';
    card.innerHTML = `
        <div class="img-container">
            <span class="lock-interrogacao">?</span>
        </div>
        <div class="info">
            <span class="number">#${String(p.numero).padStart(3, '0')}</span>
            <h3 class="name">???</h3>
            <span class="type">Não descoberto</span>
        </div>`;
    return card;
}

function cardRevelado(p) {
    const card = document.createElement('div');
    card.className = 'pokemon-card revelado';
    card.style.borderColor = elCor(p.elementos[0]);

    const badges = (p.elementos || []).map(e =>
        `<span class="type-badge" style="background:${elCor(e)}">${elNome(e)}</span>`
    ).join('');

    const rar = raridadeInfo(p.raridade);
    const naCol = Catalogo.naColecao(p.numero);

    card.innerHTML = `
        <div class="img-container">
            <img src="${imagemDe(p)}" alt="${p.nome}">
        </div>
        <div class="info">
            <span class="number">#${String(p.numero).padStart(3, '0')}</span>
            <h3 class="name">${p.nome}</h3>
            <div class="badges">${badges}</div>
            <span class="raridade" style="color:${rar.cor}">${rar.estrelas} ${rar.nome}</span>
            <button class="btn-colecao${naCol ? ' ativo' : ''}" data-num="${p.numero}">
                ${naCol ? '✓ Na coleção' : '+ Coleção'}
            </button>
        </div>`;
    return card;
}

// ── Render principal ────────────────────────────────────────────
function render() {
    const termo = (inputBusca.value || '').toLowerCase().trim();
    const fEl   = filtroEl.value;
    const fRar  = filtroRar.value;
    const filtrando = termo || fEl || fRar;

    grid.innerHTML = '';

    CATALOGO.forEach(p => {
        const descoberto = Catalogo.estaDescoberto(p.numero);

        // Sem filtro: mostra tudo (bloqueado ou revelado)
        if (!filtrando) {
            grid.appendChild(descoberto ? cardRevelado(p) : cardBloqueado(p));
            return;
        }

        // Filtrando: bloqueados não têm dados, então são ignorados
        if (!descoberto) return;
        if (termo && !(p.nome.toLowerCase().includes(termo) || String(p.numero) === termo)) return;
        if (fEl && !(p.elementos || []).includes(fEl)) return;
        if (fRar && p.raridade !== fRar) return;

        grid.appendChild(cardRevelado(p));
    });

    if (!grid.children.length) {
        grid.innerHTML = '<p class="pokedex-vazio">Nenhum Pokémon encontrado.</p>';
    }
    atualizarContador();
}

function atualizarContador() {
    if (!contador) return;
    const total = CATALOGO.length;
    const desc = CATALOGO.filter(p => Catalogo.estaDescoberto(p.numero)).length;
    contador.textContent = `${desc} / ${total} descobertos`;
}

// ── Eventos ─────────────────────────────────────────────────────
grid.addEventListener('click', e => {
    const btn = e.target.closest('.btn-colecao');
    if (!btn) return;
    const num = Number(btn.dataset.num);
    if (Catalogo.naColecao(num)) {
        Catalogo.removeColecao(num);
        notificar('Removido da coleção.');
    } else {
        Catalogo.addColecao(num);
        notificar('Adicionado à coleção! 🎒');
    }
    render();
});

// Importar JSON de liberados (do mestre)
btnImport.addEventListener('click', () => inputFile.click());
inputFile.addEventListener('change', ev => {
    const file = ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            const nums = Array.isArray(data) ? data : (data.liberados || []);
            if (!nums.length) throw new Error('vazio');
            Catalogo.liberar(nums);
            render();
            notificar(`${nums.length} Pokémon liberados! ✨`);
        } catch (err) {
            notificar('Arquivo inválido. Use o JSON de liberados do mestre.', true);
        }
        inputFile.value = '';
    };
    reader.readAsText(file);
});

// Exportar o que você já liberou (backup)
btnExport.addEventListener('click', () => {
    const nums = Catalogo.getDescobertos();
    if (!nums.length) { notificar('Você ainda não liberou nenhum Pokémon.', true); return; }
    const pacote = { tipo: 'pokemania-liberados', liberados: nums };
    const blob = new Blob([JSON.stringify(pacote, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'meus_pokemon_liberados.json';
    a.click();
    notificar('Backup exportado!');
});

[inputBusca, filtroEl, filtroRar].forEach(el => el.addEventListener('input', render));
filtroEl.addEventListener('change', render);
filtroRar.addEventListener('change', render);
btnLimpar.addEventListener('click', () => {
    inputBusca.value = ''; filtroEl.value = ''; filtroRar.value = '';
    render();
});

// ── Início ──────────────────────────────────────────────────────
preencherFiltros();
Catalogo.carregar().then(lista => {
    CATALOGO = lista.slice().sort((a, b) => a.numero - b.numero);
    render();
});
