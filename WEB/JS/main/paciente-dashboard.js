(() => {
    const byId = (id) => document.getElementById(id);
    const onlyDigits = (v) => (v || '').replace(/\D+/g, '');

    const tabBtns = document.querySelectorAll('.tabs button[data-tab]');
    const panels = {
        pres: byId('tab-prescricoes'),
        ag: byId('tab-agendamentos'),
        notif: byId('tab-notificacoes'),
    };

    const pageTitle = byId('page-section-title');
    const info = byId('paciente-info');
    const btnRefresh = byId('btn-refresh');

    const presList = byId('pres-list');
    const presSearch = byId('pres-search');

    const agList = byId('ag-list');
    const agFilterStatus = byId('ag-filter-status');
    const agSearch = byId('ag-search');

    // Sessão do paciente (do login/cadastro)
    let pacienteObj = null;
    try { pacienteObj = JSON.parse(localStorage.getItem('ultimo_paciente_obj') || 'null'); } catch { }
    const pacienteCpf = onlyDigits(pacienteObj?.cpf || '');
    if (info) info.textContent = pacienteObj?.nome ? `Olá, ${pacienteObj.nome}` : '—';

    // Abas
    tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.getAttribute('data-tab');
            Object.values(panels).forEach(p => p?.classList.remove('active'));
            if (tab === 'prescricoes') panels.pres?.classList.add('active');
            if (tab === 'agendamentos') panels.ag?.classList.add('active');
            if (tab === 'notificacoes') panels.notif?.classList.add('active');
            if (pageTitle) {
                const map = {
                    'prescricoes': 'Minhas Prescrições',
                    'agendamentos': 'Meus Agendamentos',
                    'notificacoes': 'Notificações'
                };
                pageTitle.textContent = map[tab] || 'Painel';
            }
        });
    });

    // Carregar prescrições do paciente pelo CPF
    async function loadPrescricoes() {
        if (!presList) return;
        presList.innerHTML = '<tr><td colspan="4">Carregando…</td></tr>';
        try {
            const r = await fetch('http://localhost:3000/prescricao');
            const list = await r.json();
            let minhas = Array.isArray(list) ? list.filter(p => onlyDigits(p.pacienteCpf || '') === pacienteCpf) : [];
            const q = (presSearch?.value || '').trim().toLowerCase();
            if (q) {
                minhas = minhas.filter(p =>
                    String(p.tipo || '').toLowerCase().includes(q) ||
                    String(p.medicoCrm || '').toLowerCase().includes(q) ||
                    String(p.descricao || '').toLowerCase().includes(q)
                );
            }
            if (!minhas.length) { presList.innerHTML = '<tr class="empty-state"><td colspan="4">Nenhuma prescrição encontrada.</td></tr>'; return; }
            presList.innerHTML = minhas.map(p => `
        <tr>
          <td>${p.tipo || '—'}</td>
          <td>${p.medicoCrm || '—'}</td>
          <td>${p.dataValidade ? new Date(p.dataValidade).toLocaleDateString() : '—'}</td>
          <td>${p.descricao || '—'}</td>
        </tr>
      `).join('');
        } catch (e) {
            console.error(e);
            presList.innerHTML = '<tr><td colspan="4">Erro ao carregar.</td></tr>';
        }
    }

    // Carregar agendamentos do paciente pelo ObjectId (obtido do último cadastro/login)
    async function loadAgendamentos() {
        if (!agList) return;
        agList.innerHTML = '<tr><td colspan="4">Carregando…</td></tr>';
        try {
            const r = await fetch('http://localhost:3000/agendamentos');
            const list = await r.json();
            const pacienteId = pacienteObj?._id;
            let meus = Array.isArray(list) ? list.filter(a => String(a.paciente?._id || a.paciente) === String(pacienteId)) : [];
            const status = (agFilterStatus?.value || '').trim();
            if (status) meus = meus.filter(a => (a.status || '') === status);
            const q = (agSearch?.value || '').trim().toLowerCase();
            if (q) {
                meus = meus.filter(a =>
                    String(a.medico?.nome || '').toLowerCase().includes(q) ||
                    String(a.tipo || '').toLowerCase().includes(q) ||
                    (a.dataAgendamento && new Date(a.dataAgendamento).toLocaleString().toLowerCase().includes(q))
                );
            }
            if (!meus.length) { agList.innerHTML = '<tr class="empty-state"><td colspan="4">Nenhum agendamento encontrado.</td></tr>'; return; }
            agList.innerHTML = meus.map(a => `
        <tr>
          <td>${a.medico?.nome || '—'}</td>
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

    document.addEventListener('DOMContentLoaded', () => {
        loadPrescricoes();
        loadAgendamentos();
    });

    // Filtros e ações
    btnRefresh?.addEventListener('click', () => { loadPrescricoes(); loadAgendamentos(); });
    presSearch?.addEventListener('input', () => { clearTimeout(window.__p_s); window.__p_s = setTimeout(loadPrescricoes, 250); });
    agFilterStatus?.addEventListener('change', loadAgendamentos);
    agSearch?.addEventListener('input', () => { clearTimeout(window.__a_s); window.__a_s = setTimeout(loadAgendamentos, 250); });
})();
