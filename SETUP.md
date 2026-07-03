# Vila Bele — Guia de configuração (Fase 1)

Este guia parte do princípio de que você não tem experiência técnica. Siga na ordem.
Sempre que aparecer `xxxxx`, é algo que você precisa copiar/colar do seu próprio painel.

## 1. Criar o projeto no Supabase (banco de dados + login)

1. Acesse **supabase.com** e crie uma conta gratuita (pode entrar com Google).
2. Clique em **New Project**.
   - Nome: `vila-bele` (o que preferir)
   - Senha do banco: gere uma forte e **guarde em um lugar seguro** (não vamos precisar dela no dia a dia, mas é bom ter).
   - Região: escolha a mais próxima do Brasil (ex: São Paulo, se disponível, ou `sa-east-1`).
3. Aguarde uns 2 minutos até o projeto ficar pronto.
4. No menu lateral, vá em **Project Settings > API**. Você vai ver 3 valores que precisamos:
   - `Project URL`
   - `anon public` key
   - `service_role` key (clique em "Reveal" para mostrar — **essa é secreta, nunca compartilhe**)

## 2. Criar as tabelas do banco de dados

1. No menu lateral do Supabase, vá em **SQL Editor**.
2. Abra, na ordem, cada um destes arquivos do projeto (pasta `supabase/migrations`) e cole o conteúdo no editor, clicando em **Run** depois de cada um:
   1. `0001_init.sql`
   2. `0002_rls.sql`
   3. `0003_seed_categories.sql`
3. Se algum der erro, pare e me avise antes de continuar — não rode os próximos.

## 3. Configurar o link de acesso (login sem senha)

1. No Supabase, vá em **Authentication > URL Configuration**.
2. Em **Site URL**, coloque por enquanto `http://localhost:3000` (depois trocamos pelo endereço real quando publicarmos).
3. Em **Redirect URLs**, adicione:
   - `http://localhost:3000/auth/callback`
   - (depois de publicar na Vercel, adicionamos a versão `https://` também)

## 4. Configurar as variáveis de ambiente no computador

1. Na pasta do projeto (`Documents\vila-bele-app`), edite o arquivo `.env.local` (se não existir, copie `.env.example` e renomeie para `.env.local`).
2. Preencha:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<Project URL do passo 1>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key do passo 1>
   SUPABASE_SERVICE_ROLE_KEY=<service_role key do passo 1>
   ```
3. Salve o arquivo.

## 5. Rodar o site no seu computador

Abra um terminal na pasta do projeto e rode:

```
npm run dev
```

Depois acesse **http://localhost:3000** no navegador.

## 6. Criar sua própria conta de administradora (só uma vez)

Como ainda não existe ninguém no sistema, você precisa se cadastrar manualmente uma única vez:

1. Na página de login (`http://localhost:3000/login`), digite o **seu e-mail** e clique em "Enviar link de acesso". Não clique no link ainda.
2. Volte ao Supabase, em **SQL Editor**, e rode (troque pelo seu e-mail real):
   ```sql
   insert into public.profiles (id, full_name, role)
   select id, 'Aline', 'admin' from auth.users where email = 'seu-email@aqui.com';
   ```
3. Agora sim, abra o e-mail que você recebeu e clique no link de acesso. Você deve cair no painel como administradora.
4. A partir daí, use a tela **Usuários** dentro do sistema para convidar João, Carol e Rodrigo — não precisa mais mexer no Supabase para isso.

## 7. Publicar o site na internet (Vercel)

1. Crie uma conta gratuita em **vercel.com** (pode entrar com GitHub).
2. Se ainda não tiver, crie uma conta no **github.com** e crie um repositório novo (ex: `vila-bele-app`).
3. No terminal, dentro da pasta do projeto:
   ```
   git remote add origin https://github.com/SEU-USUARIO/vila-bele-app.git
   git add .
   git commit -m "Primeira versão do sistema Vila Bele"
   git branch -M main
   git push -u origin main
   ```
4. Na Vercel, clique em **New Project**, escolha o repositório `vila-bele-app` e importe.
5. Antes de clicar em "Deploy", adicione as mesmas variáveis de ambiente do passo 4 (as 3 do Supabase) em **Environment Variables**.
6. Clique em **Deploy**. Em ~1 minuto você recebe um endereço tipo `https://vila-bele-app.vercel.app`.
7. Volte ao Supabase (**Authentication > URL Configuration**) e adicione:
   - Site URL: `https://vila-bele-app.vercel.app`
   - Redirect URL: `https://vila-bele-app.vercel.app/auth/callback`

Pronto — o sistema está no ar. João, Carol e Rodrigo já podem receber convites pela tela de Usuários.

## O que ainda falta (próximas fases)

- **Fase 4**: leitura automática dos cupons/notas salvos na pasta do Google Drive, usando IA (precisa de uma chave da Anthropic e autorização da sua conta Google).
- **Fase 5**: exportação em PDF pronta para o contador (hoje já dá para exportar em CSV/Excel pela tela de Despesas).

Quando quiser seguir para a Fase 4, me avise que eu já sei o que precisamos configurar.
