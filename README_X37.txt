LifeOS X37 — AURA NEXUS CONNECTED

INSTALL
- Windows: open index.html through a local web server, then Chrome/Edge -> Install LifeOS.
- Android: open the hosted app in Chrome -> Install app / Add to Home screen.
- iPhone/iPad: Safari -> Share -> Add to Home Screen.

CLOUD SYNC (optional)
1. Create a Supabase project.
2. Run SUPABASE_SETUP.sql in Supabase SQL Editor.
3. Open LifeOS -> AURA SYNC CENTER -> تنظیم Cloud.
4. Enter Project URL + anon/public key.
5. Sign up or log in. The app syncs the whole LifeOS state per user.

SECURITY
- Only use the Supabase anon/public key in the client.
- Never put a service_role key in the browser.
- RLS policies restrict each user to their own row.

The app remains usable offline/local-only when Cloud is not configured.
