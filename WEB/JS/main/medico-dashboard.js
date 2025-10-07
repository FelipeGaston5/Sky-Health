(() => {
    const onlyDigits = (v) => (v || '').replace(/\D+/g, '');
    const byId = (id) => document.getElementById(id);
    const tabBtns = document.querySelectorAll('.tabs button[data-tab]');
    const panels = {
        ag: byId('tab-agendamentos'),
        notif: byId('tab-notificacoes'),
        pres: byId('tab-prescricao'),
        novoAg: byId('tab-novo-agendamento'),
    };
    const agList = byId('ag-list');
    const info = byId('medico-info');
    const pageTitle = byId('page-section-title');
    const btnRefresh = byId('ag-refresh');
    const filterStatusEl = byId('ag-filter-status');
    const searchEl = byId('ag-search');

    // Sessão (definida no login)
    const sessaoPerfil = localStorage.getItem('sessao_perfil');
    const medicoId = localStorage.getItem('ultimo_medico_id');
    let medicoObj = null;
    try { medicoObj = JSON.parse(localStorage.getItem('ultimo_medico_obj') || 'null'); } catch { }
    if (info) info.textContent = medicoObj?.nome ? `Bem-vindo(a), ${medicoObj.nome}` : '—';

    // Abas
    tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.getAttribute('data-tab');
            Object.values(panels).forEach(p => p?.classList.remove('active'));
            if (tab === 'agendamentos') panels.ag?.classList.add('active');
            if (tab === 'notificacoes') panels.notif?.classList.add('active');
            if (tab === 'prescricao') panels.pres?.classList.add('active');
            if (tab === 'novo-agendamento') panels.novoAg?.classList.add('active');
            if (pageTitle) {
                const map = {
                    'agendamentos': 'Agendamentos',
                    'notificacoes': 'Notificações',
                    'prescricao': 'Nova Prescrição',
                    'novo-agendamento': 'Novo Agendamento'
                };
                pageTitle.textContent = map[tab] || 'Painel';
            }
        });
    });

    // Listar agendamentos do médico logado (filtra por médico._id)
    async function loadAgendamentos() {
        if (!agList) return;
        agList.innerHTML = '<tr><td colspan="4">Carregando…</td></tr>';
        try {
            const r = await fetch('http://localhost:3000/agendamentos');
            const list = await r.json();
            let meus = Array.isArray(list) ? list.filter(a => String(a.medico?._id || a.medico) === String(medicoId)) : [];
            // filtro por status
            const status = (filterStatusEl?.value || '').trim();
            if (status) meus = meus.filter(a => (a.status || '') === status);
            // busca textual
            const q = (searchEl?.value || '').trim().toLowerCase();
            if (q) {
                meus = meus.filter(a =>
                    String(a.paciente?.nome || '').toLowerCase().includes(q) ||
                    String(a.tipo || '').toLowerCase().includes(q) ||
                    (a.dataAgendamento && new Date(a.dataAgendamento).toLocaleString().toLowerCase().includes(q))
                );
            }
            if (!meus.length) { agList.innerHTML = '<tr class="empty-state"><td colspan="4">Nenhum agendamento encontrado.</td></tr>'; return; }
            agList.innerHTML = meus.map(a => `
        <tr>
          <td>${a.paciente?.nome || '—'}</td>
          <td>${a.tipo || '—'}</td>
          <td>${a.dataAgendamento ? new Date(a.dataAgendamento).toLocaleString() : '—'}</td>
          <td>${a.status || '—'}</td>
        </tr>
      `).join('');
        } catch (e) {
            console.error(e);
            agList.innerHTML = '<tr><td colspan="4">Erro ao carregar.</td></tr>';
        }
    }

    // Nova prescrição
    const formPres = byId('form-pres');
    const presPacienteCpf = byId('presPacienteCpf');
    const presMedicoCrm = byId('presMedicoCrm');
    const presTipo = byId('presTipo');
    const presValidade = byId('presValidade');
    const presDesc = byId('presDesc');
    const presResult = byId('pres-result');

    formPres?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            pacienteCpf: onlyDigits(presPacienteCpf.value),
            medicoCrm: (presMedicoCrm.value || '').trim(),
            tipo: presTipo.value,
            descricao: (presDesc.value || '').trim(),
            dataValidade: presValidade.value || null
        };
        if (!payload.pacienteCpf || !payload.medicoCrm || !payload.tipo || !payload.descricao || !payload.dataValidade) {
            return alert('Preencha todos os campos obrigatórios da prescrição.');
        }
        try {
            const r = await fetch('http://localhost:3000/prescricao', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!r.ok) throw new Error(await r.text());
            const data = await r.json();
            presResult.textContent = `Prescrição criada: ID ${data?.prescricao?._id || '—'}`;
            presResult.style.display = 'block';
            formPres.reset();
        } catch (e) {
            console.error(e);
            alert('Erro ao criar prescrição.');
        }
    });

    // Novo agendamento
    const formAg = byId('form-ag');
    const agPacCpf = byId('agPacienteCpf');
    const agMedCrm = byId('agMedicoCrm');
    const agData = byId('agData');
    const agTipo = byId('agTipo');
    const agObs = byId('agObs');
    const agResult = byId('ag-result');

    formAg?.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Resolver paciente por CPF e médico por CRM
        const cpf = onlyDigits(agPacCpf?.value);
        const crm = (agMedCrm?.value || '').trim();
        const dataISO = agData.value ? new Date(agData.value).toISOString() : null;
        if (!cpf || !crm || !dataISO || !agTipo.value) {
            return alert('Preencha CPF do paciente, CRM do médico, data/hora e tipo.');
        }
        try {
            // Busca paciente por CPF via API de pacientes
            let pacienteId = null;
            if (window.PacientesAPI?.buscarPorCPF) {
                const p = await window.PacientesAPI.buscarPorCPF(cpf);
                pacienteId = p?._id || null;
            }
            // Busca médico pelo CRM via lista (não há endpoint direto)
            let medicoId = null;
            if (window.MedicosAPI?.listarMedicos) {
                const medList = await window.MedicosAPI.listarMedicos();
                const found = (Array.isArray(medList) ? medList : []).find(m => String(m.crm || '').trim() === crm);
                medicoId = found?._id || null;
            }
            if (!pacienteId || !medicoId) {
                return alert('Não foi possível localizar o paciente (CPF) ou médico (CRM).');
            }
            const payload = {
                paciente: pacienteId,
                medico: medicoId,
                dataAgendamento: dataISO,
                tipo: agTipo.value,
                status: 'Agendado',
                observacoes: (agObs.value || '').trim()
            };
            const r = await fetch('http://localhost:3000/agendamentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!r.ok) throw new Error(await r.text());
            const data = await r.json();
            agResult.textContent = `Agendamento criado: ID ${data?.agendamento?._id || '—'}`;
            agResult.style.display = 'block';
            formAg.reset();
            // Recarrega lista
            loadAgendamentos();
        } catch (e) {
            console.error(e);
            alert('Erro ao criar agendamento.');
        }
    });

    // Pré-preencher CRM/ID do médico quando possível
    const tryPrefill = () => {
        if (medicoObj?.crm && presMedicoCrm && !presMedicoCrm.value) presMedicoCrm.value = medicoObj.crm;
        if (medicoObj?.crm && agMedCrm && !agMedCrm.value) agMedCrm.value = medicoObj.crm;
    };

    document.addEventListener('DOMContentLoaded', () => {
        tryPrefill();
        loadAgendamentos();
    });

    // Refresh e filtros
    btnRefresh?.addEventListener('click', loadAgendamentos);
    filterStatusEl?.addEventListener('change', loadAgendamentos);
    searchEl?.addEventListener('input', () => { clearTimeout(window.__ag_search_t); window.__ag_search_t = setTimeout(loadAgendamentos, 250); });

    // máscara simples de CPF
    const maskCPF = (v) => {
        v = (v || '').replace(/\D+/g, '').slice(0, 11);
        if (v.length > 9) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
        if (v.length > 6) return v.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
        if (v.length > 3) return v.replace(/(\d{3})(\d{0,3})/, '$1.$2');
        return v;
    };
    const cpfInput = byId('presPacienteCpf');
    cpfInput?.addEventListener('input', () => { cpfInput.value = maskCPF(cpfInput.value); });
    const cpfAgInput = byId('agPacienteCpf');
    cpfAgInput?.addEventListener('input', () => { cpfAgInput.value = maskCPF(cpfAgInput.value); });
})();
