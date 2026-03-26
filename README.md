# GitHub Profile Analysis Tool

An Express.js backend API that fetches and analyzes public GitHub profile data using the GitHub REST API.

## Features

- Fetch public profile details for any GitHub user.
- Fetch repositories with pagination and sorting.
- Return a language usage summary (based on the user's recent repositories).
- Handle common API failures (not found, rate limits, and generic errors).
- Use a GitHub token from environment variables for better rate limits.

## Tech Stack

- Node.js
- Express
- Axios
- CORS
- dotenv

## Project Structure

```text
Github-profile-analysis-tool/
|- backend/
|  |- server.js
|- package.json
|- README.md
```

## Prerequisites

- Node.js 18+
- npm
- A GitHub Personal Access Token (recommended)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```env
GITHUB_TOKEN=your_github_personal_access_token
PORT=5000
```

3. Start the server:

```bash
node backend/server.js
```

Server default URL: `http://localhost:5000`

## API Endpoints

### 1) Health Check

- Method: `GET`
- Route: `/`
- Response: `GitHub API Running`

### 2) Get User Profile

- Method: `GET`
- Route: `/api/github/:username`
- Example:

```http
GET /api/github/octocat
```

### 3) Get User Repositories

- Method: `GET`
- Route: `/api/github/:username/repos`
- Query params:
  - `page` (default: `1`)
  - `per_page` (default: `10`)
  - `sort` (`created`, `updated`, `pushed`, `full_name`; default: `updated`)
  - `direction` (`asc` or `desc`; default: `desc`)
- Example:

```http
GET /api/github/octocat/repos?page=1&per_page=10&sort=updated&direction=desc
```

Response includes:

- `data`: array of repositories
- `pagination`: metadata (`page`, `per_page`, `total_pages`, `has_next`, `has_prev`)

### 4) Get Language Summary

- Method: `GET`
- Route: `/api/github/:username/languages`
- Example:

```http
GET /api/github/octocat/languages
```

Returns a language-frequency object based on up to 100 repositories.

## Error Responses

The API returns JSON error messages with appropriate status codes:

- `404`: `User not found`
- `403`: `Rate limit exceeded`
- `500`: Generic fetch failure (depends on endpoint)

## Notes

- GitHub requests are authenticated using `GITHUB_TOKEN`.
- If you skip the token, rate limits are much lower and requests may fail sooner.
- Keep your token private and never commit `.env` to source control.
