/**
 * EQUIPE.JS — Equipe (até 6 Khosōs), com barra de vida e cobertura de fraquezas.
 * Só entram Khosōs da coleção. HP e itens equipados afetam a vida máxima.
 */

const grid      = document.getElementById('equipe-grid');
const input     = document.getElementById('add-input');
const sugestoes = document.getElementById('add-sugestoes');
const btnAdd    = document.getElementById('add-btn');
const contador  = document.getElementById('equipe-contador');
const coberturaEl = document.getElementById('equipe-cobertura');

const MAX = 6;
let CAT = [], ITENS = [], EFET = null;

function fmtNum(n) { return 'N.º ' + String(n).padStart(3, '0'); }

function vidaMax(p) {
    let v = (p.stats || {}).vida || 0;
    Catalogo.getEquipados(p.numero).forEach(id => {
        const it = ITENS.find(i => i.id === id);
        if (it && it.efeito && it.efeito.stat === 'vida') v += it.efeito.valor;
    });
    return v;
}
function hpAtual(p) {
    const h = Catalogo.getHp(p.numero);
    const max = vidaMax(p);
    return (h === undefined) ? max : Math.min(h, max);
}
function multEl(at, def) {
    if (!EFET) return 1;
    if (at === 'energia') return def === 'energia' ? 1 : 5;
    if (def === 'energia') return 0;
    const m = EFET.matriz[at];
    return (m && m[def] !== undefined) ? m[def] : 1;
}

function cardEquipe(p) {
    const card = document.createElement('div');
    card.className = 'pokemon-card revelado';
    card.style.position = 'relative';
    card.style.borderColor = elCor(p.elementos[0]);
    if (p.raridade === 'lendario') card.classList.add('holo');

    const badges = (p.elementos || []).map(e =>
        `<span class="type-badge" style="background:${elCor(e)}">${elNome(e)}</span>`).join('');
    const rar = raridadeInfo(p.raridade);
    const max = vidaMax(p), hp = hpAtual(p);
    const pct = max ? Math.round(hp / max * 100) : 0;
    const corHp = pct > 50 ? '#4ade80' : pct > 20 ? '#f59e0b' : '#ef4444';

    card.innerHTML = `
        <button class="card-remover" data-num="${p.numero}" title="Tirar da equipe">&times;</button>
        <div class="img-container" data-ver="${p.numero}" style="cursor:pointer"><img src="${Catalogo.imagem(p)}" alt="${p.nome}"></div>
        <div class="info">
            <span class="number">${fmtNum(p.numero)}</span>
            <h3 class="name">${Catalogo.apelidoOuNome(p)}</h3>
            <div class="badges">${badges}</div>
            <span class="raridade" style="color:${rar.cor}">${rar.estrelas} ${rar.nome}</span>
            <div class="hp-linha">
                <div class="hp-topo"><span>VIDA</span><span class="hp-max">máx ${max}</span></div>
                <div class="hp-bar"><div class="hp-fill" style="width:${pct}%;background:${corHp}"></div></div>
                <div class="hp-ctrl">
                    <button class="hp-btn" data-num="${p.numero}" data-d="-1" aria-label="Tirar 1 de vida">−</button>
                    <input class="hp-input" type="text" inputmode="numeric" value="${hp}" data-num="${p.numero}" title="Vida atual — digite um número (ou -28 para tirar) e Enter">
                    <button class="hp-btn" data-num="${p.numero}" data-d="1" aria-label="Somar 1 de vida">+</button>
                </div>
            </div>
        </div>`;
    return card;
}

function slotVazio(i) {
    const div = document.createElement('div');
    div.className = 'slot-vazio';
    div.innerHTML = `<span class="slot-num">SLOT ${i + 1}</span><span class="slot-hint">vazio</span>`;
    return div;
}

