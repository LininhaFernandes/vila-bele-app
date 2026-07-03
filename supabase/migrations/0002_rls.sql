-- Vila Bele - Gestão de Despesas
-- 0002_rls.sql: Row Level Security

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.expenses enable row level security;
alter table public.reimbursement_batches enable row level security;

-- helper: papel do usuário logado
create or replace function public.current_role_name()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ============================================
-- profiles
-- ============================================
create policy "profiles: qualquer autenticado pode ver"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles: admin gerencia tudo"
  on public.profiles for all
  to authenticated
  using (public.current_role_name() = 'admin')
  with check (public.current_role_name() = 'admin');

-- ============================================
-- categories
-- ============================================
create policy "categories: qualquer autenticado pode ver"
  on public.categories for select
  to authenticated
  using (true);

create policy "categories: admin gerencia tudo"
  on public.categories for all
  to authenticated
  using (public.current_role_name() = 'admin')
  with check (public.current_role_name() = 'admin');

-- ============================================
-- expenses
-- ============================================
create policy "expenses: qualquer autenticado pode ver"
  on public.expenses for select
  to authenticated
  using (true);

create policy "expenses: admin e contributor podem criar"
  on public.expenses for insert
  to authenticated
  with check (
    public.current_role_name() in ('admin', 'contributor')
    and created_by = auth.uid()
  );

create policy "expenses: admin edita tudo, contributor edita o que criou, viewer_approver atualiza reembolso"
  on public.expenses for update
  to authenticated
  using (
    public.current_role_name() = 'admin'
    or (public.current_role_name() = 'contributor' and created_by = auth.uid())
    or public.current_role_name() = 'viewer_approver'
  )
  with check (
    public.current_role_name() = 'admin'
    or (public.current_role_name() = 'contributor' and created_by = auth.uid())
    or public.current_role_name() = 'viewer_approver'
  );

create policy "expenses: só admin apaga"
  on public.expenses for delete
  to authenticated
  using (public.current_role_name() = 'admin');

-- viewer_approver só pode alterar campos de reembolso (não descrição, valor, categoria etc.)
create or replace function public.enforce_expense_update_permissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_role_name() = 'viewer_approver' then
    if new.description is distinct from old.description
      or new.establishment is distinct from old.establishment
      or new.category_id is distinct from old.category_id
      or new.amount is distinct from old.amount
      or new.expense_date is distinct from old.expense_date
      or new.paid_by is distinct from old.paid_by
      or new.receipt_url is distinct from old.receipt_url
      or new.receipt_type is distinct from old.receipt_type
      or new.created_by is distinct from old.created_by
    then
      raise exception 'Este perfil só pode atualizar o status de reembolso.';
    end if;
  end if;
  return new;
end;
$$;

create trigger expenses_enforce_update_permissions
  before update on public.expenses
  for each row execute function public.enforce_expense_update_permissions();

-- ============================================
-- reimbursement_batches
-- ============================================
create policy "batches: qualquer autenticado pode ver"
  on public.reimbursement_batches for select
  to authenticated
  using (true);

create policy "batches: admin e viewer_approver podem criar"
  on public.reimbursement_batches for insert
  to authenticated
  with check (
    public.current_role_name() in ('admin', 'viewer_approver')
    and created_by = auth.uid()
  );

create policy "batches: admin e viewer_approver podem editar"
  on public.reimbursement_batches for update
  to authenticated
  using (public.current_role_name() in ('admin', 'viewer_approver'))
  with check (public.current_role_name() in ('admin', 'viewer_approver'));

create policy "batches: só admin apaga"
  on public.reimbursement_batches for delete
  to authenticated
  using (public.current_role_name() = 'admin');

-- ============================================
-- storage: comprovantes
-- ============================================
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

create policy "receipts: qualquer autenticado pode ver"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'receipts');

create policy "receipts: admin e contributor podem enviar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'receipts'
    and public.current_role_name() in ('admin', 'contributor')
  );

create policy "receipts: só admin apaga"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'receipts' and public.current_role_name() = 'admin');
