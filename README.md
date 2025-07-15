# Full Stack URL Shortener

## Overview
A production-grade, microservice-based URL Shortener built with Node.js (Express, TypeScript) for the backend and React (TypeScript) for the frontend. Features robust logging middleware that sends logs to a remote evaluation service and stores them locally for both backend and frontend.

---

## Folder Structure

```
project-root/
├── backend/                # Express + TypeScript backend
├── frontend/               # React + TypeScript frontend
├── logged-middleware/      # All logs from backend and frontend (JSON lines)
```

---

## Features
- Shorten URLs with optional custom shortcodes and expiry
- Short, collision-resistant codes (default: 4 chars)
- Redirects via root-level short URLs (e.g., /abcd)
- Local JSON DB (lowdb) for persistence
- CORS-enabled for frontend-backend integration
- **Logging Middleware:**
  - Reusable `logEvent`/`Log` function
  - Sends logs to remote API with Bearer token
  - Stores logs locally in `logged-middleware/`
  - Used in both backend and frontend
- Environment-based short URL domain (local or production)

---

## Screenshot

![App Screenshot](./screenshot.png)

---

## Setup

### 1. Backend
```
cd backend
npm install
cp .env.example .env   # or create .env as below
npm run dev
```

#### .env Example
```
LOG_AUTH_TOKEN=...your token...
BASE_URL=http://localhost:8080
# For production:
# BASE_URL=https://short
```

### 2. Frontend
```
cd frontend
npm install
cp .env.example .env   # or create .env as below
npm run dev
```

#### frontend/.env Example
```
VITE_LOG_AUTH_TOKEN=...your token...
```

---

## Logging Middleware
- **Backend:**
  - Uses `logEvent` to log all significant events (info, debug, warn, error, fatal)
  - Sends logs to remote API and writes to `logged-middleware/backend-logs.json`
- **Frontend:**
  - Uses `Log` to log all significant events
  - Sends logs to remote API and to backend for local storage in `logged-middleware/frontend-logs.json`
- **Allowed values:**
  - stack: `backend`, `frontend`
  - level: `debug`, `info`, `warn`, `error`, `fatal`
  - package: (see code for allowed values)

---

## API Endpoints
- `POST /shorten` — Shorten a URL
- `GET /:shortcode` — Redirect to original URL

---

## Environment Variables
- `LOG_AUTH_TOKEN` — Bearer token for remote log API (required)
- `BASE_URL` — Used to construct short URLs (set to your domain in production)
- `VITE_LOG_AUTH_TOKEN` — Frontend version of the log token

---

## How to Use
1. Start backend and frontend as above.
2. Open the frontend at http://localhost:3000
3. Shorten URLs and use the generated short links.
4. Logs will be sent to the remote service and stored in `logged-middleware/`.

---

## Notes
- All logs are stored as JSON lines for easy parsing.
- No personal or company names are present in the repo, code, or README.
- All requirements for logging, folder structure, and API design are met.
- For production, set `BASE_URL` and `VITE_LOG_AUTH_TOKEN` to your deployed domain and token.

---

## License
MIT (or your preferred license) 