-- PROJ-14: Feedback/Ticket-System (team-weit, RLS wie notes).

create table if not exists public.feedback_tickets (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'fehler',        -- fehler | idee | frage
  message text not null,
  page_url text,
  status text not null default 'neu',          -- neu | in_arbeit | erledigt
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_feedback_tickets_created on public.feedback_tickets(created_at desc);

drop trigger if exists feedback_tickets_set_updated_at on public.feedback_tickets;
create trigger feedback_tickets_set_updated_at
  before update on public.feedback_tickets
  for each row execute function public.set_updated_at();

alter table public.feedback_tickets enable row level security;

create policy "Tickets lesen" on public.feedback_tickets
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Tickets anlegen" on public.feedback_tickets
  for insert with check (exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Tickets aendern" on public.feedback_tickets
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid()));
create policy "Tickets loeschen" on public.feedback_tickets
  for delete using (exists (select 1 from public.profiles p where p.id = auth.uid()));
