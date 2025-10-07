// Cliente de API para Administradores
(() => {
    const BASE_URL = 'http://localhost:3000/administradores';

    async function req(path = '', options = {}) {
        const url = `${BASE_URL}${path}`;
        const resp = await fetch(url, options);
        if (!resp.ok) {
            let msg = 'Erro na requisição';
            try { msg = await resp.text(); } catch { }
            throw new Error(msg || `${resp.status} ${resp.statusText}`);
        }
        const ct = resp.headers.get('content-type') || '';
        return ct.includes('application/json') ? resp.json() : resp.text();
    }

    async function listarAdms() { return req('/'); }
    async function buscarPorId(id) { return req(`/${id}`); }
    async function criarAdm(data) {
        return req('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }
    async function atualizarAdm(id, data) {
        return req(`/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }
    async function deletarAdm(id) { return req(`/${id}`, { method: 'DELETE' }); }

    window.AdminsAPI = { listarAdms, buscarPorId, criarAdm, atualizarAdm, deletarAdm };
})();
