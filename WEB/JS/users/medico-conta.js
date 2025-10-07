// Página Minha Conta (Médico): ver, alterar e apagar conta
(() => {
    const $ = (id) => document.getElementById(id);
    const idEl = $('acc-id');
    const nomeEl = $('acc-nome');
    const emailEl = $('acc-email');
    const telEl = $('acc-telefone');
    const userEl = $('acc-username');
    const passEl = $('acc-password');

    const btnSalvar = $('btn-salvar');
    const btnRedef = $('btn-redefinir-senha');
    const btnExcluir = $('btn-excluir');
    const btnTogglePass = $('btn-toggle-pass');

    const API = window.MedicosAPI;

    const fill = (user) => {
        if (!user) return;
        idEl.value = user._id || '';
        nomeEl.value = user.nome || '';
        emailEl.value = user.email || '';
        telEl.value = user.telefone || '';
        userEl.value = user.username || '';
        passEl.value = user.password || '';
    };

    const load = async () => {
        const fromLocal = localStorage.getItem('ultimo_medico_obj');
        if (fromLocal) {
            try { const obj = JSON.parse(fromLocal); fill(obj); return; } catch { }
        }
        const lastId = localStorage.getItem('ultimo_medico_id');
        if (lastId && API) {
            try {
                const all = await API.listarMedicos();
                const found = all.find(m => m._id === lastId);
                if (found) return fill(found);
            } catch (e) { console.warn('Falha ao buscar médico por ID', e); }
        }
        if (API) {
            try {
                const all = await API.listarMedicos();
                if (all && all.length) fill(all[0]);
            } catch (e) { console.warn('Falha ao listar médicos', e); }
        }
    };

    btnSalvar?.addEventListener('click', async () => {
        const id = idEl.value.trim();
        if (!id || !API) return alert('Médico não carregado.');
        try {
            const payload = {
                nome: nomeEl.value.trim(),
                email: emailEl.value.trim(),
                telefone: telEl.value.trim(),
            };
            const res = await API.atualizarMedico(id, payload);
            alert('Dados atualizados com sucesso.');
            const user = res.usuario || res; // dependendo do backend
            fill(user);
            localStorage.setItem('ultimo_medico_obj', JSON.stringify(user));
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar alterações.');
        }
    });

    btnRedef?.addEventListener('click', async () => {
        const id = idEl.value.trim();
        if (!id || !API) return alert('Médico não carregado.');
        const nova = prompt('Digite a nova senha:');
        if (!nova) return;
        try {
            const res = await API.atualizarMedico(id, { password: nova });
            alert('Senha alterada com sucesso.');
            const user = res.usuario || res;
            fill(user);
            localStorage.setItem('ultimo_medico_obj', JSON.stringify(user));
        } catch (e) {
            console.error(e);
            alert('Erro ao redefinir senha.');
        }
    });

    btnExcluir?.addEventListener('click', async () => {
        const id = idEl.value.trim();
        if (!id || !API) return alert('Médico não carregado.');
        if (!confirm('Tem certeza que deseja apagar a conta? Esta ação não pode ser desfeita.')) return;
        try {
            await API.excluirMedico(id);
            alert('Conta apagada com sucesso.');
            localStorage.removeItem('ultimo_medico_id');
            localStorage.removeItem('ultimo_medico_obj');
            idEl.value = nomeEl.value = emailEl.value = telEl.value = userEl.value = passEl.value = '';
        } catch (e) {
            console.error(e);
            alert('Erro ao apagar conta.');
        }
    });

    btnTogglePass?.addEventListener('click', () => {
        if (passEl.type === 'password') {
            passEl.type = 'text';
            btnTogglePass.textContent = 'Ocultar';
        } else {
            passEl.type = 'password';
            btnTogglePass.textContent = 'Mostrar';
        }
    });

    passEl.type = 'password';
    load();
})();
