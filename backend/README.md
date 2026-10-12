# Backend API

Express and MongoDB API for the Online Campaign Against Forced Marriage site.

## Structure

- `config/` — database connection setup
- `controllers/` — request handling and application logic
- `middleware/` — authentication and authorization
- `models/` — Mongoose schemas
- `routes/` — endpoint declarations
- `scripts/` — one-off maintenance and seed commands
- `app.js` — Express configuration and route mounting
- `index.js` — database connection and HTTP server startup

## Run locally

From this directory, configure `MONGO_URI` and `JWT_SECRET` in your local environment, then run `npm start`. The server listens on port `5000` unless `PORT` is set. Never commit real credentials.

Run `npm run seed` to add the sample FAQs and resources without deleting existing records. To create an initial administrator with the seed script, provide `SEED_ADMIN_USERNAME` and `SEED_ADMIN_PASSWORD` in the environment. The script does not print credentials.

## API routes

- `GET /` and `GET /api/health` — service health
- `/api/auth` — registration, login, and current user
- `/api/posts` — community posts
- `/api/reports` — case reports and admin updates
- `/api/content` — FAQs and resources
