const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50kb' }));
app.use(express.static('public'));


// ========== CONFIGURAÇÃO DO BANCO DE DADOS (JSON) ==========
const dbDir = path.join(__dirname, 'database');
const dbFile = path.join(dbDir, 'denuncias.json');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

function initializeDatabase() {
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, JSON.stringify([], null, 2));
    console.log('✅ Banco de dados (denuncias.json) criado!');
  } else {
    console.log('✅ Banco de dados (denuncias.json) encontrado!');
  }
}

function readDenuncias() {
  try {
    const data = fs.readFileSync(dbFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveDenuncias(denuncias) {
  fs.writeFileSync(dbFile, JSON.stringify(denuncias, null, 2));
}

initializeDatabase();

// ========== ROTAS DA API ==========

// GET - listar denúncias (mais recentes primeiro)
app.get('/api/denuncias', (req, res) => {
  try {
    const denuncias = readDenuncias();
    const sorted = [...denuncias].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sorted);
  } catch (err) {
    console.error('Erro ao buscar denúncias:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST - cadastrar denúncia
app.post('/api/denuncias', (req, res) => {
  try {
    const {
      tipo,
      nome,
      contato,
      descricao,
      detalhes,
      local,

    } = req.body || {};

    if (!tipo || typeof tipo !== 'string' || tipo.trim() === '') {

      return res.status(400).json({ error: 'Tipo da denúncia é obrigatório.' });
    }

    const descricaoStr = typeof descricao === 'string' ? descricao.trim() : '';
    if (descricaoStr.length < 10) {
      return res.status(400).json({ error: 'A descrição deve ter pelo menos 10 caracteres.' });
    }

    const nomeStr = (nome && typeof nome === 'string') ? nome.trim() : '';
    const contatoStr = (contato && typeof contato === 'string') ? contato.trim() : '';

    const denuncias = readDenuncias();

    const newDenuncia = {
      id: denuncias.length > 0 ? Math.max(...denuncias.map(d => d.id || 0)) + 1 : 1,
      tipo: tipo.trim(),
      nome: nomeStr,
      contato: contatoStr,
      empresa: typeof empresa === 'string' ? empresa.trim() : '',
      local: typeof local === 'string' ? local.trim() : '',
      vitima: typeof vitima === 'string' ? vitima.trim() : '',
      descricao: descricaoStr,
      detalhes: typeof detalhes === 'string' ? detalhes.trim() : '',
      createdAt: new Date().toISOString()
    };


    denuncias.push(newDenuncia);
    saveDenuncias(denuncias);

    res.status(201).json({
      message: 'Denúncia cadastrada com sucesso!',
      id: newDenuncia.id
    });
  } catch (err) {
    console.error('Erro ao cadastrar denúncia:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log('📝 Abra seu navegador e acesse!');
});


