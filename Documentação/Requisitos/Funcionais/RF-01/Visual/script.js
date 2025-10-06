
const demoUsers = {
    'gestor': { password: 'senha123', profile: 'Gestor', name: 'Carlos Silva' },
    'medico': { password: 'senha123', profile: 'Médico', name: 'Dra. Ana Oliveira' },
    'enfermeiro': { password: 'senha123', profile: 'Enfermeiro', name: 'Enf. Roberto Santos' },
    'paciente': { password: 'senha123', profile: 'Paciente', name: 'Maria Souza' }
};


let patients = JSON.parse(localStorage.getItem('patients')) || [
    {
        id: 1,
        fullName: 'João da Silva',
        birthDate: '1985-05-15',
        cpf: '123.456.789-00',
        motherName: 'Maria da Silva',
        address: 'Rua das Flores, 123, Centro, São Paulo - SP',
        phone: '(11) 99999-9999',
        email: 'joao.silva@email.com',
        bloodType: 'A+'
    },
    {
        id: 2,
        fullName: 'Ana Pereira',
        birthDate: '1990-08-22',
        cpf: '987.654.321-00',
        motherName: 'Clara Pereira',
        address: 'Av. Paulista, 1000, Bela Vista, São Paulo - SP',
        phone: '(11) 88888-8888',
        email: 'ana.pereira@email.com',
        bloodType: 'O+'
    }
];


let currentUser = null;
let currentScreen = 'login-screen';


const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const patientRegistrationScreen = document.getElementById('patient-registration-screen');
const patientListScreen = document.getElementById('patient-list-screen');
const loginForm = document.getElementById('login-form');
const patientForm = document.getElementById('patient-form');
const mainNav = document.getElementById('main-nav');
const userInfo = document.getElementById('user-info');
const dashboardContent = document.getElementById('dashboard-content');
const patientsTableBody = document.getElementById('patients-table-body');
const cancelRegistrationBtn = document.getElementById('cancel-registration');


function showScreen(screenId) {
    
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
    
    
    if (screenId === 'dashboard-screen') {
        updateDashboard();
    } else if (screenId === 'patient-list-screen') {
        updatePatientList();
    }
}


function login(username, password) {
    if (demoUsers[username] && demoUsers[username].password === password) {
        currentUser = {
            username: username,
            ...demoUsers[username]
        };
        
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        
        updateUIForUser();
        showScreen('dashboard-screen');
        
        return true;
    }
    
    return false;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUIForUser();
    showScreen('login-screen');
    loginForm.reset();
}

function checkLoggedInUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForUser();
        showScreen('dashboard-screen');
    }
}


function updateUIForUser() {
    
    updateNavigation();
    
    
    updateUserInfo();
}

function updateNavigation() {
    mainNav.innerHTML = '';
    
    if (currentUser) {
        
        const dashboardLink = document.createElement('li');
        dashboardLink.innerHTML = '<a href="#" id="dashboard-link">Dashboard</a>';
        mainNav.appendChild(dashboardLink);
        
        
        if (currentUser.profile === 'Gestor') {
            const patientListLink = document.createElement('li');
            patientListLink.innerHTML = '<a href="#" id="patient-list-link">Lista de Pacientes</a>';
            mainNav.appendChild(patientListLink);
            
            const patientRegistrationLink = document.createElement('li');
            patientRegistrationLink.innerHTML = '<a href="#" id="patient-registration-link">Cadastrar Paciente</a>';
            mainNav.appendChild(patientRegistrationLink);
        } else if (currentUser.profile === 'Médico') {
            const patientListLink = document.createElement('li');
            patientListLink.innerHTML = '<a href="#" id="patient-list-link">Pacientes</a>';
            mainNav.appendChild(patientListLink);
            
            const prescriptionsLink = document.createElement('li');
            prescriptionsLink.innerHTML = '<a href="#" id="prescriptions-link">Prescrições</a>';
            mainNav.appendChild(prescriptionsLink);
        } else if (currentUser.profile === 'Enfermeiro') {
            const patientListLink = document.createElement('li');
            patientListLink.innerHTML = '<a href="#" id="patient-list-link">Pacientes</a>';
            mainNav.appendChild(patientListLink);
            
            const nursingRecordsLink = document.createElement('li');
            nursingRecordsLink.innerHTML = '<a href="#" id="nursing-records-link">Registros de Enfermagem</a>';
            mainNav.appendChild(nursingRecordsLink);
        } else if (currentUser.profile === 'Paciente') {
            const appointmentsLink = document.createElement('li');
            appointmentsLink.innerHTML = '<a href="#" id="appointments-link">Meus Agendamentos</a>';
            mainNav.appendChild(appointmentsLink);
            
            const medicalHistoryLink = document.createElement('li');
            medicalHistoryLink.innerHTML = '<a href="#" id="medical-history-link">Meu Histórico</a>';
            mainNav.appendChild(medicalHistoryLink);
        }
        
        
        const logoutLink = document.createElement('li');
        logoutLink.innerHTML = '<a href="#" id="logout-link">Sair</a>';
        mainNav.appendChild(logoutLink);
        
        
        document.getElementById('dashboard-link').addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('dashboard-screen');
        });
        
        if (document.getElementById('patient-list-link')) {
            document.getElementById('patient-list-link').addEventListener('click', (e) => {
                e.preventDefault();
                showScreen('patient-list-screen');
            });
        }
        
        if (document.getElementById('patient-registration-link')) {
            document.getElementById('patient-registration-link').addEventListener('click', (e) => {
                e.preventDefault();
                showScreen('patient-registration-screen');
            });
        }
        
        document.getElementById('logout-link').addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

