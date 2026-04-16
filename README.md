# GIFT Almox — Vercel + Supabase

Projeto refatorado para remover completamente o Base44 e operar com frontend Vite + backend serverless em `/api` compatível com Vercel.

## Principais mudanças

- Remoção total de dependências, imports e fluxo de autenticação do Base44.
- Backend migrado para funções serverless em `/api`.
- Integração com Supabase via `@supabase/supabase-js`.
- Painel administrativo em `/admin` com login por senha, sessão via JWT em cookie e senha com hash bcrypt.
- Configurações dinâmicas do sistema aplicadas no frontend: nome, logo e cores.
- CRUD do almoxarifado migrado para endpoints próprios:
  - `POST /api/login`
  - `GET /api/settings`
  - `POST /api/settings`
  - `PUT /api/settings/password`
  - `GET/POST /api/products`
  - `PUT/DELETE /api/products/:id`
  - `GET/POST /api/entries`
  - `GET/POST /api/exits`
  - `GET/POST /api/movements`
  - `GET/POST /api/inventory-checks`
  - `PUT /api/inventory-checks/:id`

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `DEFAULT_ADMIN_PASSWORD`

> O projeto funciona melhor com `SUPABASE_SERVICE_ROLE_KEY` no backend para manter operações administrativas e hashes fora do alcance público.

## Banco de dados

1. Abra o Supabase.
2. Vá em SQL Editor.
3. Execute o arquivo `supabase/schema.sql`.

A tabela `settings` será usada pelo backend. Se não existir registro inicial, a API cria automaticamente com a senha definida em `DEFAULT_ADMIN_PASSWORD`.

## Rodando localmente

```bash
npm install
npm run dev
```

## Deploy na Vercel

1. Suba este projeto para GitHub.
2. Importe o repositório na Vercel.
3. Em **Project Settings > Environment Variables**, cadastre:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `DEFAULT_ADMIN_PASSWORD`
4. Faça o deploy.

## Acesso ao admin

- URL: `/admin`
- Use a senha definida em `DEFAULT_ADMIN_PASSWORD` na primeira execução.
- Depois do login, altere imediatamente a senha no painel.

## Observações de segurança

- A senha administrativa é armazenada como hash bcrypt.
- A sessão admin usa JWT assinado no backend e cookie `httpOnly`.
- O frontend consome apenas a API; credenciais do Supabase não ficam hardcoded no código.
- Para produção, use `SUPABASE_SERVICE_ROLE_KEY` no backend e não exponha esse valor ao cliente.
