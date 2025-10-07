(() => {
    const form = document.getElementById('login-form');
    if (!form) return;

    const roleEl = document.getElementById('role');
    const userEl = document.getElementById('username');
    const passEl = document.getElementById('password');

    // Pré-seleciona o perfil se vier na query (?role=paciente|medico|adm)
    try {
        const params = new URLSearchParams(window.location.search);
        const r = params.get('role');
        if (r && roleEl) {
            const allowed = ['paciente', 'medico', 'adm'];
            if (allowed.includes(r)) {
                roleEl.value = r;
            }
        }
    } catch { }

    const listEndpoints = {
        paciente: 'http://localhost:3000/pacientes',
        medico: 'http://localhost:3000/medicos/medicos',
        adm: 'http://localhost:3000/administradores'
    };
    const loginEndpoints = {
        paciente: 'http://localhost:3000/pacientes/login',
        medico: 'http://localhost:3000/medicos/login',
        adm: 'http://localhost:3000/administradores/login'
    };

    const redirects = {
        // Redireciona diretamente para os dashboards
        paciente: 'index/paciente.html',
        medico: 'index/medico.html',
        adm: 'index/adm.html'
    };

    async function postLogin(role, username, password) {
        const url = loginEndpoints[role];
        if (!url) throw new Error('Perfil inválido');
        const r = await fetch(url, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password })
        });
        if (!r.ok) {
            const msg = await r.text().catch(() => '');
            const err = new Error(msg || 'Falha no login');
            err.status = r.status;
            throw err;
        }
        return r.json();
    }

    async function getAll(role) {
        const url = listEndpoints[role];
        if (!url) throw new Error('Perfil inválido');
        const r = await fetch(url);
        if (!r.ok) throw new Error('Falha ao buscar dados');
        return r.json();
    }

    function extractUserCandidates(list) {
        if (!Array.isArray(list)) return [];
        return list.map(item => ({
            _id: item._id,
            username: String(item.username || '').trim().toLowerCase(),
            password: String(item.password || ''),
            raw: item
        }));
    }

    function storeSession(role, found) {
        try {
            localStorage.setItem('sessao_perfil', role);
            localStorage.setItem('sessao_user_id', found._id);
            const keyLast = role === 'paciente' ? 'ultimo_paciente_id' : role === 'medico' ? 'ultimo_medico_id' : 'ultimo_adm_id';
            const keyObj = role === 'paciente' ? 'ultimo_paciente_obj' : role === 'medico' ? 'ultimo_medico_obj' : 'ultimo_adm_obj';
            localStorage.setItem(keyLast, found._id);
            localStorage.setItem(keyObj, JSON.stringify(found.raw || found));
        } catch { }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const role = roleEl.value;
        const inputUser = (userEl.value || '').trim();
        const inputPass = passEl.value;
        if (!role || !inputUser || !inputPass) { alert('Preencha perfil, usuário e senha.'); return; }

        const typed = inputUser.toLowerCase();
        const digits = inputUser.replace(/\D+/g, '');

        // 1) Tenta login via API (mais seguro). Para paciente/médico, tenta variação com dígitos também.
        try {
            let res;
            try {
                res = await postLogin(role, typed, inputPass);
            } catch (err) {
                if ((role === 'paciente' || role === 'medico') && digits && digits !== typed) {
                    res = await postLogin(role, digits, inputPass);
                } else throw err;
            }

            // Extrai usuário do payload de resposta
            const payload = res?.usuario || res?.medico || res?.administrador || res;
            if (!payload || !payload._id) throw new Error('Resposta inválida do servidor');
            storeSession(role, payload);
            const redirect = redirects[role];
            if (redirect) window.location.href = redirect; else alert('Login efetuado.');
            return;
        } catch (e) {
            // continua para fallback
            console.warn('Falha no POST /login, usando fallback por listagem.', e);
        }

        // 2) Fallback: baixa a lista e compara no cliente
        try {
            const list = await getAll(role);
            const candidates = extractUserCandidates(list);
            const found = candidates.find(u => u.username === typed || u.username === digits);
            if (!found) { alert('Usuário não encontrado para o perfil selecionado.'); return; }
            if (found.password !== inputPass) { alert('Senha incorreta.'); return; }
            storeSession(role, found);
            const redirect = redirects[role];
            if (redirect) window.location.href = redirect; else alert('Login efetuado.');
        } catch (err) {
            console.error(err);
            alert('Erro ao comunicar com o servidor.');
        }
    });
})();
