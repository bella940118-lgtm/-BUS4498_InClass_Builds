-- Stage 8: signed-in moderators can read posts and review waiting posts.
create policy "Moderators can read all events"
on public.events for select to authenticated
using (true);

create policy "Moderators can review waiting events"
on public.events for update to authenticated
using (status = 'waiting')
with check (status in ('published', 'waiting', 'rejected'));

grant select on public.events to authenticated;
grant update (status, status_reason, reviewed_at, reviewed_by)
on public.events to authenticated;
