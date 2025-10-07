(() => {
    const byId = (id) => document.getElementById(id);
    const tabBtns = document.querySelectorAll('.tabs button[data-tab]');
    const panels = { usuarios: byId('tab-usuarios'), rel: byId('tab-relatorios') };
    const pageTitle = byId('page-section-title');
    const info = byId('adm-info');
    const btnRefresh = byId('adm-refresh');

    // Sessão: exibe nome do ADM se existir em localStorage
    let admObj = null;
    try { admObj = JSON.parse(localStorage.getItem('ultimo_adm_obj') || 'null'); } catch { }
    if (info) info.textContent = admObj?.nome ? `Olá, ${admObj.nome}` : '—';

    // Abas
    tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.getAttribute('data-tab');
            Object.values(panels).forEach(p => p?.classList.remove('active'));
            if (tab === 'usuarios') panels.usuarios?.classList.add('active');
            if (tab === 'relatorios') panels.rel?.classList.add('active');
            if (pageTitle) pageTitle.textContent = (tab === 'usuarios') ? 'Usuários' : 'Relatórios';
        });
    });

    // Utils
    const fmtDate = (d) => d ? new Date(d).toLocaleString() : '—';
    const fmtDateOnly = (d) => d ? new Date(d).toLocaleDateString() : '—';

    // Usuários - Pacientes
    const pacList = byId('pac-list');
    const pacSearch = byId('pac-search');
    const pacDetail = byId('pac-detail');
    const pacDetailCard = byId('pac-detail-card');
    const pacDetailName = byId('pac-detail-name');
    function renderPacienteDetail(p) {
        if (!p || !pacDetail) return;
        pacDetailName && (pacDetailName.textContent = p.nome || '—');
        const endereco = [p.endereco?.rua, p.endereco?.numero, p.endereco?.bairro, p.endereco?.cidade, p.endereco?.estado, p.endereco?.cep].filter(Boolean).join(', ') || '—';
        const rows = [
            ['ID', p._id],
            ['Nome', p.nome],
            ['CPF', p.cpf],
            ['E-mail', p.email],
            ['Telefone', p.telefone],
            ['Nascimento', fmtDateOnly(p.dataNascimento)],
            ['Gênero', p.genero],
            ['Tipo Sanguíneo', p.tipoSanguineo],
            ['Endereço', endereco],
            ['Peso (kg)', p.pesoKg ?? '—'],
            ['Altura (cm)', p.alturaCm ?? '—'],
            ['Alergias', (p.alergias || []).join('; ') || '—'],
            ['Doenças Crônicas', (p.doencasCronicas || []).join('; ') || '—'],
            ['Alergia a Medicamentos', (p.alergiamedicamentos || []).join('; ') || '—'],
            ['Medicamentos em Uso', (p.medicamentosUso || []).join('; ') || '—'],
            ['Cirurgias', (p.historicoCirurgico || []).join('; ') || '—'],
            ['Obs. Médicas', p.observacoesMedicas || '—'],
            ['Username', p.username || '—'],
            ['Criado', fmtDate(p.criadoEm)],
            ['Atualizado', fmtDate(p.atualizadoEm)],
        ];
        pacDetail.innerHTML = rows.map(([k, v]) => `<tr><th style="text-align:left;width:220px">${k}</th><td>${v ?? '—'}</td></tr>`).join('');
        pacDetailCard && (pacDetailCard.style.display = 'block');
    }
    async function loadPacientes() {
        if (!pacList) return;
        // Oculta detalhes até selecionar um item
        if (pacDetailCard) pacDetailCard.style.display = 'none';
        pacList.innerHTML = '<tr><td colspan="3">Carregando…</td></tr>';
        try {
            const r = await fetch('http://localhost:3000/pacientes');
            const list = await r.json();
            const q = (pacSearch?.value || '').toLowerCase().trim();
            let filtrada = Array.isArray(list) ? list : [];
            if (q) {
                filtrada = filtrada.filter(p =>
                    String(p.nome || '').toLowerCase().includes(q) ||
                    String(p.cpf || '').includes(q) ||
                    String(p.email || '').toLowerCase().includes(q)
                );
            }
            if (!filtrada.length) { pacList.innerHTML = '<tr class="empty-state"><td colspan="3">Nenhum paciente encontrado.</td></tr>'; return; }
            pacList.innerHTML = filtrada.map(p => `
        <tr>
          <td><a href="#" data-pac-id="${p._id}">${p._id || '—'}</a></td>
          <td>${p.nome || '—'}</td>
          <td>${p.cpf || '—'}</td>
        </tr>
      `).join('');
            // clique no ID
            pacList.querySelectorAll('a[data-pac-id]').forEach(a => {
                a.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    const id = a.getAttribute('data-pac-id');
                    const obj = (Array.isArray(list) ? list : []).find(x => x._id === id);
                    renderPacienteDetail(obj);
                });
            });
        } catch (e) {
            console.error(e);
            pacList.innerHTML = '<tr><td colspan="3">Erro ao carregar.</td></tr>';
        }
    }

    // Usuários - Médicos
    const medList = byId('med-list');
    const medSearch = byId('med-search');
    const medDetail = byId('med-detail');
    const medDetailCard = byId('med-detail-card');
    const medDetailName = byId('med-detail-name');
    function renderMedicoDetail(m) {
        if (!m || !medDetail) return;
        medDetailName && (medDetailName.textContent = m.nome || '—');
        const endereco = [m.endereco?.rua, m.endereco?.numero, m.endereco?.bairro, m.endereco?.cidade, m.endereco?.estado, m.endereco?.cep].filter(Boolean).join(', ') || '—';
        const rows = [
            ['ID', m._id],
            ['Nome', m.nome],
            ['CPF', m.cpf],
            ['CRM', m.crm],
            ['E-mail', m.email],
            ['Telefone', m.telefone],
            ['Nascimento', fmtDateOnly(m.dataNascimento)],
            ['Gênero', m.genero],
            ['Especialidade', m.especialidade],
            ['Experiência (anos)', m.experienciaAnos ?? '—'],
            ['Hospitais', (m.hospitaisAfiliados || []).join('; ') || '—'],
            ['Consultas Realizadas', m.consultasRealizadas ?? '—'],
            ['Pacientes Atendidos', m.pacientesAtendidos ?? '—'],
            ['Endereço', endereco],
            ['Username', m.username || '—'],
            ['Criado', fmtDate(m.criadoEm)],
            ['Atualizado', fmtDate(m.atualizadoEm)],
        ];
        medDetail.innerHTML = rows.map(([k, v]) => `<tr><th style=\"text-align:left;width:220px\">${k}</th><td>${v ?? '—'}</td></tr>`).join('');
        medDetailCard && (medDetailCard.style.display = 'block');
    }
    async function loadMedicos() {
        if (!medList) return;
        // Oculta detalhes até selecionar um item
        if (medDetailCard) medDetailCard.style.display = 'none';
        medList.innerHTML = '<tr><td colspan="3">Carregando…</td></tr>';
        try {
            const r = await fetch('http://localhost:3000/medicos/medicos');
            const list = await r.json();
            const q = (medSearch?.value || '').toLowerCase().trim();
            let filtrada = Array.isArray(list) ? list : [];
            if (q) {
                filtrada = filtrada.filter(m =>
                    String(m.nome || '').toLowerCase().includes(q) ||
                    String(m.crm || '').toLowerCase().includes(q) ||
                    String(m.email || '').toLowerCase().includes(q)
                );
            }
            if (!filtrada.length) { medList.innerHTML = '<tr class="empty-state"><td colspan="3">Nenhum médico encontrado.</td></tr>'; return; }
            medList.innerHTML = filtrada.map(m => `
        <tr>
          <td><a href="#" data-med-id="${m._id}">${m._id || '—'}</a></td>
          <td>${m.nome || '—'}</td>
          <td>${m.crm || '—'}</td>
        </tr>
      `).join('');
            // clique no ID
            medList.querySelectorAll('a[data-med-id]').forEach(a => {
                a.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    const id = a.getAttribute('data-med-id');
                    const obj = (Array.isArray(list) ? list : []).find(x => x._id === id);
                    renderMedicoDetail(obj);
                });
            });
        } catch (e) {
            console.error(e);
            medList.innerHTML = '<tr><td colspan="3">Erro ao carregar.</td></tr>';
        }
    }

    // Relatórios
    const agStats = byId('rel-ag-stats');
    const agProx = byId('rel-ag-prox');
    const agRec = byId('rel-ag-recentes');
    const prStats = byId('rel-pr-stats');
    const prVal = byId('rel-pr-validas');
    const prRet = byId('rel-pr-retiradas');
    const relRange = byId('rel-range');

    function inRange(date, days) {
        if (days === 'all') return true;
        const dt = new Date(date).getTime();
        const now = Date.now();
        const from = now - (Number(days) * 24 * 60 * 60 * 1000);
        return dt >= from && dt <= now + (365 * 24 * 60 * 60 * 1000); // inclui futuros
    }

    async function loadRelatorios() {
        const range = relRange?.value || '30';

        // Agendamentos
        agProx.innerHTML = '<tr><td colspan="5">Carregando…</td></tr>';
        agRec.innerHTML = '<tr><td colspan="5">Carregando…</td></tr>';
        try {
            const rAg = await fetch('http://localhost:3000/agendamentos');
            const ags = await rAg.json();
            const arr = Array.isArray(ags) ? ags : [];
            const prox = arr.filter(a => new Date(a.dataAgendamento) > new Date());
            const rec = arr.filter(a => new Date(a.dataAgendamento) <= new Date());
            const proxR = prox.filter(a => inRange(a.dataAgendamento, range));
            const recR = rec.filter(a => inRange(a.dataAgendamento, range));
            agProx.innerHTML = proxR.length ? proxR.map(a => `
        <tr><td>${a.medico?.nome || '—'}</td><td>${a.paciente?.nome || '—'}</td><td>${a.tipo || '—'}</td><td>${fmtDate(a.dataAgendamento)}</td><td>${a.status || '—'}</td></tr>
      `).join('') : '<tr class="empty-state"><td colspan="5">Nenhum registro.</td></tr>';
            agRec.innerHTML = recR.length ? recR.map(a => `
        <tr><td>${a.medico?.nome || '—'}</td><td>${a.paciente?.nome || '—'}</td><td>${a.tipo || '—'}</td><td>${fmtDate(a.dataAgendamento)}</td><td>${a.status || '—'}</td></tr>
      `).join('') : '<tr class="empty-state"><td colspan="5">Nenhum registro.</td></tr>';
            if (agStats) agStats.innerHTML = `
        <li>Total: ${arr.length}</li>
        <li>Agendados: ${arr.filter(a => a.status === 'Agendado').length}</li>
        <li>Realizados: ${arr.filter(a => a.status === 'Realizado').length}</li>
        <li>Cancelados: ${arr.filter(a => a.status === 'Cancelado').length}</li>
      `;
        } catch (e) {
            console.error(e);
            agProx.innerHTML = agRec.innerHTML = '<tr><td colspan="5">Erro ao carregar.</td></tr>';
        }

        // Prescrições
        prVal.innerHTML = '<tr><td colspan="4">Carregando…</td></tr>';
        prRet.innerHTML = '<tr><td colspan="4">Carregando…</td></tr>';
        try {
            const rPr = await fetch('http://localhost:3000/prescricao');
            const payload = await rPr.json();
            const list = Array.isArray(payload?.prescricoes) ? payload.prescricoes : (Array.isArray(payload) ? payload : []);
            const now = Date.now();
            // Válida: dentro da validade (dataValidade > agora)
            const validas = list.filter(p => p.dataValidade && new Date(p.dataValidade).getTime() > now);
            // Retirada: não temos um campo explícito; assumimos valida = false como retirada (ou expiradas + alguma lógica)
            const retiradas = list.filter(p => p.valida === false && p.dataValidade && new Date(p.dataValidade).getTime() <= now);
            prVal.innerHTML = validas.length ? validas.map(p => `
        <tr><td>${p.tipo || '—'}</td><td>${p.medico?.nome || p.medico?.crm || '—'}</td><td>${p.paciente?.nome || p.paciente?.cpf || '—'}</td><td>${fmtDateOnly(p.dataValidade)}</td></tr>
      `).join('') : '<tr class="empty-state"><td colspan="4">Nenhum registro.</td></tr>';
            prRet.innerHTML = retiradas.length ? retiradas.map(p => `
        <tr><td>${p.tipo || '—'}</td><td>${p.medico?.nome || p.medico?.crm || '—'}</td><td>${p.paciente?.nome || p.paciente?.cpf || '—'}</td><td>${fmtDateOnly(p.dataValidade)}</td></tr>
      `).join('') : '<tr class="empty-state"><td colspan="4">Nenhum registro.</td></tr>';
            if (prStats) prStats.innerHTML = `
        <li>Total: ${list.length}</li>
        <li>Válidas: ${validas.length}</li>
        <li>Retiradas/Expiradas: ${retiradas.length}</li>
      `;
        } catch (e) {
            console.error(e);
            prVal.innerHTML = prRet.innerHTML = '<tr><td colspan="4">Erro ao carregar.</td></tr>';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadPacientes();
        loadMedicos();
        loadRelatorios();
    });

    btnRefresh?.addEventListener('click', () => {
        loadPacientes();
        loadMedicos();
        loadRelatorios();
    });

    pacSearch?.addEventListener('input', () => { clearTimeout(window.__adm_p); window.__adm_p = setTimeout(loadPacientes, 250); });
    medSearch?.addEventListener('input', () => { clearTimeout(window.__adm_m); window.__adm_m = setTimeout(loadMedicos, 250); });
    byId('rel-range')?.addEventListener('change', loadRelatorios);
})();
