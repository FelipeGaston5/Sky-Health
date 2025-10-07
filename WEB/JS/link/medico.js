const MedicosAPI = (() => {
    const API_URL = 'http://localhost:3000/medicos/medicos';

    async function criarMedico(payload) {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const erro = await res.text();
            throw new Error(`Erro ao criar médico: ${erro}`);
        }
        return await res.json();
    }

    async function listarMedicos() {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Erro ao buscar médicos');
        return await res.json();
    }

    async function atualizarMedico(id, dados) {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!res.ok) throw new Error('Erro ao atualizar médico');
        return await res.json();
    }

    async function excluirMedico(id) {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao excluir médico');
        return true;
    }

    return { criarMedico, listarMedicos, atualizarMedico, excluirMedico };
})();

if (typeof window !== 'undefined') window.MedicosAPI = MedicosAPI;
