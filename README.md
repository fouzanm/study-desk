# Study Desk

A personal study platform: courses with a day-by-day plan, progress tracking, charts and weekly quizzes. It ships with one course, **FDE Prep** (12 weeks toward Forward Deployed, Implementation and Integration Engineer roles), and you can add more.

- **Dashboard:** today's task, overall progress, hours per week, progress over time, quiz scores, progress by topic, weekly completion and a study calendar.
- **Plan:** 84 days with a done checkbox, the hours you studied and notes.
- **Quizzes:** 12 weekly quizzes (5 multiple-choice questions each) with explanations.
- **Courses:** switch between courses; each keeps its own plan, progress and quiz scores.
- **Your account:** sign up with your name, email and password. Your name and initials show in the top bar.
- **Login and sync:** email and password login with Supabase. Your data follows you to every device.

It's a static site (`index.html`, `config.js` and one file per course), so it needs no build step.

## Setup (about 10 minutes)

### 1. Create the database (Supabase, free)

1. Go to <https://supabase.com>, sign up and click **New project**. Any name and region work; pick the region closest to you, for example Mumbai.
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql`, and click **Run**.
3. Open **Project Settings → API** and copy:
   - the **Project URL**;
   - the **anon public** key.
4. Paste both into `config.js` and commit the change.

The anon key is designed to be public. The row-level security rules in `schema.sql` make sure each user can only read and change their own data.

**Optional:** in **Authentication → Providers → Email** you can turn off **Confirm email**, so you can sign in straight after creating your account without clicking a confirmation link.

### 2. Host it (Netlify or Vercel, free)

**Netlify**
1. Sign in at <https://app.netlify.com> with GitHub.
2. Click **Add new site → Import an existing project → GitHub**, and choose `study-desk`. Give Netlify access to private repos when asked.
3. Leave the build command empty. Set the publish directory to `.` (already set in `netlify.toml`), then click **Deploy**.

**Vercel**
1. Sign in at <https://vercel.com> with GitHub.
2. Click **Add New → Project**, import `study-desk`, keep the framework as **Other**, and click **Deploy**.

Every push to `main` redeploys the site automatically.

### 3. Allow your site address in Supabase

In Supabase, open **Authentication → URL Configuration**, set **Site URL** to your Netlify or Vercel address, and save. This makes confirmation emails link back to your site.

### 4. Create your account

Open the site, choose **Create account**, and sign in.

## Add a course

1. Copy `courses/_template.js` to a new file, for example `courses/system-design.js`.
2. Give it a unique `id` and fill in its title, weeks, daily topics and quiz questions.
3. In `index.html`, under `<script src="courses/fde.js"></script>`, add:
   ```html
   <script src="courses/system-design.js"></script>
   ```
4. Commit and push. The course appears on the **Courses** page after the site redeploys.

Don't change a course's `id` after you start it: your progress is saved under that id.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Files

| File | What it is |
|---|---|
| `index.html` | The app: dashboard, plan, quizzes, courses, login and sync |
| `courses/fde.js` | The FDE Prep course (default) |
| `courses/_template.js` | Starting point for a new course |
| `config.js` | Your Supabase URL and anon key |
| `supabase/schema.sql` | Table and access rules, run once |
| `netlify.toml`, `vercel.json` | Hosting settings |