function renderCobertura() {
    if (!coberturaEl) return;
    const team = Catalogo.getEquipe().map(n => CAT.find(p => p.numero === n)).filter(Boolean);
    if (!team.length || !EFET) { coberturaEl.innerHTML = ''; return; }
    const cont = {};
    EFET.ordem.filter(at => at !== 'energia').forEach(at => {
        let c = 0;
        team.forEach(p => {
            let m = 1; (p.elementos || []).forEach(e => { m *= multEl(at, e); });
            if (m > 1) c++;
        });
        if (c > 0) cont[at] = c;
    });
    const arr = Object.entries(cont).sort((a, b) => b[1] - a[1]);
    if (!arr.length) { coberturaEl.innerHTML = '<div class="cob-box"><h3>Cobertura do time</h3><p class="def-vazio">Nenhuma fraqueza em comum. Time equilibrado!</p></div>'; return; }
    const chips = arr.map(([at, c]) => {
        const el = window.ELEMENTOS[at] || {};
        const alerta = c >= Math.ceil(team.length / 2) ? ' alerta' : '';
        return `<span class="cob-chip${alerta}"><span class="def-orb" style="--c1:${el.cor};--c2:${el.cor2}"></span>${elNome(at)}<b>${c}/${team.length}</b></span>`;
    }).join('');
    coberturaEl.innerHTML = `<div class="cob-box"><h3>Cobertura do time — fraquezas</h3><p class="cob-sub">Quantos membros são fracos a cada elemento:</p><div class="cob-chips">${chips}</div></div>`;
}

function render() {
    const nums = Catalogo.getEquipe();
    grid.innerHTML = '';
    for (let i = 0; i < MAX; i++) {
        const n = nums[i];
        const p = (n !== undefined) ? CAT.find(x => x.numero === n) : null;
        grid.appendChild(p ? cardEquipe(p) : slotVazio(i));
    }
    if (contador) contador.innerHTML = `<b>${nums.length}</b> / ${MAX}`;
    renderCobertura();
}

function candidatos() {
    return CAT.filter(p => Catalogo.naColecao(p.numero) && !Catalogo.naEquipe(p.numero));
}
function adicionar(p) {
    const r = Catalogo.addEquipe(p.numero);
    if (!r.ok) { notificar(r.msg, 'erro'); return; }
    notificar(`${p.nome} entrou na equipe.`, 'ok');
    input.value = ''; sugestoes.innerHTML = ''; render();
}
function tentarAdicionarTexto() {
    const v = input.value.trim().toLowerCase();
    if (!v) return;
    const p = CAT.find(x => String(x.numero) === v || x.nome.toLowerCase() === v);
    if (!p) { notificar('Khosō não encontrado.', 'erro'); return; }
    if (!Catalogo.naColecao(p.numero)) { notificar('Esse Khosō não está na sua coleção.', 'erro'); return; }
    if (Catalogo.naEquipe(p.numero)) { notificar('Esse Khosō já está na equipe.', 'erro'); return; }
    adicionar(p);
}

grid.addEventListener('click', e => {
    const ver = e.target.closest('[data-ver]');
    const rm = e.target.closest('.card-remover');
    const hpBtn = e.target.closest('.hp-btn');
    if (hpBtn) {
        const n = Number(hpBtn.dataset.num);
        const p = CAT.find(x => x.numero === n);
        if (hpBtn.dataset.full) Catalogo.setHp(n, vidaMax(p));
        else Catalogo.setHp(n, Math.min(vidaMax(p), Math.max(0, hpAtual(p) + Number(hpBtn.dataset.d))));
        render();
        return;
    }
    if (rm) { Catalogo.removeEquipe(Number(rm.dataset.num)); notificar('Removido da equipe.'); render(); return; }
    if (ver) { window.location.href = `detalhes.html?n=${ver.dataset.ver}`; }
});

// Editar a vida: digite um número (vida atual) ou com sinal (+10 / -28 = delta)
grid.addEventListener('keydown', e => {
    const inp = e.target.closest('.hp-input');
    if (!inp || e.key !== 'Enter') return;
    const n = Number(inp.dataset.num);
    const p = CAT.find(x => x.numero === n);
    if (!p) return;
    const raw = inp.value.trim();
    const num = parseInt(raw, 10);
    if (isNaN(num)) return;
    const novo = /^[+-]/.test(raw) ? hpAtual(p) + num : num; // com sinal = delta; sem sinal = valor exato
    Catalogo.setHp(n, Math.min(vidaMax(p), Math.max(0, novo)));
    render();
});

input.addEventListener('input', () => {
    const v = input.value.trim().toLowerCase();
    sugestoes.innerHTML = '';
    if (!v) return;
    candidatos().filter(p => p.nome.toLowerCase().includes(v) || String(p.numero).includes(v)).slice(0, 8)
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

Promise.all([
    Catalogo.carregar(),
    fetch(Catalogo.base + 'data/itens.json').then(r => r.json()).catch(() => ({ itens: [] })),
    fetch(Catalogo.base + 'data/efetividade.json').then(r => r.json()).catch(() => null),
]).then(([cat, itens, efet]) => {
    CAT = cat; ITENS = itens.itens || []; EFET = efet;
    render();
});
