# Frontend

This is the React + Vite frontend for the GitHub Profile Analysis Tool. It renders the dashboard UI, chart sections, and repository explorer that sit on top of the backend API.

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
- Repository file explorer and modal tab view.
- Search suggestions from GitHub user search.
- Real login via GitHub and Google OAuth from the backend.
- Recent search history protected behind the login state.

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
- Main UI code lives in [src/App.jsx](src/App.jsx).
- Shared chart components live in [src/components/Charts.jsx](src/components/Charts.jsx).
- The repository file browser lives in [src/components/FileExplorer.jsx](src/components/FileExplorer.jsx) and [src/components/RepoModal.jsx](src/components/RepoModal.jsx).

## OAuth Setup Checklist

If the login buttons are disabled, the backend OAuth values are missing.

### Just GitHub Login

1. Copy [backend/.env.example](../backend/.env.example) to `backend/.env`.
2. Fill only these 4 values first:
   - `FRONTEND_URL=http://localhost:5173`
   - `BACKEND_URL=http://localhost:5000`
   - `GITHUB_CLIENT_ID=...`
   - `GITHUB_CLIENT_SECRET=...`
3. In your GitHub OAuth app, add this callback URL:
   - `http://localhost:5000/auth/github/callback`
4. Restart the backend.
5. Open the login page again and click GitHub login.

### Optional

If you also want Google login, fill these too:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