function updateUserInfo() {
    if (currentUser) {
        userInfo.innerHTML = `
            <div class="user-avatar">${currentUser.name.charAt(0)}</div>
            <div>
                <div>${currentUser.name}</div>
                <div class="user-profile">${currentUser.profile}</div>
            </div>
        `;
    } else {
        userInfo.innerHTML = '';
    }
}


function updateDashboard() {
    const dashboardTitle = document.getElementById('dashboard-title');
    dashboardTitle.textContent = `Dashboard - ${currentUser.profile}`;
    
    let dashboardHTML = '';
    
    if (currentUser.profile === 'Gestor') {
        dashboardHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3>Relatórios e Dados Estratégicos</h3>
                    <ul>
                        <li>Relatório de Ocupação</li>
                        <li>Indicadores de Performance</li>
                        <li>Análise Financeira</li>
                        <li>Estatísticas de Atendimento</li>
                    </ul>
                </div>
                <div class="dashboard-card">
                    <h3>Gestão de Usuários</h3>
                    <ul>
                        <li>Cadastrar Novo Usuário</li>
                        <li>Gerenciar Permissões</li>
                        <li>Relatório de Acessos</li>
                    </ul>
                </div>
                <div class="dashboard-card">
                    <h3>Gestão de Pacientes</h3>
                    <ul>
                        <li>Total de Pacientes: ${patients.length}</li>
                        <li>Novos Cadastros (mês)</li>
                        <li>Pacientes por Região</li>
                    </ul>
                </div>
            </div>
        `;
    } else if (currentUser.profile === 'Médico') {
        dashboardHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3>Prontuários</h3>
                    <ul>
                        <li>Consultas do Dia</li>
                        <li>Prontuários Pendentes</li>
                        <li>Histórico de Pacientes</li>
                    </ul>
                </div>
                <div class="dashboard-card">
                    <h3>Prescrição Digital</h3>
                    <ul>
                        <li>Nova Prescrição</li>
                        <li>Prescrições Ativas</li>
                        <li>Histórico de Prescrições</li>
                    </ul>
                </div>
                <div class="dashboard-card">
                    <h3>Agenda</h3>
                    <ul>
                        <li>Próximas Consultas</li>
                        <li>Disponibilidade</li>
                        <li>Agendar Nova Consulta</li>
                    </ul>
                </div>
            </div>
        `;
    } else if (currentUser.profile === 'Enfermeiro') {
        dashboardHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3>Registros de Enfermagem</h3>
                    <ul>
                        <li>Novo Registro</li>
                        <li>Registros do Dia</li>
                        <li>Medicações Pendentes</li>
                    </ul>
                </div>
                <div class="dashboard-card">
                    <h3>Dados Básicos do Paciente</h3>
                    <ul>
                        <li>Sinais Vitais</li>
                        <li>Evolução do Paciente</li>
                        <li>Procedimentos Realizados</li>
                    </ul>
                </div>
                <div class="dashboard-card">
                    <h3>Plantão</h3>
                    <ul>
                        <li>Pacientes sob Cuidados</li>
                        <li>Plantões Agendados</li>
                        <li>Comunicação com Médicos</li>
                    </ul>
                </div>
            </div>
        `;
    } else if (currentUser.profile === 'Paciente') {
        dashboardHTML = `
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3>Meu Histórico</h3>
                    <ul>
                        <li>Consultas Realizadas</li>
                        <li>Exames e Resultados</li>
                        <li>Medicações em Uso</li>
                        <li>Alergias e Condições</li>
                    </ul>
                </div>
                <div class="dashboard-card">
                    <h3>Agendamentos</h3>
                    <ul>
                        <li>Próxima Consulta</li>
                        <li>Histórico de Agendamentos</li>
                        <li>Solicitar Novo Agendamento</li>
                    </ul>
                </div>
                <div class="dashboard-card">
                    <h3>Meus Dados</h3>
                    <ul>
                        <li>Informações Pessoais</li>
                        <li>Contatos de Emergência</li>
                        <li>Plano de Saúde</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    dashboardContent.innerHTML = dashboardHTML;
}


function savePatient(patientData) {
    
    const newId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;
    
    const newPatient = {
        id: newId,
        ...patientData
    };
    
    patients.push(newPatient);
    localStorage.setItem('patients', JSON.stringify(patients));
    
    return newPatient;
}

function updatePatientList() {
    patientsTableBody.innerHTML = '';
    
    patients.forEach(patient => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${patient.fullName}</td>
            <td>${patient.cpf}</td>
            <td>${formatDate(patient.birthDate)}</td>
            <td>${patient.phone}</td>
            <td class="action-buttons">
                <button class="btn btn-primary btn-sm view-patient" data-id="${patient.id}">Ver</button>
                ${currentUser.profile === 'Gestor' ? 
                  `<button class="btn btn-warning btn-sm edit-patient" data-id="${patient.id}">Editar</button>
                   <button class="btn btn-danger btn-sm delete-patient" data-id="${patient.id}">Excluir</button>` : 
                  ''}
            </td>
        `;
        
        patientsTableBody.appendChild(row);
    });
    
    
    document.querySelectorAll('.view-patient').forEach(button => {
        button.addEventListener('click', (e) => {
            const patientId = parseInt(e.target.getAttribute('data-id'));
            viewPatient(patientId);
        });
    });
    
    if (currentUser.profile === 'Gestor') {
        document.querySelectorAll('.edit-patient').forEach(button => {
            button.addEventListener('click', (e) => {
                const patientId = parseInt(e.target.getAttribute('data-id'));
                editPatient(patientId);
            });
        });
        
        document.querySelectorAll('.delete-patient').forEach(button => {
            button.addEventListener('click', (e) => {
                const patientId = parseInt(e.target.getAttribute('data-id'));
                deletePatient(patientId);
            });
        });
    }
}

function viewPatient(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
        alert(`Detalhes do Paciente:\n\nNome: ${patient.fullName}\nCPF: ${patient.cpf}\nData de Nascimento: ${formatDate(patient.birthDate)}\nTelefone: ${patient.phone}\nEndereço: ${patient.address}`);
    }
}

function editPatient(patientId) {
   
    alert(`Funcionalidade de edição do paciente ${patientId} será implementada.`);
}

function deletePatient(patientId) {
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
        patients = patients.filter(p => p.id !== patientId);
        localStorage.setItem('patients', JSON.stringify(patients));
        updatePatientList();
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}


document.addEventListener('DOMContentLoaded', function() {
    
    checkLoggedInUser();
    
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (login(username, password)) {
            
        } else {
            alert('Usuário ou senha incorretos!');
        }
    });
    
    
    patientForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(patientForm);
        const patientData = {
            fullName: formData.get('fullName'),
            birthDate: formData.get('birthDate'),
            cpf: formData.get('cpf'),
            motherName: formData.get('motherName'),
            address: formData.get('address'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            bloodType: formData.get('bloodType')
        };
        
        
        if (!patientData.fullName || !patientData.birthDate || !patientData.cpf || 
            !patientData.motherName || !patientData.address || !patientData.phone) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
       
        if (patients.some(p => p.cpf === patientData.cpf)) {
            alert('Já existe um paciente cadastrado com este CPF.');
            return;
        }
        
        
        const newPatient = savePatient(patientData);
        
        alert(`Paciente ${newPatient.fullName} cadastrado com sucesso! ID: ${newPatient.id}`);
        
        
        patientForm.reset();
        
        
        showScreen('patient-list-screen');
    });
    
    
    cancelRegistrationBtn.addEventListener('click', function() {
        patientForm.reset();
        showScreen('dashboard-screen');
    });
});


const style = document.createElement('style');
style.textContent = `
    .btn-sm {
        padding: 5px 10px;
        font-size: 0.875rem;
    }
    
    .user-profile {
        font-size: 0.875rem;
        opacity: 0.8;
    }
`;
document.head.appendChild(style);