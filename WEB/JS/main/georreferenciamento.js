// ===================== DARK MODE =====================
const body = document.body;
const toggleBtn = document.getElementById('themeToggle');

if (toggleBtn) {
  const storedTheme = localStorage.getItem('theme') || 'light';
  setTheme(storedTheme);

  toggleBtn.addEventListener('click', () => {
    const current = body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });
}

function setTheme(theme) {
  if (theme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    body.classList.add('dark-mode');
    if (toggleBtn) {
      toggleBtn.querySelector('.theme-toggle__label').textContent = 'Modo claro';
      toggleBtn.querySelector('.theme-toggle__icon').textContent = '☀️';
    }
  } else {
    body.setAttribute('data-theme', 'light');
    body.classList.remove('dark-mode');
    if (toggleBtn) {
      toggleBtn.querySelector('.theme-toggle__label').textContent = 'Modo escuro';
      toggleBtn.querySelector('.theme-toggle__icon').textContent = '🌙';
    }
  }
  localStorage.setItem('theme', theme);
}

// ===================== GEOREFERENCIAMENTO (PACIENTES) =====================

// Bairros de Recife -> coordenadas aproximadas
// Completae depois com todos os bairros utilizados no sistema
const coordenadasBairros = {
  "Boa Viagem": { lat: -8.1265, lng: -34.9156 },
  "Ibura": { lat: -8.1415, lng: -34.9443 },
  "Casa Amarela": { lat: -8.0234, lng: -34.9187 },
  "Santo Amaro": { lat: -8.0510, lng: -34.8800 },
  "Espinheiro": { lat: -8.0450, lng: -34.8950 },
  "Pina": { lat: -8.0891, lng: -34.8851 }
  // TODO: adicionar outros bairros usados no Sky-Health
};

// Vai guardar todos os registros no formato que o mapa usa
let registrosBase = [];

// Inicializar mapa em Recife
const mapa = L.map("mapa").setView([-8.05, -34.88], 12);

// Mapa base (OpenStreetMap)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19
}).addTo(mapa);

// Grupo onde marcadores ficam
const camadaMarcadores = L.layerGroup().addTo(mapa);

// ==== Função: cor dinâmica por número de casos ====
function corPorCasos(qtd) {
  if (qtd <= 20) return "#a7f3d0"; // baixo
  if (qtd <= 50) return "#facc15"; // moderado
  if (qtd <= 100) return "#fb923c"; // alto
  return "#ef4444"; // crítico
}

// ==== Buscar pacientes via API já existente (PacientesAPI) ====
async function carregarPacientesDoBackend() {
  if (!window.PacientesAPI || !window.PacientesAPI.listarPacientes) {
    throw new Error('PacientesAPI.listarPacientes não está disponível. Verifique a ordem dos scripts.');
  }
  const lista = await window.PacientesAPI.listarPacientes();

  // Pode vir como array simples ou dentro de { pacientes: [...] }
  if (Array.isArray(lista)) return lista;
  if (Array.isArray(lista.pacientes)) return lista.pacientes;
  return [];
}

// ==== Transformar PACIENTE -> registros para o mapa ====
// Cada doença crônica do paciente vira 1 registro
function pacienteParaRegistrosGeo(paciente) {
  const bairro = paciente.endereco?.bairro;
  if (!bairro) return [];

  const coords = coordenadasBairros[bairro];
  if (!coords) return []; // bairro sem coordenada cadastrado → ignorado

  const doencas = Array.isArray(paciente.doencasCronicas)
    ? paciente.doencasCronicas
    : [];

  // Usa a data de criação do paciente como referência (ou vazio)
  let dataBase = "";
  if (paciente.criadoEm) {
    try {
      dataBase = new Date(paciente.criadoEm).toISOString().slice(0, 10);
    } catch {
      dataBase = "";
    }
  }

  // Gera um registro por doença crônica
  return doencas.map(doenca => ({
    bairro,
    lat: coords.lat,
    lng: coords.lng,
    doenca,
    casos: 1,
    data: dataBase
  }));
}

// ==== Preencher o <select> de doenças automaticamente ====
function carregarDoencas(dados) {
  const select = document.getElementById("selectDoenca");
  if (!select) return;

  const lista = new Set();
  dados.forEach(reg => {
    if (reg.doenca) lista.add(reg.doenca);
  });

  select.innerHTML = `<option value="todas">Todas</option>`;

  lista.forEach(doenca => {
    select.innerHTML += `<option value="${doenca}">${doenca}</option>`;
  });
}

// ==== Agrupar registros por bairro ====
function agruparPorBairro(dadosFiltrados) {
  const grupos = {};

  dadosFiltrados.forEach(reg => {
    if (!grupos[reg.bairro]) {
      grupos[reg.bairro] = {
        bairro: reg.bairro,
        lat: reg.lat,
        lng: reg.lng,
        total: 0
      };
    }
    grupos[reg.bairro].total += reg.casos;
  });

  return Object.values(grupos);
}

// ==== Aplicar filtros e desenhar o mapa ====
async function aplicarFiltros() {
  // Carrega pacientes e gera registros base se ainda não foi feito
  if (!registrosBase.length) {
    const pacientes = await carregarPacientesDoBackend();
    registrosBase = pacientes
      .flatMap(pacienteParaRegistrosGeo)
      .filter(r => r !== null);
  }

  const doencaSel = document.getElementById("selectDoenca")?.value || "todas";
  const inicio = document.getElementById("dataInicio")?.value || "";
  const fim = document.getElementById("dataFim")?.value || "";

  // Filtragem dinâmica
  const filtrados = registrosBase.filter(reg => {
    if (doencaSel !== "todas" && reg.doenca !== doencaSel) return false;
    if (inicio && reg.data && reg.data < inicio) return false;
    if (fim && reg.data && reg.data > fim) return false;
    return true;
  });

  // Agrupar por bairro
  const agrupados = agruparPorBairro(filtrados);

  // Limpar marcadores antigos
  camadaMarcadores.clearLayers();

  // Criar novos marcadores
  agrupados.forEach(b => {
    const cor = corPorCasos(b.total);

    const marker = L.circleMarker([b.lat, b.lng], {
      radius: 12,
      color: cor,
      fillColor: cor,
      fillOpacity: 0.85,
      weight: 2
    });

    marker.bindPopup(`
      <strong>Bairro:</strong> ${b.bairro}<br>
      <strong>Casos totais:</strong> ${b.total}
    `);

    marker.addTo(camadaMarcadores);
  });

  // Centralizar no conjunto de pontos
  if (agrupados.length > 0) {
    const bounds = agrupados.map(b => [b.lat, b.lng]);
    mapa.fitBounds(bounds, { padding: [40, 40] });
  }
}

// Botão "Aplicar filtros"
const btnAplicar = document.getElementById("btnAplicar");
btnAplicar?.addEventListener("click", aplicarFiltros);

// ==== Inicialização ====
(async () => {
  try {
    const pacientes = await carregarPacientesDoBackend();

    registrosBase = pacientes
      .flatMap(pacienteParaRegistrosGeo)
      .filter(r => r !== null);

    carregarDoencas(registrosBase);
    aplicarFiltros();
  } catch (e) {
    console.error('Erro ao inicializar georreferenciamento:', e);
  }
})();
