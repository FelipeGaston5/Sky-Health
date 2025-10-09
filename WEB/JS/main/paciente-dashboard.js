(() => {
    const byId = (id) => document.getElementById(id);
    const onlyDigits = (v) => (v || '').replace(/\D+/g, '');

    const tabBtns = document.querySelectorAll('.tabs button[data-tab]');
    const panels = {
        pres: byId('tab-prescricoes'),
        ag: byId('tab-agendamentos'),
        notif: byId('tab-notificacoes'),
        exames: byId('tab-exames'),
        hist: byId('tab-historico'),
    };

    const pageTitle = byId('page-section-title');
    const info = byId('paciente-info');
    const btnRefresh = byId('btn-refresh');

    const presList = byId('pres-list');
    const presSearch = byId('pres-search');

    const agList = byId('ag-list');
    const exList = byId('ex-list');
    const exSearch = byId('ex-search');
    // Botões externos de export de exames removidos (export agora no modal)
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
            if (tab === 'historico') panels.hist?.classList.add('active');
            if (tab === 'exames') panels.exames?.classList.add('active');
            if (pageTitle) {
                const map = {
                    'prescricoes': 'Minhas Prescrições',
                    'agendamentos': 'Meus Agendamentos',
                    'notificacoes': 'Notificações',
                    'exames': 'Resultados de Exames',
                    'historico': 'Histórico Médico'
                };
                pageTitle.textContent = map[tab] || 'Painel';
            }
        });
    });

    // Carregar prescrições do paciente (usa rota dedicada; fallback para lista completa)
    async function loadPrescricoes() {
        if (!presList) return;
        presList.innerHTML = '<tr><td colspan="4">Carregando…</td></tr>';
        const pacienteId = pacienteObj?._id;
        if (!pacienteId) {
            presList.innerHTML = '<tr class="empty-state"><td colspan="4">Sessão do paciente não encontrada.</td></tr>';
            return;
        }
        try {
            let data;
            // Tenta endpoint filtrado por paciente
            try {
                const r1 = await fetch(`http://localhost:3000/prescricao/paciente/${pacienteId}`);
                if (!r1.ok) throw new Error('Falha endpoint filtrado');
                data = await r1.json();
            } catch {
                // Fallback: todas as prescrições
                const r2 = await fetch('http://localhost:3000/prescricao');
                data = await r2.json();
            }
            const arr = Array.isArray(data) ? data : (Array.isArray(data.prescricoes) ? data.prescricoes : []);
            // Filtra por id ou CPF (caso backend retorne sem usar endpoint filtrado)
            let minhas = arr.filter(p => {
                const pid = String(p.paciente?._id || p.paciente || '');
                const pcpf = onlyDigits(p.paciente?.cpf || '');
                return pid === String(pacienteId) || (pcpf && pcpf === pacienteCpf);
            });
            // Filtro de busca
            const q = (presSearch?.value || '').trim().toLowerCase();
            if (q) {
                minhas = minhas.filter(p =>
                    String(p.tipo || '').toLowerCase().includes(q) ||
                    String(p.medico?.crm || '').toLowerCase().includes(q) ||
                    String(p.descricao || '').toLowerCase().includes(q)
                );
            }
            if (!minhas.length) {
                presList.innerHTML = '<tr class="empty-state"><td colspan="4">Nenhuma prescrição encontrada.</td></tr>';
                return;
            }
            presList.innerHTML = minhas.map(p => {
                const tipo = p.tipo || '—';
                const crm = p.medico?.crm || '—';
                const validade = p.dataValidade ? new Date(p.dataValidade).toLocaleDateString() : '—';
                const desc = p.descricao || '—';
                return `<tr><td>${tipo}</td><td>${crm}</td><td>${validade}</td><td>${desc}</td></tr>`;
            }).join('');
        } catch (e) {
            console.error('Erro ao carregar prescrições:', e);
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
        loadExames();
        setTimeout(() => buildHistorico(), 600);
    });

    // Filtros e ações
    btnRefresh?.addEventListener('click', () => { loadPrescricoes(); loadAgendamentos(); loadExames(); });
    presSearch?.addEventListener('input', () => { clearTimeout(window.__p_s); window.__p_s = setTimeout(loadPrescricoes, 250); });
    agFilterStatus?.addEventListener('change', loadAgendamentos);
    agSearch?.addEventListener('input', () => { clearTimeout(window.__a_s); window.__a_s = setTimeout(loadAgendamentos, 250); });
    exSearch?.addEventListener('input', () => { clearTimeout(window.__e_s); window.__e_s = setTimeout(() => { renderExames(); }, 200); });

    // Modal Exame - referências serão (re)capturadas após DOM pronto
    let modalExame, mxClose, mxTitulo, mxChips, mxTipo, mxNome, mxMedico, mxCrm, mxColeta, mxResultado, mxRef, mxJust, mxDesc, mxDisc, mxConc, mxLaudo, mxAnalista, mxDiretor, mxLocalNome, mxLocalEnd;
    let mxCopyBtn, mxExpTxtBtn, mxExpJsonBtn, mxExpXmlBtn, mxExpPdfBtn;
    let __exame_atual_modal = null;

    function initModalRefs() {
        modalExame = document.getElementById('modal-exame');
        mxClose = document.getElementById('mx-close');
        mxTitulo = document.getElementById('mx-titulo');
        mxChips = document.getElementById('mx-chips');
        mxTipo = document.getElementById('mx-tipo');
        mxNome = document.getElementById('mx-nome');
        mxMedico = document.getElementById('mx-medico');
        mxCrm = document.getElementById('mx-crm');
        mxColeta = document.getElementById('mx-coleta');
        mxResultado = document.getElementById('mx-resultado');
        mxRef = document.getElementById('mx-ref');
        mxJust = document.getElementById('mx-justificativa');
        mxDesc = document.getElementById('mx-descricao');
        mxDisc = document.getElementById('mx-discussao');
        mxConc = document.getElementById('mx-conclusao');
        mxLaudo = document.getElementById('mx-laudo');
        mxAnalista = document.getElementById('mx-analista');
        mxDiretor = document.getElementById('mx-diretor');
        mxLocalNome = document.getElementById('mx-local-nome');
        mxLocalEnd = document.getElementById('mx-local-endereco');
        mxCopyBtn = document.getElementById('mx-copy');
        mxExpTxtBtn = document.getElementById('mx-exp-txt');
        mxExpJsonBtn = document.getElementById('mx-exp-json');
        mxExpXmlBtn = document.getElementById('mx-exp-xml');
        mxExpPdfBtn = document.getElementById('mx-exp-pdf');
    }

    let __exames_cache = [];
    let __exames_export_cache = null; // cache da última string gerada para evitar recomputo

    async function loadExames() {
        if (!exList) return;
        exList.innerHTML = '<tr><td colspan="6">Carregando…</td></tr>';
        const pacienteId = pacienteObj?._id;
        if (!pacienteId) { exList.innerHTML = '<tr class="empty-state"><td colspan="6">Sessão não encontrada.</td></tr>'; return; }
        try {
            const r = await fetch(`http://localhost:3000/exames/paciente/${pacienteId}`);
            const json = await r.json();
            const arr = Array.isArray(json) ? json : (json.exames || []);
            __exames_cache = arr;
            renderExames();
        } catch (err) {
            console.error('Erro exames:', err);
            exList.innerHTML = '<tr><td colspan="6">Erro ao carregar.</td></tr>';
        }
    }

    function renderExames() {
        if (!exList) return;
        const q = (exSearch?.value || '').trim().toLowerCase();
        let meus = __exames_cache;
        if (q) {
            meus = meus.filter(e =>
                String(e.tipoExame || '').toLowerCase().includes(q) ||
                String(e.nomeExame || '').toLowerCase().includes(q) ||
                String(e.medico?.nome || '').toLowerCase().includes(q)
            );
        }
        if (!meus.length) { exList.innerHTML = '<tr class="empty-state"><td colspan="6">Nenhum exame encontrado.</td></tr>'; return; }
        exList.innerHTML = meus.map(e => {
            const status = e.status || (e.laudo ? 'concluido' : 'pendente');
            const cls = status === 'concluido' ? 'status-concluido' : 'status-pendente';
            return `<tr>
                <td>${e.tipoExame || '—'}</td>
                <td>${e.nomeExame || '—'}</td>
                <td><span class="${cls}">${status}</span></td>
                <td>${e.dataResultado ? new Date(e.dataResultado).toLocaleDateString() : '—'}</td>
                <td>${e.medico?.nome || '—'}</td>
                <td><button type="button" class="btn btn-secondary btn-small" data-view-exame="${e._id}">Ver</button></td>
            </tr>`;
        }).join('');
        // Bind
        exList.querySelectorAll('button[data-view-exame]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-view-exame');
                const exame = __exames_cache.find(x => x._id === id);
                if (exame) openExameModal(exame);
            });
        });
        // Invalida cache de export sempre que re-renderiza
        __exames_export_cache = null;
    }

    function openExameModal(exame) {
        if (!modalExame) initModalRefs();
        if (!modalExame) return console.warn('Modal de exame não encontrado no DOM.');
        // Se algum campo essencial ainda não existe, tenta reconsultar
        if (!mxTitulo) initModalRefs();
        __exame_atual_modal = exame;
        const status = exame.status || (exame.laudo ? 'concluido' : 'pendente');
        if (mxTitulo) mxTitulo.textContent = `Exame - ${exame.nomeExame || exame.tipoExame || 'Detalhes'}`;
        if (mxChips) mxChips.innerHTML = `<span class="chip ${status === 'concluido' ? 'status-concluido' : 'status-pendente'}">${status}</span>`;
        if (mxTipo) mxTipo.textContent = exame.tipoExame || '—';
        if (mxNome) mxNome.textContent = exame.nomeExame || '—';
        if (mxMedico) mxMedico.textContent = exame.medico?.nome || '—';
        if (mxCrm) mxCrm.textContent = exame.medico?.crm || '—';
        if (mxColeta) mxColeta.textContent = exame.dataColeta ? new Date(exame.dataColeta).toLocaleString() : '—';
        if (mxResultado) mxResultado.textContent = exame.dataResultado ? new Date(exame.dataResultado).toLocaleString() : '—';
        if (mxRef) mxRef.textContent = exame.valoresReferencia || '—';
        if (mxJust) mxJust.textContent = exame.justificativa || '—';
        if (mxDesc) mxDesc.textContent = exame.descricaoDetalhada || '—';
        if (mxDisc) mxDisc.textContent = exame.discussao || '—';
        if (mxConc) mxConc.textContent = exame.conclusao || '—';
        if (mxLaudo) mxLaudo.textContent = exame.laudo || (status === 'pendente' ? '(Laudo pendente)' : '—');
        if (mxAnalista) mxAnalista.textContent = exame.analistaResponsavel || '—';
        if (mxDiretor) mxDiretor.textContent = exame.diretorTecnico || '—';
        if (mxLocalNome) mxLocalNome.textContent = exame.localNome || '—';
        if (mxLocalEnd) mxLocalEnd.textContent = exame.localEndereco || '—';
        modalExame.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        bindModalExportActions();
    }

    function closeExameModal() {
        if (modalExame) { modalExame.style.display = 'none'; document.body.style.overflow = ''; }
    }
    document.addEventListener('DOMContentLoaded', () => {
        initModalRefs();
        mxClose?.addEventListener('click', closeExameModal);
        modalExame?.addEventListener('click', (e) => { if (e.target === modalExame) closeExameModal(); });
    });

    function exameToTxt(e) {
        if (!e) return '';
        const f = (k, v) => `${k}: ${v ?? '—'}`;
        const linhas = [
            '=== EXAME ===',
            f('ID', e._id),
            f('Tipo', e.tipoExame),
            f('Nome', e.nomeExame),
            f('Status', e.status || (e.laudo ? 'concluido' : 'pendente')),
            f('Data Coleta', formatDateShort(e.dataColeta)),
            f('Data Resultado', formatDateShort(e.dataResultado)),
            f('Médico', e.medico?.nome),
            f('CRM', e.medico?.crm),
            f('Analista Responsável', e.analistaResponsavel),
            f('Diretor Técnico', e.diretorTecnico),
            f('Local Nome', e.localNome),
            f('Local Endereço', e.localEndereco),
            f('Valores Referência', e.valoresReferencia),
            f('Justificativa', e.justificativa),
            f('Descrição Detalhada', e.descricaoDetalhada),
            f('Discussão', e.discussao),
            f('Conclusão', e.conclusao),
            f('Laudo', e.laudo || '(pendente)'),
            '--- Fim ---'
        ];
        return linhas.join('\n');
    }

    function exameToJson(e) { return JSON.stringify(e, null, 2); }
    function exameToXml(e) {
        if (!e) return '';
        const esc = (v) => String(v ?? '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[s]));
        return `<?xml version="1.0" encoding="UTF-8"?>\n<exame id="${esc(e._id)}" status="${esc(e.status || (e.laudo ? 'concluido' : 'pendente'))}">\n  <tipo>${esc(e.tipoExame)}</tipo>\n  <nome>${esc(e.nomeExame)}</nome>\n  <dataColeta>${esc(e.dataColeta)}</dataColeta>\n  <dataResultado>${esc(e.dataResultado)}</dataResultado>\n  <valoresReferencia>${esc(e.valoresReferencia)}</valoresReferencia>\n  ${e.justificativa ? `<justificativa>${esc(e.justificativa)}</justificativa>` : ''}\n  ${e.descricaoDetalhada ? `<descricaoDetalhada>${esc(e.descricaoDetalhada)}</descricaoDetalhada>` : ''}\n  ${e.discussao ? `<discussao>${esc(e.discussao)}</discussao>` : ''}\n  ${e.conclusao ? `<conclusao>${esc(e.conclusao)}</conclusao>` : ''}\n  ${e.analistaResponsavel ? `<analistaResponsavel>${esc(e.analistaResponsavel)}</analistaResponsavel>` : ''}\n  ${e.diretorTecnico ? `<diretorTecnico>${esc(e.diretorTecnico)}</diretorTecnico>` : ''}\n  ${(e.localNome || e.localEndereco) ? `<local><nome>${esc(e.localNome)}</nome><endereco>${esc(e.localEndereco)}</endereco></local>` : ''}\n  ${e.laudo ? `<laudo>${esc(e.laudo)}</laudo>` : '<laudo pendente="true" />'}\n  <medico crm="${esc(e.medico?.crm)}">${esc(e.medico?.nome)}</medico>\n</exame>`;
    }

    function bindModalExportActions() {
        if (!mxCopyBtn) return;
        mxCopyBtn.onclick = () => {
            if (!__exame_atual_modal) return;
            const txt = exameToTxt(__exame_atual_modal);
            navigator.clipboard?.writeText(txt).then(() => {
                mxCopyBtn.textContent = 'Copiado';
                setTimeout(() => mxCopyBtn.textContent = 'Copiar', 1800);
            }).catch(() => alert('Falha ao copiar'));
        };
        mxExpTxtBtn.onclick = () => { if (__exame_atual_modal) downloadFile('exame.txt', 'text/plain;charset=utf-8', exameToTxt(__exame_atual_modal)); };
        mxExpJsonBtn.onclick = () => { if (__exame_atual_modal) downloadFile('exame.json', 'application/json;charset=utf-8', exameToJson(__exame_atual_modal)); };
        mxExpXmlBtn.onclick = () => { if (__exame_atual_modal) downloadFile('exame.xml', 'application/xml;charset=utf-8', exameToXml(__exame_atual_modal)); };
        mxExpPdfBtn.onclick = () => {
            if (!__exame_atual_modal) return;
            const txt = exameToTxt(__exame_atual_modal).replace(/[&<>]/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[s]));
            const w = window.open('', '_blank');
            if (!w) return alert('Popup bloqueado.');
            w.document.write(`<html><head><title>Exame</title><meta charset='utf-8'><style>body{font-family:Arial,Helvetica,sans-serif;white-space:pre-wrap;font-size:12px;line-height:1.4;margin:24px;}h1{text-align:center;margin-bottom:16px;}hr{margin:24px 0;}</style></head><body><h1>Exame</h1><pre>${txt}</pre><hr><small>Gerado em ${new Date().toLocaleString()}</small></body></html>`);
            w.document.close(); w.focus(); setTimeout(() => w.print(), 400);
        };
    }

    // ================= Histórico Médico Consolidado =================
    const histConteudo = byId('hist-conteudo');
    const histStatus = byId('hist-status');
    const btnHistRefresh = byId('hist-refresh');
    const btnHistTxt = byId('hist-export-txt');
    const btnHistXml = byId('hist-export-xml');
    const btnHistJson = byId('hist-export-json');
    const btnHistPdf = byId('hist-export-pdf');
    const btnHistImport = byId('hist-import');
    const inputHistImport = byId('hist-import-input');
    // Modal de preview de importação
    let modalHmc, mhmcClose, mhmcPreview, mhmcToggle, mhmcConfirm, mhmcCancel, mhmcMeta;
    let __hmc_import_buffer = null; // {type, raw, parsed, fileName, truncated}

    function initImportModalRefs() {
        modalHmc = document.getElementById('modal-hmc');
        mhmcClose = document.getElementById('mhmc-close');
        mhmcPreview = document.getElementById('mhmc-preview');
        mhmcToggle = document.getElementById('mhmc-toggle');
        mhmcConfirm = document.getElementById('mhmc-confirm');
        mhmcCancel = document.getElementById('mhmc-cancel');
        mhmcMeta = document.getElementById('mhmc-meta');
    }

    function openImportModal() {
        if (!modalHmc) initImportModalRefs();
        if (!modalHmc) return;
        modalHmc.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeImportModal() {
        if (modalHmc) modalHmc.style.display = 'none';
        document.body.style.overflow = '';
    }

    async function fetchAllData() {
        const pacienteId = pacienteObj?._id;
        if (!pacienteId) throw new Error('Paciente não autenticado.');
        // Paraleliza: prescrições + exames + paciente
        const [presR, exR, pacR] = await Promise.all([
            fetch(`http://localhost:3000/prescricao/paciente/${pacienteId}`).catch(() => null),
            fetch(`http://localhost:3000/exames/paciente/${pacienteId}`).catch(() => null),
            fetch(`http://localhost:3000/pacientes/${pacienteId}`).catch(() => null)
        ]);
        let prescricoes = [];
        if (presR && presR.ok) {
            const pj = await presR.json();
            prescricoes = Array.isArray(pj) ? pj : (pj.prescricoes || []);
        }
        let exames = [];
        if (exR && exR.ok) {
            const ej = await exR.json();
            exames = Array.isArray(ej) ? ej : (ej.exames || []);
        }
        let pacienteFull = pacienteObj;
        if (pacR && pacR.ok) pacienteFull = await pacR.json();
        return { paciente: pacienteFull, prescricoes, exames };
    }

    function formatDate(d) {
        if (!d) return '—';
        try { return new Date(d).toLocaleString(); } catch { return d; }
    }

    function buildTxt(data) {
        const { paciente, prescricoes, exames } = data;
        const linha = (k, v) => `${k}: ${v ?? '—'}`;
        const header = [
            '=== HISTÓRICO MÉDICO CONSOLIDADO ===',
            `Gerado em: ${formatDate(Date.now())}`,
            ''
        ];
        const ident = [
            '--- Identificação do Paciente ---',
            linha('Nome completo', paciente?.nome),
            linha('Data de nascimento', paciente?.dataNascimento ? new Date(paciente.dataNascimento).toLocaleDateString() : '—'),
            linha('Sexo/Gênero', paciente?.genero),
            linha('CPF', paciente?.cpf),
            linha('Contato (telefone)', paciente?.telefone),
            linha('E-mail', paciente?.email),
            linha('Endereço', paciente?.endereco ? `${paciente.endereco.rua || ''}, ${paciente.endereco.numero || ''} - ${paciente.endereco.bairro || ''} - ${paciente.endereco.cidade || ''}/${paciente.endereco.estado || ''} CEP:${paciente.endereco.cep || ''}` : '—'),
            ''
        ];
        const saude = [
            '--- Dados de Saúde / Anamnese (parcial) ---',
            linha('Tipo Sanguíneo', paciente?.tipoSanguineo),
            linha('Peso (kg)', paciente?.pesoKg),
            linha('Altura (cm)', paciente?.alturaCm),
            linha('Alergias', (paciente?.alergias || []).join(', ') || '—'),
            linha('Doenças Crônicas', (paciente?.doencasCronicas || []).join(', ') || '—'),
            linha('Alergia a Medicamentos', (paciente?.alergiamedicamentos || []).join(', ') || '—'),
            linha('Medicamentos em Uso', (paciente?.medicamentosUso || []).join(', ') || '—'),
            linha('Histórico Cirúrgico', (paciente?.historicoCirurgico || []).join(', ') || '—'),
            linha('Observações Médicas', paciente?.observacoesMedicas),
            ''
        ];
        // Montagem correta (sem espalhar string em caracteres)
        const prescrSec = ['--- Prescrições / Tratamentos ---'];
        if (prescricoes.length) {
            prescricoes.forEach(p => {
                prescrSec.push([
                    `* Tipo: ${p.tipo}`,
                    `  Emissão: ${formatDate(p.dataEmissao)}`,
                    `  Validade: ${formatDate(p.dataValidade)}`,
                    `  Médico: ${p.medico?.nome || '—'} (CRM: ${p.medico?.crm || '—'})`,
                    `  Descrição: ${p.descricao}`,
                    ''
                ].join('\n'));
            });
        } else {
            prescrSec.push('Nenhuma prescrição registrada.', '');
        }
        const exSec = ['--- Resultados / Laudos de Exames ---'];
        if (exames.length) {
            exames.forEach(e => {
                const linhas = [
                    `* Tipo: ${e.tipoExame}`,
                    `  Nome: ${e.nomeExame || '—'}`,
                    `  Coleta: ${formatDate(e.dataColeta)}`,
                    `  Resultado: ${formatDate(e.dataResultado)}`,
                    `  Status: ${e.status || (e.laudo ? 'concluido' : 'pendente')}`,
                    `  Médico: ${e.medico?.nome || '—'} (CRM: ${e.medico?.crm || '—'})`
                ];
                if (e.valoresReferencia) linhas.push(`  Valores Referência: ${e.valoresReferencia}`);
                if (e.laudo) linhas.push(`  Laudo: ${e.laudo}`); else linhas.push('  Laudo: (pendente)');
                linhas.push('');
                exSec.push(linhas.join('\n'));
            });
        } else {
            exSec.push('Nenhum exame registrado.', '');
        }
        const footer = [
            '--- Fim do Documento ---'
        ];
        return [...header, ...ident, ...saude, ...prescrSec, ...exSec, ...footer].join('\n');
    }

    // ================= Exportação de Exames (aba específica) =================
    function formatDateShort(d) { if (!d) return '—'; try { return new Date(d).toLocaleString(); } catch { return d; } }

    function buildExamesTxt(arr) {
        const header = [
            '=== RESULTADOS / LAUDOS DE EXAMES ===',
            `Gerado em: ${formatDateShort(Date.now())}`,
            ''
        ];
        if (!arr.length) return header.concat(['Nenhum exame registrado.', '']).join('\n');
        const blocos = arr.map(e => {
            const linhas = [
                `* ID: ${e._id}`,
                `  Tipo: ${e.tipoExame || '—'}`,
                `  Nome: ${e.nomeExame || '—'}`,
                `  Status: ${e.status || (e.laudo ? 'concluido' : 'pendente')}`,
                `  Coleta: ${formatDateShort(e.dataColeta)}`,
                `  Resultado: ${formatDateShort(e.dataResultado)}`,
                `  Médico: ${(e.medico?.nome || '—')} (CRM: ${e.medico?.crm || '—'})`,
            ];
            if (e.valoresReferencia) linhas.push(`  Valores Referência: ${e.valoresReferencia}`);
            if (e.justificativa) linhas.push(`  Justificativa: ${e.justificativa}`);
            if (e.descricaoDetalhada) linhas.push(`  Descrição Detalhada: ${e.descricaoDetalhada}`);
            if (e.discussao) linhas.push(`  Discussão: ${e.discussao}`);
            if (e.conclusao) linhas.push(`  Conclusão: ${e.conclusao}`);
            if (e.analistaResponsavel) linhas.push(`  Analista Responsável: ${e.analistaResponsavel}`);
            if (e.diretorTecnico) linhas.push(`  Diretor Técnico: ${e.diretorTecnico}`);
            if (e.localNome || e.localEndereco) linhas.push(`  Local: ${(e.localNome || '—')} ${e.localEndereco ? ' - ' + e.localEndereco : ''}`);
            if (e.laudo) linhas.push(`  Laudo: ${e.laudo}`); else linhas.push('  Laudo: (pendente)');
            return linhas.join('\n');
        });
        return header.concat(blocos).concat(['', '--- Fim do Documento ---']).join('\n');
    }

    function buildExamesXml(arr) {
        const esc = (v) => String(v ?? '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[s]));
        return `<?xml version="1.0" encoding="UTF-8"?>\n<exames geradoEm="${esc(formatDateShort(Date.now()))}">\n${arr.map(e => `  <exame id="${esc(e._id)}" status="${esc(e.status || (e.laudo ? 'concluido' : 'pendente'))}">\n    <tipo>${esc(e.tipoExame)}</tipo>\n    <nome>${esc(e.nomeExame)}</nome>\n    <dataColeta>${esc(e.dataColeta)}</dataColeta>\n    <dataResultado>${esc(e.dataResultado)}</dataResultado>\n    <valoresReferencia>${esc(e.valoresReferencia)}</valoresReferencia>\n    ${e.justificativa ? `<justificativa>${esc(e.justificativa)}</justificativa>` : ''}\n    ${e.descricaoDetalhada ? `<descricaoDetalhada>${esc(e.descricaoDetalhada)}</descricaoDetalhada>` : ''}\n    ${e.discussao ? `<discussao>${esc(e.discussao)}</discussao>` : ''}\n    ${e.conclusao ? `<conclusao>${esc(e.conclusao)}</conclusao>` : ''}\n    ${e.analistaResponsavel ? `<analistaResponsavel>${esc(e.analistaResponsavel)}</analistaResponsavel>` : ''}\n    ${e.diretorTecnico ? `<diretorTecnico>${esc(e.diretorTecnico)}</diretorTecnico>` : ''}\n    ${(e.localNome || e.localEndereco) ? `<local><nome>${esc(e.localNome)}</nome><endereco>${esc(e.localEndereco)}</endereco></local>` : ''}\n    ${e.laudo ? `<laudo>${esc(e.laudo)}</laudo>` : '<laudo pendente="true" />'}\n    <medico crm="${esc(e.medico?.crm)}">${esc(e.medico?.nome)}</medico>\n  </exame>`).join('\n')}\n</exames>`;
    }

    function buildExamesJson(arr) {
        return JSON.stringify(arr, null, 2);
    }

    function ensureExamesExportCache() {
        if (__exames_export_cache) return __exames_export_cache;
        const q = (exSearch?.value || '').trim().toLowerCase();
        let meus = __exames_cache;
        if (q) {
            meus = meus.filter(e => String(e.tipoExame || '').toLowerCase().includes(q) || String(e.nomeExame || '').toLowerCase().includes(q) || String(e.medico?.nome || '').toLowerCase().includes(q));
        }
        __exames_export_cache = {
            arr: meus,
            txt: buildExamesTxt(meus),
            xml: buildExamesXml(meus),
            json: buildExamesJson(meus)
        };
        return __exames_export_cache;
    }

    function exportExames(kind) {
        if (!__exames_cache.length) return alert('Nenhum exame para exportar.');
        const cache = ensureExamesExportCache();
        if (!cache.arr.length) return alert('Nenhum exame após filtro/busca.');
        if (kind === 'txt') return downloadFile('exames.txt', 'text/plain;charset=utf-8', cache.txt);
        if (kind === 'xml') return downloadFile('exames.xml', 'application/xml;charset=utf-8', cache.xml);
        if (kind === 'json') return downloadFile('exames.json', 'application/json;charset=utf-8', cache.json);
        if (kind === 'pdf') {
            const w = window.open('', '_blank');
            if (!w) return alert('Popup bloqueado. Libere popups para exportar.');
            const safe = cache.txt.replace(/[&<>]/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[s]));
            w.document.write(`<html><head><title>Exames</title><meta charset='utf-8'><style>body{font-family:Arial,Helvetica,sans-serif;white-space:pre-wrap;font-size:12px;line-height:1.4;margin:24px;}h1{text-align:center;margin-bottom:16px;}hr{margin:24px 0;}</style></head><body><h1>Resultados de Exames</h1><pre>${safe}</pre><hr><small>Gerado em ${new Date().toLocaleString()}</small></body></html>`);
            w.document.close(); w.focus(); setTimeout(() => w.print(), 400);
        }
    }

    // (sem listeners externos)

    function buildXml(data) {
        const esc = (v) => String(v ?? '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[s]));
        const { paciente, prescricoes, exames } = data;
        const addr = paciente?.endereco || {};
        return `<?xml version="1.0" encoding="UTF-8"?>\n<historicoMedico geradoEm="${esc(formatDate(Date.now()))}">\n  <paciente>\n    <nome>${esc(paciente?.nome)}</nome>\n    <dataNascimento>${esc(paciente?.dataNascimento)}</dataNascimento>\n    <genero>${esc(paciente?.genero)}</genero>\n    <cpf>${esc(paciente?.cpf)}</cpf>\n    <telefone>${esc(paciente?.telefone)}</telefone>\n    <email>${esc(paciente?.email)}</email>\n    <endereco>\n      <rua>${esc(addr.rua)}</rua>\n      <numero>${esc(addr.numero)}</numero>\n      <bairro>${esc(addr.bairro)}</bairro>\n      <cidade>${esc(addr.cidade)}</cidade>\n      <estado>${esc(addr.estado)}</estado>\n      <cep>${esc(addr.cep)}</cep>\n    </endereco>\n    <tipoSanguineo>${esc(paciente?.tipoSanguineo)}</tipoSanguineo>\n    <pesoKg>${esc(paciente?.pesoKg)}</pesoKg>\n    <alturaCm>${esc(paciente?.alturaCm)}</alturaCm>\n    <alergias>${esc((paciente?.alergias || []).join(', '))}</alergias>\n    <doencasCronicas>${esc((paciente?.doencasCronicas || []).join(', '))}</doencasCronicas>\n    <alergiaMedicamentos>${esc((paciente?.alergiamedicamentos || []).join(', '))}</alergiaMedicamentos>\n    <medicamentosUso>${esc((paciente?.medicamentosUso || []).join(', '))}</medicamentosUso>\n    <historicoCirurgico>${esc((paciente?.historicoCirurgico || []).join(', '))}</historicoCirurgico>\n    <observacoesMedicas>${esc(paciente?.observacoesMedicas)}</observacoesMedicas>\n  </paciente>\n  <prescricoes>\n${prescricoes.map(p => `    <prescricao id="${esc(p._id)}">\n      <tipo>${esc(p.tipo)}</tipo>\n      <dataEmissao>${esc(p.dataEmissao)}</dataEmissao>\n      <dataValidade>${esc(p.dataValidade)}</dataValidade>\n      <descricao>${esc(p.descricao)}</descricao>\n      <medico crm="${esc(p.medico?.crm)}">${esc(p.medico?.nome)}</medico>\n    </prescricao>`).join('\n')}\n  </prescricoes>\n  <exames>\n${exames.map(e => `    <exame id="${esc(e._id)}" status="${esc(e.status || (e.laudo ? 'concluido' : 'pendente'))}">\n      <tipo>${esc(e.tipoExame)}</tipo>\n      <nome>${esc(e.nomeExame)}</nome>\n      <dataColeta>${esc(e.dataColeta)}</dataColeta>\n      <dataResultado>${esc(e.dataResultado)}</dataResultado>\n      <valoresReferencia>${esc(e.valoresReferencia)}</valoresReferencia>\n      ${e.laudo ? `<laudo>${esc(e.laudo)}</laudo>` : '<laudo pendente="true" />'}\n      <medico crm="${esc(e.medico?.crm)}">${esc(e.medico?.nome)}</medico>\n    </exame>`).join('\n')}\n  </exames>\n</historicoMedico>`;
    }

    async function buildHistorico() {
        if (!histConteudo) return;
        histConteudo.innerHTML = '<pre class="hist-block">Gerando histórico...</pre>';
        try {
            const data = await fetchAllData();
            const txt = buildTxt(data);
            histConteudo.innerHTML = `<pre class="hist-block"></pre>`;
            const pre = histConteudo.querySelector('pre.hist-block');
            if (pre) pre.textContent = txt; // garante preservação exata sem inserir \n adicionais
            if (histStatus) {
                histStatus.textContent = 'Histórico atualizado com sucesso.';
                histStatus.style.display = 'block';
            }
            // Cache em memória
            window.__pac_hist_cache = { data, txt, xml: buildXml(data), json: JSON.stringify(data, null, 2) };
        } catch (e) {
            console.error(e);
            histConteudo.innerHTML = `<pre class="hist-block">Erro ao gerar histórico: ${e.message}</pre>`;
            if (histStatus) {
                histStatus.textContent = 'Falha ao gerar.';
                histStatus.style.display = 'block';
                histStatus.classList.remove('success');
            }
        }
    }

    function downloadFile(name, mime, content) {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }

    btnHistRefresh?.addEventListener('click', buildHistorico);
    btnHistTxt?.addEventListener('click', () => {
        if (!window.__pac_hist_cache) return alert('Gere o histórico primeiro.');
        downloadFile('historico_medico.txt', 'text/plain;charset=utf-8', window.__pac_hist_cache.txt);
    });
    btnHistXml?.addEventListener('click', () => {
        if (!window.__pac_hist_cache) return alert('Gere o histórico primeiro.');
        downloadFile('historico_medico.xml', 'application/xml;charset=utf-8', window.__pac_hist_cache.xml);
    });
    btnHistJson?.addEventListener('click', () => {
        if (!window.__pac_hist_cache) return alert('Gere o histórico primeiro.');
        downloadFile('historico_medico.json', 'application/json;charset=utf-8', window.__pac_hist_cache.json);
    });
    btnHistPdf?.addEventListener('click', () => {
        if (!window.__pac_hist_cache) return alert('Gere o histórico primeiro.');
        // Abordagem simples: abrir nova janela com conteúdo formatado e chamar print (usuario escolhe PDF)
        const w = window.open('', '_blank');
        if (!w) return alert('Popup bloqueado. Libere popups para exportar.');
        const safe = (window.__pac_hist_cache.txt || '').replace(/[&<>]/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[s]));
        w.document.write(`<html><head><title>Histórico Médico</title><meta charset='utf-8'><style>body{font-family:Arial,Helvetica,sans-serif;white-space:pre-wrap;font-size:12px;line-height:1.4;margin:24px;}h1{text-align:center;margin-bottom:16px;}hr{margin:24px 0;}</style></head><body><h1>Histórico Médico Consolidado</h1><pre>${safe}</pre><hr><small>Gerado em ${new Date().toLocaleString()}</small></body></html>`);
        w.document.close();
        w.focus();
        setTimeout(() => w.print(), 400);
    });

    // ================= Importação de Histórico (HMC) =================
    btnHistImport?.addEventListener('click', () => inputHistImport?.click());

    inputHistImport?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const name = file.name.toLowerCase();
            let imported = null;
            if (name.endsWith('.json')) {
                try { imported = JSON.parse(text); } catch (err) { throw new Error('JSON inválido.'); }
            } else if (name.endsWith('.xml')) {
                // Parse simples de XML para extrair algumas tags conhecidas
                const parser = new DOMParser();
                const xml = parser.parseFromString(text, 'application/xml');
                if (xml.querySelector('parsererror')) throw new Error('XML inválido.');
                // Tentativa de detectar se é histórico ou apenas exames
                if (xml.documentElement.tagName === 'historicoMedico') {
                    imported = { rawXml: text, tipo: 'historico' };
                } else if (xml.documentElement.tagName === 'exames') {
                    imported = { rawXml: text, tipo: 'exames' };
                } else {
                    imported = { rawXml: text, tipo: 'desconhecido' };
                }
            } else if (name.endsWith('.txt')) {
                imported = { rawTxt: text, tipo: 'txt' };
            } else {
                throw new Error('Formato não suportado. Use .json, .xml ou .txt');
            }
            // Preparar buffer de preview
            const previewRaw = (typeof imported === 'string') ? imported : (imported.rawXml || imported.rawTxt || JSON.stringify(imported, null, 2));
            const MAX_PREVIEW = 12000; // caracteres
            const truncated = previewRaw.length > MAX_PREVIEW;

            // ========== Extração de identificação do paciente importado ==========
            function digits(v) { return (v || '').replace(/\D+/g, ''); }
            let importedPaciente = { nome: null, cpf: null };
            try {
                if (name.endsWith('.json')) {
                    if (imported && imported.paciente) {
                        importedPaciente.nome = imported.paciente.nome || null;
                        importedPaciente.cpf = digits(imported.paciente.cpf || '');
                    }
                } else if (name.endsWith('.xml')) {
                    const parser2 = new DOMParser();
                    const xmlDoc = parser2.parseFromString(text, 'application/xml');
                    const pacEl = xmlDoc.querySelector('historicoMedico > paciente');
                    if (pacEl) {
                        const nomeEl = pacEl.querySelector('nome');
                        const cpfEl = pacEl.querySelector('cpf');
                        importedPaciente.nome = nomeEl?.textContent?.trim() || null;
                        importedPaciente.cpf = digits(cpfEl?.textContent || '');
                    }
                } else if (name.endsWith('.txt')) {
                    const nomeMatch = /Nome completo:\s*(.+)/i.exec(text);
                    const cpfMatch = /CPF:\s*([^\n]+)/i.exec(text);
                    if (nomeMatch) importedPaciente.nome = nomeMatch[1].trim();
                    if (cpfMatch) importedPaciente.cpf = digits(cpfMatch[1]);
                }
            } catch { /* silencioso */ }
            const localCpf = digits(pacienteObj?.cpf || '');
            const localNome = (pacienteObj?.nome || '').trim().toLowerCase();
            let match = false;
            let matchReason = '';
            if (importedPaciente.cpf && localCpf) {
                match = importedPaciente.cpf === localCpf;
                matchReason = match ? 'CPF correspondente' : 'CPF diferente';
            } else if (importedPaciente.nome && localNome) {
                // compara usando startsWith ou igualdade flexível
                const inome = importedPaciente.nome.trim().toLowerCase();
                match = inome === localNome || inome.startsWith(localNome) || localNome.startsWith(inome);
                matchReason = match ? 'Nome semelhante' : 'Nome diferente';
            } else {
                matchReason = 'Sem dados suficientes para validar';
            }

            __hmc_import_buffer = {
                type: name.endsWith('.json') ? 'json' : name.endsWith('.xml') ? 'xml' : 'txt',
                raw: previewRaw,
                parsed: imported,
                fileName: file.name,
                truncated,
                pacienteDetectado: importedPaciente,
                pacienteMatch: match,
                pacienteMatchReason: matchReason
            };
            initImportModalRefs();
            if (mhmcPreview) mhmcPreview.textContent = truncated ? previewRaw.slice(0, MAX_PREVIEW) + '\n... (truncado para pré-visualização)' : previewRaw;
            if (mhmcMeta) {
                const parts = [`${file.name}`, __hmc_import_buffer.type.toUpperCase(), truncated ? '(parcial)' : null];
                if (importedPaciente.nome || importedPaciente.cpf) {
                    const identStr = [importedPaciente.nome, importedPaciente.cpf ? 'CPF ' + importedPaciente.cpf : null].filter(Boolean).join(' • ');
                    parts.push('Paciente: ' + identStr);
                    parts.push(match ? '[OK]' : '[MISMATCH]');
                } else {
                    parts.push('Paciente: (não identificado)');
                }
                mhmcMeta.textContent = parts.filter(Boolean).join(' • ');
                mhmcMeta.classList.remove('mismatch', 'match');
                mhmcMeta.classList.add(match ? 'match' : 'mismatch');
            }
            if (mhmcToggle) {
                // Estado inicial sempre parcial (altura limitada)
                mhmcPreview.style.maxHeight = '55vh';
                mhmcToggle.textContent = 'Mostrar completo';
                mhmcToggle.setAttribute('data-all', '0');
            }
            openImportModal();
        } catch (err) {
            alert('Falha ao importar: ' + err.message);
        } finally {
            if (inputHistImport) inputHistImport.value = '';
        }
    });
})();

