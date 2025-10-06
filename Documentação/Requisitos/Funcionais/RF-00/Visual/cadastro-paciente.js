
let patients = JSON.parse(localStorage.getItem('patients')) || [];
let nextPatientId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;


const patientForm = document.getElementById('patient-form');
const btnCancel = document.getElementById('btn-cancel');
const btnClear = document.getElementById('btn-clear');
const btnSubmit = document.getElementById('btn-submit');
const successModal = document.getElementById('success-modal');
const closeModal = document.querySelector('.close');
const btnNewPatient = document.getElementById('btn-new-patient');
const btnViewList = document.getElementById('btn-view-list');


function applyMasks() {
    
    const cpfInput = document.getElementById('cpf');
    cpfInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }
        e.target.value = value;
    });

    
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            if (value.length <= 2) {
                value = value.replace(/(\d{0,2})/, '($1');
            } else if (value.length <= 6) {
                value = value.replace(/(\d{2})(\d{0,4})/, '($1) $2');
            } else {
                value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
            }
        }
        e.target.value = value;
    });

    const zipCodeInput = document.getElementById('zipCode');
    zipCodeInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 8) {
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        }
        e.target.value = value;
    });
}


function validateForm(formData) {
    const errors = [];

    
    if (!formData.get('fullName') || formData.get('fullName').trim().length < 3) {
        errors.push('Nome completo deve ter pelo menos 3 caracteres');
    }

    
    const birthDate = new Date(formData.get('birthDate'));
    const today = new Date();
    if (birthDate >= today) {
        errors.push('Data de nascimento deve ser anterior à data atual');
    }

    
    const cpf = formData.get('cpf').replace(/\D/g, '');
    if (cpf.length !== 11) {
        errors.push('CPF deve ter 11 dígitos');
    }

    
    if (!formData.get('motherName') || formData.get('motherName').trim().length < 3) {
        errors.push('Nome da mãe deve ter pelo menos 3 caracteres');
    }

    
    if (!formData.get('address') || formData.get('address').trim().length < 10) {
        errors.push('Endereço deve ter pelo menos 10 caracteres');
    }

    
    const phone = formData.get('phone').replace(/\D/g, '');
    if (phone.length < 10) {
        errors.push('Telefone deve ter pelo menos 10 dígitos');
    }

    return errors;
}


function savePatient(patientData) {
    const patient = {
        id: nextPatientId++,
        fullName: patientData.get('fullName').trim(),
        birthDate: patientData.get('birthDate'),
        cpf: patientData.get('cpf').replace(/\D/g, ''),
        motherName: patientData.get('motherName').trim(),
        address: patientData.get('address').trim(),
        phone: patientData.get('phone').replace(/\D/g, ''),
        email: patientData.get('email')?.trim() || '',
        zipCode: patientData.get('zipCode')?.replace(/\D/g, '') || '',
        city: patientData.get('city')?.trim() || '',
        state: patientData.get('state') || '',
        bloodType: patientData.get('bloodType') || '',
        allergies: patientData.get('allergies')?.trim() || '',
        observations: patientData.get('observations')?.trim() || '',
        registrationDate: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
    };

    patients.push(patient);
    localStorage.setItem('patients', JSON.stringify(patients));
    localStorage.setItem('nextPatientId', nextPatientId.toString());

    return patient;
}


function showSuccessModal(patient) {
    document.getElementById('patient-id').textContent = patient.id.toString().padStart(6, '0');
    document.getElementById('patient-name').textContent = patient.fullName;
    document.getElementById('patient-cpf').textContent = patient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    
    successModal.style.display = 'block';
}


function clearForm() {
    patientForm.reset();
    
    document.getElementById('fullName').focus();
}


document.addEventListener('DOMContentLoaded', function() {
    applyMasks();

    
    patientForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(patientForm);
        const errors = validateForm(formData);

        if (errors.length > 0) {
            alert('Por favor, corrija os seguintes erros:\n\n• ' + errors.join('\n• '));
            return;
        }

        
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span class="btn-icon">⏳</span>Cadastrando...';

        
        setTimeout(() => {
            try {
                const patient = savePatient(formData);
                showSuccessModal(patient);
                clearForm();
            } catch (error) {
                alert('Erro ao cadastrar paciente: ' + error.message);
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = '<span class="btn-icon">✓</span>Cadastrar Paciente';
            }
        }, 1000);
    });

    
    btnCancel.addEventListener('click', function() {
        if (confirm('Deseja cancelar o cadastro? Todas as informações não salvas serão perdidas.')) {
            window.location.href = 'dashboard.html';
        }
    });

    
    btnClear.addEventListener('click', function() {
        if (confirm('Deseja limpar todo o formulário?')) {
            clearForm();
        }
    });

    
    closeModal.addEventListener('click', function() {
        successModal.style.display = 'none';
    });

    btnNewPatient.addEventListener('click', function() {
        successModal.style.display = 'none';
        clearForm();
        document.getElementById('fullName').focus();
    });

    btnViewList.addEventListener('click', function() {
        window.location.href = 'lista-pacientes.html';
    });

    
    window.addEventListener('click', function(e) {
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });

    
    const requiredFields = patientForm.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.style.borderColor = 'var(--danger)';
            } else {
                this.style.borderColor = 'var(--border)';
            }
        });
    });
});


document.getElementById('zipCode')?.addEventListener('blur', function() {
    const cep = this.value.replace(/\D/g, '');
    if (cep.length === 8) {
        
        setTimeout(() => {
            document.getElementById('address').value = 'Rua Exemplo, 123 - Centro';
            document.getElementById('city').value = 'São Paulo';
            document.getElementById('state').value = 'SP';
        }, 500);
    }
});