# Study Desk

A personal study platform: courses with a day-by-day plan, progress tracking, charts and weekly quizzes. It ships with one course, **FDE Prep** (12 weeks toward Forward Deployed, Implementation and Integration Engineer roles), and you can add more.

- **Dashboard:** today's task, overall progress, hours per week, progress over time, quiz scores, progress by topic, weekly completion and a study calendar.
- **Plan:** 84 days with a done checkbox, the hours you studied and notes.
- **Quizzes:** 12 weekly quizzes (5 multiple-choice questions each) with explanations.
- **Courses:** switch between courses; each keeps its own plan, progress and quiz scores.
- **Your account:** sign up with your name, email and password. Your name and initials show in the top bar.
- **Login and sync:** email and password login with Supabase. Your data follows you to every device.

It's a static site (`index.html`, `config.js` catalogue and lesson files), so it needs no build step.

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

## How courses work

- **Courses** are single topics (SQL, RAG, Airflow…). They live in `catalog/topics.js`, each with an ordered list of lessons and a quiz.
- **Paths** are bundles of courses for a role (FDE, AI Engineer, Software Engineer, Data Engineer). They live in `catalog/paths.js`.
- **Lessons** load on demand from `lessons/<course-id>.js`. A lesson that isn't written yet shows "coming soon".
- Progress is stored per lesson, so a lesson done in one path counts in every path that includes it.

## Add a course

1. In `catalog/topics.js`, add an entry:
   ```js
   {"id":"terraform","title":"Terraform","color":"#56d6ff","description":"One sentence.",
    "lessons":[["basics","What Terraform is"],["state","State and plans"],["review","Review + quiz","review"]],
    "quiz":[["Question?",["A","B","C","D"],1,"Why B is right."]]}
   ```
2. Optionally add it to a path in `catalog/paths.js`.
3. Write the lessons in `lessons/terraform.js` (copy the shape of `lessons/sql.js`): each lesson has `title`, `one`, `learn`, `ex`, `try` and `remember`.
4. Push. It appears on the Courses page after Netlify redeploys.

Never change a course or lesson `id` after people start it: progress is saved under those ids.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Files

| File | What it is |
|---|---|
| `index.html` | The app: dashboard, plan, quizzes, courses, login and sync |
| `catalog/topics.js` | All courses (topics) with lessons and quizzes |
| `catalog/paths.js` | Paths: bundles of courses per role |
| `lessons/*.js` | Lesson content, one file per course |
| `config.js` | Your Supabase URL and anon key |
| `supabase/schema.sql` | Table and access rules, run once |
| `netlify.toml`, `vercel.json` | Hosting settings |
