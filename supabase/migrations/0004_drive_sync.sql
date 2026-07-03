-- Vila Bele - Gestão de Despesas
-- 0004_drive_sync.sql: controle de arquivos já lidos da pasta "Notinhas e Cupons"

create table public.processed_drive_files (
  id uuid primary key default gen_random_uuid(),
  drive_file_id text not null unique,
  file_name text not null,
  status text not null check (status in ('processed', 'failed', 'skipped')),
  expense_id uuid references public.expenses(id) on delete set null,
  error_message text,
  processed_at timestamptz not null default now()
);

comment on table public.processed_drive_files is 'Evita reprocessar o mesmo arquivo da pasta do Google Drive.';

alter table public.processed_drive_files enable row level security;

create policy "processed_drive_files: admin gerencia tudo"
  on public.processed_drive_files for all
  to authenticated
  using (public.current_role_name() = 'admin')
  with check (public.current_role_name() = 'admin');
