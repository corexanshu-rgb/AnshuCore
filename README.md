# AnshuCore website

Static website (HTML, CSS, JavaScript modules) plus Vercel serverless functions in `/api`.
No build step and no npm packages are needed.

## Folder structure

```
anshucore/
  api/            Serverless functions (site, request, rating, apk, admin)
  public/         Website files (index.html, admin.html, css/, js/)
  vercel.json     Routing
  package.json
  .env.example    Environment variables to set on Vercel
```

## Deploy on Vercel (free)

1. Upload this folder to a new GitHub repository.
2. On vercel.com choose **Add New > Project**, import the repository, keep **Framework Preset: Other**, and deploy.
3. In the Vercel project open **Storage** (or Marketplace) and add **Upstash Redis** (free plan). Connect it to the project. The database variables are added automatically.
4. Open **Settings > Environment Variables** and add:
   - `ADMIN_EMAIL` = your admin email
   - `ADMIN_PASSWORD` = your admin password
   - `SESSION_SECRET` = any long random text
   - `GITHUB_TOKEN` (optional) = a GitHub token with no scopes, for a higher API limit
5. Redeploy the project (Deployments > Redeploy).
6. Open `https://your-site.vercel.app/admin` and sign in.

## Using the admin panel

- **Requests**: call, WhatsApp or email each request. "Not interested" deletes it.
- **Ratings**: visitor ratings stay hidden until you approve them.
- **Services / Why work with me / Projects / FAQ**: add, edit, delete and reorder.
- **Android App**: enter your GitHub repository (`owner/repo`). Create a Release in GitHub and attach the `.apk`. The site shows the files and the GitHub download counts.
- **Social links**: paste a link and the icon is created automatically.
- **About and Privacy**: edit the footer pages.
- **Settings**: profile, photo, contact, home headline, budget presets and visible sections.

## Local test

```
npm i -g vercel
vercel dev
```
Without a database, data is kept in memory only while `vercel dev` runs.
