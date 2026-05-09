# Momento — Local Development Guide

## 1. Requirements

Before running the project, make sure you have installed:

- Node.js (LTS recommended)
- npm
- Git
- PostgreSQL
- VS Code or another IDE
- (Optional) Docker & Docker Compose

## 2. Project Structure

Momento/ 
- admin-frontend/
- user-frontend/
- api-gateway/
- services/
  - auth-service/
  - user-service/
  - post-service/
  - provider-service/
  - admin-service/
  - notification-service/
  - chat-service/
- database/
- docs/
- docker-compose.yml
- package.json (root)
- README.md

## 3. Install Dependencies

There are two convenient options to install dependencies for the whole repository.

Option A — Install everything from the project root (recommended):

```bash
npm run install:all
```

Note: after a fresh clone run `npm install` at the repository root once before `npm run install:all` so required root devDependencies (for example `concurrently`) are available. Alternatively run the per-folder installs shown in Option B.

Option B — Install parts individually using root helper scripts or by entering each folder.

Examples (root helper scripts):

```bash
npm run install:frontends      # installs both frontends
npm run install:backend        # installs all backend services + gateway
npm run install:database       # installs packages for the database workspace
```

Examples (manual):

```bash
cd admin-frontend 
npm install

cd user-frontend 
npm install

cd api-gateway 
npm install

cd database 
npm install

cd services/auth-service 
npm install
```
And the same for the rest of services

## 4. Environment Variables

Each backend service has a `.env.example` file. Create a `.env` file in each service folder from its `.env.example`.

Also create `database/.env` from `database/.env.example` and populate `DATABASE_URL`.

Example database connection:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/momento?schema=public"
```

Example API Gateway variables (example values):

```
PORT=3000
FRONTEND_URL=http://localhost:5173
ADMIN_FRONTEND_URL=http://localhost:5174

AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
POST_SERVICE_URL=http://localhost:3003
PROVIDER_SERVICE_URL=http://localhost:3004
ADMIN_SERVICE_URL=http://localhost:3005
NOTIFICATION_SERVICE_URL=http://localhost:3006
CHAT_SERVICE_URL=http://localhost:3007
```

Adjust ports and URLs in each service's `.env` as needed.

## 5. PostgreSQL Setup

Create a local PostgreSQL database named `momento`:

```sql
CREATE DATABASE momento;
```

Configure the connection string in `database/.env` as shown above.

The Prisma schema lives at `database/prisma/schema.prisma`.

## 6. Prisma Commands

Run these commands from the `database/` folder.

```bash
npx prisma format
npx prisma validate
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio
```

## 7. Local Ports / How to verify

- API Gateway: http://localhost:3000 (default)
- Backend services: typically start at 3001..3007 — check each service's `package.json`/`.env`
- Frontends: `user-frontend` and `admin-frontend` (Vite defaults to 5173). Verify each frontend's dev script or `.env` for exact ports.

Use the root helper scripts to run services (these use `concurrently`):

## 8. Run the Project (root scripts)

From the project root you can use the provided npm scripts to run or build everything.

Start everything (both frontends + backend):

```bash
npm run dev
```

Start backend services only:

```bash
npm run dev:backend
```

Start a single piece (examples):

```bash
npm run dev:user-frontend   # run user frontend
npm run dev:admin-frontend  # run admin frontend
npm run dev:gateway         # run API gateway only
```

Install helpers you may also use:

```bash
npm run install:all         # install database, backend and frontends
npm run install:backend
npm run install:frontends
```

Build everything:

```bash
npm run build:all
```

Other useful root scripts:

- `npm run create:superadmin` — run the helper script to create a superadmin user (requires ts-node and proper env).
- `npm run health` — quick health check script (calls `scripts/check-health.js`).

## 9. Health Check Routes

### Direct Service Routes

Use the ports shown when services are running (examples):

```bash
curl http://localhost:3000/api/health
curl http://localhost:3001/health
curl http://localhost:3002/health
```

### Through API Gateway

```bash
curl http://localhost:3000/api/auth/health
curl http://localhost:3000/api/users/health
curl http://localhost:3000/api/posts/health
```

## 10. Docker / Compose

This repo contains `docker-compose.yml`. You can use Docker to run the database and services if you prefer containerized local development. The compose file is not a required step for quick local dev but is available for CI/production-like runs.

See `docs/docker.md` for a short Compose quickstart, commands, and troubleshooting tips.

## 11. Notes

- Do not commit `.env` files.
- Do not commit `node_modules`.
- Use `.env.example` files to document required environment variables.
- The project uses a centralized `database/` workspace for Prisma configuration and migrations.
- The repo provides root npm scripts to make local setup quicker (`install:all`, `dev`, `build:all`, etc.).
