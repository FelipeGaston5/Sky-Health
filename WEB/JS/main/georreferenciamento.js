//dark mode
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
// Inicializar mapa 
const mapa = L.map("mapa").setView([-8.05, -34.88], 12);

// Mapa 
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


// ==== Função: carregar doenças automaticamente do JSON ====
async function carregarDoencas(dados) {
    const select = document.getElementById("selectDoenca");
    const lista = new Set();

    dados.forEach(reg => lista.add(reg.doenca));

    select.innerHTML = `<option value="todas">Todas</option>`;

    lista.forEach(doenca => {
        select.innerHTML += `<option value="${doenca}">${doenca}</option>`;
    });
}


// ==== Função: agrupar registros por bairro ====
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


// ==== Função principal: aplicar filtros e desenhar mapa ====
async function aplicarFiltros() {
    const resp = await fetch("dados_doencas.json");
    const dados = await resp.json();

    const doencaSel = document.getElementById("selectDoenca").value;
    const inicio = document.getElementById("dataInicio").value;
    const fim = document.getElementById("dataFim").value;

    // Filtragem dinâmica
    const filtrados = dados.filter(reg => {
        if (doencaSel !== "todas" && reg.doenca !== doencaSel) return false;
        if (inicio && reg.data < inicio) return false;
        if (fim && reg.data > fim) return false;
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


// Aplicar filtros ao clicar no botão
document.getElementById("btnAplicar").addEventListener("click", aplicarFiltros);


// ==== Inicialização ====
(async () => {
    const resp = await fetch("dados_doencas.json");
    const dados = await resp.json();

    await carregarDoencas(dados);
    aplicarFiltros(); // primeira carga
})();
