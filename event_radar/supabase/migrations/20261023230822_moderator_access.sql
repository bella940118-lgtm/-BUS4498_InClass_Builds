-- Only project administrators can add or remove moderator accounts.
-- A moderator account must already exist in Authentication > Users.
create table public.moderators (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.moderators enable row level security;

revoke all on public.moderators from anon, authenticated;
grant select (user_id) on public.moderators to authenticated;

create policy "Moderators can verify their own access"
on public.moderators for select to authenticated
using ((select auth.uid()) = user_id);
