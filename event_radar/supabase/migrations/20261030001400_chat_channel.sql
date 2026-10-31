-- Stage 14: keep one decision per chat message and poll GroupMe every minute.
alter table public.events
  add column source text not null default '',
  add column source_id text not null default '',
  add column source_name text not null default '';

create unique index events_one_per_message
  on public.events (source, source_id)
  where source_id <> '';

create table public.channel_cursor (
  source text primary key,
  last_id text not null default '',
  read_count bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.channel_cursor enable row level security;
revoke all on public.channel_cursor from public, anon, authenticated;
grant select, insert, update, delete on public.channel_cursor to service_role;

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'read-chat-channel',
  '* * * * *',
  $job$
    select net.http_post(
      url := 'https://vymksytzzgoxonfvvgzj.supabase.co/functions/v1/read-channel',
      headers := '{"Content-Type":"application/json","apikey":"sb_publishable_qtAHF8-lXaARTp_qY5b-xA_q54DDkIi"}'::jsonb,
      body := '{}'::jsonb,
      timeout_milliseconds := 120000
    );
  $job$
);
