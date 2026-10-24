-- Stage 7: flyer photos and public read access to their links.
alter table public.events
  add column flyer_url text not null default '';

grant select (flyer_url) on public.events to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('flyers', 'flyers', true, 5242880, array['image/jpeg', 'image/png']);
