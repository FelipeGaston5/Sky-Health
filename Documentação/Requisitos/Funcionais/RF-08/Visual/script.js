
/*  Funcionalidades: adicionar/remover medicamentos, assinatura simulada,
   salvar prescrição em localStorage, enviar para farmácia, processar dispensação,
   toasts, popup de visualização.
*/

(function () {
  // utilidades
  const $ = id => document.getElementById(id);
  const exists = id => !!$(id);

  /* -------------------------
     Elementos (com checagem)
     ------------------------- */
  const form = $('form-prescricao') || $('presc-form') || null;
  const btnAdd = $('btn-add-med');
  const btnClear = $('btn-clear-med');
  const btnSign = $('btn-sign');
  const btnRegister = $('btn-register');
  const btnSendPharm = $('btn-send-pharm');
  const btnProcessar = $('btn-processar');
  const btnViewPresc = $('btn-view-presc');
  const signedInfo = $('signed-info');
  const medTableBody = document.querySelector('#med-table tbody');
  const emptyMed = $('empty-med');
  const pacienteInput = $('paciente');
  const medicoInput = $('medico');
  const crmInput = $('crm');
  const observacoesInput = $('observacoes');
  const rxCodeInput = $('rx-code');
  const farmaciaNomeInput = $('farmacia-nome');
  const prescListContainer = $('presc-list');
  const dispHistoryEl = $('disp-history');

  // fallback for dynamic list mode
  const listaMedicamentos = $('lista-medicamentos') || null;

  // meds array used when using med-table approach (your current HTML)
  let meds = [];

  // -------------------------
  // Toast (mensagens)
  // -------------------------
  function showToast(message, type = 'info') {
    try {
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.textContent = message;
      document.body.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('show'));
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 2600);
    } catch (e) {
      console.log('Toast erro:', e);
    }
  }

  // injetar estilo básico para toast/popup se não existir
  (function injectStyles() {
    const css = `
.toast { position: fixed; bottom: 20px; right: 20px; background: #fff; color:#111; padding:10px 14px; border-radius:10px; box-shadow:0 6px 20px rgba(0,0,0,.12); opacity:0; transform: translateY(8px); transition:all .28s ease; z-index:9999; font-weight:600; }
.toast.show{ opacity:1; transform: translateY(0); }
.toast.success{ border-left:4px solid #2ecc71; }
.toast.error{ border-left:4px solid #e74c3c; }
.toast.info{ border-left:4px solid #3498db; }
.toast.warning{ border-left:4px solid #f39c12; }

.popup-overlay{ position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.45); z-index:10000; }
.popup-card{ background:#fff; padding:20px; border-radius:10px; width:90%; max-width:560px; box-shadow:0 10px 40px rgba(2,6,23,0.25); }
.fade-in{ animation: fadeIn .28s ease both; }
.fade-out{ animation: fadeOut .25s ease both; }
@keyframes fadeIn{ from{ opacity:0; transform: translateY(8px);} to{opacity:1; transform:none} }
@keyframes fadeOut{ from{ opacity:1;} to{opacity:0; transform: translateY(8px)} }
`;
    const s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  })();

  // -------------------------
  // Escape html
  // -------------------------
  function escapeHtml(text) {
    return (text || '').toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  // -------------------------
  // localStorage helpers
  // -------------------------
  function loadArray(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch (e) { return []; }
  }
  function saveArray(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
  }

  // -------------------------
  // Render meds (table) — seu HTML atual
  // -------------------------
  function renderMedsTable() {
    if (!medTableBody) return;
    medTableBody.innerHTML = '';
    if (!meds || meds.length === 0) {
      if (emptyMed) emptyMed.style.display = 'block';
      return;
    }
    if (emptyMed) emptyMed.style.display = 'none';
    meds.forEach((m, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(m.nome)}</td>
        <td>${escapeHtml(m.dosagem)}</td>
        <td>${escapeHtml(m.posologia)}</td>
        <td><div class="actions"><button data-i="${i}" class="remove-med secondary">Remover</button></div></td>
      `;
      medTableBody.appendChild(tr);
    });
    // attach listeners
    medTableBody.querySelectorAll('.remove-med').forEach(btn => {
      btn.addEventListener('click', (ev) => {
        const i = Number(ev.currentTarget.dataset.i);
        if (!Number.isNaN(i)) {
          meds.splice(i, 1);
          renderMedsTable();
          showToast('Medicamento removido', 'warning');
        }
      });
    });
  }

  // -------------------------
  // Add med from fixed inputs (seu formulário atual)
  // -------------------------
  function addMedFromInputs() {
    const nomeEl = $('med-nome');
    const dosEl = $('med-dosagem');
    const posEl = $('med-posologia');
    if (!nomeEl) { showToast('Campo de medicamento não encontrado', 'error'); return; }
    const nome = nomeEl.value.trim();
    const dosagem = dosEl ? dosEl.value.trim() : '';
    const posologia = posEl ? posEl.value.trim() : '';

    if (!nome) { showToast('Informe o nome do medicamento.', 'error'); nomeEl.focus(); return; }
    meds.push({ nome, dosagem, posologia });
    renderMedsTable();
    if (nomeEl) nomeEl.value = '';
    if (dosEl) dosEl.value = '';
    if (posEl) posEl.value = '';
    showToast('Medicamento adicionado', 'success');
  }

  // -------------------------
  // Clear med input fields (fixed inputs)
  // -------------------------
  function clearMedInputs() {
    const nomeEl = $('med-nome');
    const dosEl = $('med-dosagem');
    const posEl = $('med-posologia');
    if (nomeEl) nomeEl.value = '';
    if (dosEl) dosEl.value = '';
    if (posEl) posEl.value = '';
    showToast('Campos limpos', 'info');
  }

  // -------------------------
  // Signature simulation used in table mode (original behavior)
  // -------------------------
  let currentSignature = null;
  function signPrescription() {
    if (meds.length === 0) { showToast('Adicione pelo menos um medicamento antes de assinar.', 'error'); return; }
    const medico = medicoInput ? medicoInput.value.trim() : '';
    if (!medico) {
      if (!confirm('Ainda sem nome do médico. Deseja continuar assinando sem nome?')) return;
    }
    const signer = medico || prompt('Digite o nome do profissional para assinatura (simulado):') || 'Médico não informado';
    currentSignature = `${signer} — Assinado em ${new Date().toLocaleString()}`;
    if (signedInfo) signedInfo.textContent = currentSignature;
    if (btnSign) { btnSign.textContent = 'Assinado ✓'; btnSign.disabled = true; }
    showToast('Assinatura simulada registrada', 'success');
  }

  // -------------------------
  // Register prescription (table mode)
  // -------------------------
  function registerPrescription() {
    const paciente = pacienteInput ? pacienteInput.value.trim() : '';
    if (!paciente) { showToast('Informe o paciente.', 'error'); return; }
    if (!meds || meds.length === 0) { showToast('Adicione ao menos um medicamento.', 'error'); return; }
    if (!currentSignature) {
      if (!confirm('Prescrição ainda não assinada. Deseja salvar mesmo assim?')) return;
    }
    const id = 'RX-' + Date.now().toString();
    const presc = {
      id,
      paciente,
      medico: medicoInput ? medicoInput.value.trim() : '',
      crm: crmInput ? crmInput.value.trim() : '',
      medicamentos: meds.slice(),
      observacoes: observacoesInput ? observacoesInput.value.trim() : '',
      signature: currentSignature,
      sentToPharmacy: false,
      dispensed: false,
      createdAt: new Date().toISOString()
    };
    const arr = loadArray('prescriptions');
    arr.unshift(presc);
    saveArray('prescriptions', arr);
    // reset
    meds = [];
    renderMedsTable();
    if (pacienteInput) pacienteInput.value = '';
    if (observacoesInput) observacoesInput.value = '';
    if (medicoInput) medicoInput.value = '';
    if (crmInput) crmInput.value = '';
    currentSignature = null;
    if (signedInfo) signedInfo.textContent = '';
    if (btnSign) { btnSign.disabled = false; btnSign.textContent = 'Assinar digitalmente'; }
    renderPrescriptions();
    showToast('Prescrição registrada: ' + id, 'success');
  }

  // -------------------------
  // Send to pharmacy (marks last as sent)
  // -------------------------
  function sendToPharmacy() {
    const arr = loadArray('prescriptions');
    if (!arr || arr.length === 0) { showToast('Não há prescrições registradas para enviar.', 'error'); return; }
    const presc = arr[0];
    if (presc.sentToPharmacy) { showToast('Prescrição já enviada anteriormente.', 'warning'); return; }
    presc.sentToPharmacy = true;
    presc.sentAt = new Date().toISOString();
    arr[0] = presc;
    saveArray('prescriptions', arr);
    renderPrescriptions();
    showToast('Prescrição ' + presc.id + ' enviada para farmácia (simulado).', 'success');
  }

  // -------------------------
  // Render prescriptions list
  // -------------------------
  function renderPrescriptions() {
    if (!prescListContainer) return;
    const arr = loadArray('prescriptions');
    if (!arr || arr.length === 0) { prescListContainer.innerHTML = '<div class="muted small">Nenhuma prescrição registrada.</div>'; return; }
    let html = '<table><thead><tr><th>Código</th><th>Paciente</th><th>Médico</th><th>Criado</th><th>Status</th><th>Ações</th></tr></thead><tbody>';
    arr.forEach(p => {
      const status = (p.dispensed ? '<span class="chip success">Dispensada</span>' : p.sentToPharmacy ? '<span class="chip info">Enviada</span>' : '<span class="chip">Registrada</span>');
      html += `<tr>
        <td>${escapeHtml(p.id)}</td>
        <td>${escapeHtml(p.paciente)}</td>
        <td>${escapeHtml(p.medico || '')}</td>
        <td>${new Date(p.createdAt).toLocaleString()}</td>
        <td>${status}</td>
        <td><div class="actions"><button data-id="${p.id}" class="view-presc">Ver</button></div></td>
      </tr>`;
    });
    html += '</tbody></table>';
    prescListContainer.innerHTML = html;

    prescListContainer.querySelectorAll('.view-presc').forEach(b => {
      b.addEventListener('click', (ev) => {
        const id = ev.currentTarget.dataset.id;
        viewPrescription(id);
      });
    });
  }

  // -------------------------
  // View prescription (alert or popup)
  // -------------------------
  function viewPrescription(id) {
    const arr = loadArray('prescriptions');
    const p = arr.find(x => x.id === id);
    if (!p) { showToast('Prescrição não encontrada.', 'error'); return; }
    // popup
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay fade-in';
    const card = document.createElement('div');
    card.className = 'popup-card';
    let medsHtml = '';
    if (p.medicamentos && p.medicamentos.length > 0) {
      medsHtml = '<ul>' + p.medicamentos.map(m => `<li>${escapeHtml(m.nome)} — ${escapeHtml(m.dosagem || '-')} — ${escapeHtml(m.posologia || '-')}</li>`).join('') + '</ul>';
    } else medsHtml = '<div class="muted">Nenhum medicamento</div>';
    card.innerHTML = `
      <h3>Prescrição ${escapeHtml(p.id)}</h3>
      <p><strong>Paciente:</strong> ${escapeHtml(p.paciente)}</p>
      <p><strong>Médico:</strong> ${escapeHtml(p.medico || '-')}</p>
      <p><strong>CRM:</strong> ${escapeHtml(p.crm || '-')}</p>
      <p><strong>Criado:</strong> ${new Date(p.createdAt).toLocaleString()}</p>
      <hr>
      <h4>Medicamentos</h4>
      ${medsHtml}
      <hr>
      <p><strong>Observações:</strong> ${escapeHtml(p.observacoes || '-')}</p>
      <p><strong>Assinatura:</strong> ${escapeHtml(p.signature || 'Não assinada')}</p>
      <div style="margin-top:12px; display:flex; gap:8px; justify-content:flex-end;">
        <button id="close-popup" class="secondary">Fechar</button>
      </div>
    `;
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    $('close-popup').addEventListener('click', () => {
      overlay.classList.remove('fade-in');
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.remove(), 300);
    });
  }

  // -------------------------
  // Pharmacy processing (dispensa)
  // -------------------------
  function processDispense() {
    const code = rxCodeInput ? rxCodeInput.value.trim() : '';
    const farm = farmaciaNomeInput ? farmaciaNomeInput.value.trim() : '';
    if (!code) { if ( $('farm-msg') ) $('farm-msg').textContent = 'Informe o código da prescrição.'; showToast('Informe o código da prescrição.', 'error'); return; }
    if (!farm) { if ( $('farm-msg') ) $('farm-msg').textContent = 'Informe o nome da farmácia.'; showToast('Informe o nome da farmácia.', 'error'); return; }
    const arr = loadArray('prescriptions');
    const idx = arr.findIndex(x => x.id === code);
    if (idx === -1) { if ( $('farm-msg') ) $('farm-msg').textContent = 'Prescrição não encontrada.'; showToast('Prescrição não encontrada.', 'error'); return; }
    const presc = arr[idx];
    if (presc.dispensed) { if ( $('farm-msg') ) $('farm-msg').textContent = 'Prescrição já está marcada como dispensada.'; showToast('Prescrição já dispensada.', 'warning'); return; }
    presc.dispensed = true;
    presc.dispensedAt = new Date().toISOString();
    presc.dispensedBy = farm;
    arr[idx] = presc;
    saveArray('prescriptions', arr);
    // history
    const history = loadArray('dispHistory');
    history.unshift({ rx: presc.id, paciente: presc.paciente, farmacia: farm, data: presc.dispensedAt });
    saveArray('dispHistory', history);
    if ($('farm-msg')) $('farm-msg').textContent = 'Dispensação registrada com sucesso.';
    showToast('Dispensação registrada', 'success');
    renderPrescriptions();
    renderDispHistory();
  }

  // -------------------------
  // Render dispense history
  // -------------------------
  function renderDispHistory() {
    if (!dispHistoryEl) return;
    const arr = loadArray('dispHistory');
    if (!arr || arr.length === 0) { dispHistoryEl.innerHTML = '<div class="muted small">Nenhuma dispensação registrada.</div>'; return; }
    let html = '<table><thead><tr><th>RX</th><th>Paciente</th><th>Farmácia</th><th>Data</th></tr></thead><tbody>';
    arr.forEach(r => {
      html += `<tr><td>${escapeHtml(r.rx)}</td><td>${escapeHtml(r.paciente)}</td><td>${escapeHtml(r.farmacia)}</td><td>${new Date(r.data).toLocaleString()}</td></tr>`;
    });
    html += '</tbody></table>';
    dispHistoryEl.innerHTML = html;
  }

  // -------------------------
  // Init: attach events safely
  // -------------------------
  function init() {
    try {
      // render initial
      renderMedsTable();
      renderPrescriptions();
      renderDispHistory();

      // add med (button) -> if med inputs exist (fixed input mode)
      if (btnAdd) {
        btnAdd.addEventListener('click', () => {
          // if dynamic-list exists, prefer dynamic add; else use fixed input mode
          if (listaMedicamentos) {
            // dynamic mode not implemented here (but could be)
            showToast('Modo dinâmico não habilitado — usando modo de tabela.', 'info');
          }
          addMedFromInputs();
        });
      }

      // clear med inputs
      if (btnClear) btnClear.addEventListener('click', clearMedInputs);

      // sign
      if (btnSign) btnSign.addEventListener('click', signPrescription);

      // register
      if (btnRegister) btnRegister.addEventListener('click', registerPrescription);

      // send to pharmacy
      if (btnSendPharm) btnSendPharm.addEventListener('click', sendToPharmacy);

      // process dispense
      if (btnProcessar) btnProcessar.addEventListener('click', processDispense);

      // view presc from input RX field
      if (btnViewPresc) btnViewPresc.addEventListener('click', () => {
        const code = rxCodeInput ? rxCodeInput.value.trim() : '';
        if (!code) { showToast('Cole o código no campo acima para visualizar.', 'error'); return; }
        viewPrescription(code);
      });

      // keyboard: Press Enter on RX code to view
      if (rxCodeInput) {
        rxCodeInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (btnViewPresc) btnViewPresc.click();
          }
        });
      }

      showToast('Módulo de Prescrições pronto', 'info');
    } catch (err) {
      console.error('Init error:', err);
    }
  }

  // start
  init();

  // Expor algumas funções para debug (opcional)
  window._rf08_debug = { renderMedsTable, renderPrescriptions, renderDispHistory, meds, loadArray, saveArray };
})();
