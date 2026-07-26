/**
 * INDEX.JS — Lógica da página inicial (Início).
 * Mostra estatísticas e um Khosō de destaque entre os já descobertos.
 * Roda sempre na raiz, então as sub-páginas ficam em 'templates/'.
 */
Catalogo.carregar().then(lista => {
    document.getElementById('stat-total').textContent = lista.length;

    const descobertos = lista.filter(p => Catalogo.estaDescoberto(p.numero));
    document.getElementById('stat-descobertos').textContent = descobertos.length;
    
    const pct = lista.length ? Math.round((descobertos.length / lista.length) * 100) : 0;
    const progressFill = document.getElementById('progress-fill');
    const progressPercent = document.getElementById('progress-percent');
    if (progressFill && progressPercent) {
        // setTimeout para dar tempo do CSS carregar e a animação ocorrer
        setTimeout(() => {
            progressFill.style.width = pct + '%';
            progressPercent.textContent = pct + '%';
        }, 100);
    }

    renderDistribuicao(descobertos);

    const box = document.getElementById('destaque-conteudo');

    if (!descobertos.length) {
        box.innerHTML =
            '<p class="destaque-desc">Você ainda não descobriu nenhum Khosō. ' +
            'Vá até a <a href="templates/khosodex.html" style="color:var(--primary)">Khosōdex</a> ' +
            'e importe o arquivo de liberados que o mestre te enviar.</p>';
        return;
    }

    // Destaque do dia: determinístico pela data, entre os descobertos
    const hoje = new Date();
    const seed = hoje.getFullYear() * 1000 + (hoje.getMonth() + 1) * 50 + hoje.getDate();
    const p = descobertos[seed % descobertos.length];

    const badges = (p.elementos || []).map(e =>
        `<span class="type-badge" style="background:${elCor(e)}">${elNome(e)}</span>`
    ).join('');

    box.innerHTML =
        `<img src="${Catalogo.imagem(p)}" alt="${p.nome}">` +
        `<div class="destaque-nome">${p.nome}</div>` +
        `<div class="destaque-badges">${badges}</div>` +
        `<p class="destaque-desc">${p.descricao || ''}</p>` +
        `<a class="cta" href="templates/khosodex.html">Ver Khosōdex →</a>`;
});

// Mini-estatísticas: distribuição dos descobertos por raridade e elemento
function renderDistribuicao(desc) {
    const el = document.getElementById('inicio-distrib');
    if (!el) return;
    if (!desc.length) { el.innerHTML = ''; return; }

    const rar = {}, els = {};
    desc.forEach(p => {
        rar[p.raridade] = (rar[p.raridade] || 0) + 1;
        (p.elementos || []).forEach(e => { els[e] = (els[e] || 0) + 1; });
    });

    const rarOrdem = ['inicial', 'comum', 'mitico', 'lendario'];
    const rarChips = rarOrdem.filter(r => rar[r]).map(r => {
        const info = raridadeInfo(r);
        return `<div class="distrib-item" style="border-left-color:${info.cor}">
            <span>${info.nome}</span>
            <b style="color:${info.cor}">${rar[r]}</b>
        </div>`;
    }).join('');

    const elChips = Object.entries(els).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, c]) => {
        const e = window.ELEMENTOS[k] || {};
        return `<div class="distrib-item">
            <span class="distrib-label"><span class="distrib-orb" style="--c1:${e.cor};--c2:${e.cor2}"></span>${elNome(k)}</span>
            <b>${c}</b>
        </div>`;
    }).join('');

    el.innerHTML = `
        <h2 class="inicio-section-tit">Seus Descobertos em Detalhes</h2>
        <div class="distrib-container">
            <div class="distrib-box">
                <h3>Por Raridade</h3>
                <div class="distrib-list">${rarChips}</div>
            </div>
            <div class="distrib-box">
                <h3>Por Elemento</h3>
                <div class="distrib-list">${elChips}</div>
            </div>
        </div>`;
}
