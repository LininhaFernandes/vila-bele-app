# 🔐 Vila Bele - Sistema de Autenticação JWT

## ✅ O que foi implementado

### Backend
- ✅ **Database Layer** (`src/lib/db.ts`) - Pool PostgreSQL via `pg`
- ✅ **Auth Module** (`src/lib/auth.ts`) - Funções de autenticação:
  - `hashPassword()` - Hash com bcryptjs (10 salt rounds)
  - `verifyPassword()` - Verificar senha
  - `createToken()` - JWT com 7 dias de expiração
  - `verifyToken()` - Validar token JWT
  - `loginUser()` - Autenticar usuário
  - `changePassword()` - Trocar própria senha
  - `resetUserPassword()` - Admin resetar senha
  - `requireProfile()` - Server Component helper
  - E mais...

### API Endpoints
```
POST   /api/auth/login                    - Fazer login
GET    /api/auth/profile                  - Buscar perfil (requer token)
POST   /api/auth/change-password          - Trocar própria senha
GET    /api/admin/users                   - Listar usuários (admin only)
POST   /api/admin/users                   - Criar usuário (admin only)
POST   /api/admin/users/:id/reset-password - Resetar senha (admin only)
```

### Frontend
- ✅ **Página de Login** (`src/app/login/`) - Email + Senha com JWT
- ✅ **Página de Perfil** (`src/app/(app)/perfil/`) - Alterar senha
- ✅ **Admin Panel** (`src/app/(app)/admin/usuarios/`) - Gerenciar usuários

### Middleware
- ✅ **Proteção de Rotas** (`middleware.ts`)
  - Rotas públicas: `/login`, `/`
  - Rotas protegidas: `/painel`, `/despesas`, `/reembolsos`, `/revisao`, `/admin/usuarios`, `/perfil`
  - Token via cookie: `request.cookies.get("token")`

## 🚀 Quick Start

### 1. Variáveis de Ambiente
```env
DATABASE_URL=postgresql://neondb_owner:npg_...@ep-...neon.tech/neondb?sslmode=require
JWT_SECRET=seu-super-secreto-key-change-this-em-producao
```

✅ Já configurado em `.env.local`

### 2. Setup do Banco de Dados
Veja `GUIA_NEON.txt` para instruções completas.

Resumido:
1. Acesse: https://console.neon.tech → SQL Editor
2. Cole o conteúdo de `setup-neon.sql`
3. Clique em Execute

### 3. Rodar Localmente
```bash
npm run dev
```

Acesse: http://localhost:3000/login

### 4. Login
- **Email:** admin@vila-bele.com
- **Senha:** senha123

## 📚 Fluxo de Autenticação

```
1. Usuário acessa /
   ↓
2. Middleware verifica token no cookie
   ↓
3. Sem token → Redireciona para /login
   ↓
4. Usuário preenche email + senha
   ↓
5. Submit POST /api/auth/login
   ↓
6. Backend busca usuário no DB
   ↓
7. Valida senha com bcrypt.compare()
   ↓
8. Se OK:
   - Gera JWT (7 dias)
   - Salva em cookie httpOnly
   - Salva em localStorage (client)
   ↓
9. Redireciona para /painel
   ↓
10. Middleware valida token
   ↓
11. Usuário acessa sistema completo
```

## 🔐 Segurança

- ✅ Senhas hasheadas com bcryptjs (10 salt rounds)
- ✅ JWT com 7 dias de expiração
- ✅ Token em cookie httpOnly (protegido de XSS)
- ✅ Validação de role (admin vs user)
- ✅ Senha atual obrigatória para trocar senha
- ✅ Validação mínima 6 caracteres
- ✅ NUNCA retorna senha em responses

## 📋 Endpoints Detalhados

### POST /api/auth/login
```json
Request:
{
  "email": "admin@vila-bele.com",
  "password": "senha123"
}

Response (200):
{
  "user": {
    "id": 1,
    "email": "admin@vila-bele.com",
    "full_name": "Administrador",
    "role": "admin",
    "created_at": "2026-01-10T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

Error (401):
{
  "error": "Email ou senha incorretos"
}
```

