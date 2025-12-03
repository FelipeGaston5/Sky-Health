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

// ===================== GEOREFERENCIAMENTO (CONSULTAS) =====================

// Bairros de Recife -> coordenadas aproximadas
const coordenadasBairros = {
  "Boa Viagem": { lat: -8.1265, lng: -34.9156 },
  "Ibura": { lat: -8.1415, lng: -34.9443 },
  "Casa Amarela": { lat: -8.0234, lng: -34.9187 },
  "Santo Amaro": { lat: -8.0510, lng: -34.8800 },
  "Espinheiro": { lat: -8.0450, lng: -34.8950 },
  "Pina": { lat: -8.0891, lng: -34.8851 }
  // Adicione aqui outros bairros usados no Sky-Health
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

// ==== Função: cor dinâmica por número de consultas ====
function corPorCasos(qtd) {
  if (qtd <= 20) return "#a7f3d0"; // baixo
  if (qtd <= 50) return "#facc15"; // moderado
  if (qtd <= 100) return "#fb923c"; // alto
  return "#ef4444"; // crítico
}

// ==== Buscar CONSULTAS via API do backend ====
// Depende de window.ConsultasAPI.listarConsultas() definido em consultas.js
async function carregarConsultasDoBackend() {
  if (!window.ConsultasAPI || !window.ConsultasAPI.listarConsultas) {
    throw new Error('ConsultasAPI.listarConsultas não está disponível. Verifique consultas.js e a ordem dos scripts.');
  }

  const lista = await window.ConsultasAPI.listarConsultas();

  // Pode vir como array simples ou dentro de { agendamentos: [...] }
  if (Array.isArray(lista)) return lista;
  if (Array.isArray(lista.agendamentos)) return lista.agendamentos;
  return [];
}

// ==== Transformar AGENDAMENTO/CONSULTA -> registro para o mapa ====
// Cada consulta (agendamento) vira 1 registro
function consultaParaRegistroGeo(agendamento) {
  // Tenta descobrir o bairro em diferentes formatos comuns
  const bairro =
    agendamento?.paciente?.endereco?.bairro ||
    agendamento?.paciente?.bairro ||
    agendamento?.endereco?.bairro ||
    agendamento?.bairro ||
    null;

  if (!bairro) return null;

  const coords = coordenadasBairros[bairro];
  if (!coords) return null; // bairro sem coordenada cadastrada → ignora

  // Tipo de consulta: tenta vários campos comuns
  const tipoConsulta =
    agendamento.tipoConsulta ||
    agendamento.tipo ||
    agendamento.especialidade ||
    "Consulta";

  // Data da consulta: tenta vários campos comuns
  const dataBruta =
    agendamento.dataConsulta ||
    agendamento.data ||
    agendamento.criadoEm ||
    "";

  let dataNormalizada = "";
  if (dataBruta) {
    try {
      dataNormalizada = new Date(dataBruta).toISOString().slice(0, 10);
    } catch {
      dataNormalizada = "";
    }
  }

  return {
    bairro,
    lat: coords.lat,
    lng: coords.lng,
    tipoConsulta,
    casos: 1,          // cada consulta conta como 1 ocorrência
    data: dataNormalizada
  };
}

// ==== Preencher o <select> de tipos de consulta automaticamente ====
function carregarTiposConsulta(dados) {
  const select = document.getElementById("selectConsulta");
  if (!select) return;

  const lista = new Set();
  dados.forEach(reg => {
    if (reg.tipoConsulta) lista.add(reg.tipoConsulta);
  });

  select.innerHTML = `<option value="todas">Todas</option>`;

  lista.forEach(tipo => {
    select.innerHTML += `<option value="${tipo}">${tipo}</option>`;
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
  // Carrega consultas e gera registros base se ainda não foi feito
  if (!registrosBase.length) {
    const consultas = await carregarConsultasDoBackend();
    registrosBase = consultas
      .map(consultaParaRegistroGeo)
      .filter(r => r !== null);
  }

  const tipoSel = document.getElementById("selectConsulta")?.value || "todas";
  const inicio = document.getElementById("dataInicio")?.value || "";
  const fim = document.getElementById("dataFim")?.value || "";

  // Filtragem dinâmica
  const filtrados = registrosBase.filter(reg => {
    if (tipoSel !== "todas" && reg.tipoConsulta !== tipoSel) return false;
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
      <strong>Consultas no período:</strong> ${b.total}
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
if (btnAplicar) {
  btnAplicar.addEventListener("click", async () => {
    try {
      await aplicarFiltros();
    } catch (e) {
      console.error("Erro ao aplicar filtros:", e);
    }
  });
}

// ==== Inicialização ====
(async () => {
  try {
    const consultas = await carregarConsultasDoBackend();

    registrosBase = consultas
      .map(consultaParaRegistroGeo)
      .filter(r => r !== null);

    carregarTiposConsulta(registrosBase);
    await aplicarFiltros();
  } catch (e) {
    console.error('Erro ao inicializar georreferenciamento:', e);
  }
})();
