/**
 * KHOSODEX.JS — Khosōdex com mecânica de DESCOBERTA (estático).
 *
 * Mostra todos os Khosōs do catálogo; os não descobertos ficam como card
 * escuro/"?". O jogador importa o JSON de liberados que o mestre distribui
 * para revelar. A partir dos revelados, pode adicionar à Coleção.
 * (O backup geral do progresso fica no Exportar/Importar do menu.)
 */

const grid = document.getElementById('khosodex-list');
const inputBusca = document.getElementById('khoso-input');
const filtroEl = document.getElementById('filtro-elemento');
const filtroGen = document.getElementById('filtro-geracao');
const filtroRar = document.getElementById('filtro-raridade');
const btnLimpar = document.getElementById('btn-limpar');
const btnImport = document.getElementById('btn-importar');
const inputFile = document.getElementById('import-file');
const contador = document.getElementById('khosodex-contador');

let CATALOGO = [];
let novos = []; // números recém-liberados (para animar)

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

function preencherFiltroGeracao(lista) {
    // Re-seleciona caso a variável global tenha falhado no carregamento inicial
    const select = filtroGen || document.getElementById('filtro-geracao');
    if (!select) return;

    // Limpa opções antigas, mantendo apenas a primeira ("Todas as gerações")
    while (select.options.length > 1) {
        select.remove(1);
    }

    const gens = Catalogo.getGeracoesExistentes(lista);
    gens.forEach(g => {
        const o = document.createElement('option');
        o.value = g;
        o.textContent = `Geração ${g}`;
        select.appendChild(o);
    });
}

function imagemDe(p) { return Catalogo.imagem(p); }

function cardBloqueado(p) {
    const card = document.createElement('div');
    card.className = 'khoso-card bloqueado';
    card.innerHTML = `
        <div class="img-container"><span class="lock-interrogacao">?</span></div>
        <div class="info">
            <span class="number">N.º ${String(p.numero).padStart(3, '0')}</span>
            <h3 class="name">Desconhecido</h3>
            <span class="type">Não descoberto</span>
        </div>`;
    return card;
}

function adicionarParticulas(elemento, cor) {
    for (let i = 0; i < 15; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 4 + 2 + 'px';
        p.style.width = size;
        p.style.height = size;
        p.style.backgroundColor = cor;
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.setProperty('--x', (Math.random() * 100 - 50) + 'px');
        p.style.setProperty('--y', (Math.random() * -100 - 20) + 'px');
        p.style.animation = `particleFloat ${Math.random() * 2 + 2}s infinite ease-out`;
        p.style.animationDelay = Math.random() * 5 + 's';
        elemento.appendChild(p);
    }
}

function cardRevelado(p) {
    const card = document.createElement('div');
    card.className = 'khoso-card revelado';
    card.style.cursor = 'pointer';
    if (novos.includes(p.numero)) card.classList.add('revelar');

    card.addEventListener('click', (e) => {
        // Não redireciona se clicar no botão de coleção
        if (!e.target.closest('.btn-colecao')) {
            window.location.href = `detalhes.html?n=${p.numero}`;
        }
    });

    const cores = p.elementos.map(e => elCor(e));
    card.style.borderRadius = '15px'; // Bordas arredondadas garantidas

    if (cores.length > 1) {
        card.style.border = '3px solid transparent';
        card.style.backgroundImage = `linear-gradient(#222, #222), linear-gradient(135deg, ${cores[0]}, ${cores[1]}, ${cores[0]}, ${cores[1]})`;
        card.style.backgroundOrigin = 'border-box';
        card.style.backgroundClip = 'padding-box, border-box';
        card.style.backgroundSize = '400% 400%';
        card.style.animation = 'borderRotate 6s ease infinite';
        card.style.boxShadow = `0 0 15px ${cores[0]}44`; // Glow suave com 44 (transparência)
    } else {
        card.style.borderColor = cores[0];
    }

    // Efeito de partículas + holográfico para lendários
    if (p.raridade === 'lendario') {
        card.classList.add('holo');
        adicionarParticulas(card, cores[0]);
    }

    const badges = (p.elementos || []).map(e =>
        `<span class="type-badge" style="background:${elCor(e)}">${elNome(e)}</span>`
    ).join('');

    const rar = raridadeInfo(p.raridade);

    card.innerHTML = `
        <div class="img-container"><img src="${imagemDe(p)}" alt="${p.nome}"></div>
        <div class="info">
            <span class="number">N.º ${String(p.numero).padStart(3, '0')}</span>
            <h3 class="name">${Catalogo.apelidoOuNome(p)}</h3>
            <div class="badges">${badges}</div>
            <span class="raridade" style="color:${rar.cor}">${rar.estrelas} ${rar.nome}</span>
            <button class="btn-colecao" data-num="${p.numero}">
                + Coleção
            </button>
        </div>`;
    return card;
}

