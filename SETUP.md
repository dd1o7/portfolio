# Setup

Written assuming you have not done this before. Follow it top to bottom.

---

## 1. Run the site on your own machine

Open a terminal in this folder and run:

```bash
pnpm install    # only needed the first time
pnpm dev
```

Then open **http://localhost:3000** in your browser.

Leave that terminal running. Every time you save a file, the page updates by
itself. To stop it, press `Ctrl+C` in that terminal.

**This is where you should try things.** Nothing you do here affects the live
site until you push to GitHub.

---

## 2. Make it yours

Open `src/site.config.ts`. Everything personal is in that one file — your name,
your GitHub username, your links, the text on the homepage. Change it, save, and
the browser updates.

Then replace the placeholder content in `content/`. See `CLAUDE.md` for what
each field means.

---

## 3. Put it on GitHub

You need a GitHub repository for the site to live in.

1. Go to **https://github.com/new**
2. Repository name: `portfolio` (or anything you like)
3. Choose **Public** or **Private** — both work
4. **Do not** tick "Add a README", "Add .gitignore", or "Choose a license".
   This folder already has those, and ticking them causes a conflict.
5. Click **Create repository**

GitHub then shows you a page of commands. Ignore it and run these instead,
replacing `YOUR-USERNAME` and `YOUR-REPO`:

```bash
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

If it asks for a password, GitHub no longer accepts your account password here —
it wants a token. Easiest fix is to install the GitHub CLI and run `gh auth login`,
which handles it for you.

---

## 4. Put it on the internet

1. Go to **https://vercel.com/signup** and sign up **with GitHub**
2. Click **Add New… → Project**
3. Find your repository in the list and click **Import**
4. Change nothing on the settings screen — Vercel detects Next.js by itself
5. Click **Deploy**

Wait about a minute. You will get a URL like `your-repo.vercel.app`. That is your
live site.

**From now on, every `git push` updates the live site automatically.** There is
no deploy button to press.

Last step: copy your new URL into the `url` field in `src/site.config.ts`, then
commit and push. That field is used for link previews when the site is shared.

---

## 5. Add your CV (whenever you are ready)

Put your PDF at `public/resume.pdf`, then commit and push.

The "cv" link appears in the navigation by itself once the file exists. There is
no setting to change. To use a different filename, update `resume.path` in
`src/site.config.ts`.

---

## Updating the site from now on

Two ways, and they do the same thing:

**A. Edit files, then push.** Add or change a Markdown file in `content/`, then:

```bash
git add .
git commit -m "Add project X"
git push
```

The live site updates about 40 seconds later.

**B. The `/admin` dashboard.** Go to `your-site.vercel.app/admin`, sign in, and
write. It commits the same files for you. See the next section to switch it on.

---

## 6. Switch on the /admin dashboard

This is what lets you update the site from your phone. Do it after step 4.

**Generate your password and secrets:**

```bash
pnpm setup
```

This prints an admin password — **save it in your password manager now.** It is
not stored anywhere and cannot be recovered, though you can always re-run the
command to set a new one. It also prints the environment variables you need, and
step-by-step instructions for creating the GitHub token.

**Then create the GitHub token**, following the instructions the script printed.
It takes about a minute. Give it access to **only this one repository**, and only
the **Contents: Read and write** permission — nothing else.

**Then add four variables in Vercel** (Project → Settings → Environment
Variables), adding each to all three environments:

| Variable | Where it comes from |
|---|---|
| `ADMIN_PASSWORD_HASH` | printed by `pnpm setup` |
| `AUTH_SECRET` | printed by `pnpm setup` |
| `GITHUB_TOKEN` | the token you just created |
| `GITHUB_REPO` | `your-username/your-repo` |

**Finally, redeploy.** Vercel does not apply new environment variables to an
existing deployment — go to the Deployments tab and redeploy the latest one.

Now visit `your-site.vercel.app/admin`. Add it to your phone's home screen and it
behaves like an app.

### How safe is this?

The token can only change files in that one repository. If your password were
ever guessed, the worst anyone could do is edit your portfolio's content — and
because every change is a git commit, you can undo it. The token cannot touch
your other repositories, your account, or anything else.

Never put the token anywhere other than Vercel's environment variables. If you
ever paste it into a file by accident, delete the token on GitHub and make a new
one — that instantly makes the old one useless.

---

## When something breaks

**The terminal shows a red error mentioning a file in `content/`**

Your frontmatter has a problem. The message names the file and the field, for
example:

```
Invalid frontmatter in content/projects/foo.md
  • title: cannot be empty
```

Fix that field and save.

**A page says 404**

Check the filename in `content/` matches the URL. A file at
`content/projects/my-thing.md` is served at `/projects/my-thing`.

**The build fails on Vercel but works locally**

Almost always a draft. Items with `draft: true` are visible locally and hidden on
the live site, so a page that links to a draft can break. Set `draft: false` when
you are ready to publish.

**You want to undo something**

Every change is a git commit, so nothing is ever really lost. `git log` shows the
history, and Vercel keeps every previous deployment — you can roll back from its
dashboard in a couple of clicks.
