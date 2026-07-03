/**
 * TEMA.JS — Personalização de cores do site (primária e secundária).
 *
 * Carregado no <head> de cada página para aplicar as cores salvas ANTES do
 * render (sem flash). As cores ficam no localStorage, então persistem ao
 * trocar de página ou dar F5. O botão de engrenagem no menu abre o modal.
 */
(function () {
    const LS = 'pokemania_tema';
    const PADRAO = { primary: '#ff4444', secondary: '#457b9d' };
    const PRESETS = [
        { nome: 'Protesto',  primary: '#ff4444', secondary: '#457b9d' },
        { nome: 'Esmeralda', primary: '#22c55e', secondary: '#0ea5e9' },
        { nome: 'Âmbar',     primary: '#f59e0b', secondary: '#ef4444' },
        { nome: 'Ametista',  primary: '#a855f7', secondary: '#ec4899' },
        { nome: 'Ciano',     primary: '#06b6d4', secondary: '#6366f1' },
        { nome: 'Sangue',    primary: '#dc2626', secondary: '#991b1b' },
    ];

    function hexToRgba(hex, a) {
        let h = (hex || '').replace('#', '');
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        const r = parseInt(h.slice(0, 2), 16) || 0;
        const g = parseInt(h.slice(2, 4), 16) || 0;
        const b = parseInt(h.slice(4, 6), 16) || 0;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    function get() {
        try {
            return Object.assign({}, PADRAO, JSON.parse(localStorage.getItem(LS)) || {});
        } catch (e) { return Object.assign({}, PADRAO); }
    }
    function salvar(t) { localStorage.setItem(LS, JSON.stringify(t)); }

    function aplicar(t) {
        const r = document.documentElement.style;
        r.setProperty('--primary', t.primary);
        r.setProperty('--secondary', t.secondary);
        r.setProperty('--primary-glow', hexToRgba(t.primary, 0.3));
        r.setProperty('--secondary-glow', hexToRgba(t.secondary, 0.3));
    }

    // Aplica imediatamente (script está no <head>, então roda antes do paint)
    aplicar(get());

    let modal = null;
    function construir() {
        modal = document.createElement('div');
        modal.className = 'tema-modal-overlay hidden';
        modal.innerHTML = `
            <div class="tema-modal">
                <h2>Personalizar cores</h2>
                <div class="tema-presets">
                    ${PRESETS.map((pr, i) => `<button class="tema-preset" data-i="${i}" title="${pr.nome}" style="background:linear-gradient(135deg, ${pr.primary} 60%, ${pr.secondary} 60%)"></button>`).join('')}
                </div>
                <label class="tema-campo">
                    <span>Cor primária</span>
                    <input type="color" id="tema-primary">
                </label>
                <label class="tema-campo">
                    <span>Cor secundária</span>
                    <input type="color" id="tema-secondary">
                </label>
                <div class="tema-botoes">
                    <button class="btn-sec" id="tema-reset">Restaurar padrão</button>
                    <button class="btn" id="tema-fechar">Concluir</button>
                </div>
            </div>`;
        document.body.appendChild(modal);

        const ip = modal.querySelector('#tema-primary');
        const is = modal.querySelector('#tema-secondary');

        function live() {
            const novo = { primary: ip.value, secondary: is.value };
            aplicar(novo); salvar(novo);
        }
        ip.addEventListener('input', live);
        is.addEventListener('input', live);

        modal.querySelectorAll('.tema-preset').forEach(b => b.addEventListener('click', () => {
            const pr = PRESETS[Number(b.dataset.i)];
            ip.value = pr.primary; is.value = pr.secondary;
            aplicar({ primary: pr.primary, secondary: pr.secondary });
            salvar({ primary: pr.primary, secondary: pr.secondary });
        }));

        modal.querySelector('#tema-reset').addEventListener('click', () => {
            ip.value = PADRAO.primary; is.value = PADRAO.secondary;
            aplicar(PADRAO); salvar(PADRAO);
        });
        modal.querySelector('#tema-fechar').addEventListener('click', fechar);
        modal.addEventListener('click', e => { if (e.target === modal) fechar(); });
    }

    function abrir() {
        if (!modal) construir();
        const t = get();
        modal.querySelector('#tema-primary').value = t.primary;
        modal.querySelector('#tema-secondary').value = t.secondary;
        modal.classList.remove('hidden');
    }
    function fechar() { if (modal) modal.classList.add('hidden'); }

    window.Tema = { abrir, fechar, aplicar, get };
})();
