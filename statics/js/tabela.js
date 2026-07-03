/**
 * TABELA.JS — Página Elementos: tabela de efetividade interativa.
 * Lê data/efetividade.json. Mostra legenda, seletor de elemento, painel de
 * fortes/fracos (atacando e defendendo) e a matriz completa colorida.
 */
(async function () {
    const cont = document.getElementById('elementos-view');
    const base = (window.Catalogo && Catalogo.base) || '';

    let data;
    try {
        data = await fetch(base + 'data/efetividade.json').then(r => r.json());
    } catch (e) {
        cont.innerHTML = '<p class="lista-vazia">Não foi possível carregar a tabela de elementos.</p>';
        return;
    }

    const ORDEM = data.ordem;
    const M = data.matriz;
    const EL = window.ELEMENTOS;

    function mult(at, def) {
        // ENERGIA é supremo: x5 contra tudo, imune a tudo (recebe x0)
        if (at === 'energia') return def === 'energia' ? 1 : 5;
        if (def === 'energia') return 0;
        return (M[at] && M[at][def] !== undefined) ? M[at][def] : 1;
    }

    function estilo(m) {
        if (m === 0)    return { bg: '#3f3f46', cor: '#d4d4d8', label: 'x0',  nome: 'Imune' };
        if (m === 0.25) return { bg: '#7f1d2e', cor: '#fecdd3', label: 'x¼', nome: 'Muito resistente' };
        if (m === 0.5)  return { bg: '#b91c3c', cor: '#ffe4e6', label: 'x½', nome: 'Resiste' };
        if (m === 2)    return { bg: '#15803d', cor: '#dcfce7', label: 'x2',  nome: 'Eficaz' };
        if (m === 3)    return { bg: '#166534', cor: '#bbf7d0', label: 'x3',  nome: 'Muito eficaz' };
        if (m >= 5)     return { bg: '#ca8a04', cor: '#fffbe6', label: 'x5',  nome: 'Supremo' };
        if (m >= 4)     return { bg: '#b8860b', cor: '#fff7d6', label: 'x4',  nome: 'Devastador' };
        return { bg: '', cor: 'var(--text-faint)', label: 'x1', nome: 'Normal' };
    }

    function orb(k, cls) {
        const e = EL[k] || { cor: '#888', cor2: '#aaa' };
        return `<span class="el-orb ${cls || ''}" style="--c1:${e.cor};--c2:${e.cor2}"></span>`;
    }

    let selecionado = ORDEM[0];

    function legendaHtml() {
        const itens = [0, 0.25, 0.5, 1, 2, 3, 4].map(m => {
            const s = estilo(m);
            const bg = s.bg || 'var(--bg-input)';
            return `<span class="leg-item"><span class="leg-cor" style="background:${bg}"></span>${s.label} · ${s.nome}</span>`;
        }).join('');
        return `<div class="legenda">${itens}</div>`;
    }

    function seletorHtml() {
        return `<div class="el-seletor">` + ORDEM.map(k => {
            const e = EL[k];
            return `<button class="el-chip${k === selecionado ? ' ativo' : ''}" data-el="${k}">
                ${orb(k)}<span>${e.nome}</span></button>`;
        }).join('') + `</div>`;
    }

    function tags(arr, campo) {
        if (!arr.length) return '<span class="vazio-mini">Nada</span>';
        return arr.map(x => {
            const k = x[campo], e = EL[k], s = estilo(x.m);
            return `<button class="el-tag" data-el="${k}" style="border-color:${e.cor}">
                ${orb(k)}<span>${e.nome}</span><b style="color:${s.bg || 'var(--text-muted)'}">${s.label}</b></button>`;
        }).join('');
    }

    function painelHtml(key) {
        const e = EL[key];
        const atk = ORDEM.map(d => ({ d, m: mult(key, d) })).filter(x => x.m !== 1);
        const fortes = atk.filter(x => x.m > 1).sort((a, b) => b.m - a.m);
        const fracos = atk.filter(x => x.m < 1).sort((a, b) => a.m - b.m);

        const def = ORDEM.map(a => ({ a, m: mult(a, key) })).filter(x => x.m !== 1);
        const recebe = def.filter(x => x.m > 1).sort((a, b) => b.m - a.m);
        const resiste = def.filter(x => x.m < 1).sort((a, b) => a.m - b.m);

        const parent = (data.derivado && data.derivado[key]) || key;
        const ehBase = key === parent || (data.base || []).includes(key);
        const derivadoTxt = key === 'energia'
            ? 'Supremo — Máx: Raio + Tudo'
            : (ehBase ? 'Elemento base' : (EL[parent] ? EL[parent].nome : parent));
        const nota = (data.notas && data.notas[key]) || '';

        return `
            <div class="painel" style="border-top-color:${e.cor}">
                <div class="painel-head">${orb(key, 'el-orb-lg')}<h2 style="color:${e.cor}">${e.nome}</h2></div>
                <div class="painel-meta">
                    <span class="meta-item">Derivado: <b>${derivadoTxt}</b></span>
                    ${nota ? `<span class="meta-nota">${nota}</span>` : ''}
                </div>
                <div class="painel-grid">
                    <div class="painel-bloco">
                        <span class="bloco-tit">Atacando</span>
                        <h3>Causa mais dano em</h3><div class="tags">${tags(fortes, 'd')}</div>
                        <h3>Tem pouco efeito contra</h3><div class="tags">${tags(fracos, 'd')}</div>
                    </div>
                    <div class="painel-bloco">
                        <span class="bloco-tit">Defendendo</span>
                        <h3>Sofre mais de</h3><div class="tags">${tags(recebe, 'a')}</div>
                        <h3>Resiste a</h3><div class="tags">${tags(resiste, 'a')}</div>
                    </div>
                </div>
            </div>`;
    }

    function matrizHtml() {
        const th = k => `<th data-el="${k}" class="${k === selecionado ? 'sel' : ''}">${orb(k)}<span class="th-nome">${EL[k].nome}</span></th>`;
        const head = `<th class="canto">At \\ Def</th>` + ORDEM.map(th).join('');
        const rows = ORDEM.map(a => {
            const cells = ORDEM.map(d => {
                const m = mult(a, d), s = estilo(m);
                const sel = (a === selecionado || d === selecionado) ? ' sel' : '';
                const bg = s.bg ? `background:${s.bg};` : '';
                return `<td class="cel${sel}" style="${bg}color:${s.cor}" title="${EL[a].nome} → ${EL[d].nome}: ${s.label} (${s.nome})">${m === 1 ? '' : s.label}</td>`;
            }).join('');
            return `<tr>${th(a)}${cells}</tr>`;
        }).join('');
        return `<div class="matriz-wrap"><table class="matriz"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }

    function render() {
        cont.innerHTML = legendaHtml() + seletorHtml() + painelHtml(selecionado) + matrizHtml();
        cont.querySelectorAll('[data-el]').forEach(el => {
            el.addEventListener('click', () => {
                selecionado = el.getAttribute('data-el');
                render();
                const pnl = cont.querySelector('.painel');
                if (pnl) pnl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    }

    render();
})();
