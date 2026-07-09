-- PROJ-15: Signatur (pro Nutzer) + privater Bild-Bereich für E-Mail-Bilder.
-- Anzuwenden über Supabase (MCP apply_migration oder SQL-Editor).

-- ── Signatur pro Nutzer ─────────────────────────────────────────────────
create table if not exists public.user_signatures (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  body_html text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists user_signatures_set_updated_at on public.user_signatures;
create trigger user_signatures_set_updated_at
  before update on public.user_signatures
  for each row execute function public.set_updated_at();

alter table public.user_signatures enable row level security;

-- Jeder Nutzer sieht/ändert nur seine eigene Signatur.
create policy "Signatur lesen" on public.user_signatures
  for select using (user_id = auth.uid());
create policy "Signatur anlegen" on public.user_signatures
  for insert with check (user_id = auth.uid());
create policy "Signatur aendern" on public.user_signatures
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Signatur loeschen" on public.user_signatures
  for delete using (user_id = auth.uid());

-- ── Privater Bild-Bereich für E-Mail-Bilder (Signatur + Vorlagen) ───────
insert into storage.buckets (id, name, public)
values ('email-images', 'email-images', false)
on conflict (id) do nothing;

create policy "Email-Bilder lesen" on storage.objects
  for select using (bucket_id = 'email-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Email-Bilder hochladen" on storage.objects
  for insert with check (bucket_id = 'email-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Email-Bilder loeschen" on storage.objects
  for delete using (bucket_id = 'email-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid()));
