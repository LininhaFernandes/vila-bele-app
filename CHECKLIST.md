# ✅ Checklist - Setup Rápido em 5 Minutos

## Passo 1: Abrir Neon (30 segundos)
- [ ] Acesse https://console.neon.tech
- [ ] Faça login
- [ ] Selecione projeto "neondb"
- [ ] Clique em "SQL Editor" (menu esquerdo)

## Passo 2: Copiar SQL (1 minuto)
- [ ] Abra arquivo: `setup-neon.sql` (no projeto)
- [ ] Copie TODO o conteúdo (Ctrl+A → Ctrl+C)
- [ ] Cole no Neon SQL Editor
- [ ] Clique em "Execute" ou Ctrl+Enter

```sql
-- Você deve colar isto:
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (email, password, full_name, role)
VALUES (
  'admin@vila-bele.com',
  '$2b$10$.8Rgnd2SqGD2PKYBsj9DC.aoFfbboJEe7poFj3bfLcw/84/PMNsYu',
  'Administrador',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

SELECT * FROM users;
```

## Passo 3: Verificar Execução (30 segundos)
- [ ] Você vê a mensagem: "✓ Query executed successfully"
- [ ] Você vê a tabela com 1 linha (admin@vila-bele.com)

Se vir erro "UNIQUE constraint failed" = OK! Usuário já existe.

## Passo 4: Rodar Servidor (1 minuto)
No terminal/PowerShell do projeto:
```bash
npm run dev
```

- [ ] Aguarde: "✓ Ready in X.Xs"
- [ ] Servidor deve estar em http://localhost:3000

## Passo 5: Fazer Login (2 minutos)

1. Abra: http://localhost:3000/login
2. Preencha:
   - Email: `admin@vila-bele.com`
   - Senha: `senha123`
3. Clique em "Entrar"
4. Aguarde redirecionamento para `/painel`

### ✓ Se funcionou:
- [ ] Você está em http://localhost:3000/painel
- [ ] Pode ver o dashboard
- [ ] Autenticação está 100% funcional! 🎉

### ✗ Se não funcionou:
- [ ] Confira o console do navegador (F12)
- [ ] Confira os logs do servidor (terminal)
- [ ] Veja "TROUBLESHOOTING" em `GUIA_NEON.txt`

---

## Próximos Passos (Opcional)

### Explorar Admin Panel
1. Clique no menu (canto superior)
2. Selecione "Admin" → "Usuários"
3. Crie um novo usuário de teste
4. Teste resetar senha

### Testar Perfil
1. Clique no menu (canto superior)
2. Selecione "Perfil"
3. Veja seus dados
4. Teste alterar senha

### Testar Logout
1. Clique no menu
2. Clique em "Sair"
3. Você é redirecionado para /login

---

## 🔑 Dados do Admin

| Campo | Valor |
|-------|-------|
| Email | admin@vila-bele.com |
| Senha | senha123 |

⚠️ **MUDE A SENHA DEPOIS de fazer login pela primeira vez!**

---

## 📞 Problemas?

### Se travar no login:
1. Abra DevTools (F12)
2. Vá para Console
3. Procure por erros vermelhos
4. Copie o erro

### Se vir 404/500:
1. Parar servidor (Ctrl+C)
2. Executar: `npm run build`
3. Procurar erros TypeScript
4. Rodar: `npm run dev` novamente

### Se erro de banco:
1. Confirme DATABASE_URL em `.env.local`
2. Volte ao Neon
3. Verifique se `users` table existe:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'users';
   ```

---

## ⏱️ Estimativa Total

- Setup SQL: 1 minuto
- Servidor rodar: 1 minuto  
- Login e teste: 2 minutos
- **Total: ~4-5 minutos** ⚡

---

✅ **Pronto para começar?** Siga os 5 passos acima!

Dúvidas? Veja:
- `GUIA_NEON.txt` - Guia visual completo
- `SETUP_NEON.md` - Instruções detalhadas
- `AUTH_SETUP.md` - Documentação técnica
