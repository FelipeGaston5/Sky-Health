// Minha Conta - Administrador
(() => {
    const idEl = document.getElementById('acc-id');
    const userEl = document.getElementById('acc-username');
    const passEl = document.getElementById('acc-password');
    const nomeEl = document.getElementById('acc-nome');
    const emailEl = document.getElementById('acc-email');
    const telEl = document.getElementById('acc-telefone');
    const cargoEl = document.getElementById('acc-cargo');
    const deptEl = document.getElementById('acc-departamento');

    const btnSalvar = document.getElementById('btn-salvar');
    const btnReset = document.getElementById('btn-redefinir-senha');
    const btnExcluir = document.getElementById('btn-excluir');
    const btnToggle = document.getElementById('btn-toggle-pass');

    const onlyDigits = (v) => (v || '').replace(/\D+/g, '');

    const loadFromLocal = () => {
        try {
            const obj = JSON.parse(localStorage.getItem('ultimo_adm_obj') || 'null');
            return obj || null;
        } catch {
            return null;
        }
    };

    const fill = (adm) => {
        if (!adm) return;
        idEl.value = adm._id || '';
        userEl.value = adm.username || '';
        passEl.value = adm.password || (onlyDigits(adm.cpf || '').slice(-6) || '123456');
        nomeEl.value = adm.nome || '';
        emailEl.value = adm.email || '';
        telEl.value = adm.telefone || '';
        cargoEl.value = adm.cargo || '';
        deptEl.value = adm.departamento || '';
    };

    const fetchById = async (id) => {
        try {
            if (window.AdminsAPI?.buscarPorId) return await AdminsAPI.buscarPorId(id);
            const url = `http://localhost:3000/administradores/${id}`;
            const r = await fetch(url);
            return await r.json();
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    const load = async () => {
        const local = loadFromLocal();
        if (local?._id) {
            fill(local);
            // Tenta atualizar com dados do servidor, sem bloquear
            fetchById(local._id).then((srv) => { if (srv) fill(srv); });
            return;
        }
        // último id
        const id = localStorage.getItem('ultimo_adm_id');
        if (id) {
            const srv = await fetchById(id);
            if (srv) fill(srv);
        }
    };

    btnSalvar?.addEventListener('click', async () => {
        const id = idEl.value;
        if (!id) return alert('Nenhum administrador carregado.');
        const data = {
            nome: nomeEl.value.trim(),
            email: emailEl.value.trim(),
            telefone: telEl.value.trim(),
            cargo: cargoEl.value.trim(),
            departamento: deptEl.value.trim(),
        };
        try {
            let res;
            if (window.AdminsAPI?.atualizarAdm) res = await AdminsAPI.atualizarAdm(id, data);
            else {
                const r = await fetch(`http://localhost:3000/administradores/${id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
                });
                res = await r.json();
            }
            const saved = res?.administrador || res;
            try { localStorage.setItem('ultimo_adm_obj', JSON.stringify(saved)); } catch { }
            alert('Dados atualizados.');
            fill(saved);
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar.');
        }
    });

    btnReset?.addEventListener('click', async () => {
        const id = idEl.value;
        if (!id) return alert('Nenhum administrador carregado.');
        const cpf = prompt('Para redefinir a senha, informe o CPF (apenas números) ou deixe em branco para 123456:');
        const pwd = cpf ? onlyDigits(cpf).slice(-6) : '123456';
        try {
            let res;
            if (window.AdminsAPI?.atualizarAdm) res = await AdminsAPI.atualizarAdm(id, { password: pwd });
            else {
                const r = await fetch(`http://localhost:3000/administradores/${id}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwd })
                });
                res = await r.json();
            }
            const saved = res?.administrador || res;
            try { localStorage.setItem('ultimo_adm_obj', JSON.stringify(saved)); } catch { }
            alert('Senha redefinida.');
            fill(saved);
        } catch (e) {
            console.error(e);
            alert('Erro ao redefinir.');
        }
    });

    btnExcluir?.addEventListener('click', async () => {
        const id = idEl.value;
        if (!id) return alert('Nenhum administrador carregado.');
        if (!confirm('Tem certeza que deseja apagar esta conta?')) return;
        try {
            if (window.AdminsAPI?.deletarAdm) await AdminsAPI.deletarAdm(id);
            else await fetch(`http://localhost:3000/administradores/${id}`, { method: 'DELETE' });
            try { localStorage.removeItem('ultimo_adm_obj'); localStorage.removeItem('ultimo_adm_id'); } catch { }
            alert('Conta removida.');
            window.location.href = '../main/login.html';
        } catch (e) {
            console.error(e);
            alert('Erro ao excluir.');
        }
    });

    btnToggle?.addEventListener('click', () => {
        if (passEl.type === 'password') {
            passEl.type = 'text';
            btnToggle.textContent = 'Ocultar';
        } else {
            passEl.type = 'password';
            btnToggle.textContent = 'Mostrar';
        }
    });

    document.addEventListener('DOMContentLoaded', load);
})();
