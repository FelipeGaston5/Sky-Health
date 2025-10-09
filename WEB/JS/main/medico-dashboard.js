(() => {
    const onlyDigits = (v) => (v || '').replace(/\D+/g, '');
    const byId = (id) => document.getElementById(id);
    const tabBtns = document.querySelectorAll('.tabs button[data-tab]');
    const panels = {
        ag: byId('tab-agendamentos'),
        notif: byId('tab-notificacoes'),
        pres: byId('tab-prescricao'),
        novoAg: byId('tab-novo-agendamento'),
        exame: byId('tab-exame-resultado')
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
            if (tab === 'exame-resultado') panels.exame?.classList.add('active');
            if (pageTitle) {
                const map = {
                    'agendamentos': 'Agendamentos',
                    'notificacoes': 'Notificações',
                    'prescricao': 'Nova Prescrição',
                    'novo-agendamento': 'Novo Agendamento',
                    'exame-resultado': 'Resultado de Exames'
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
    const presIssuer = byId('pres-issuer');
    // Exames
    const formExame = byId('form-exame');
    const exPacienteCpf = byId('exPacienteCpf');
    const exMedicoCrm = byId('exMedicoCrm');
    const exTipo = byId('exTipo');
    const exNome = byId('exNome');
    const exDataColeta = byId('exDataColeta');
    const exValoresRef = byId('exValoresRef');
    const exLaudo = byId('exLaudo');
    const exameResult = byId('exame-result');
    const exPendList = byId('ex-pend-list');
    const modalLaudo = byId('modal-laudo');
    const laudoClose = byId('laudo-close');
    const laudoCancel = byId('laudo-cancel');
    const formLaudo = byId('form-laudo-completo');
    const laudoExameId = byId('laudoExameId');
    const laudoPaciente = byId('laudoPaciente');
    const laudoNomeExame = byId('laudoNomeExame');
    const laudoJustificativa = byId('laudoJustificativa');
    const laudoDescricaoDetalhada = byId('laudoDescricaoDetalhada');
    const laudoDiscussao = byId('laudoDiscussao');
    const laudoConclusao = byId('laudoConclusao');
    const laudoAnalista = byId('laudoAnalista');
    const laudoDiretor = byId('laudoDiretor');
    const laudoLocalNome = byId('laudoLocalNome');
    const laudoLocalEndereco = byId('laudoLocalEndereco');
    const laudoValoresReferencia = byId('laudoValoresReferencia');
    const laudoTextoLivre = byId('laudoTextoLivre');
    const laudoStatus = byId('laudo-status');
    const presConsent = byId('presConsent');
    const presAssMed = byId('presAssMed');
    const presAssPac = byId('presAssPac');

    formPres?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            pacienteCpf: onlyDigits(presPacienteCpf.value),
            medicoCrm: (presMedicoCrm.value || '').trim(),
            tipo: presTipo.value,
            descricao: (presDesc.value || '').trim(),
            dataValidade: presValidade.value || null,
            consentimentoExplicito: !!presConsent?.checked,
            assinaturaMedico: (presAssMed?.value || '').trim() || null,
            assinaturaPacienteOuResponsavel: (presAssPac?.value || '').trim() || null
        };
        if (!payload.pacienteCpf || !payload.medicoCrm || !payload.tipo || !payload.descricao || !payload.dataValidade || !payload.consentimentoExplicito) {
            return alert('Preencha todos os campos obrigatórios e confirme o consentimento.');
        }
        try {
            const r = await fetch('http://localhost:3000/prescricao', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!r.ok) throw new Error(await r.text());
            const data = await r.json();
            const emitidoPor = data?.prescricao?.medico?.nome ? `${data.prescricao.medico.nome} (CRM ${data.prescricao.medico.crm || '—'})` : (presAssMed?.value || medicoObj?.nome || 'Médico');
            presResult.textContent = `Prescrição criada: ID ${data?.prescricao?._id || '—'}`;
            presResult.style.display = 'block';
            if (presIssuer) {
                presIssuer.textContent = `Emitido por: ${emitidoPor} em ${new Date().toLocaleString()}`;
            }
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
        loadExamesPendentes();
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

    // máscara CPF também para exame
    exPacienteCpf?.addEventListener('input', () => { exPacienteCpf.value = maskCPF(exPacienteCpf.value); });

    // Pré-preencher CRM do médico no formulário de exame
    if (medicoObj?.crm && exMedicoCrm && !exMedicoCrm.value) exMedicoCrm.value = medicoObj.crm;

    formExame?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            pacienteCpf: onlyDigits(exPacienteCpf.value),
            medicoCrm: (exMedicoCrm.value || '').trim(),
            tipoExame: exTipo.value,
            nomeExame: (exNome.value || '').trim() || null,
            laudo: (exLaudo.value || '').trim(), // opcional; se vazio vira pendente
            dataColeta: exDataColeta.value || null,
            valoresReferencia: (exValoresRef.value || '').trim() || null
        };
        if (!payload.pacienteCpf || !payload.medicoCrm || !payload.tipoExame) {
            return alert('Preencha CPF, CRM e tipo do exame. O laudo pode ser concluído depois.');
        }
        try {
            const r = await fetch('http://localhost:3000/exames', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!r.ok) throw new Error(await r.text());
            const data = await r.json();
            exameResult.textContent = `Exame salvo: ID ${data?.exame?._id || '—'}`;
            exameResult.style.display = 'block';
            formExame.reset();
            if (medicoObj?.crm && exMedicoCrm && !exMedicoCrm.value) exMedicoCrm.value = medicoObj.crm;
            loadExamesPendentes();
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar exame.');
        }
    });

    // Função para concluir laudo (caso depois queira implementar lista e botão)
    window.concluirLaudoExame = async (exameId, novoLaudo) => {
        if (!exameId || !novoLaudo) return alert('Exame ou laudo ausente.');
        try {
            const r = await fetch(`http://localhost:3000/exames/${exameId}/laudo`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ laudo: novoLaudo }) });
            if (!r.ok) throw new Error(await r.text());
            const data = await r.json();
            alert('Laudo concluído com sucesso.');
            return data;
        } catch (e) {
            console.error(e);
            alert('Erro ao concluir laudo.');
        }
    };

    async function loadExamesPendentes() {
        if (!exPendList || !medicoId) return;
        exPendList.innerHTML = '<tr><td colspan="6">Carregando…</td></tr>';
        try {
            const r = await fetch(`http://localhost:3000/exames/medico/${medicoId}`);
            const data = await r.json();
            const arr = Array.isArray(data) ? data : (data.exames || []);
            const pend = arr.filter(e => (e.status || (e.laudo ? 'concluido' : 'pendente')) === 'pendente');
            if (!pend.length) { exPendList.innerHTML = '<tr class="empty-state"><td colspan="6">Nenhum exame pendente.</td></tr>'; return; }
            exPendList.innerHTML = pend.map(e => `
            <tr>
                <td>${e.paciente?.nome || '—'}</td>
                <td>${e.nomeExame || '—'}</td>
                <td>${e.tipoExame || '—'}</td>
                <td>${e.dataColeta ? new Date(e.dataColeta).toLocaleDateString() : '—'}</td>
                <td><span class="badge badge-warning">Pendente</span></td>
                <td><button type="button" class="btn btn-primary btn-small" data-exame="${e._id}">Laudar</button></td>
              </tr>
            `).join('');
            // Bind buttons
            exPendList.querySelectorAll('button[data-exame]').forEach(btn => {
                btn.addEventListener('click', () => openLaudoModal(pend.find(x => x._id === btn.getAttribute('data-exame'))));
            });
        } catch (err) {
            console.error(err);
            exPendList.innerHTML = '<tr><td colspan="6">Erro ao carregar.</td></tr>';
        }
    }

    function openLaudoModal(exame) {
        if (!exame || !modalLaudo) return;
        laudoExameId.value = exame._id;
        laudoPaciente.value = exame.paciente?.nome || '—';
        laudoNomeExame.value = exame.nomeExame || exame.tipoExame || '—';
        laudoJustificativa.value = exame.justificativa || '';
        laudoDescricaoDetalhada.value = exame.descricaoDetalhada || '';
        laudoDiscussao.value = exame.discussao || '';
        laudoConclusao.value = exame.conclusao || '';
        laudoAnalista.value = exame.analistaResponsavel || '';
        laudoDiretor.value = exame.diretorTecnico || '';
        laudoLocalNome.value = exame.localNome || '';
        laudoLocalEndereco.value = exame.localEndereco || '';
        laudoValoresReferencia.value = exame.valoresReferencia || '';
        laudoTextoLivre.value = exame.laudo || '';
        laudoStatus.style.display = 'none';
        modalLaudo.style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function closeLaudoModal() {
        if (modalLaudo) modalLaudo.style.display = 'none';
    }
    laudoClose?.addEventListener('click', closeLaudoModal);
    laudoCancel?.addEventListener('click', closeLaudoModal);
    modalLaudo?.addEventListener('click', (e) => { if (e.target === modalLaudo) closeLaudoModal(); });

    formLaudo?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!laudoExameId.value) return alert('Exame não identificado.');
        if (!laudoDescricaoDetalhada.value.trim() && !laudoConclusao.value.trim() && !laudoTextoLivre.value.trim()) {
            return alert('Preencha ao menos Descrição Detalhada, Conclusão ou Laudo Texto Livre.');
        }
        const payload = {
            justificativa: laudoJustificativa.value.trim() || null,
            descricaoDetalhada: laudoDescricaoDetalhada.value.trim() || null,
            discussao: laudoDiscussao.value.trim() || null,
            conclusao: laudoConclusao.value.trim() || null,
            analistaResponsavel: laudoAnalista.value.trim() || null,
            diretorTecnico: laudoDiretor.value.trim() || null,
            valoresReferencia: laudoValoresReferencia.value.trim() || null,
            laudo: laudoTextoLivre.value.trim() || null,
            localNome: laudoLocalNome.value.trim() || null,
            localEndereco: laudoLocalEndereco.value.trim() || null
        };
        try {
            const r = await fetch(`http://localhost:3000/exames/${laudoExameId.value}/laudo`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!r.ok) throw new Error(await r.text());
            laudoStatus.textContent = 'Laudo concluído com sucesso.';
            laudoStatus.style.display = 'block';
            setTimeout(() => { closeLaudoModal(); loadExamesPendentes(); }, 800);
        } catch (err) {
            console.error(err);
            laudoStatus.textContent = 'Erro ao salvar laudo.';
            laudoStatus.style.display = 'block';
            laudoStatus.classList.remove('success');
        }
    });
})();
