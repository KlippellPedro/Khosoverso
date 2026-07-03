/**
 * MENU.JS — Barra superior compartilhada (estilo Supremacia do Protesto).
 *
 * Detecta se a página está em /templates/ e monta os links com o prefixo certo.
 * Sem conta/perfil. Inclui Exportar/Importar PROGRESSO (save único: liberados +
 * coleção + equipe), no mesmo espírito do importar/exportar da Ficha.
 */
(function () {
    const pathname = window.location.pathname;
    const isInTemplates = pathname.includes('/templates/') || pathname.endsWith('/templates');
    const homePrefix = isInTemplates ? '../' : '';
    const prefix = isInTemplates ? '' : 'templates/';

    const paginas = [
        { label: 'Início', href: homePrefix + 'index.html' },
        { label: 'Khosōdex', href: prefix + 'pokedex.html' },
        { label: 'Elementos', href: prefix + 'elementos.html' },
        { label: 'Equipe', href: prefix + 'equipe.html' },
        { label: 'Coleção', href: prefix + 'colecao.html' },
        { label: 'Inventário', href: prefix + 'inventario.html' },
        { label: 'Social', href: prefix + 'social.html' },
    ];

    // Pega o nome do arquivo atual (ex: pokedex.html)
    const pathParts = pathname.split('/');
    const atual = (pathParts[pathParts.length - 1] || 'index.html').toLowerCase();

    const linksHtml = paginas.map(p => {
        const isAtivo = p.href.toLowerCase().endsWith(atual);
        return `<a href="${p.href}" class="topbar-link${isAtivo ? ' active' : ''}">${p.label}</a>`;
    }).join('');

    const html = `
        <header class="topbar">
            <a class="topbar-logo" href="${homePrefix}index.html" aria-label="Início" title="Supremacia do Protesto">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                    <path d="M12 6 V18 M7.5 9 L16.5 15 M16.5 9 L7.5 15" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
                <span>SDP</span>
            </a>
            <nav class="topbar-links">${linksHtml}</nav>
            <div class="topbar-acoes">
                <button class="btn-ghost btn-tema" id="btn-tema" title="Personalizar cores do site" aria-label="Personalizar cores">
                    <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87a.49.49 0 00.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                </button>
                <button class="btn-ghost" id="btn-exportar-progresso" title="Salvar seu progresso (liberados, coleção e equipe) num arquivo">Exportar</button>
                <button class="btn-ghost" id="btn-importar-progresso" title="Carregar um progresso salvo">Importar</button>
                <input type="file" id="file-progresso" accept=".json" hidden>
            </div>
        </header>`;

    function wireProgresso() {
        const btnExp = document.getElementById('btn-exportar-progresso');
        const btnImp = document.getElementById('btn-importar-progresso');
        const file = document.getElementById('file-progresso');
        const btnTema = document.getElementById('btn-tema');
        if (btnTema) btnTema.addEventListener('click', () => window.Tema && Tema.abrir());

        if (!btnExp || !btnImp || !file) return;

        btnExp.addEventListener('click', () => window.Catalogo && Catalogo.exportarProgresso());
        btnImp.addEventListener('click', () => file && file.click());
        file.addEventListener('change', ev => {
            const f = ev.target.files[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = e => {
                const r = Catalogo.importarProgresso(e.target.result);
                if (r.ok) {
                    notificar('Progresso carregado. Atualizando...', 'ok');
                    setTimeout(() => location.reload(), 900);
                } else {
                    notificar(r.msg || 'Arquivo inválido.', 'erro');
                }
                file.value = '';
            };
            reader.readAsText(f);
        });
    }

    function render() {
        const slot = document.getElementById('site-header');
        if (slot) slot.outerHTML = html;
        else document.body.insertAdjacentHTML('afterbegin', html);
        wireProgresso();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }
})();
