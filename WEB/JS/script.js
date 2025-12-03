// Script geral do sistema
(() => {
    const THEME_KEY = 'skyhealth:theme'; // 'light' | 'dark'

    const getSystemPrefersDark = () =>
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    const getStoredTheme = () => {
        try {
            return localStorage.getItem(THEME_KEY);
        } catch (_) {
            return null;
        }
    };

    const storeTheme = (theme) => {
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (_) {
            // ignore private mode errors
        }
    };

    const applyTheme = (theme) => {
        const isDark = theme === 'dark';
        document.body.classList.toggle('dark-mode', isDark);
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
        const btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.setAttribute('aria-pressed', String(isDark));
            const icon = btn.querySelector('.theme-toggle__icon');
            const label = btn.querySelector('.theme-toggle__label');
            if (icon) icon.textContent = isDark ? '☀️' : '🌙';
            if (label) label.textContent = isDark ? 'Claro' : 'Escuro';
            btn.title = isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro';
        }
    };

    const initTheme = () => {
        const stored = getStoredTheme();
        const theme = stored || (getSystemPrefersDark() ? 'dark' : 'light');
        applyTheme(theme);
    };

    const createToggleButton = () => {
        if (document.getElementById('theme-toggle')) return; // evita duplicar
        const btn = document.createElement('button');
        btn.id = 'theme-toggle';
        btn.className = 'theme-toggle';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Alternar tema');
        btn.setAttribute('aria-pressed', 'false');
        btn.innerHTML = `
            <span class="theme-toggle__icon" aria-hidden="true">🌙</span>
            <span class="theme-toggle__label">Escuro</span>
        `;
        btn.addEventListener('click', () => {
            const nowDark = !document.body.classList.contains('dark-mode');
            const next = nowDark ? 'dark' : 'light';
            storeTheme(next);
            applyTheme(next);
        });

        // Tenta inserir no header (de preferência no nav)
        const header = document.querySelector('header');
        const navTarget = header?.querySelector?.('.landing-actions') || header?.querySelector?.('nav');
        if (navTarget) {
            navTarget.appendChild(btn);
        } else if (header) {
            header.appendChild(btn);
        } else {
            // fallback para body (com posição fixa no canto)
            document.body.appendChild(btn);
        }
        // Ajusta estado visual conforme tema atual
        applyTheme(document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    };

    // Insere uma logo global no header (usa var(--logo) no CSS)
    const injectGlobalLogo = () => {
        const header = document.querySelector('header');
        if (!header) return;
        if (header.querySelector('.logo-global')) return; // evita duplicar
        // Se a página já possui uma logo própria, não injeta a global
        const hasExistingLogo = header.querySelector(
            '.logo-icon, .logo, img[alt*="logo" i], [aria-label*="logo" i]'
        );
        if (hasExistingLogo) {
            return;
        }
        const logo = document.createElement('div');
        logo.className = 'logo-global';
        logo.setAttribute('role', 'img');
        logo.setAttribute('aria-label', 'Sky Health');
        header.appendChild(logo);
    };

    // Mantém em sincronia com mudança do sistema
    const setupSystemListener = () => {
        if (!window.matchMedia) return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => {
            const stored = getStoredTheme();
            if (!stored) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        };
        if (mq.addEventListener) mq.addEventListener('change', handler);
        else if (mq.addListener) mq.addListener(handler);
    };

    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        injectGlobalLogo();
        createToggleButton();
        setupSystemListener();
        // Logo clicável: envia ao index ou ao dashboard conforme sessão
        const setupLogoNavigation = () => {
            const go = (ev) => {
                ev?.preventDefault?.();
                let role = null;
                try { role = localStorage.getItem('sessao_perfil'); } catch { }
                // Direcionar para os dashboards principais
                const map = { paciente: './main/index/paciente.html', medico: './main/index/medico.html', adm: './main/index/adm.html' };
                const target = role && map[role] ? map[role] : 'index.html';
                const path = window.location.pathname.replace(/\\/g, '/');
                const marker = '/HTML/';
                const idx = path.lastIndexOf(marker);
                const base = idx >= 0 ? path.slice(0, idx + marker.length) : path.slice(0, path.lastIndexOf('/') + 1);
                window.location.href = base + target;
            };
            document.querySelectorAll('.logo-icon, .logo-global, .logo-brand').forEach(el => {
                el.style.cursor = 'pointer';
                el.setAttribute('title', 'Voltar ao início');
                el.addEventListener('click', go);
                el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') go(e); });
                el.setAttribute('tabindex', '0');
                el.setAttribute('role', 'link');
            });
        };
        setupLogoNavigation();
        console.log('Script geral carregado. Dark Mode disponível.');
    });
})();
