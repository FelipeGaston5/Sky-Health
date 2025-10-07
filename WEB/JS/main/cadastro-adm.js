// Cadastro de Administrador
(() => {
    const form = document.getElementById('adm-form');
    if (!form) return;

    const API_BASE = 'http://localhost:3000/administradores';

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
    const role = document.getElementById('role');
    const department = document.getElementById('department');
    const hiringDate = document.getElementById('hiringDate');

    const modal = document.getElementById('success-modal');
    const closeModalBtn = modal?.querySelector('.close');
    const btnNew = document.getElementById('btn-new-adm');
    const btnList = document.getElementById('btn-view-list');
    const btnCancel = document.getElementById('btn-cancel');
    const btnClear = document.getElementById('btn-clear');

    const admIdSpan = document.getElementById('adm-id');
    const admNameSpan = document.getElementById('adm-name');
    const admCpfSpan = document.getElementById('adm-cpf');
    const admUserSpan = document.getElementById('adm-username');
    const admPassSpan = document.getElementById('adm-password');

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

    cpf?.addEventListener('input', () => (cpf.value = maskCPF(cpf.value)));
    phone?.addEventListener('input', () => (phone.value = maskPhone(phone.value)));
    zipCode?.addEventListener('input', () => (zipCode.value = maskCEP(zipCode.value)));

    emailDomain?.addEventListener('change', () => {
        if (!email) return;
        const domain = emailDomain.value;
        if (!domain) return;
        const current = email.value.trim();
        const local = (current.split('@')[0] || current.replace(/@.*/, ''));
        email.value = local + domain;
    });
    email?.addEventListener('input', () => { if (/@/.test(email.value) && emailDomain) emailDomain.value = ''; });

    btnCancel?.addEventListener('click', () => { if (confirm('Cancelar cadastro e voltar?')) window.history.back(); });
    btnClear?.addEventListener('click', () => { form.reset(); });

    const buildPayload = () => {
        const user = onlyDigits(cpf?.value || email?.value || '').slice(0, 11);
        const username = user || (email?.value || '').trim();
        const password = user ? user.slice(-6) : '123456';
        return {
            nome: (fullName?.value || '').trim(),
            cpf: onlyDigits(cpf?.value || ''),
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
            cargo: (role?.value || '').trim(),
            departamento: (department?.value || '').trim(),
            dataContratacao: hiringDate?.value || null,
            username,
            password
        };
    };

    const validate = () => {
        const errs = [];
        const req = [
            [fullName, 'Nome completo'],
            [birthDate, 'Data de nascimento'],
            [email, 'E-mail'],
            [role, 'Cargo'],
            [department, 'Departamento'],
            [hiringDate, 'Data de contratação']
        ];
        req.forEach(([el, name]) => { if (!el?.value?.trim()) errs.push(`${name} é obrigatório.`); });
        if (cpf?.value?.trim()) {
            if (!isValidCPF(cpf.value)) errs.push('CPF inválido.');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        if (!emailRegex.test(email?.value || '')) errs.push('E-mail inválido.');
        if (errs.length) { alert('Corrija os erros:\n\n' + errs.join('\n')); return false; }
        return true;
    };

    const openModal = (data) => {
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { window.scrollTo(0, 0); }
        admIdSpan.textContent = data?._id || '—';
        admNameSpan.textContent = data?.nome || fullName?.value || '—';
        admCpfSpan.textContent = data?.cpf || cpf?.value || '—';
        admUserSpan.textContent = data?.username || (onlyDigits(cpf?.value || '') || (email?.value || '')) || '—';
        admPassSpan.textContent = data?.password || (onlyDigits(cpf?.value || '').slice(-6) || '123456') || '—';
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    };
    const closeModal = () => { modal.style.display = 'none'; document.body.classList.remove('modal-open'); };
    closeModalBtn?.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    btnNew?.addEventListener('click', () => { closeModal(); form.reset(); });
    btnList?.addEventListener('click', () => { window.open(API_BASE, '_blank'); });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validate()) return;
        const payload = buildPayload();
        try {
            let data;
            if (window.AdminsAPI?.criarAdm) data = await AdminsAPI.criarAdm(payload);
            else {
                const resp = await fetch(API_BASE, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
                if (!resp.ok) throw new Error(await resp.text() || 'Erro ao cadastrar administrador');
                data = await resp.json();
            }
            const saved = data?.administrador || data;
            try {
                if (saved?._id) {
                    localStorage.setItem('ultimo_adm_id', saved._id);
                    localStorage.setItem('ultimo_adm_obj', JSON.stringify(saved));
                }
            } catch { }
            openModal(saved);
        } catch (err) {
            console.error(err);
            alert('Falha de comunicação com o servidor.');
        }
    });
})();
