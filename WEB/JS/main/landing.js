(() => {
    // Utilidades
    const qs = (s, el = document) => el.querySelector(s);
    const byId = (id) => document.getElementById(id);

    // Preloader: esconde após DOM pronto + pequeno delay para efeito
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => { byId('preloader')?.classList.add('hidden'); }, 350);
    });

    function openMenu(menu, anchor) {
        const rect = anchor.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 10;
        const left = Math.min(rect.left + window.scrollX, window.innerWidth - menu.offsetWidth - 12);
        menu.style.top = `${top}px`;
        menu.style.left = `${left}px`;
        menu.classList.add('open');
    }
    function closeMenus() {
        byId('menu-login')?.classList.remove('open');
        byId('menu-create')?.classList.remove('open');
    }

    function goToLogin(role) {
        const url = `main/login.html?role=${encodeURIComponent(role)}`;
        window.location.href = url;
    }
    function goToCreate(role) {
        const map = {
            paciente: 'main/criar-login/paciente.html',
            medico: 'main/criar-login/medicos.html',
            adm: 'main/criar-login/adm.html',
        };
        const url = map[role];
        if (url) window.location.href = url; else alert('Perfil inválido.');
    }

    // Botões principais
    const btnLogin = byId('btn-login');
    const btnCreate = byId('btn-create');
    const ctaLogin = byId('cta-login');
    const ctaCreate = byId('cta-create');

    const menuLogin = byId('menu-login');
    const menuCreate = byId('menu-create');

    btnLogin?.addEventListener('click', (e) => { e.preventDefault(); closeMenus(); openMenu(menuLogin, btnLogin); });
    btnCreate?.addEventListener('click', (e) => { e.preventDefault(); closeMenus(); openMenu(menuCreate, btnCreate); });
    ctaLogin?.addEventListener('click', (e) => { e.preventDefault(); closeMenus(); openMenu(menuLogin, ctaLogin); });
    ctaCreate?.addEventListener('click', (e) => { e.preventDefault(); closeMenus(); openMenu(menuCreate, ctaCreate); });

    // Clique fora fecha
    document.addEventListener('click', (e) => {
        const t = e.target;
        if (!menuLogin?.contains(t) && !menuCreate?.contains(t) && t !== btnLogin && t !== btnCreate && t !== ctaLogin && t !== ctaCreate) {
            closeMenus();
        }
    });

    // Ações dos menus
    menuLogin?.querySelectorAll('[data-role]')?.forEach((btn) => {
        btn.addEventListener('click', () => goToLogin(btn.getAttribute('data-role')));
    });
    menuCreate?.querySelectorAll('[data-role]')?.forEach((btn) => {
        btn.addEventListener('click', () => goToCreate(btn.getAttribute('data-role')));
    });
})();
