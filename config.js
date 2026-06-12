/* ============================================================
   Cut Options — Supabase configuration
   ------------------------------------------------------------
   1. Create a free project at https://supabase.com
   2. In the dashboard: Project Settings → API
        • copy the "Project URL"            -> SUPABASE_URL
        • copy the "anon / public" API key  -> SUPABASE_KEY
   3. Paste them below and deploy this folder as a static site.

   See README.md for the database + auth setup (one SQL snippet).
   ============================================================ */
window.CUT_OPTIONS_CONFIG = {
  SUPABASE_URL: '',   // e.g. 'https://abcdwxyz.supabase.co'
  SUPABASE_KEY: '',   // anon public key, e.g. 'eyJhbGciOi...'  (or 'sb_publishable_...')

  // Usernames are turned into a synthetic email of the form
  //   <username>@<USERNAME_EMAIL_DOMAIN>
  // so people can sign in with just a username + password.
  // You normally never need to change this.
  USERNAME_EMAIL_DOMAIN: 'cutoptions.local',

  // Usernames that are allowed to EDIT the master cut options
  // (categories, primals, routes, cuts, yields and labour).
  // Everyone else can only change the $/kg prices.
  // IMPORTANT: this must match the admin policy in your database
  // (see README.md). The matching account's email becomes
  //   <username>@<USERNAME_EMAIL_DOMAIN>.
  ADMIN_USERNAMES: ['admin'],

  // Set to false to hide the "Create account" tab and make the site
  // invite/login-only (you then create users from the Supabase dashboard).
  ALLOW_SIGNUP: true
};
