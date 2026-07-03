(async function () {
    const params = new URLSearchParams(window.location.search);
    const num = Number(params.get('n'));
    const view = document.getElementById('detalhes-view');
    if (!num) { view.innerHTML = '<p>Khosō não especificado.</p>'; return; }

    const catalogo = await Catalogo.carregar();
    const p = Catalogo.porNumero(catalogo, num);
    if (!p || !Catalogo.estaDescoberto(num)) {
        view.innerHTML = '<p>Este Khosō ainda não foi descoberto ou não existe.</p>';
        return;
    }

    const efet = await fetch(Catalogo.base + 'data/efetividade.json').then(r => r.json()).catch(() => null);
    const itensData = await fetch(Catalogo.base + 'data/itens.json').then(r => r.json()).catch(() => ({ itens: [] }));
    const ITENS = itensData.itens || [];
    const REFORCOS = ITENS.filter(i => i.efeito);

    document.title = `Pokémania - ${p.nome}`;

    const descobertos = Catalogo.getDescobertos();
    const navegavel = catalogo.filter(i => descobertos.includes(i.numero)).sort((a, b) => a.numero - b.numero);
    const idx = navegavel.findIndex(i => i.numero === num);
    const prev = navegavel[idx - 1], next = navegavel[idx + 1];

    const cores = p.elementos.map(e => elCor(e));
    const bgDin = cores.length > 1 ? `linear-gradient(90deg, ${cores[0]}, ${cores[1]})` : cores[0];
    const labels = { vida: 'Vida', ataque_m: 'Ataque Mágico', ataque_f: 'Ataque Físico', defesa_m: 'Defesa Mágica', defesa_f: 'Defesa Física', speed: 'Velocidade' };

    function bonuses() {
        const b = {};
        Catalogo.getEquipados(num).forEach(id => {
            const it = ITENS.find(i => i.id === id);
            if (it && it.efeito) b[it.efeito.stat] = (b[it.efeito.stat] || 0) + it.efeito.valor;
        });
        return b;
    }

    function statsHtml() {
        const b = bonuses();
        return Object.entries(p.stats || {}).map(([k, base]) => {
            const bon = b[k] || 0, val = base + bon;
            return `<div class="stat-row">
                <div style="display:flex;justify-content:space-between">
                    <span>${labels[k] || k}</span>
                    <b>${val}${bon ? ` <span class="stat-bonus">+${bon}</span>` : ''}</b>
                </div>
                <div class="stat-bar"><div class="stat-fill" style="width:${Math.min(val / 160 * 100, 100)}%;background:${bgDin}"></div></div>
            </div>`;
        }).join('');
    }

    function equiparHtml() {
        const eq = Catalogo.getEquipados(num);
        const disp = REFORCOS.filter(i => !eq.includes(i.id));
        const equipados = eq.map(id => {
            const it = ITENS.find(i => i.id === id);
            if (!it) return '';
            return `<span class="eq-item">${it.nome} <b>+${it.efeito.valor} ${labels[it.efeito.stat] || it.efeito.stat}</b><button class="eq-rm" data-id="${id}" title="Remover">&times;</button></span>`;
        }).join('') || '<span class="def-vazio">Nenhum item equipado.</span>';
        const add = disp.length ? `<div class="equipar-add">
            <select id="eq-select" class="filtro-select">${disp.map(i => `<option value="${i.id}">${i.nome} (+${i.efeito.valor} ${labels[i.efeito.stat] || i.efeito.stat})</option>`).join('')}</select>
            <button id="eq-btn" class="btn-sec">Equipar</button>
        </div>` : '';
        return `<div class="equipar-box"><h3>Itens de reforço</h3><div class="equipados-lista">${equipados}</div>${add}</div>`;
    }

    function defesaHtml() {
        if (!efet || !efet.matriz) return '';
        const multEl = (at, def) => {
            if (at === 'energia') return def === 'energia' ? 1 : 5;
            if (def === 'energia') return 0;
            const m = efet.matriz[at];
            return (m && m[def] !== undefined) ? m[def] : 1;
        };
        const fmt = m => (m === 0) ? 'x0' : (m < 1 ? 'x1/' + Math.round(1 / m) : 'x' + (Number.isInteger(m) ? m : m.toFixed(1)));
        const perfil = (efet.ordem || []).map(at => {
            if (at === 'energia') return { at, m: 5 };
            let mlt = 1; (p.elementos || []).forEach(e => { mlt *= multEl(at, e); });
            return { at, m: mlt };
        }).filter(x => x.m !== 1);
        const fraco = perfil.filter(x => x.m > 1).sort((a, b) => b.m - a.m);
        const resiste = perfil.filter(x => x.m > 0 && x.m < 1).sort((a, b) => a.m - b.m);
        const imune = perfil.filter(x => x.m === 0);
        const chip = x => {
            const el = window.ELEMENTOS[x.at] || {};
            return `<span class="def-chip"><span class="def-orb" style="--c1:${el.cor || '#888'};--c2:${el.cor2 || '#aaa'}"></span>${elNome(x.at)}<b>${fmt(x.m)}</b></span>`;
        };
        const grupo = (t, arr) => arr.length ? `<div class="def-grupo"><h4>${t}</h4><div class="def-chips">${arr.map(chip).join('')}</div></div>` : '';
        return `<div class="defesa-elemental"><h3>Defesa elemental</h3>${grupo('Fraco contra', fraco)}${grupo('Resiste a', resiste)}${grupo('Imune a', imune)}${(!fraco.length && !resiste.length && !imune.length) ? '<p class="def-vazio">Sem interações elementais notáveis.</p>' : ''}</div>`;
    }

    function evolucaoHtml() {
        const de = p.evolui_de ? catalogo.find(x => x.numero === p.evolui_de) : null;
        const paras = (p.evolui_para || []).map(ev => ({ mon: catalogo.find(x => x.numero === ev.numero), cond: ev.condicao })).filter(x => x.mon);
        if (!de && !paras.length) return '';
        const node = (mon, atual) => {
            const desc = Catalogo.estaDescoberto(mon.numero);
            return `<a class="evo-node${atual ? ' atual' : ''}" ${desc ? `href="detalhes.html?n=${mon.numero}"` : 'style="pointer-events:none"'}>
                <div class="evo-img">${desc ? `<img src="${Catalogo.imagem(mon)}" alt="">` : '<span>?</span>'}</div>
                <span class="evo-nome">${desc ? Catalogo.apelidoOuNome(mon) : '???'}</span>
            </a>`;
        };
        const seta = cond => `<div class="evo-seta"><span>→</span>${cond ? `<small>${cond}</small>` : ''}</div>`;
        let chain = '';
        if (de) chain += node(de, false) + seta('');
        chain += node(p, true);
        if (paras.length === 1) chain += seta(paras[0].cond) + node(paras[0].mon, false);
        else if (paras.length > 1) chain += `<div class="evo-ramos">${paras.map(x => `<div class="evo-ramo">${seta(x.cond)}${node(x.mon, false)}</div>`).join('')}</div>`;
        return `<div class="bloco-detalhe"><h3>Evolução</h3><div class="evo-chain">${chain}</div></div>`;
    }

    function ataquesHtml() {
        const ats = Catalogo.getAtaques(num);
        const tl = { fisico: 'Físico', magico: 'Mágico', status: 'Status' };
        const elOpts = Object.keys(window.ELEMENTOS).map(k => `<option value="${k}">${window.ELEMENTOS[k].nome}</option>`).join('');
        const tipoOpts = [['fisico', 'Físico'], ['magico', 'Mágico'], ['status', 'Status']].map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
        const cards = ats.length ? ats.map((m, i) => {
            const el = window.ELEMENTOS[m.elemento] || {};
            return `<div class="atk-card" style="border-left-color:${el.cor || '#888'}">
                <button class="atk-rm" data-i="${i}" title="Remover ataque">&times;</button>
                <div class="atk-top"><span class="def-orb" style="--c1:${el.cor || '#888'};--c2:${el.cor2 || '#aaa'}"></span><span class="atk-nome">${m.nome}</span></div>
                <div class="atk-tags"><span class="mov-tag">${elNome(m.elemento)}</span><span class="mov-tag mov-tipo">${tl[m.tipo] || m.tipo}</span></div>
                ${m.descricao ? `<p class="atk-desc">${m.descricao}</p>` : ''}
            </div>`;
        }).join('') : '<p class="def-vazio">Nenhum ataque ainda. Crie os ataques do seu Khosō no formulário abaixo.</p>';
        return `<div class="bloco-detalhe">
            <h3>Ataques</h3>
            <div class="atk-grid">${cards}</div>
            <div class="atk-form">
                <input id="atk-nome" class="atk-in" type="text" maxlength="28" placeholder="Nome do ataque (ex: Mordida de Lava)">
                <div class="atk-form-row">
                    <select id="atk-el" class="filtro-select" title="Elemento do ataque">${elOpts}</select>
                    <select id="atk-tipo" class="filtro-select" title="Tipo de dano">${tipoOpts}</select>
                </div>
                <input id="atk-desc" class="atk-in" type="text" maxlength="80" placeholder="O que o ataque faz (opcional)">
                <button id="atk-add" class="btn">+ Criar ataque</button>
            </div>
        </div>`;
    }

    function pessoalHtml() {
        const k = Catalogo.getKhoso(num);
        const ap = (k.apelido || '').replace(/"/g, '&quot;');
        const nt = (k.nota || '').replace(/</g, '&lt;');
        return `<div class="bloco-detalhe pessoal-box">
            <h3>Apelido e anotações</h3>
            <input id="ap-input" class="ap-input" type="text" maxlength="24" placeholder="Dê um apelido (opcional)" value="${ap}">
            <textarea id="ap-nota" class="ap-nota" placeholder="Suas anotações sobre este Khosō...">${nt}</textarea>
        </div>`;
    }

    function render() {
        const rar = raridadeInfo(p.raridade);
        const badges = (p.elementos || []).map(e => `<span class="type-badge" style="background:${elCor(e)}">${elNome(e)}</span>`).join('');
        const navHtml = `<div class="nav-detalhes">
            <a href="${prev ? 'detalhes.html?n=' + prev.numero : '#'}" class="btn-nav ${!prev ? 'disabled' : ''}">${prev ? '← ' + prev.nome : '—'}</a>
            <a href="${next ? 'detalhes.html?n=' + next.numero : '#'}" class="btn-nav ${!next ? 'disabled' : ''}">${next ? next.nome + ' →' : '—'}</a>
        </div>`;
        const borderStyle = cores.length > 1
            ? `border:3px solid transparent;background-image:linear-gradient(#1a1a1a,#1a1a1a),linear-gradient(135deg,${cores[0]},${cores[1]},${cores[0]},${cores[1]});background-origin:border-box;background-clip:padding-box,border-box;background-size:400% 400%;animation:borderRotate 6s ease infinite;box-shadow:0 0 30px ${cores[0]}66;`
            : `border-color:${cores[0]};border-radius:15px;box-shadow:0 0 20px ${cores[0]}33;`;

        view.innerHTML = `${navHtml}
            <div class="detalhes-container" style="${borderStyle}">
                <div class="detalhes-img"><img src="${Catalogo.imagem(p)}" alt="${p.nome}"></div>
                <div class="detalhes-info">
                    <span class="number">N.º ${String(p.numero).padStart(3, '0')}</span>
                    <h1 style="font-size:2.5rem;margin-bottom:10px;">${p.nome}</h1>
                    <div class="badges" style="margin-bottom:15px;">${badges}</div>
                    <p class="raridade" style="color:${rar.cor};margin-bottom:20px;">${rar.estrelas} ${rar.nome}</p>
                    <p class="descricao" style="font-style:italic;color:#ccc;line-height:1.6;margin-bottom:26px;">"${p.descricao}"</p>
                    <div class="stats-container"><h3>Estatísticas Base</h3>${statsHtml()}</div>
                    ${equiparHtml()}
                    ${evolucaoHtml()}
                    ${ataquesHtml()}
                    ${defesaHtml()}
                    ${pessoalHtml()}
                </div>
            </div>`;

        if (p.raridade === 'lendario') {
            const c = view.querySelector('.detalhes-container');
            if (c) for (let i = 0; i < 28; i++) {
                const d = document.createElement('div');
                d.className = 'particle';
                const s = Math.random() * 6 + 2 + 'px';
                d.style.width = s; d.style.height = s; d.style.backgroundColor = cores[0];
                d.style.left = Math.random() * 100 + '%'; d.style.top = Math.random() * 100 + '%';
                d.style.setProperty('--x', (Math.random() * 200 - 100) + 'px');
                d.style.setProperty('--y', (Math.random() * -150 - 50) + 'px');
                d.style.animation = `particleFloat ${Math.random() * 3 + 2}s infinite ease-out`;
                d.style.animationDelay = Math.random() * 5 + 's';
                c.appendChild(d);
            }
        }

        const btn = document.getElementById('eq-btn'), sel = document.getElementById('eq-select');
        if (btn && sel) btn.addEventListener('click', () => { Catalogo.equipar(num, Number(sel.value)); render(); });
        view.querySelectorAll('.eq-rm').forEach(b => b.addEventListener('click', () => { Catalogo.desequipar(num, Number(b.dataset.id)); render(); }));

        const apIn = document.getElementById('ap-input'), apNt = document.getElementById('ap-nota');
        const salvarKhoso = () => Catalogo.setKhoso(num, { apelido: apIn ? apIn.value : '', nota: apNt ? apNt.value : '' });
        if (apIn) apIn.addEventListener('input', salvarKhoso);
        if (apNt) apNt.addEventListener('input', salvarKhoso);

        const atkAdd = document.getElementById('atk-add');
        if (atkAdd) atkAdd.addEventListener('click', () => {
            const nome = document.getElementById('atk-nome').value.trim();
            if (!nome) { notificar('Dê um nome ao ataque.', 'erro'); return; }
            Catalogo.addAtaque(num, {
                nome,
                elemento: document.getElementById('atk-el').value,
                tipo: document.getElementById('atk-tipo').value,
                descricao: document.getElementById('atk-desc').value.trim(),
            });
            notificar('Ataque criado.', 'ok');
            render();
        });
        view.querySelectorAll('.atk-rm').forEach(b => b.addEventListener('click', () => { Catalogo.removeAtaque(num, Number(b.dataset.i)); render(); }));
    }

    render();
})();
