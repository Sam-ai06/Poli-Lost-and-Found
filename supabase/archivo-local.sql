-- Backup privado del estado anterior a la integración. No modifica el dispositivo.
create table if not exists public.archivos_migracion_local (
  usuario_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null,
  creado_en timestamptz not null default now(),
  constraint archivo_migracion_tamano check (pg_column_size(snapshot) <= 5242880)
);
alter table public.archivos_migracion_local enable row level security;
grant select, insert, update on public.archivos_migracion_local to authenticated;
create policy "usuario lee su archivo local" on public.archivos_migracion_local for select to authenticated
using (usuario_id = (select auth.uid()));
create policy "usuario guarda su archivo local" on public.archivos_migracion_local for insert to authenticated
with check (usuario_id = (select auth.uid()));
create policy "usuario actualiza su archivo local" on public.archivos_migracion_local for update to authenticated
using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));
