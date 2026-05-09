# Momento

Momento is a social platform focused on sharing memories and inspiration from past events. The platform allows users to publish posts, interact with content, follow other users, and discover service providers.

## Main Features

- User registration and authentication
- Browsing of posts and profiles
- Post creation with multiple images
- Likes, comments, and follows
- Chat
- Notifications
- Provider request system
- Provider profiles and services
- Reports and moderation
- SuperAdmin statistics and logs

## Technologies

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL

## Repository layout

Top-level folders you will work with:

- `admin-frontend/` — admin backoffice (Vite + React)
- `user-frontend/` — public/user-facing frontend (Vite + React)
- `api-gateway/` — gateway routing to services
- `services/` — microservices (auth, user, post, provider, admin, notification, chat)
- `database/` — Prisma schema, migrations, and DB helpers
- `docs/` — documentation

There is also a root `package.json` with helper scripts and `docker-compose.yml` for optional containerized runs.

## Quickstart (recommended)

1) Install all dependencies from the project root:

```bash
npm run install:all
```

Note: after a fresh clone run `npm install` at the repository root once before `npm run install:all` so required root devDependencies (for example `concurrently`) are available. If you prefer, run the per-folder `npm install` commands shown in `docs/local-development.md`.

2) Create `.env` files from each `.env.example` (services + database). Set `DATABASE_URL` in `database/.env`.

3) Create local Postgres DB `momento` and run Prisma migrations:

```sql
CREATE DATABASE momento;
```

From `database/`:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

4) Start everything (frontends + backend):

```bash
npm run dev
```

5) Health checks (examples):

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/auth/health
```

## Useful root scripts

- `npm run dev` — run both frontends and all backend services (uses `concurrently`)
- `npm run dev:backend` — run API gateway + all services
- `npm run dev:user-frontend` — start user frontend
- `npm run dev:admin-frontend` — start admin frontend
- `npm run install:all` — install database, backend services and frontends
- `npm run build:all` — build backend + frontends
- `npm run create:superadmin` — helper to create a superadmin user
- `npm run health` — run repository health check script

## Local development notes

- Prisma configuration and migrations are centralized in `database/` intentionally for the first version.
- Local uploads are used for development phase;
- There are `Dockerfile`s and `docker-compose.yml` for containerized workflows — optional.

## Documentation

See the `docs/` folder for architecture, local development, api and docker documentation:

- `docs/architecture.md`
- `docs/api-documentation.md`
- `docs/local-development.md`
- `docs/docker.md`

---