// Bind modal import events
document.addEventListener('DOMContentLoaded', () => {
    initImportModalRefs();
    function abortImport() {
        __hmc_import_buffer = null;
        if (mhmcPreview) {
            mhmcPreview.textContent = '';
            mhmcPreview.style.maxHeight = '55vh';
        }
        if (mhmcToggle) {
            mhmcToggle.textContent = 'Mostrar completo';
            mhmcToggle.setAttribute('data-all', '0');
        }
        closeImportModal();
    }
    mhmcClose?.addEventListener('click', abortImport);
    modalHmc?.addEventListener('click', (ev) => { if (ev.target === modalHmc) abortImport(); });
    mhmcCancel?.addEventListener('click', abortImport);
    mhmcToggle?.addEventListener('click', () => {
        if (!__hmc_import_buffer) return;
        const expanded = mhmcToggle.getAttribute('data-all') === '1';
        if (expanded) {
            // Volta ao modo parcial
            if (__hmc_import_buffer.truncated) {
                mhmcPreview.textContent = __hmc_import_buffer.raw.slice(0, 12000) + '\n... (truncado para pré-visualização)';
            } else {
                mhmcPreview.textContent = __hmc_import_buffer.raw; // mesmo conteúdo, apenas restringe altura
            }
            mhmcPreview.style.maxHeight = '55vh';
            mhmcToggle.textContent = 'Mostrar completo';
            mhmcToggle.setAttribute('data-all', '0');
        } else {
            // Expande
            mhmcPreview.textContent = __hmc_import_buffer.raw;
            mhmcPreview.style.maxHeight = 'none';
            mhmcToggle.textContent = 'Mostrar parcial';
            mhmcToggle.setAttribute('data-all', '1');
        }
    });
    mhmcConfirm?.addEventListener('click', () => {
        if (!__hmc_import_buffer) return;
        // Verificação final de correspondência de paciente antes de inserir
        if (__hmc_import_buffer && __hmc_import_buffer.pacienteMatch === false) {
            const msg = `O arquivo parece pertencer a outro paciente. Motivo: ${__hmc_import_buffer.pacienteMatchReason}.\nProsseguir mesmo assim?`;
            if (!confirm(msg)) return; // aborta se usuário cancelar
        }
        // Insere bloco final no histórico
        if (histConteudo) {
            const bloco = document.createElement('pre');
            bloco.className = 'hist-block';
            bloco.textContent = `=== IMPORTADO (${__hmc_import_buffer.fileName}) ===\n` + __hmc_import_buffer.raw;
            histConteudo.prepend(bloco);
        }
        if (histStatus) {
            histStatus.textContent = `Arquivo ${__hmc_import_buffer.fileName} importado.`;
            histStatus.style.display = 'block';
        }
        __hmc_import_buffer = null;
        closeImportModal();
    });
});
