-- PROJ-10: Pipeline-Automatik. Neue Phasen + Regel-Schalter-Tabelle.

-- Neue Phasen (FK-Ziel für customers.stage_id). Reihenfolge im Board kommt aus
-- der Code-Konstante STAGES; die DB-Position wird im Code nicht gelesen.
insert into public.pipeline_stages (id, name, position, color, is_won, is_lost) values
  ('angebotserstellung', 'Angebotserstellung', 8, '#d946ef', false, false),
  ('nachfassen', 'Nachfassen', 9, '#0891b2', false, false)
on conflict (id) do nothing;

-- Regel-Schalter (an/aus je Automatik-Regel), team-weit.
create table if not exists public.automation_rules (
  key text primary key,
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

drop trigger if exists automation_rules_set_updated_at on public.automation_rules;
create trigger automation_rules_set_updated_at
  before update on public.automation_rules
  for each row execute function public.set_updated_at();

alter table public.automation_rules enable row level security;

create policy "Automatik lesen" on public.automation_rules
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Automatik aendern" on public.automation_rules
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Automatik anlegen" on public.automation_rules
  for insert with check (exists (select 1 from public.profiles p where p.id = auth.uid()));

-- Regeln seeden.
insert into public.automation_rules (key, enabled) values
  ('angebot_sent_to_nachfassen', true),
  ('inbound_email_to_lead', false)
on conflict (key) do nothing;
