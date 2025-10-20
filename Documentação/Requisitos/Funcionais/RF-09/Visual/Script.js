// ==========================
// Sky Health - Script Principal
// ==========================

const form = document.getElementById("agendamentoForm");
const verAgendamentosBtn = document.getElementById("verAgendamentos");
const listaAgendamentos = document.getElementById("lista-agendamentos");
const containerAgendamentos = document.getElementById("agendamentosContainer");

const modal = document.getElementById("modalDetalhes");
const modalDetalhes = modal.querySelector(".modal-detalhes");
const fecharModalBtn = modal.querySelector(".fechar-modal");
const btnReagendar = document.getElementById("btnReagendar");
const btnCancelar = document.getElementById("btnCancelar");

const toastContainer = document.getElementById("toastContainer");

// ==========================
// Utilitários
// ==========================
function carregarAgendamentos() {
  return JSON.parse(localStorage.getItem("agendamentos")) || [];
}

function salvarAgendamentos(agendamentos) {
  localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
}

function gerarID() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

function mostrarToast(mensagem, tipo = "sucesso") {
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = mensagem;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ==========================
// Funções principais
// ==========================
function renderizarAgendamentos() {
  const agendamentos = carregarAgendamentos();
  containerAgendamentos.innerHTML = "";

  if (agendamentos.length === 0) {
    containerAgendamentos.innerHTML = `<p class="sem-agendamentos">Nenhum agendamento realizado ainda.</p>`;
    return;
  }

  agendamentos.forEach((a) => {
    const item = document.createElement("div");
    item.classList.add("agendamento-item");
    item.dataset.id = a.id;
    item.innerHTML = `
      <h4>${a.tipo} com ${a.profissional}</h4>
      <p><strong>Paciente:</strong> ${a.paciente}</p>
      <p><strong>Data:</strong> ${a.data} às ${a.hora}</p>
      <p><strong>Unidade:</strong> ${a.unidade}</p>
    `;
    item.addEventListener("click", () => abrirModal(a.id));
    containerAgendamentos.appendChild(item);
  });
}

// Criar novo agendamento
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const paciente = document.getElementById("paciente").value.trim();
  const tipo = document.getElementById("tipo").value;
  const profissional = document.getElementById("profissional").value;
  const unidade = document.getElementById("unidade").value;
  const data = document.getElementById("data").value;
  const hora = document.getElementById("hora").value;

  if (!paciente || !tipo || !profissional || !unidade || !data || !hora) {
    mostrarToast("Preencha todos os campos!", "erro");
    return;
  }

  const novoAgendamento = {
    id: gerarID(),
    paciente,
    tipo,
    profissional,
    unidade,
    data: new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" }),
    hora,
  };

  const agendamentos = carregarAgendamentos();
  agendamentos.push(novoAgendamento);
  salvarAgendamentos(agendamentos);

  mostrarToast("Agendamento criado com sucesso!");
  form.reset();
  verAgendamentosBtn.style.display = "inline-flex";
  renderizarAgendamentos();
});

// Ver agendamentos
verAgendamentosBtn.addEventListener("click", () => {
  const visible = !listaAgendamentos.classList.contains("hidden");
  if (visible) {
    listaAgendamentos.classList.add("hidden");
  } else {
    listaAgendamentos.classList.remove("hidden");
    renderizarAgendamentos();
    listaAgendamentos.scrollIntoView({ behavior: "smooth" });
  }
});

// Modal
function abrirModal(id) {
  const agendamentos = carregarAgendamentos();
  const agendamento = agendamentos.find((a) => a.id === id);
  if (!agendamento) return;

  modalDetalhes.innerHTML = `
    <p><strong>Paciente:</strong> ${agendamento.paciente}</p>
    <p><strong>Tipo:</strong> ${agendamento.tipo}</p>
    <p><strong>Profissional:</strong> ${agendamento.profissional}</p>
    <p><strong>Unidade:</strong> ${agendamento.unidade}</p>
    <p><strong>Data:</strong> ${agendamento.data}</p>
    <p><strong>Hora:</strong> ${agendamento.hora}</p>
  `;

  btnCancelar.onclick = () => cancelarAgendamento(id);
  btnReagendar.onclick = () => reagendarAgendamento(id);

  modal.classList.add("show");
}

fecharModalBtn.addEventListener("click", () => modal.classList.remove("show"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("show");
});

function cancelarAgendamento(id) {
  let agendamentos = carregarAgendamentos();
  agendamentos = agendamentos.filter((a) => a.id !== id);
  salvarAgendamentos(agendamentos);
  mostrarToast("Agendamento cancelado!", "erro");
  modal.classList.remove("show");
  renderizarAgendamentos();
}

function reagendarAgendamento(id) {
  const agendamentos = carregarAgendamentos();
  const agendamento = agendamentos.find((a) => a.id === id);

  if (!agendamento) return;

  const novaData = prompt("Informe a nova data (dd/mm/aaaa):");
  const novoHorario = prompt("Informe o novo horário (HH:MM):");

  if (novaData && novoHorario) {
    agendamento.data = novaData;
    agendamento.hora = novoHorario;
    salvarAgendamentos(agendamentos);
    mostrarToast("Agendamento reagendado!");
    modal.classList.remove("show");
    renderizarAgendamentos();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (carregarAgendamentos().length > 0) {
    verAgendamentosBtn.style.display = "inline-flex";
  }
});
