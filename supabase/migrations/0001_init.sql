-- Vila Bele - Gestão de Despesas
-- 0001_init.sql: tabelas principais

create extension if not exists "pgcrypto";

-- ============================================
-- profiles: uma linha por usuário do sistema (espelha auth.users)
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin', 'viewer_approver', 'contributor')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Usuários do sistema. role: admin (controle total), viewer_approver (João/Carol - visão fácil + aprova reembolsos), contributor (Rodrigo - visão fácil + cadastra próprias despesas).';

-- ============================================
-- categories: tipos de despesa (editável pelo admin)
-- ============================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text not null default 'Wrench',
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================
-- reimbursement_batches: lotes de reembolso acumulado
-- ============================================
create table public.reimbursement_batches (
  id uuid primary key default gen_random_uuid(),
  paid_at date not null,
  total_amount numeric(12,2) not null check (total_amount >= 0),
  paid_by uuid not null references public.profiles(id),
  notes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

comment on table public.reimbursement_batches is 'Agrupa várias despesas "aguardando reembolso" pagas de uma vez por João ou Carol.';

-- ============================================
-- expenses: lançamentos de despesa
-- ============================================
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null,
  description text not null,
  establishment text,
  category_id uuid references public.categories(id),
  amount numeric(12,2) not null check (amount >= 0),
  paid_by uuid not null references public.profiles(id),
  reimbursement_status text not null default 'not_applicable'
    check (reimbursement_status in ('not_applicable', 'pending', 'reimbursed')),
  reimbursed_by uuid references public.profiles(id),
  reimbursement_batch_id uuid references public.reimbursement_batches(id),
  reimbursed_at date,
  receipt_url text,
  receipt_type text not null default 'none' check (receipt_type in ('cupom_fiscal', 'nota_fiscal', 'none')),
  source text not null default 'manual' check (source in ('pasta_notinhas', 'manual', 'email_futuro')),
  status text not null default 'confirmed' check (status in ('draft', 'confirmed')),
  ai_suggested jsonb,
  notes text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.expenses.status is 'draft = rascunho criado pela IA a partir da pasta de notinhas, aguardando revisão. confirmed = lançamento válido.';
comment on column public.expenses.source is 'De onde veio o lançamento: pasta_notinhas (Fase 4), manual, ou email_futuro (extensão futura).';

create index expenses_date_idx on public.expenses (expense_date desc);
create index expenses_category_idx on public.expenses (category_id);
create index expenses_paid_by_idx on public.expenses (paid_by);
create index expenses_reimbursement_status_idx on public.expenses (reimbursement_status);
create index expenses_batch_idx on public.expenses (reimbursement_batch_id);

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();
