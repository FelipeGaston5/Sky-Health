// Cadastro de Médico: máscaras, validações e envio ao backend
(() => {
    const form = document.getElementById('doctor-form');
    if (!form) return;

    const API_BASE = 'http://localhost:3000/medicos';
    const LIST_URL = `${API_BASE}/medicos`;

    // Campos
    const fullName = document.getElementById('fullName');
    const birthDate = document.getElementById('birthDate');
    const cpf = document.getElementById('cpf');
    const phone = document.getElementById('phone');
    const email = document.getElementById('email');
    const emailDomain = document.getElementById('emailDomain');
    const street = document.getElementById('street');
    const number = document.getElementById('number');
    const neighborhood = document.getElementById('neighborhood');
    const zipCode = document.getElementById('zipCode');
    const city = document.getElementById('city');
    const state = document.getElementById('state');
    const gender = document.getElementById('gender');

    const crm = document.getElementById('crm');
    const specialty = document.getElementById('specialty');
    const experienceYears = document.getElementById('experienceYears');
    const affiliatedHospitals = document.getElementById('affiliatedHospitals');

    const btnCancel = document.getElementById('btn-cancel');
    const btnClear = document.getElementById('btn-clear');
    const modal = document.getElementById('success-modal');
    const closeModalBtn = modal ? modal.querySelector('.close') : null;
    const doctorIdSpan = document.getElementById('doctor-id');
    const doctorNameSpan = document.getElementById('doctor-name');
    const doctorCpfSpan = document.getElementById('doctor-cpf');
    const doctorCrmSpan = document.getElementById('doctor-crm');
    const doctorUserSpan = document.getElementById('doctor-username');
    const doctorPassSpan = document.getElementById('doctor-password');
    const btnNewDoctor = document.getElementById('btn-new-doctor');
    const btnViewList = document.getElementById('btn-view-list');

    const onlyDigits = (v) => (v || '').replace(/\D+/g, '');

    const maskCPF = (v) => {
        v = onlyDigits(v).slice(0, 11);
        if (v.length > 9) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
        if (v.length > 6) return v.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
        if (v.length > 3) return v.replace(/(\d{3})(\d{0,3})/, '$1.$2');
        return v;
    };

    const maskPhone = (v) => {
        v = onlyDigits(v).slice(0, 11);
        if (v.length <= 10) return v.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{1,4})$/, '$1-$2');
        return v.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    };

    const maskCEP = (v) => {
        v = onlyDigits(v).slice(0, 8);
        if (v.length > 5) return v.replace(/(\d{5})(\d{0,3})/, '$1-$2');
        return v;
    };

    if (cpf) cpf.addEventListener('input', () => (cpf.value = maskCPF(cpf.value)));
    if (phone) phone.addEventListener('input', () => (phone.value = maskPhone(phone.value)));
    if (zipCode) zipCode.addEventListener('input', () => (zipCode.value = maskCEP(zipCode.value)));

    if (emailDomain) {
        emailDomain.addEventListener('change', () => {
            if (!email) return;
            const domain = emailDomain.value;
            if (!domain) return;
            const current = email.value.trim();
            const parts = current.split('@');
            const local = parts[0] || current.replace(/@.*/, '');
            email.value = local + domain;
        });
    }

    if (email) {
        email.addEventListener('input', () => {
            if (/@/.test(email.value) && emailDomain) emailDomain.value = '';
        });
    }

    if (btnCancel) btnCancel.addEventListener('click', () => { if (confirm('Cancelar e voltar?')) window.history.back(); });
    if (btnClear) btnClear.addEventListener('click', () => { form.reset(); });

    const isValidCPF = (v) => {
        const s = onlyDigits(v);
        if (!s || s.length !== 11 || /^(\d)\1{10}$/.test(s)) return false;
        let sum = 0;
        for (let i = 0; i < 9; i++) sum += parseInt(s.charAt(i)) * (10 - i);
        let rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(s.charAt(9))) return false;
        sum = 0;
        for (let i = 0; i < 10; i++) sum += parseInt(s.charAt(i)) * (11 - i);
        rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        return rev === parseInt(s.charAt(10));
    };

    const buildPayload = () => {
        const user = onlyDigits(cpf?.value || '');
        return {
            nome: (fullName?.value || '').trim(),
            cpf: user,
            email: (email?.value || '').trim(),
            telefone: (phone?.value || '').trim(),
            dataNascimento: birthDate?.value || null,
            endereco: {
                rua: street?.value || '',
                numero: number?.value || '',
                bairro: neighborhood?.value || '',
                cidade: (city?.value || '').trim(),
                estado: (state?.value || '').trim(),
                cep: onlyDigits(zipCode?.value || ''),
            },
            genero: gender?.value || undefined,

            crm: (crm?.value || '').trim(),
            especialidade: (specialty?.value || '').trim(),
            experienciaAnos: (() => { const v = experienceYears?.value || ''; return v ? parseInt(v, 10) : undefined; })(),
            hospitaisAfiliados: ((affiliatedHospitals?.value || '').split(',').map(s => s.trim()).filter(Boolean)),

            username: user,
            password: user.slice(-6) || '123456'
        };
    };

    const validate = () => {
        const errs = [];
        const req = [
            [fullName, 'Nome completo'],
            [birthDate, 'Data de nascimento'],
            [cpf, 'CPF'],
            [phone, 'Telefone'],
            [email, 'E-mail'],
            [street, 'Rua'],
            [crm, 'CRM'],
            [specialty, 'Especialidade'],
        ];
        req.forEach(([el, name]) => { if (!el?.value?.trim()) errs.push(`${name} é obrigatório.`); });

        const cpfDigits = onlyDigits(cpf?.value || '');
        if (!isValidCPF(cpfDigits)) errs.push('CPF inválido.');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        if (!emailRegex.test(email?.value || '')) errs.push('E-mail inválido.');

        if (errs.length) { alert('Corrija os erros:\n\n' + errs.join('\n')); return false; }
        return true;
    };

    const openModal = (data) => {
        if (!modal) return;
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { window.scrollTo(0, 0); }
        doctorIdSpan.textContent = data?._id || '—';
        doctorNameSpan.textContent = data?.nome || fullName?.value || '—';
        doctorCpfSpan.textContent = data?.cpf || cpf?.value || '—';
        doctorCrmSpan.textContent = data?.crm || crm?.value || '—';
        doctorUserSpan.textContent = data?.username || onlyDigits(cpf?.value || '') || '—';
        doctorPassSpan.textContent = data?.password || onlyDigits(cpf?.value || '').slice(-6) || '—';
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    };

    const closeModal = () => { modal.style.display = 'none'; document.body.classList.remove('modal-open'); };
    closeModalBtn?.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    btnNewDoctor?.addEventListener('click', () => { closeModal(); form.reset(); });
    btnViewList?.addEventListener('click', () => { window.open(LIST_URL, '_blank'); });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validate()) return;
        const payload = buildPayload();

        try {
            let data;
            if (window.MedicosAPI?.criarMedico) data = await MedicosAPI.criarMedico(payload);
            else {
                const resp = await fetch(LIST_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!resp.ok) throw new Error(await resp.text() || 'Erro ao cadastrar médico');
                data = await resp.json();
            }
            const saved = data?.medico || data;
            try {
                if (saved?._id) {
                    localStorage.setItem('ultimo_medico_id', saved._id);
                    localStorage.setItem('ultimo_medico_obj', JSON.stringify(saved));
                }
            } catch { }
            openModal(saved);
        } catch (err) {
            console.error(err);
            alert('Falha de comunicação com o servidor.');
        }
    });
})();
