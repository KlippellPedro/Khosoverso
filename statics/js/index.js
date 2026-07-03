/**
 * INDEX.JS — Lógica da página inicial (Início).
 * Mostra estatísticas e um Pokémon de destaque entre os já descobertos.
 * Roda sempre na raiz, então as sub-páginas ficam em 'templates/'.
 */
Catalogo.carregar().then(lista => {
    document.getElementById('stat-total').textContent = lista.length;

    const descobertos = lista.filter(p => Catalogo.estaDescoberto(p.numero));
    document.getElementById('stat-descobertos').textContent = descobertos.length;
    renderDistribuicao(descobertos);

    const box = document.getElementById('destaque-conteudo');

    if (!descobertos.length) {
        box.innerHTML =
            '<p class="destaque-desc">Você ainda não descobriu nenhum Khosō. ' +
            'Vá até a <a href="templates/pokedex.html" style="color:var(--primary)">Khosōdex</a> ' +
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
        `<a class="cta" href="templates/pokedex.html">Ver Khosōdex →</a>`;
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
        return `<span class="distrib-chip" style="border-color:${info.cor}"><b style="color:${info.cor}">${rar[r]}</b> ${info.nome}</span>`;
    }).join('');

    const elChips = Object.entries(els).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, c]) => {
        const e = window.ELEMENTOS[k] || {};
        return `<span class="distrib-chip"><span class="distrib-orb" style="--c1:${e.cor};--c2:${e.cor2}"></span>${elNome(k)} <b>${c}</b></span>`;
    }).join('');

    el.innerHTML = `
        <h2 class="inicio-distrib-tit">Seus descobertos em números</h2>
        <div class="distrib-grupo"><h3>Por raridade</h3><div class="distrib-chips">${rarChips}</div></div>
        <div class="distrib-grupo"><h3>Por elemento</h3><div class="distrib-chips">${elChips}</div></div>`;
}
