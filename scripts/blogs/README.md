# TOGKF Blog — Google Sheets Setup

## Google Sheet columns

| Column | Example | Notes |
|---|---|---|
| `url_title` | `higaonna-sensei-seminar-2025` | Lowercase, hyphens only — becomes `togkf.in/blog/url_title` |
| `title` | Higaonna Sensei Seminar 2025 | Article headline |
| `date_published` | 2025-08-14 | ISO date |
| `excerpt` | Short summary for listing and social previews | ~160 chars |
| `image` | Google Drive link or direct URL | Hero image |
| `body` | Long text | Separate paragraphs with blank lines |
| `verified` | VERIFIED | Only verified rows are published |

## Apps Script setup

1. Open the blog Google Sheet → **Extensions → Apps Script**
2. Paste [`Code.gs`](Code.gs) and save
3. **Project Settings → Script Properties** — add:
   - `GITHUB_TOKEN` — fine-grained PAT with **Actions: Read and write** on `sk5268/togkf`
   - `GITHUB_REPO` — `sk5268/togkf` (optional; this is the default)
4. **Deploy → New deployment → Web app**
   - Execute as: Me
   - Who has access: **Anyone** (required — not "Anyone with Google account")
5. Copy the Web App URL → add as GitHub repo secret `BLOG_SCRIPT_URL`

## Publish button in the sheet

1. **Insert → Drawing** — label it **Publish to Website**
2. Save and place the drawing above your data rows
3. Click the drawing → **⋮** → **Assign script** → enter `publishBlog`

## Publishing workflow (for Sensei)

1. Fill in the article row
2. Set `verified` to `VERIFIED`
3. Click **Publish to Website**
4. Wait ~1–2 minutes — article appears at `togkf.in/blog/{url_title}`

## GitHub one-time setup

1. **Settings → Secrets and variables → Actions** — add `BLOG_SCRIPT_URL`
2. **Settings → Pages → Build and deployment** — set source to **GitHub Actions**
3. Merge the `blogs` branch into `prod` — the workflow deploys the full site

The workflow also runs on every push to `prod` and once daily at 3 AM IST as a fallback.
