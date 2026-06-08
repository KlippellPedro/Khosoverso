/**
 * MENU.JS — Cabeçalho compartilhado entre todas as páginas.
 *
 * Detecta se a página está em /templates/ ou na raiz e monta os links com o
 * prefixo certo (mesmo padrão da Ficha). Sem botões de tema/idioma e sem Pacotes.
 * Cada página tem <div id="site-header"></div>; este script injeta o menu nele.
 */
(function () {
    const isInTemplates = window.location.pathname.includes('/templates/');
    const homePrefix = isInTemplates ? '../' : '';        // raiz (index.html) e assets
    const prefix     = isInTemplates ? '' : 'templates/';  // sub-páginas

    const paginas = [
        { label: 'Início',  href: homePrefix + 'index.html' },
        { label: 'Pokédex', href: prefix + 'pokedex.html'  },
        { label: 'Equipe',  href: prefix + 'equipe.html'   },
        { label: 'Coleção', href: prefix + 'colecao.html'  },
        { label: 'Social',  href: prefix + 'social.html'   },
    ];

    const atual = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const perfil = (window.Catalogo ? Catalogo.getPerfil() : { nome: 'Treinador', avatar: '' });
    const avatar = perfil.avatar || (homePrefix + 'statics/uploads/utilidade/poke-ball.png');
    const primeiroNome = (perfil.nome || 'Treinador').split(' ')[0];

    const navHtml = paginas.map(p => {
        const ativo = p.href.endsWith(atual) ? ' active' : '';
        return `<a href="${p.href}" class="menu-item${ativo}">${p.label}</a>`;
    }).join('');

    const html = `
        <header class="menu">
            <nav class="menu-nav">
                ${navHtml}
                <div class="user-dropdown">
                    <div class="menu-item dropdown-trigger">
                        <img src="${avatar}" class="menu-icon-user" alt="Perfil">
                        <span>${primeiroNome}</span>
                    </div>
                    <div class="dropdown-content">
                        <a href="${prefix}perfil.html">Meu Perfil</a>
                    </div>
                </div>
            </nav>
        </header>`;

    function render() {
        const slot = document.getElementById('site-header');
        if (slot) slot.outerHTML = html;
        else document.body.insertAdjacentHTML('afterbegin', html);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }
})();
