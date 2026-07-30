# 🚀 Setup do Banco de Dados no Neon

## Passo 1: Acessar o Dashboard do Neon

1. Acesse [https://console.neon.tech](https://console.neon.tech)
2. Faça login com sua conta
3. Selecione o projeto (provavelmente "neondb")
4. Clique em **"SQL Editor"** no menu esquerdo

## Passo 2: Executar o SQL

1. No SQL Editor, copie e cole o SQL abaixo:

```sql
-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuário admin (senha: senha123)
INSERT INTO users (email, password, full_name, role) 
VALUES (
  'admin@vila-bele.com', 
  '$2b$10$.8Rgnd2SqGD2PKYBsj9DC.aoFfbboJEe7poFj3bfLcw/84/PMNsYu',
  'Administrador', 
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Verificar se foi criado
SELECT id, email, full_name, role, created_at FROM users;
```

2. Clique no botão **"Execute"** (ou Ctrl+Enter)

## Passo 3: Confirmar

Você deve ver uma resposta como:
```
id | email                 | full_name      | role  | created_at
1  | admin@vila-bele.com   | Administrador  | admin | 2026-01-10 15:30:00
```

## Passo 4: Testar o Login

Agora volte para o projeto e teste:

1. Acesse: http://localhost:3000/login
2. Email: `admin@vila-bele.com`
3. Senha: `senha123`
4. Clique em **"Entrar"**

Você deve ser redirecionado para `/painel` 🎉

## Criar Mais Usuários

Se quiser criar outros usuários via painel admin:

1. Faça login como admin
2. Vá para `/admin/usuarios`
3. Preencha o formulário e clique em "Criar Usuário"

## Dados do Usuário Admin

| Campo | Valor |
|-------|-------|
| **Email** | admin@vila-bele.com |
| **Senha** | senha123 |
| **Nome** | Administrador |
| **Role** | admin |
| **Hash** | $2b$10$.8Rgnd2SqGD2PKYBsj9DC.aoFfbboJEe7poFj3bfLcw/84/PMNsYu |

---

### ⚠️ Importante

- ⚠️ **Nunca compartilhe o hash** (ele serve para verificar a senha)
- ⚠️ **MUDE A SENHA DEPOIS** de fazer o primeiro login
- ⚠️ O `DATABASE_URL` no `.env.local` já está configurado corretamente

---

## Troubleshooting

### "UNIQUE constraint failed: users.email"
- O usuário admin já existe
- Execute apenas o `SELECT` para verificar
- Para recriar: DELETE FROM users WHERE email = 'admin@vila-bele.com'; então execute o INSERT

### "Failed to connect to database"
- Verifique se o `DATABASE_URL` em `.env.local` está correto
- Teste a conexão no Neon dashboard

### Esquecer a senha?
- No Neon SQL Editor, execute:
```sql
UPDATE users 
SET password = '$2b$10$.8Rgnd2SqGD2PKYBsj9DC.aoFfbboJEe7poFj3bfLcw/84/PMNsYu'
WHERE email = 'admin@vila-bele.com';
```
- Depois faça login com: `admin@vila-bele.com` / `senha123`
