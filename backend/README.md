# Backend

This folder contains the Express API used by the frontend dashboard. It proxies a few public GitHub endpoints and returns a simplified JSON response for the UI.

## Stack

- Node.js
- Express
- Axios
- CORS

## Setup

Install dependencies from the backend folder:

```bash
npm install
```

Run the server in development mode:

```bash
npm run dev
```

Run it without nodemon:

```bash
npm start
```

The server listens on `http://localhost:5000`.

## API Endpoints

### `GET /api/github/:username`

Returns public GitHub profile data for the requested user.

### `GET /api/github/:username/repos`

Returns repositories for the requested user.

Query params:

- `page` defaults to `1`
- `per_page` defaults to `10`

Response shape:

- `data`: repository list
- `pagination`: simple pagination metadata with `has_prev`, `has_next`, and `total_pages`

### `GET /api/github/:username/languages`

Returns a language frequency map built from the user's public repositories.

## Notes

- Requests are made against the public GitHub REST API.
- CORS is enabled so the frontend can call the backend from `localhost` during development.
- There is no `.env`-based GitHub token handling in the current server implementation.
