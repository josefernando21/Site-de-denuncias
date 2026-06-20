# Site de Denúncias (denuncias-site)

Site para cadastrar denúncias de empresas (assédio, difamação, racismo ou outros), salvando os dados no servidor em `database/denuncias.json`.

## Estrutura
- `server.js` - backend Express + API
- `public/` - frontend (HTML/CSS/JS)
- `database/denuncias.json` - persistência simples (arquivo)

## Rodar local
1) Instalar dependências:

```bash
npm install
```

2) Iniciar servidor:

```bash
npm start
```

3) Abrir no navegador:

- http://localhost:3000

## Rotas da API
- `GET /api/denuncias` - lista denúncias
- `POST /api/denuncias` - cadastra denúncia

Payload (exemplo):
```json
{
  "tipo": "Assédio",
  "nome": "Maria",
  "contato": "maria@email.com",
  "descricao": "..."
}
```

## Deploy no Render (para enviar para outras pessoas)

### 1) Enviar o repositório
Faça push do projeto para um repositório Git (GitHub/GitLab).

### 2) Criar Web Service no Render
- Framework/Runtime: **Node**
- Build Command: (padrão) `npm install`
- Start Command: `npm start`
- Instance/Port: o Render define a porta automaticamente via variável de ambiente **`PORT`** (seu `server.js` já usa `process.env.PORT`).

### 3) Como testar
- Abra a URL do serviço renderizada no browser (carrega o front em `public/`).
- Use o formulário para enviar uma denúncia.
- A API grava em `database/denuncias.json` dentro do ambiente do container.

### Observação sobre persistência
Este projeto salva em arquivo (`database/denuncias.json`). Em alguns planos/reescalonamentos do Render, o filesystem pode ser recriado; nesse caso o arquivo pode voltar ao estado inicial. Para persistência “garantida” entre deploys/instâncias, seria necessário migrar para banco externo (ex: Postgres).

