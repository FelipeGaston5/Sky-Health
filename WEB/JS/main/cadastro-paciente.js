// Cadastro de Paciente: máscaras, validações e envio ao backend
(() => {
    const form = document.getElementById('patient-form');
    if (!form) return;

    // Backend habilitado
    const API_BASE = 'http://localhost:3000';
    const PACIENTES_URL = `${API_BASE}/pacientes`;

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
    const bloodType = document.getElementById('bloodType');
    const allergies = document.getElementById('allergies');
    const observations = document.getElementById('observations');
    const gender = document.getElementById('gender');
    const weightKg = document.getElementById('weightKg');
    const heightCm = document.getElementById('heightCm');
    const chronicDiseases = document.getElementById('chronicDiseases');
    const drugAllergies = document.getElementById('drugAllergies');
    const currentMedications = document.getElementById('currentMedications');
    const surgicalHistory = document.getElementById('surgicalHistory');

    const btnCancel = document.getElementById('btn-cancel');
    const btnClear = document.getElementById('btn-clear');
    const modal = document.getElementById('success-modal');
    const closeModalBtn = modal ? modal.querySelector('.close') : null;
    const patientIdSpan = document.getElementById('patient-id');
    const patientNameSpan = document.getElementById('patient-name');
    const patientCpfSpan = document.getElementById('patient-cpf');
    const patientUsernameSpan = document.getElementById('patient-username');
    const patientPasswordSpan = document.getElementById('patient-password');
    const btnNewPatient = document.getElementById('btn-new-patient');
    const btnViewList = document.getElementById('btn-view-list');

    // Helpers
    const onlyDigits = (v) => (v || '').replace(/\D+/g, '');

    const maskCPF = (v) => {
        v = onlyDigits(v).slice(0, 11);
        if (v.length > 9) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
        if (v.length > 6) return v.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
        if (v.length > 3) return v.replace(/(\d{3})(\d{0,3})/, '$1.$2');
        return v;
    };

    const maskPhone = (v) => {
        v = onlyDigits(v).slice(0, 11); // BR: 10 fixo ou 11 celular
        if (v.length <= 10) {
            return v
                .replace(/^(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
        }
        return v
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    };

    const maskCEP = (v) => {
        v = onlyDigits(v).slice(0, 8);
        if (v.length > 5) return v.replace(/(\d{5})(\d{0,3})/, '$1-$2');
        return v;
    };

    // Validações
    const isValidCPF = (v) => {
        const s = onlyDigits(v);
        if (!s || s.length !== 11 || /^([0-9])\1{10}$/.test(s)) return false;
        // Dígitos verificadores
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

    const setFieldError = (el, message) => {
        if (!el) return;
        el.classList.add('input-error');
        el.setAttribute('aria-invalid', 'true');
        el.title = message || '';
    };
    const clearFieldError = (el) => {
        if (!el) return;
        el.classList.remove('input-error');
        el.removeAttribute('aria-invalid');
        el.title = '';
    };

    const applyMasks = () => {
        if (cpf) cpf.value = maskCPF(cpf.value);
        if (phone) phone.value = maskPhone(phone.value);
        if (zipCode) zipCode.value = maskCEP(zipCode.value);
    };

    // Eventos de máscara
    if (cpf) {
        cpf.addEventListener('input', (e) => {
            const prev = e && e.target ? e.target.selectionStart : null;
            cpf.value = maskCPF(cpf.value);
            clearFieldError(cpf);
        });
    }
    if (phone) {
        phone.addEventListener('input', () => {
            phone.value = maskPhone(phone.value);
            clearFieldError(phone);
        });
    }
    if (zipCode) {
        zipCode.addEventListener('input', () => {
            zipCode.value = maskCEP(zipCode.value);
        });
    }

    // Seletor de domínio de e-mail
    if (emailDomain) {
        emailDomain.addEventListener('change', () => {
            if (!email) return;
            const domain = emailDomain.value;
            const current = email.value.trim();
            if (!domain) return; // sem alteração
            const parts = current.split('@');
            const local = parts[0] || current.replace(/@.*/, '');
            email.value = local + domain;
            clearFieldError(email);
        });
    }

    // Se o usuário digitar @ manualmente, limpamos o seletor
    if (email) {
        email.addEventListener('input', () => {
            if (!email) return;
            if (/@/.test(email.value) && emailDomain) emailDomain.value = '';
            clearFieldError(email);
        });
    }

    // Botões
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            if (confirm('Cancelar cadastro e voltar?')) {
                window.history.back();
            }
        });
    }

    if (btnClear) {
        btnClear.addEventListener('click', () => {
            form.reset();
            applyMasks();
            [fullName, birthDate, cpf, phone, email, street, number, neighborhood, zipCode, city, state, bloodType, allergies, chronicDiseases, drugAllergies, currentMedications, surgicalHistory, weightKg, heightCm, gender, observations]
                .forEach(clearFieldError);
        });
    }

    const openModal = (data) => {
        if (!modal) return;
        // Garante que a página vá ao topo ao concluir o cadastro
        try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (_) {
            window.scrollTo(0, 0);
        }
        if (patientIdSpan) patientIdSpan.textContent = (data && data._id) || '—';
        if (patientNameSpan) patientNameSpan.textContent = (data && data.nome) || (fullName ? fullName.value : '') || '—';
        if (patientCpfSpan) patientCpfSpan.textContent = (data && data.cpf) || (cpf ? cpf.value : '') || '—';
        if (patientUsernameSpan) patientUsernameSpan.textContent = (data && data.username) || ((cpf && cpf.value) ? cpf.value.replace(/\D+/g, '') : '') || '—';
        if (patientPasswordSpan) patientPasswordSpan.textContent = (data && data.password) || ((cpf && cpf.value) ? cpf.value.replace(/\D+/g, '').slice(-6) : '') || '—';
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        if (modal) modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    };
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    if (btnNewPatient) btnNewPatient.addEventListener('click', () => { closeModal(); form.reset(); applyMasks(); });
    if (btnViewList) btnViewList.addEventListener('click', () => {
        // Abre a lista direto da API
        window.open(PACIENTES_URL, '_blank');
    });

    // Mapeamento modelo -> backend (userModel.js)
    const buildPayload = () => {
        const emailVal = ((email && email.value) || '').trim();
        const payload = {
            nome: ((fullName && fullName.value) || '').trim(),
            cpf: onlyDigits((cpf && cpf.value) || ''),
            email: emailVal,
            telefone: ((phone && phone.value) || '').trim(),
            dataNascimento: (birthDate ? birthDate.value : null) || null,
            endereco: {
                rua: (street && street.value) || '',
                numero: (number && number.value) || '',
                bairro: (neighborhood && neighborhood.value) || '',
                cidade: ((city && city.value) || '').trim(),
                estado: ((state && state.value) || '').trim(),
                cep: onlyDigits((zipCode && zipCode.value) || ''),
            },
            genero: (gender && gender.value) || undefined,
            tipoSanguineo: (bloodType ? bloodType.value : '') || '',
            pesoKg: (() => { const v = (weightKg && weightKg.value) || ''; return v ? parseFloat(v) : undefined; })(),
            alturaCm: (() => { const v = (heightCm && heightCm.value) || ''; return v ? parseInt(v, 10) : undefined; })(),
            alergias: ((((allergies && allergies.value) || '').split(',').map(s => s.trim()).filter(Boolean))),
            doencasCronicas: (() => { const arr = (((chronicDiseases && chronicDiseases.value) || '').split(',').map(s => s.trim()).filter(Boolean)); return arr.length ? arr : ['Nenhuma']; })(),
            alergiamedicamentos: (() => { const arr = (((drugAllergies && drugAllergies.value) || '').split(',').map(s => s.trim()).filter(Boolean)); return arr.length ? arr : ['Nenhuma']; })(),
            medicamentosUso: (() => { const arr = (((currentMedications && currentMedications.value) || '').split(',').map(s => s.trim()).filter(Boolean)); return arr.length ? arr : ['Nenhum']; })(),
            historicoCirurgico: (() => { const arr = (((surgicalHistory && surgicalHistory.value) || '').split(',').map(s => s.trim()).filter(Boolean)); return arr.length ? arr : ['Nenhum']; })(),
            observacoesMedicas: ((observations && observations.value) || '').trim(),
            username: ((cpf && cpf.value) || '').replace(/\D+/g, ''),
            password: ((cpf && cpf.value) || '').replace(/\D+/g, '').slice(-6) || '123456'
        };
        return payload;
    };

    // Validação de campos obrigatórios e regras
    const validateForm = () => {
        let ok = true;
        const errors = [];

        const required = [
            { el: fullName, name: 'Nome completo' },
            { el: birthDate, name: 'Data de nascimento' },
            { el: cpf, name: 'CPF' },
            { el: phone, name: 'Telefone' },
            { el: email, name: 'E-mail' },
            { el: street, name: 'Rua' },
            { el: bloodType, name: 'Tipo sanguíneo' },
            { el: observations, name: 'Observações médicas' },
        ];

        required.forEach(({ el, name }) => {
            if (!el) return;
            const val = (el.value || '').trim();
            if (!val) {
                ok = false;
                setFieldError(el, `${name} é obrigatório.`);
                errors.push(`${name} é obrigatório.`);
            } else {
                clearFieldError(el);
            }
        });

        // Regras específicas
        const cpfDigits = onlyDigits((cpf && cpf.value) || '');
        if (cpfDigits.length !== 11 || !isValidCPF(cpfDigits)) {
            ok = false;
            setFieldError(cpf, 'CPF inválido.');
            errors.push('CPF inválido.');
        }

        const phoneDigits = onlyDigits((phone && phone.value) || '');
        if (phoneDigits.length < 10 || phoneDigits.length > 11) {
            ok = false;
            setFieldError(phone, 'Telefone inválido.');
            errors.push('Telefone inválido.');
        }

        const emailVal = ((email && email.value) || '').trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        if (!emailRegex.test(emailVal)) {
            ok = false;
            setFieldError(email, 'E-mail inválido.');
            errors.push('E-mail inválido.');
        }

        if (!ok) {
            alert('Corrija os erros:\n\n' + errors.join('\n'));
        }
        return ok;
    };

    // Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        applyMasks();
        if (!validateForm()) return;

        const payload = buildPayload();

        try {
            let data;
            if (window.PacientesAPI && typeof PacientesAPI.criarPaciente === 'function') {
                data = await PacientesAPI.criarPaciente(payload);
            } else {
                const resp = await fetch(PACIENTES_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!resp.ok) {
                    const msg = await resp.text();
                    throw new Error(msg || 'Erro ao cadastrar paciente');
                }
                data = await resp.json();
            }

            const saved = (data && data.usuario) || data;
            try {
                if (saved && saved._id) {
                    localStorage.setItem('ultimo_paciente_id', saved._id);
                    localStorage.setItem('ultimo_paciente_obj', JSON.stringify(saved));
                }
            } catch (_) { }
            openModal(saved);
        } catch (err) {
            alert('Falha de comunicação com o servidor. Verifique sua conexão.');
            console.error(err);
        }
    });
})();
