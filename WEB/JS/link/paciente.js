const PacientesAPI = (() => {
    const API_URL = 'http://localhost:3000/pacientes';

    async function criarPaciente(payload) {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const erro = await res.text();
            throw new Error(`Erro ao criar paciente: ${erro}`);
        }
        return await res.json();
    }

    async function listarPacientes() {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Erro ao buscar pacientes');
        return await res.json();
    }

    // O backend atual não possui rota /cpf/:cpf; fazemos um filtro local como fallback
    async function buscarPorCPF(cpf) {
        const lista = await listarPacientes();
        const alvo = String(cpf || '').replace(/\D+/g, '');
        return lista.find(p => String(p.cpf || '').replace(/\D+/g, '') === alvo) || null;
    }

    async function atualizarPaciente(id, dados) {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!res.ok) throw new Error('Erro ao atualizar paciente');
        return await res.json();
    }

    async function excluirPaciente(id) {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao excluir paciente');
        return true;
    }

    return { criarPaciente, listarPacientes, buscarPorCPF, atualizarPaciente, excluirPaciente };
})();
// Expor no escopo global do navegador
if (typeof window !== 'undefined') {
    window.PacientesAPI = PacientesAPI;
}
