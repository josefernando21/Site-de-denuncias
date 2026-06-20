const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');


const app = express();

console.log('📍 Diretório de trabalho (__dirname):', __dirname);
console.log('📍 Diretório do processo (process.cwd()):', process.cwd());

// Tentar encontrar a pasta public em múltiplos caminhos
let publicPath = path.join(__dirname, 'public');
if (!fs.existsSync(publicPath)) {
  console.warn('⚠️  Pasta public não encontrada em:', publicPath);
  // Tentar um nível acima
  publicPath = path.join(__dirname, '..', 'public');
  if (fs.existsSync(publicPath)) {
    console.log('✅ Encontrada pasta public em:', publicPath);
  } else {
    console.warn('⚠️  Pasta public também não encontrada em:', publicPath);
    publicPath = path.join(__dirname, 'public');
  }
}

console.log('📂 Usando pasta public:', publicPath);

app.use(cors());
app.use(express.json({ limit: '50kb' }));
app.use(express.static(publicPath));

// Garantir que GET / sempre entregue o frontend (evita problemas no deploy)
app.get('/', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  console.log('📄 Servindo index.html de:', indexPath);
  console.log('📄 Arquivo existe?', fs.existsSync(indexPath));
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error('❌ Arquivo não encontrado:', indexPath);
    res.status(404).send('<h1>index.html não encontrado</h1><p>Procurando em: ' + indexPath + '</p>');
  }
});



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
      empresa,
      vitima
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

// Fallback para SPA - qualquer rota não-API retorna index.html
app.use((req, res) => {
  if (!req.path.startsWith('/api/')) {
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    return res.status(404).send('<h1>index.html não encontrado</h1><p>Procurando em: ' + indexPath + '</p>');
  }
  res.status(404).json({ error: 'Rota não encontrada' });
});

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log('📝 Abra seu navegador e acesse!');
  
  // Listar arquivos para debug
  console.log('\n📋 Arquivos em', publicPath + ':');
  try {
    const files = fs.readdirSync(publicPath);
    files.forEach(f => console.log('  -', f));
  } catch (err) {
    console.error('  Erro ao listar arquivos:', err.message);
  }
});


