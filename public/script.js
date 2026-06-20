async function loadDenuncias() {
  const lista = document.getElementById('lista');
  lista.innerHTML = '<div class="hint">Carregando...</div>';

  try {
    const res = await fetch('/api/denuncias');
    const denuncias = await res.json();

    if (!Array.isArray(denuncias) || denuncias.length === 0) {
      lista.innerHTML = '<div class="hint">Ainda não há denúncias cadastradas.</div>';
      return;
    }

    const slice = denuncias.slice(0, 20);

    lista.innerHTML = slice.map(d => {
      const tipo = escapeHtml(d.tipo || '');
      const id = d.id ?? '';
      const createdAt = formatDate(d.createdAt);
      const empresa = d.empresa ? escapeHtml(d.empresa) : '';
      const local = d.local ? escapeHtml(d.local) : '';
      const vitima = d.vitima ? escapeHtml(d.vitima) : '';
      const nome = d.nome ? escapeHtml(d.nome) : '';
      const contato = d.contato ? escapeHtml(d.contato) : '';
      const desc = escapeHtml(d.descricao || '');
      const detalhes = d.detalhes ? escapeHtml(d.detalhes) : '';

      const extra = [
        empresa ? `Empresa: ${empresa}` : null,
        local ? `Local: ${local}` : null,
        vitima ? `Parte/Vítima: ${vitima}` : null,
        nome ? `Identificação: ${nome}` : null,
        contato ? `Contato: ${contato}` : null
      ].filter(Boolean).join('<br>');

      return `
        <div class="item">
          <div class="top">
            <div class="badge">${tipo || 'Denúncia'}</div>
            <div class="meta">#${id} • ${createdAt}</div>
          </div>
          ${extra ? `<div class="meta" style="margin-top:8px">${extra}</div>` : ''}
          <div class="desc">${desc}</div>
          ${detalhes ? `<div class="desc" style="opacity:.92; margin-top:10px">${detalhes}</div>` : ''}
        </div>
      `;
    }).join('');
  } catch {
    lista.innerHTML = '<div class="hint">Erro ao carregar denúncias.</div>';
  }
}

function setMessage(el, text, kind) {
  el.textContent = text;
  el.classList.remove('success', 'error');
  if (kind) el.classList.add(kind);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '<')
    .replaceAll('>', '>')
    .replaceAll('"', '"')
    .replaceAll("'", '&#039;');
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso || '';
    return d.toLocaleString('pt-BR');
  } catch {
    return iso || '';
  }
}

const form = document.getElementById('form');
const mensagem = document.getElementById('mensagem');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setMessage(mensagem, 'Enviando denúncia...', null);

  const payload = {
    tipo: document.getElementById('tipo').value,
    empresa: document.getElementById('empresa').value,
    local: document.getElementById('local').value,
    vitima: document.getElementById('vitima').value,
    nome: document.getElementById('nome').value,
    contato: document.getElementById('contato').value,
    descricao: document.getElementById('descricao').value,
    detalhes: document.getElementById('detalhes').value
  };

  try {
    const res = await fetch('/api/denuncias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(mensagem, data?.error || 'Falha ao enviar denúncia.', 'error');
      return;
    }

    setMessage(mensagem, `${data.message} ID: ${data.id}`, 'success');
    form.reset();
    await loadDenuncias();
  } catch {
    setMessage(mensagem, 'Erro de rede ao enviar denúncia.', 'error');
  }
});

loadDenuncias();

