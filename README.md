# GitHub Profile Analysis Tool

GitHub Profile Analysis Tool is a split frontend/backend app for exploring a GitHub user's public profile, repositories, and language breakdown. The frontend is a React + Vite dashboard, and the backend is a small Express API that proxies a few GitHub endpoints.

## Project Layout

```text
Github-profile-analysis-tool/
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
