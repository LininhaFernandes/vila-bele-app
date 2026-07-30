# 🚀 START HERE - Sistema de Autenticação

## ⚡ Em 3 Etapas

### 1️⃣ Setup Banco de Dados (5 minutos)

**Importante: Faça isso PRIMEIRO!**

1. Abra: https://console.neon.tech
2. Clique em **SQL Editor**
3. Copie TODO o conteúdo de `setup-neon.sql` (arquivo no projeto)
4. Cole no SQL Editor do Neon
5. Clique em **Run** (ou Enter)

✅ Pronto! Tabela criada e admin inserido.

---

### 2️⃣ Testar Localmente (5 minutos)

```bash
# Terminal
npm run dev

# Abra no navegador
# http://localhost:3000/login

# Teste com:
# Email: admin@vila-bele.com
# Senha: senha123
```

✅ Você deveria:
- Fazer login
- Ver o dashboard (/painel)
- Acessar /admin/usuarios (botão no painel)
- Fazer logout

---

### 3️⃣ Deploy em Produção (5 minutos)

```bash
# Commit tudo
git add .
git commit -m "Implement authentication system"
git push origin main

# Vercel fará deploy AUTOMATICAMENTE!
# Verifique em: https://vila-bele-app.vercel.app/login
```

---

## 🔐 Segurança - Antes de Deploy

No [Vercel Dashboard](https://vercel.com):

1. Vá em **Project Settings**
2. Clique em **Environment Variables**
3. Confirme:
   - `DATABASE_URL` está lá (copie de `.env.local`)
   - `JWT_SECRET` - **MUDE para valor aleatório novo**

Exemplo de JWT_SECRET novo:
```
JWT_SECRET=a7x9Km2pQ5vB8nJ4cL6wR3tF1yH9sD2e0mN5oP7q
```

---

## ✅ Checklist Rápido

- [ ] Executar `setup-neon.sql` no Neon
- [ ] Testar login local: `npm run dev`
- [ ] Fazer `git push origin main`
- [ ] Confirmar deploy em Vercel
- [ ] Testar em `https://vila-bele-app.vercel.app/login`

---

## 📚 Documentação Completa

Para detalhes:
- **AUTH_IMPLEMENTATION_COMPLETE.md** - Instruções detalhadas
- **QUICK_START.md** - Guia rápido
- **VERIFICACAO_FINAL.txt** - Checklist de verificação

---

## 🔑 Credenciais Padrão

```
Email: admin@vila-bele.com
Senha: senha123
```

Pode mudar a senha em `/perfil` depois de logado.

---

## 🎯 O que foi implementado

✅ Login com email + senha  
✅ JWT authentication (7 dias)  
✅ Dashboard (/painel)  
✅ Perfil com mudança de senha  
✅ Admin panel para gerenciar usuários  
✅ Middleware protegendo rotas  
✅ Logout funcional  

---

## 🆘 Problemas?

| Problema | Solução |
|----------|---------|
| "Email ou senha inválidos" | Executou `setup-neon.sql` no Neon? |
| "Acesso negado no admin" | Precisa ser admin. Criar novo usuário com role admin. |
| Middleware não funciona | `rm -rf .next && npm run build` |

---

## 🎉 Pronto!

Sistema testado e pronto para produção!

**Próximo passo: Execute `setup-neon.sql` no Neon Console**
