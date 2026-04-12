# Backend

This folder contains the Express API used by the frontend dashboard. It proxies a few public GitHub endpoints and returns a simplified JSON response for the UI.

## Stack

- Node.js
- Express
- Axios
- CORS
- Cookie parsing for OAuth state cookies
- Nodemailer for login notification emails

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

## Environment Variables

Create a `.env` file in the backend folder with these values:

- `FRONTEND_URL` - frontend URL, usually `http://localhost:5173`
- `BACKEND_URL` - backend URL, usually `http://localhost:5000`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_TOKEN` - optional, improves GitHub API rate limits for proxy requests
- `STRIPE_SECRET_KEY` - required for paid checkout and subscription actions
- `STRIPE_WEBHOOK_SECRET` - required to verify Stripe webhook events
- `STRIPE_PRICE_PRO_MONTHLY` - Stripe recurring price ID for Pro plan
- `STRIPE_PRICE_TEAM_MONTHLY` - Stripe recurring price ID for Team plan
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM` - optional sender name/address
- `EMAIL_SECURE` - set to `true` for secure SMTP

## API Endpoints

### `GET /api/billing/plans`

Returns available plan metadata used by pricing UI.

### `GET /api/billing/subscription`

Returns the authenticated user's current subscription and active plan details.

Requires authenticated `oauth_user` cookie.

### `POST /api/billing/subscription`

Updates the authenticated user's active plan.

Request body:

- `plan`: one of `free`, `pro`, `team`

Requires authenticated `oauth_user` cookie.

### `POST /api/billing/checkout-session`

Creates a Stripe Checkout session for a paid plan (`pro` or `team`) and returns a redirect URL.

Requires authenticated `oauth_user` cookie.

### `POST /api/billing/subscription/cancel`

Marks the current paid subscription to cancel at period end.

Requires authenticated `oauth_user` cookie.

### `POST /api/billing/subscription/resume`

Resumes renewal for a subscription previously set to cancel at period end.

Requires authenticated `oauth_user` cookie.

### `POST /api/billing/stripe/webhook`

Stripe webhook endpoint to confirm checkout and synchronize subscription status updates.

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

### `GET /api/github/search/users`

Returns GitHub user search results for the supplied query string.

Query params:

- `q` required search string
- `per_page` defaults to `8`

## Auth Endpoints

### `GET /auth/github`

Starts the GitHub OAuth flow.

### `GET /auth/google`

Starts the Google OAuth flow.

All callbacks redirect back to the frontend and store the signed-in user in a browser cookie so the dashboard can show the logged-in state.

## Notes

- Requests are made against the public GitHub REST API through the backend proxy.
- CORS is enabled so the frontend can call the backend from `localhost` during development.
- Login notifications are emailed after OAuth succeeds, if SMTP credentials are configured.
