# Club Event Radar

A BUS 4498 practice build (Week 9, Friday Build 3). Club officers paste an announcement, an AI agent turns it into an event card and checks the posting rules, and the post is either published or held for a moderator.

## How it's hosted

| Part | What it does | Here |
|---|---|---|
| GitHub repository | Holds the code | This folder |
| GitHub Pages | Serves the public website | `index.html`, `style.css`, `app.js`, `config.js` |
| Supabase project | The backend | The database, the AI agent, the photos, the sign-in |
| Database table | Saves every post and its status | `events` |
| Edge Function | The AI agent | `supabase/functions/submit-event` |
| Secrets | Hold the AI key, which is never in this repository | Set in Supabase |
| Storage | Keeps flyer photos | The `flyers` bucket |
| Sign-in | Moderator accounts | Supabase Auth |

## Files

- `context/`: the posting rules and campus places (stable context).
- `test/`: sample posts, what should happen, and the test log.
- `supabase/migrations/`: the database changes, one per stage.
- `AGENTS.md` and `CLAUDE.md`: instructions for Claude Code and Codex.
- `HANDOFF.md`: handoff notes for a teammate.

Every club, event, and person in the sample posts is made up.

## Moderator sign-in setup

The sign-in page is `sign-in.html`; `moderator.html` checks the user's Supabase Auth session and their membership in `public.moderators`. The allowlist table has row-level security: signed-in users can read only their own membership, and cannot add themselves. Its migration is `supabase/migrations/20261023230822_moderator_access.sql` and is already applied to the `event-radar` Supabase project.

To add the first moderator in the Supabase dashboard:

1. Open **Authentication → Sign In / Providers → User Signups** and turn off **Allow new users to sign up**. This keeps moderator accounts invite-only.
2. Open **Authentication → Users → Add user** and create the moderator account. Do not put its password in this repository or a chat.
3. Copy that user's UUID from **Authentication → Users**. In **SQL Editor → New query**, run `insert into public.moderators (user_id) values ('USER_UUID_HERE');` with that UUID. Only a project administrator should run this query.
4. Open `moderator.html` in a private browser window. It should redirect to `sign-in.html`; after signing in as the allowlisted user, the moderator page should open. A different signed-in user should see **Access denied**.

The event board, event table, and review actions have not been built yet. When adding them, enforce moderator access with database policies too; a browser route guard alone does not protect data.
