-- PROJ-13: Kundendateien (team-weit, RLS wie notes) + privater Bucket.

create table if not exists public.customer_files (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  file_name text not null,
  description text,
  file_size bigint not null default 0,
  content_type text,
  storage_path text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_customer_files_customer
  on public.customer_files(customer_id);

drop trigger if exists customer_files_set_updated_at on public.customer_files;
create trigger customer_files_set_updated_at
  before update on public.customer_files
  for each row execute function public.set_updated_at();

alter table public.customer_files enable row level security;

create policy "Dateien lesen" on public.customer_files
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Dateien anlegen" on public.customer_files
  for insert with check (exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Dateien aendern" on public.customer_files
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Dateien loeschen" on public.customer_files
  for delete using (exists (select 1 from public.profiles p where p.id = auth.uid()));

-- Privater Bucket für Kundendateien
insert into storage.buckets (id, name, public)
values ('customer-files', 'customer-files', false)
on conflict (id) do nothing;

create policy "Kundendateien lesen" on storage.objects
  for select using (bucket_id = 'customer-files'
    and exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Kundendateien hochladen" on storage.objects
  for insert with check (bucket_id = 'customer-files'
    and exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Kundendateien loeschen" on storage.objects
  for delete using (bucket_id = 'customer-files'
    and exists (select 1 from public.profiles p where p.id = auth.uid()));
