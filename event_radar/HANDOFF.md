# Club Event Radar — handoff for Nicole Wu

## What works now

The [website](https://bella940118-lgtm.github.io/BUS4498_InClass_Builds/event_radar/) lists published campus club events. A club officer can submit an announcement and an optional JPG or PNG flyer; the `submit-event` Edge Function reads the details, checks posting rules and duplicates, and either publishes the post or holds it for review. Flyer posts always wait. A signed-in moderator can review waiting posts and approve or reject them from the website.

## Where things live

- **GitHub repository:** `BUS4498_InClass_Builds`, in the `event_radar/` folder. GitHub Pages serves `index.html`, `app.js`, `style.css`, and `config.js`.
- **Supabase project:** `event-radar` at https://vymksytzzgoxonfvvgzj.supabase.co. The `public.events` database table holds posts, the `flyers` Storage bucket holds photos, and Supabase Auth holds moderator accounts.
- **Agent and rules:** `supabase/functions/submit-event/index.ts`, `context/posting-rules.md`, and `context/campus-places.md`. Database changes are saved in `supabase/migrations/`. Test examples are in `test/sample-announcements.md` and `test/sample-flyer.png`.

## Secrets

`ANTHROPIC_API_KEY` is set in Supabase → Edge Functions → Secrets. Nicole does not need its value. Keep AI keys, database passwords, and Supabase secret keys out of the repository and chats; `config.js` contains only the public Project URL and publishable key.

## How to test

1. Submit sample **A** from `test/sample-announcements.md`: it should publish and appear on the website. If it was submitted already, the agent should say it is a duplicate.
2. Submit sample **F** (the textbook sale): it should be rejected because it is not an event.
3. Submit the sample flyer with “Clothing swap next week, all the details are on the flyer!”: it should wait with the event details read from the image. Sign in as a moderator, approve it, and check that the event card and photo appear on the website.

## What's next

The sample posts have fixed October and November 2026 dates, so update them before later demos. The README's older moderator-page notes also need updating. An optional future improvement is a nightly job to archive past events.

## How we take turns

Tell each other before starting work on the same files. In GitHub Desktop, **pull** (download) the latest changes before you start, then **push** (upload) your changes when you stop. Share what changed and what you tested.
