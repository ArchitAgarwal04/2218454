# URL Shortener Backend

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Create a `.env` file in the backend directory with:
   ```
   LOG_AUTH_TOKEN=your_token_here
   ```
   (Already set up for you.)

3. Start the development server:
   ```
   npm run dev
   ```
   The backend will run on `http://localhost:8080` by default.

## Folder Structure
- `src/routes/` - Express route definitions
- `src/controllers/` - Route controllers
- `src/services/` - Business logic and DB
- `src/middleware/` - Middleware (e.g., logging)
- `src/utils/` - Utility functions (e.g., logger)
- `src/types/` - Shared TypeScript types
- `data/db.json` - Local JSON DB (auto-created)

## API Endpoints
- `POST /shorten` - Shorten a URL
- `GET /shorturls/:shortcode` - Get stats for a shortcode
- `GET /go/:shortcode` - Redirect to original URL

## Logging
All logs are sent to the remote evaluation service using the provided token. No `console.log()` is used for application events.

## Frontend Integration
- The backend is CORS-enabled for `http://localhost:3000`.
- The frontend should set its API base URL to `http://localhost:8080`. 