// Study Desk settings.
//
// SUPABASE_URL and SUPABASE_ANON_KEY connect the app to a Supabase project for
// sign-in and saving. The anon key is meant to be public: each user's data is
// protected by the row-level security rules in supabase/schema.sql.
//
// Running your own copy? Replace both values with your own project's
// (Supabase → Project Settings → API), or leave them empty ("") to use
// local mode: no sign-in, progress saved in your browser only.
//
// On localhost the app always uses local mode, so a local copy never writes to
// the live database. Set USE_SUPABASE_ON_LOCALHOST to true to test sign-in locally.
window.STUDY_CONFIG = {
  SUPABASE_URL: "https://mbeayrwjbbflkwzufsed.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZWF5cndqYmJmbGt3enVmc2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1MzcwMDYsImV4cCI6MjExMTExMzAwNn0.rM4lzWqYfTJxrs5yKuT5rHFkd07bzSWSQDmmRZOco-8",
  USE_SUPABASE_ON_LOCALHOST: false
};