### GET /api/auth/profile
```
Headers:
Authorization: Bearer <token>

Response (200):
{
  "id": 1,
  "email": "admin@vila-bele.com",
  "full_name": "Administrador",
  "role": "admin",
  "created_at": "2026-01-10T..."
}
```

### POST /api/auth/change-password
```json
Request:
{
  "currentPassword": "senha123",
  "newPassword": "novaSenha456"
}

Response (200):
{
  "message": "Senha alterada com sucesso"
}

Error (401):
{
  "error": "Senha atual incorreta"
}
```

### GET /api/admin/users
```
Headers:
Authorization: Bearer <token>

Response (200): [
  {
    "id": 1,
    "email": "admin@vila-bele.com",
    "full_name": "Administrador",
    "role": "admin",
    "created_at": "2026-01-10T..."
  },
  ...
]

Error (403): {"error": "Acesso negado"}
```

### POST /api/admin/users
```json
Request:
{
  "email": "joao@example.com",
  "password": "senha456",
  "full_name": "João Silva",
  "role": "user"
}

Response (200):
{
  "id": 2,
  "email": "joao@example.com",
  "full_name": "João Silva",
  "role": "user",
  "created_at": "2026-01-10T..."
}

Error (409):
{
  "error": "Email já existe"
}
```

### POST /api/admin/users/:id/reset-password
```json
Request:
{
  "newPassword": "senhaReseta789"
}

Response (200):
{
  "message": "Senha resetada com sucesso"
}

Error (404):
{
  "error": "Usuário não encontrado"
}
```

## 🎯 Funcionalidades

### Usuário Comum
- ✅ Fazer login
- ✅ Ver perfil
- ✅ Trocar própria senha
- ✅ Acessar painel e despesas
- ✅ Ver dados compartilhados

### Admin
- ✅ Tudo que usuário comum faz
- ✅ Criar novos usuários
- ✅ Resetar senha de qualquer usuário
- ✅ Gerenciar roles

## 🗄️ Banco de Dados

### Tabela: users
```sql
id (PK)        - SERIAL
email          - VARCHAR(255) UNIQUE NOT NULL
password       - VARCHAR(255) NOT NULL (hash bcrypt)
full_name      - VARCHAR(255) NOT NULL
role           - VARCHAR(50) DEFAULT 'user' (admin | user)
created_at     - TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## 🚫 O que NÃO foi mexido

Conforme PROMPT 2, mantendo 100% das funcionalidades:
- ✅ Sistema de despesas (`/despesas`)
- ✅ Reembolsos (`/reembolsos`)
- ✅ Revisão (`/revisao`)
- ✅ Dashboard (`/painel`)
- ✅ Integração Google Drive
- ✅ IA/Classificação automática
- ✅ Tabelas Supabase existentes (sem `user_id`)
- ✅ **TODOS OS USUÁRIOS VEEM TODOS OS DADOS**

## 📦 Dependências Adicionadas

```json
{
  "bcryptjs": "^3.0.3",
  "jsonwebtoken": "^9.0.3",
  "pg": "^8.22.0"
}
```

DevDependencies:
```json
{
  "@types/jsonwebtoken": "^9.0.10",
  "@types/pg": "^8.20.0"
}
```

## ✨ Próximos Passos

1. ✅ Setup banco de dados (veja `GUIA_NEON.txt`)
2. ✅ Fazer login
3. ✅ Trocar senha em `/perfil`
4. ✅ Criar usuários em `/admin/usuarios`
5. ✅ Deploy em Vercel
   - Adicionar variáveis: `DATABASE_URL`, `JWT_SECRET`
   - Push para GitHub
   - Deploy automático

## 🐛 Troubleshooting

### "Email ou senha incorretos" após setup
- Verifique se o usuário admin foi criado no Neon
- Execute: `SELECT * FROM users;` no Neon SQL Editor

### Token inválido / Redirecionado para login
- Limpe localStorage: `localStorage.clear()`
- Faça login novamente

### Erro ao criar usuário no admin
- Confirme que você é admin (role = 'admin')
- Verifique se email já existe

---

**Implementado com ❤️ por Claude Code**

Para dúvidas, veja `GUIA_NEON.txt` ou `SETUP_NEON.md`
