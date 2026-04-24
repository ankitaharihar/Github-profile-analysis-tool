# Frontend

This is the React + Vite frontend for RepoInsight. It renders the dashboard UI, chart sections, and repository explorer that sit on top of the backend API.

## Stack

- React 19
- Vite
- Axios
- Recharts
- React Markdown
- React Syntax Highlighter
- Chart.js and React Chart.js 2

## Features

- GitHub username lookup with profile analysis.
- Developer score and summary cards for followers, repositories, and stars.
- Language, skills, and activity charts.
- Repository explorer controls: search, language filter, sort options, and fork include/exclude toggle.
- Repository quick stats in the dashboard view (filtered repo count, average stars, fork ratio).
- One-click CSV export for the currently filtered repository list.
- Repository file explorer and modal tab view.
- Search suggestions from GitHub user search.
- Real login via GitHub and Google OAuth from the backend.
- Recent search history protected behind the login state.
- Auth profile sync after OAuth redirect using backend `GET /auth/me`.

## Setup

Install dependencies from the frontend folder:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

Lint:

```bash
npm run lint
```

## Development Notes

- The app expects the backend to be running at `http://localhost:5000`.
- Set `VITE_API_BASE_URL` if your backend runs somewhere else.
- Repository data is fetched from GitHub API endpoints, so public GitHub rate limits still apply.
- The login landing section shows provider buttons when you are signed out.
- Logout calls backend `POST /auth/logout` and also clears local auth state.
- Main UI code lives in [src/App.jsx](src/App.jsx).
- Shared chart components live in [src/components/Charts.jsx](src/components/Charts.jsx).
- The repository file browser lives in [src/components/FileExplorer.jsx](src/components/FileExplorer.jsx) and [src/components/RepoModal.jsx](src/components/RepoModal.jsx).

## Deployment Notes

### Netlify Deployment

1. Connect your GitHub repo to Netlify
2. Set build settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Add environment variable:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** Your backend API URL (e.g., `https://your-backend.herokuapp.com`)
4. Optional (recommended for stable username suggestions):
   - **Key:** `GITHUB_TOKEN`
   - **Value:** A GitHub personal access token with public-read access
5. Deploy!

**If OAuth buttons are disabled on the deployed site:**

- Verify `VITE_API_BASE_URL` is set correctly
- Ensure your backend is running and reachable
- Check that backend OAuth credentials are configured

### Username Suggestions On Netlify

- The frontend now falls back to Netlify Function `/.netlify/functions/search-users` when backend search is unavailable.
- If suggestions are still limited or intermittent, set `GITHUB_TOKEN` in Netlify env vars and redeploy.

## OAuth Setup Checklist

If the login buttons are disabled, the backend OAuth values are missing.

### Just GitHub Login

1. Copy [backend/.env.example](../backend/.env.example) to `backend/.env`.
2. Fill these 5 values first:
   - `FRONTEND_URL=http://localhost:5173`
   - `BACKEND_URL=http://localhost:5000`
   - `GITHUB_CLIENT_ID=...`
   - `GITHUB_CLIENT_SECRET=...`
   - `GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback`
3. In your GitHub OAuth app, add this callback URL:
   - `http://localhost:5000/auth/github/callback`
4. Restart the backend.
5. Open the login page again and click GitHub login.

### Optional

If you also want Google login, fill these too:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Deployment Checklist

1. Set frontend env `VITE_API_BASE_URL` to deployed backend URL.
2. Set backend `FRONTEND_URL` to deployed frontend URL.
3. Set backend `GITHUB_CALLBACK_URL` to exact GitHub callback URL.
4. Redeploy backend first, then frontend.

## Quick Troubleshooting

### Login success message appears, but profile/menu still shows Login

- Check backend endpoint `GET /auth/me` responds correctly.
- Check `VITE_API_BASE_URL` points to correct backend.
- Check browser network for blocked cookie/cors requests.

### OAuth provider buttons disabled

- Backend `GET /auth/config` likely returning missing provider config.
- Verify backend OAuth env vars and redeploy backend.