function render() {
    const termo = (inputBusca.value || '').toLowerCase().trim();
    const fEl = filtroEl.value;
    const fRar = filtroRar.value;
    const fGen = filtroGen ? filtroGen.value : '';
    const filtrando = termo || fEl || fRar || fGen;

    grid.innerHTML = '';

    CATALOGO.forEach(p => {
        const descoberto = Catalogo.estaDescoberto(p.numero);

        if (!filtrando) {
            grid.appendChild(descoberto ? cardRevelado(p) : cardBloqueado(p));
            return;
        }
        // Ao filtrar, bloqueados são ignorados (não têm dados visíveis)
        if (!descoberto) return;
        if (termo && !(p.nome.toLowerCase().includes(termo) || String(p.numero) === termo)) return;
        if (fEl && !(p.elementos || []).includes(fEl)) return;
        if (fRar && p.raridade !== fRar) return;
        if (fGen && String(p.geracao || 1) !== String(fGen)) return;

        grid.appendChild(cardRevelado(p));
    });

    if (!grid.children.length) {
        grid.innerHTML = '<p class="khosodex-vazio">Nenhum Khosō encontrado.</p>';
    }
    atualizarContador();
}

function atualizarContador() {
    if (!contador) return;
    const total = CATALOGO.length;
    const desc = CATALOGO.filter(p => Catalogo.estaDescoberto(p.numero)).length;
    contador.innerHTML = `<b>${desc}</b> / ${total} descobertos`;
}

// ── Eventos ─────────────────────────────────────────────────────
grid.addEventListener('click', e => {
    const btn = e.target.closest('.btn-colecao');
    if (!btn) return;
    
    // Impede que o clique no botão acione o card e redirecione
    e.stopPropagation();
    
    const num = Number(btn.dataset.num);
    const p = CATALOGO.find(x => x.numero === num);
    
    Catalogo.addColecao(num);
    notificar(`${p ? p.nome : 'Khosō'} adicionado à coleção!`, 'ok');
});

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
            const antes = new Set(Catalogo.getDescobertos());
            Catalogo.liberar(nums);
            novos = Catalogo.getDescobertos().filter(n => !antes.has(n));
            const qtdNovos = novos.length;
            render();
            novos = [];
            notificar(`${qtdNovos || nums.length} Khosōs liberados.`, 'ok');
        } catch (err) {
            notificar('Arquivo inválido. Use o JSON de liberados do mestre.', 'erro');
        }
        inputFile.value = '';
    };
    reader.readAsText(file);
});

[inputBusca, filtroEl, filtroRar, filtroGen].filter(Boolean).forEach(el => el.addEventListener('input', render));
filtroEl.addEventListener('change', render);
if (filtroRar) filtroRar.addEventListener('change', render);
if (filtroGen) filtroGen.addEventListener('change', render);
btnLimpar.addEventListener('click', () => {
    inputBusca.value = ''; filtroEl.value = ''; filtroRar.value = ''; if (filtroGen) filtroGen.value = '';
    render();
});

// ── Início ──────────────────────────────────────────────────────
preencherFiltros();
Catalogo.carregar().then(lista => {
    CATALOGO = lista.slice().sort((a, b) => a.numero - b.numero);
    preencherFiltroGeracao(CATALOGO);
    render();
});
