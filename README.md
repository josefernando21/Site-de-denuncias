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

## Observação importante sobre “enviar para outras pessoas”
Para outras pessoas verem e salvarem denúncias, você precisa hospedar o projeto em um servidor (deploy) que mantenha o backend rodando.

Persistência em arquivo (`denuncias.json`) funciona bem em hospedagens que mantêm armazenamento do projeto.

