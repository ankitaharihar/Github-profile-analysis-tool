# RepoInsight

RepoInsight is a split frontend/backend app for exploring a GitHub user's public profile, repositories, and language breakdown. The frontend is a React + Vite dashboard, and the backend is a small Express API that proxies a few GitHub endpoints.

## Project Layout

```text
RepoInsight/
├─ backend/
├─ frontend/
├─ package.json
└─ README.md
```

## What It Does

- Searches and analyzes a GitHub username from the dashboard.
- Shows profile details, repository counts, stars, and follower stats.
- Renders language, skills, and activity charts.
- Browses repository files and README content in a modal-style explorer.
- Uses the backend for profile data and GitHub directly for some repository lookups.

## Prerequisites

- Node.js 18 or newer
- npm

## Install

Install dependencies for the root helper package and both apps:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

## Run

Start both apps together from the repository root:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Scripts

- Root: `npm run dev` starts backend and frontend together.
- Backend: `npm run dev` runs `nodemon server.js`, `npm start` runs `node server.js`.
- Frontend: `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`.

## Backend API

The backend listens on `http://localhost:5000` and exposes:

- `GET /api/github/:username` for public profile data.
- `GET /api/github/:username/repos` for repositories with simple pagination fields.
- `GET /api/github/:username/languages` for a language frequency summary.

## Frontend

The frontend lives in [frontend/README.md](frontend/README.md) and contains the UI-specific setup and usage notes.

## Backend

The backend API details are documented in [backend/README.md](backend/README.md).

## Deployment

### Frontend (Netlify)

1. Push your code to GitHub
2. Connect your repo to Netlify and configure:
   - **Build command:** `npm run build --prefix frontend`
   - **Publish directory:** `frontend/dist`
3. Set environment variables in Netlify dashboard:
   - `VITE_API_BASE_URL`: Your backend API URL (e.g., `https://your-backend.herokuapp.com`)

### Backend

Deploy to a hosting platform like:

- [Heroku](https://heroku.com)
- [Vercel](https://vercel.com)
- [Railway](https://railway.app)
- [AWS Lambda](https://aws.amazon.com/lambda)
- Any VPS (DigitalOcean, Linode, etc.)

**Required environment variables**:

- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` (from GitHub OAuth App)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (from Google OAuth App, if using)
- `STRIPE_SECRET_KEY` and related Stripe vars (if using billing)
- `FRONTEND_URL`: Your deployed frontend URL

### Important: Connect Frontend to Backend

On the deployed frontend (Netlify), set the `VITE_API_BASE_URL` environment variable to point to your deployed backend. This allows the frontend to:

- Fetch OAuth configuration
- Retrieve GitHub profile data
- Handle authentication requests

If `VITE_API_BASE_URL` is not set, the frontend defaults to `http://localhost:5000`, which won't work on a deployed site.
