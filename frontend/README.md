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
- Repository data is fetched from GitHub API endpoints, so public GitHub rate limits still apply.
- Main UI code lives in [src/App.jsx](src/App.jsx).
- Shared chart components live in [src/components/Charts.jsx](src/components/Charts.jsx).
- The repository file browser lives in [src/components/FileExplorer.jsx](src/components/FileExplorer.jsx) and [src/components/RepoModal.jsx](src/components/RepoModal.jsx).
