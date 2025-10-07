// Página Minha Conta (Paciente): ver, alterar e apagar conta
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

    const API = window.PacientesAPI;

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
        const fromLocal = localStorage.getItem('ultimo_paciente_obj');
        if (fromLocal) {
            try {
                const obj = JSON.parse(fromLocal);
                fill(obj);
                return;
            } catch { /* ignore */ }
        }

        const lastId = localStorage.getItem('ultimo_paciente_id');
        if (lastId && API) {
            try {
                const all = await API.listarPacientes();
                const found = all.find(p => p._id === lastId);
                if (found) return fill(found);
            } catch (e) { console.warn('Falha ao buscar paciente por ID', e); }
        }

        // Fallback: pega o primeiro da lista
        if (API) {
            try {
                const all = await API.listarPacientes();
                if (all && all.length) fill(all[0]);
            } catch (e) { console.warn('Falha ao listar pacientes', e); }
        }
    };

    btnSalvar?.addEventListener('click', async () => {
        const id = idEl.value.trim();
        if (!id || !API) return alert('Paciente não carregado.');
        try {
            const payload = {
                nome: nomeEl.value.trim(),
                email: emailEl.value.trim(),
                telefone: telEl.value.trim(),
            };
            const res = await API.atualizarPaciente(id, payload);
            alert('Dados atualizados com sucesso.');
            fill(res.usuario || res); // backend users.put retorna {usuario}
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar alterações.');
        }
    });

    btnRedef?.addEventListener('click', async () => {
        const id = idEl.value.trim();
        if (!id || !API) return alert('Paciente não carregado.');
        const nova = prompt('Digite a nova senha:');
        if (!nova) return;
        try {
            const res = await API.atualizarPaciente(id, { password: nova });
            alert('Senha alterada com sucesso.');
            fill(res.usuario || res);
        } catch (e) {
            console.error(e);
            alert('Erro ao redefinir senha.');
        }
    });

    btnExcluir?.addEventListener('click', async () => {
        const id = idEl.value.trim();
        if (!id || !API) return alert('Paciente não carregado.');
        if (!confirm('Tem certeza que deseja apagar a conta? Esta ação não pode ser desfeita.')) return;
        try {
            await API.excluirPaciente(id);
            alert('Conta apagada com sucesso.');
            localStorage.removeItem('ultimo_paciente_id');
            localStorage.removeItem('ultimo_paciente_obj');
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

    // Inicia com senha oculta
    passEl.type = 'password';

    // Carregar dados ao abrir
    load();
})();
