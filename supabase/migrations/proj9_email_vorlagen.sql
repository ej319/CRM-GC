-- PROJ-9: E-Mail-Vorlagen (team-weit, RLS wie notes)
-- Anzuwenden über Supabase (MCP apply_migration oder SQL-Editor).
-- Enthält: zwei Tabellen + RLS-Policies. Der private Storage-Bucket
-- "template-attachments" + dessen Policies stehen unten als separater Block,
-- da Buckets in Supabase i. d. R. per Dashboard/Storage-API angelegt werden.

create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text,
  body_html text not null default '',
  -- optionale Ersatztexte je Platzhalter, z. B. {"Firma":"unser Kunde"}
  placeholder_defaults jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists email_templates_set_updated_at on public.email_templates;
create trigger email_templates_set_updated_at
  before update on public.email_templates
  for each row execute function public.set_updated_at();

create table if not exists public.email_template_attachments (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.email_templates(id) on delete cascade,
  file_name text not null,
  file_size bigint not null default 0,
  content_type text,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_email_template_attachments_template
  on public.email_template_attachments(template_id);

alter table public.email_templates enable row level security;
alter table public.email_template_attachments enable row level security;

-- Team-RLS: jeder angemeldete Nutzer mit Profil darf lesen/schreiben (wie notes)
create policy "Vorlagen lesen" on public.email_templates
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Vorlagen anlegen" on public.email_templates
  for insert with check (exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Vorlagen aendern" on public.email_templates
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Vorlagen loeschen" on public.email_templates
  for delete using (exists (select 1 from public.profiles p where p.id = auth.uid()));

create policy "Vorlagen-Anhaenge lesen" on public.email_template_attachments
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Vorlagen-Anhaenge anlegen" on public.email_template_attachments
  for insert with check (exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Vorlagen-Anhaenge loeschen" on public.email_template_attachments
  for delete using (exists (select 1 from public.profiles p where p.id = auth.uid()));

-- ── Storage-Bucket (privat) für Vorlagen-Anhänge ─────────────────────────
-- Bucket anlegen (privat):
insert into storage.buckets (id, name, public)
values ('template-attachments', 'template-attachments', false)
on conflict (id) do nothing;

-- Policies für den Bucket (wie email-attachments):
create policy "Vorlagen-Anhaenge Datei lesen" on storage.objects
  for select using (bucket_id = 'template-attachments'
    and exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Vorlagen-Anhaenge Datei hochladen" on storage.objects
  for insert with check (bucket_id = 'template-attachments'
    and exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Vorlagen-Anhaenge Datei loeschen" on storage.objects
  for delete using (bucket_id = 'template-attachments'
    and exists (select 1 from public.profiles p where p.id = auth.uid()));
