/**
 * COLECAO.JS — Coleção do jogador (Khosōs capturados).
 *
 * Mostra os Khosōs que o jogador adicionou à coleção (localStorage) e permite
 * adicionar por nome ou número, com autocomplete. Só dá para adicionar Khosōs
 * que já foram DESCOBERTOS (revelados na Khosōdex).
 */

const grid      = document.getElementById('colecao-grid');
const input     = document.getElementById('add-input');
const sugestoes = document.getElementById('add-sugestoes');
const btnAdd    = document.getElementById('add-btn');
const contador  = document.getElementById('colecao-contador');

let CAT = [];

function fmtNum(n) { return 'N.º ' + String(n).padStart(3, '0'); }

function cardColecao(p) {
    const card = document.createElement('div');
    card.className = 'khoso-card revelado';
    card.style.position = 'relative';
    card.style.cursor = 'pointer';
    card.style.borderColor = elCor(p.elementos[0]);
    if (p.raridade === 'lendario') card.classList.add('holo');

    const badges = (p.elementos || []).map(e =>
        `<span class="type-badge" style="background:${elCor(e)}">${elNome(e)}</span>`
    ).join('');
    const rar = raridadeInfo(p.raridade);
    const naEq = Catalogo.naEquipe(p.numero);

    card.innerHTML = `
        <button class="card-remover" data-num="${p.numero}" title="Remover da coleção">&times;</button>
        <div class="img-container"><img src="${Catalogo.imagem(p)}" alt="${p.nome}"></div>
        <div class="info">
            <span class="number">${fmtNum(p.numero)}</span>
            <h3 class="name">${Catalogo.apelidoOuNome(p)}</h3>
            <div class="badges">${badges}</div>
            <span class="raridade" style="color:${rar.cor}">${rar.estrelas} ${rar.nome}</span>
            <button class="btn-colecao btn-equipe${naEq ? ' ativo' : ''}" data-num="${p.numero}">${naEq ? 'Na equipe' : '+ Equipe'}</button>
        </div>`;

    card.addEventListener('click', e => {
        if (e.target.closest('button')) return;
        window.location.href = `detalhes.html?n=${p.numero}`;
    });
    return card;
}

function render() {
    const itens = Catalogo.getColecao()
        .map(n => CAT.find(p => p.numero === n))
        .filter(Boolean)
        .sort((a, b) => a.numero - b.numero);

    grid.innerHTML = '';
    if (!itens.length) {
        grid.innerHTML = '<p class="lista-vazia">Sua coleção está vazia. Adicione Khosōs descobertos pelo nome ou número.</p>';
    } else {
        itens.forEach(p => grid.appendChild(cardColecao(p)));
    }
    if (contador) contador.innerHTML = `<b>${itens.length}</b> capturados`;
}

// Candidatos: descobertos e ainda não na coleção
function candidatos() {
    return CAT.filter(p => Catalogo.estaDescoberto(p.numero) && !Catalogo.naColecao(p.numero));
}

function adicionar(p) {
    Catalogo.addColecao(p.numero);
    notificar(`${p.nome} adicionado à coleção.`, 'ok');
    input.value = ''; sugestoes.innerHTML = '';
    render();
}

function tentarAdicionarTexto() {
    const v = input.value.trim().toLowerCase();
    if (!v) return;
    const p = CAT.find(x => String(x.numero) === v || x.nome.toLowerCase() === v);
    if (!p) { notificar('Khosō não encontrado.', 'erro'); return; }
    if (!Catalogo.estaDescoberto(p.numero)) { notificar('Você ainda não descobriu esse Khosō.', 'erro'); return; }
    if (Catalogo.naColecao(p.numero)) { notificar('Esse Khosō já está na sua coleção.', 'erro'); return; }
    adicionar(p);
}

// ── Eventos ─────────────────────────────────────────────────────
grid.addEventListener('click', e => {
    // Botão "+ Equipe" / "Na equipe" (adiciona direto da coleção)
    const btnEq = e.target.closest('.btn-equipe');
    if (btnEq) {
        e.stopPropagation();
        const num = Number(btnEq.dataset.num);
        if (Catalogo.naEquipe(num)) {
            Catalogo.removeEquipe(num);
            notificar('Removido da equipe.');
        } else {
            const r = Catalogo.addEquipe(num);
            if (!r.ok) { notificar(r.msg, 'erro'); return; }
            notificar('Entrou na equipe.', 'ok');
        }
        render();
        return;
    }
    // Botão remover da coleção
    const btn = e.target.closest('.card-remover');
    if (!btn) return;
    e.stopPropagation();
    Catalogo.removeColecao(Number(btn.dataset.num));
    notificar('Removido da coleção.');
    render();
});

input.addEventListener('input', () => {
    const v = input.value.trim().toLowerCase();
    sugestoes.innerHTML = '';
    if (!v) return;
    candidatos()
        .filter(p => p.nome.toLowerCase().includes(v) || String(p.numero).includes(v))
        .slice(0, 8)
        .forEach(p => {
            const d = document.createElement('div');
            d.innerHTML = `<img src="${Catalogo.imagem(p)}"><span>${p.nome}</span><span class="sug-num">${fmtNum(p.numero)}</span>`;
            d.addEventListener('mousedown', ev => { ev.preventDefault(); adicionar(p); });
            sugestoes.appendChild(d);
        });
});
input.addEventListener('keydown', e => { if (e.key === 'Enter') { sugestoes.innerHTML = ''; tentarAdicionarTexto(); } });
btnAdd.addEventListener('click', tentarAdicionarTexto);
document.addEventListener('click', e => { if (e.target !== input) sugestoes.innerHTML = ''; });

// ── Início ──────────────────────────────────────────────────────
Catalogo.carregar().then(l => { CAT = l; render(); });
