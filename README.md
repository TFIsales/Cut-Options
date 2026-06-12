# Cut Options — Equivalent Value

A web app for comparing beef cut/boning routes by equivalent value off one carcase.

It runs on **Supabase** with **username + password** login and two roles:

| Role | Can do |
| --- | --- |
| **Admin** | Edit everything — categories, primals, routes, cuts, **yields, labour, names, carcase weight**. This is the single *master* set of options everyone uses. |
| **Everyone else** | See the admin's master options (read-only) and change **only the `$/kg` prices**. Each person's prices are saved privately to their own account. The break-even `⌖` button is available too — it just calculates a `$/kg`. |

Both the interface **and** the database (Row-Level Security) enforce these limits, so a
non-admin can't change the cuts or yields even by going around the app.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com> and create a free project.
2. Open **Project Settings → API** and copy:
   - **Project URL**
   - the **anon / public** API key

## 2. Add your keys

Open `config.js` and paste them in:

```js
window.CUT_OPTIONS_CONFIG = {
  SUPABASE_URL: 'https://YOURPROJECT.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOi...',          // anon public key
  USERNAME_EMAIL_DOMAIN: 'cutoptions.local',
  ADMIN_USERNAMES: ['admin'],             // usernames allowed to edit the master options
  ALLOW_SIGNUP: true
};
```

> Usernames are turned into a hidden email of the form
> `username@cutoptions.local` so people can log in with just a username + password.
> The admin account in `ADMIN_USERNAMES` must match the admin email used in the
> database policy below.

## 3. Set up the database

In the Supabase dashboard open **SQL Editor** and run this once.
**If you change the admin username/domain, update the two `admin@cutoptions.local`
lines to match.**

```sql
-- 1) Shared MASTER template (admin writes, everyone reads) ------------------
create table public.cut_template (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
alter table public.cut_template enable row level security;

create policy "anyone signed in can read the template"
  on public.cut_template for select to authenticated using (true);

create policy "only admin can change the template"
  on public.cut_template for all to authenticated
  using      (auth.jwt() ->> 'email' = 'admin@cutoptions.local')
  with check (auth.jwt() ->> 'email' = 'admin@cutoptions.local');

-- 2) Per-user PRICES ($/kg overlay, private to each user) -------------------
create table public.app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);
alter table public.app_state enable row level security;

create policy "users read/write only their own prices"
  on public.app_state for all to authenticated
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

## 4. Turn off email confirmation

Because usernames map to placeholder emails (not real inboxes):

**Authentication → Providers → Email** → turn **Confirm email** *off*.
(or **Authentication → Sign In / Providers**, depending on dashboard version)

## 5. Create the admin account

Open the deployed site and use **Create account** with username `admin` and a
password — or create it from the dashboard under
**Authentication → Users → Add user** with email `admin@cutoptions.local`.

The first time the admin signs in, the current cut options are published to the
cloud as the master template that everyone else loads.

## 6. Add the other users

- If `ALLOW_SIGNUP: true`, staff can self-register from the **Create account** tab.
- To make it invite-only, set `ALLOW_SIGNUP: false` and add users from
  **Authentication → Users → Add user** (email `theirname@cutoptions.local`).

Anyone who is **not** in `ADMIN_USERNAMES` automatically gets the price-entry view.

---

## Deploy

It's a static site — host the folder anywhere:

- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop or connect this repo.
- **GitHub Pages** — push and enable Pages on the branch.
- Or just open `index.html` locally for testing.

No build step. Files: `index.html`, `config.js`, `README.md`.

---

## How the data is stored

- `cut_template` (one row, `id = 'global'`) — the master options the admin edits.
- `app_state` (one row per user) — that user's `$/kg` overrides, applied on top of
  the master template by row id.

If Supabase is unreachable, edits fall back to this browser's local storage and
sync up again when the connection returns.
