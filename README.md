# Study Desk

A free study platform for people preparing for tech roles. Pick a **path** (a bundle of courses for one job), single **courses**, or hands-on **projects**, then learn one short lesson a day, tick it off, take quizzes and revise.

Live: <https://studydesk-fouzan.netlify.app>

## Features

- **Paths:** Forward Deployed Engineer, AI Engineer, Software Engineer and Data Engineer. Each is a set of courses in a sensible order, with a start date you choose.
- **Courses:** 25 single topics (SQL, Python, APIs, RAG, Agents, System Design, Airflow, Spark…). Join any of them on their own.
- **Projects:** portfolio projects you can join separately (Odoo AI Agent, Integration Hub, Data Pipeline).
- **Lessons:** short and simple: the idea in one line, what to learn, an example, a task to try and what to remember.
- **Plan:** every lesson with a done checkbox, hours studied and notes.
- **Quizzes:** one multiple-choice quiz per course, with explanations.
- **Revise:** a one-page cheat sheet and flashcards for each course, plus a list of your weak courses.
- **Dashboard:** today's lesson, overall progress, charts, streak and a study calendar.
- **Accounts:** email or Google sign-in. Progress syncs across devices, and a lesson done in one path counts in every path that has it.
- **Admin panel:** sign-ups, a funnel, daily activity and per-user progress. Only admins can see it.

It is a static site: plain HTML, CSS and JavaScript with no build step. Supabase handles sign-in and storage.

## Run it locally (1 minute, no account needed)

```bash
git clone https://github.com/fouzanm/study-desk.git
cd study-desk
python3 -m http.server 8000
```

Open <http://localhost:8000>.

On `localhost` the app runs in **local mode**: there's no sign-in, and your progress is saved in your browser only. Everything else works. Local mode never touches the live database.

Any static server works instead of Python, for example `npx serve`.

## Run your own copy with sign-in

To give your copy accounts and syncing, connect your own free Supabase project.

### 1. Create the database

1. Sign up at <https://supabase.com> and click **New project**. Any name works; pick the region closest to your users.
2. Open **SQL Editor**, paste all of `supabase/schema.sql` and click **Run**. This creates:
   - the tables;
   - the security rules (each user can only see their own data);
   - the admin functions.
3. Open **Project Settings → API** and copy the **Project URL** and the **anon public** key.

### 2. Put your keys in `config.js`

```js
window.STUDY_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "your anon public key",
  USE_SUPABASE_ON_LOCALHOST: false
};
```

| Setting | What it does |
|---|---|
| `SUPABASE_URL` | Your Supabase project address. Leave it `""` to always use local mode. |
| `SUPABASE_ANON_KEY` | Your project's **anon public** key. It is safe to publish: the security rules protect the data. **Never** put the `service_role` key here. |
| `USE_SUPABASE_ON_LOCALHOST` | `false` (default): local mode on localhost. `true`: use sign-in on localhost too, for testing. Add `http://localhost:8000` to Supabase's **Redirect URLs** if you do. |

### 3. Set up sign-in in Supabase

- **Email:** works out of the box. In **Authentication → Providers → Email** you can turn off **Confirm email** so new users can sign in without a confirmation link.
- **Google (optional):**
  1. In Google Cloud Console, create an **OAuth client ID** (type: Web application).
  2. Add `https://YOUR-PROJECT.supabase.co/auth/v1/callback` as an authorised redirect URI.
  3. Paste the client ID and secret into Supabase under **Authentication → Providers → Google** and switch it on.

  The secret stays in Supabase, never in this repo.
- **URL Configuration:** under **Authentication → URL Configuration**, set **Site URL** to your live address. Add it to **Redirect URLs** as well.

### 4. Host it (free)

- **Netlify:**
  1. Go to **Add new site → Import an existing project → GitHub** and pick your fork.
  2. Leave the build command empty.
  3. Set the publish directory to `.` (already set in `netlify.toml`).
- **Vercel:** go to **Add New → Project**, import your fork, set the framework to **Other** and deploy.

Every push to `main` redeploys automatically.

### 5. Make yourself an admin

Create your account on the site, then run this in the Supabase SQL Editor with your email:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'you@example.com';
```

Reload the site and an **Admin** tab appears. Nobody can add themselves as an admin from the app.

## How the content is organised

| Thing | Where | Notes |
|---|---|---|
| Courses | `catalog/topics.js` | One entry per topic: `id`, `title`, `color`, `description`, `lessons`, `quiz`. |
| Projects | `catalog/topics.js` | Same as a course, with `"kind":"project"`. Shown under Projects, never inside a path. |
| Paths | `catalog/paths.js` | `id`, `title`, `color`, `description`, `hoursPerDay` and `courses` (a list of course ids in order). |
| Lessons | `lessons/<course-id>.js` | Loaded only when opened. A lesson that isn't written yet shows "coming soon". |

### Add a course

1. Add an entry to `catalog/topics.js`:
   ```js
   {"id":"terraform","title":"Terraform","color":"#56d6ff","description":"One sentence.",
    "lessons":[["basics","What Terraform is"],["state","State and plans"],["review","Review + quiz","review"]],
    "quiz":[["Question?",["A","B","C","D"],1,"Why B is right."]]}
   ```
   - In each quiz question, the number is the index of the right answer, starting at 0.
   - A lesson marked `"review"` shows the course cheat sheet and quiz.
2. Optionally add its id to a path in `catalog/paths.js`.
3. Write the lessons in `lessons/terraform.js`, copying the shape of `lessons/sql.js`:
   ```js
   L["terraform:basics"] = {
     title: "What Terraform is",
     one: "The idea in one sentence.",
     learn: ["Point one", "Point two"],
     ex: "code or example",
     try: "A small task to do now.",
     remember: ["Short fact for revision"]
   };
   ```
   The `remember` lines become the cheat sheet and flashcards on the Revise page.

**Never rename a course or lesson `id` after people have started it.** Progress is saved under those ids.

## Data and privacy

- Each user's progress lives in one row of `study_state`, which only that user can read or change.
- `activity` records simple events (visit, join, lesson done, quiz) for the admin panel. Users can add their own events but can't read anyone's.
- The admin panel reads data through `admin_overview()`, which refuses anyone not listed in `admins`.
- In local mode nothing leaves the browser.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole app: pages, styles and logic |
| `config.js` | Supabase settings (see above) |
| `catalog/topics.js` | Courses and projects with lessons and quizzes |
| `catalog/paths.js` | Paths: bundles of courses per role |
| `lessons/*.js` | Lesson content, one file per course |
| `supabase/schema.sql` | Tables, security rules and admin functions. Run once. |
| `netlify.toml`, `vercel.json` | Hosting settings |

## Contributing

Lessons are the most useful contribution. Pick a course whose lessons say "coming soon", write them in simple English following the shape above, and open a pull request.

## License

MIT. See [LICENSE](LICENSE).
