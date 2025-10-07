(() => {
    const tbody = document.getElementById('adm-table-body');
    const render = (list) => {
        if (!Array.isArray(list) || !list.length) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhum administrador encontrado.</td></tr>';
            return;
        }
        tbody.innerHTML = list.map(a => `
      <tr>
        <td>${a.nome || '—'}</td>
        <td>${a.email || '—'}</td>
        <td>${a.cargo || '—'}</td>
        <td>${a.criadoEm ? new Date(a.criadoEm).toLocaleString() : '—'}</td>
        <td class="actions">
          <button class="btn btn-secondary" data-open="${a._id}">Abrir</button>
          <button class="btn btn-secondary danger" data-del="${a._id}">Apagar</button>
        </td>
      </tr>
    `).join('');
    };

    const load = async () => {
        try {
            let list;
            if (window.AdminsAPI?.listarAdms) list = await AdminsAPI.listarAdms();
            else {
                const r = await fetch('http://localhost:3000/administradores');
                list = await r.json();
            }
            render(list);
        } catch (e) {
            console.error(e);
            tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar.</td></tr>';
        }
    };

    tbody?.addEventListener('click', async (e) => {
        const t = e.target;
        if (!(t instanceof HTMLElement)) return;
        const openId = t.getAttribute('data-open');
        const delId = t.getAttribute('data-del');
        if (openId) {
            try { localStorage.setItem('ultimo_adm_id', openId); } catch { }
            window.location.href = 'adm.html';
        } else if (delId) {
            if (!confirm('Apagar este administrador?')) return;
            try {
                if (window.AdminsAPI?.deletarAdm) await AdminsAPI.deletarAdm(delId);
                else await fetch(`http://localhost:3000/administradores/${delId}`, { method: 'DELETE' });
                await load();
            } catch (e) {
                console.error(e);
                alert('Erro ao apagar.');
            }
        }
    });

    document.addEventListener('DOMContentLoaded', load);
})();
