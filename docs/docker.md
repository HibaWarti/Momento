# Momento — Docker / Compose Quickstart

## Purpose

This document explains how to use the repository `docker-compose.yml` and Dockerfiles for local, reproducible development. It is optional — you can still run services locally using the Node/Vite dev scripts — but Compose helps run the database and services in containers and mirrors production wiring.

## What the compose file provides (typical)

- A PostgreSQL service with a persistent volume for data
- Optionally a service for the `database/` workspace (Prisma migrations)
- Optionally service containers built from the `services/*` and `api-gateway/` Dockerfiles
- Network wiring and port mappings so frontends and gateway can reach backend services

## Before you run

- Copy any `.env.example` files to `.env` in the appropriate folders (services + `database/`).
- Optionally create a separate env file for Docker (recommended): `.env.docker` and reference it in `docker-compose` if used.
- Confirm ports in `.env` do not conflict with host processes.

## Quick commands

Start containers (foreground) and build images if needed:

```bash
docker compose up --build
```

Start in background (detached):

```bash
docker compose up --build -d
```

Stop and remove containers, networks (preserves volumes by default):

```bash
docker compose down
```

View logs (all services):

```bash
docker compose logs -f
```

View logs for a single service (example `api-gateway`):

```bash
docker compose logs -f api-gateway
```

Run a one-off command inside a service container (example: open a shell):

```bash
docker compose exec api-gateway sh
# or for a node container
docker compose exec services_auth-service sh
```

## Running Prisma migrations inside containers

If the compose setup exposes a `database`/`prisma` container, run migrations there. Example (adjust the service name used in your compose file):

```bash
docker compose exec database npx prisma migrate deploy
# or
docker compose exec api-gateway npx prisma migrate deploy --schema=/path/to/database/prisma/schema.prisma
```

If you prefer to run migrations from the host against the containerized DB:

```bash
# ensure DATABASE_URL in database/.env points to the container DB host and port
cd database
npx prisma migrate dev --name init
```

## Ports & Volumes

- DB data is stored in a docker volume (check `volumes:` in the compose file). This ensures data persists across container restarts.
- Typical port mappings (examples):
  - Postgres: 5432 -> 5432
  - API Gateway: 3000 -> 3000
  - Frontend (if containerized): 5173 -> 5173

Adjust host port numbers in compose or local `.env` files when ports conflict.

## Environment variables

- Keep secret values out of committed files. Use `.env` or `.env.docker` (and add them to `.gitignore`).
- The compose file may reference service-specific `.env` files; check the top of `docker-compose.yml` for which env files are used.

## Troubleshooting

- "Port already in use": stop the host process using that port or change the port mapping in `docker-compose.yml`.
- "Permission denied" when mounting volumes on Windows: try using named volumes instead of host paths or configure Docker Desktop shared drives.
- Container fails to start due to missing env: ensure each service has the required `.env` entries or provide them via Compose env.

## Optional: building a single service

Build only the gateway and start it (example):

```bash
docker compose build api-gateway
docker compose up -d api-gateway
```

## Cleanup

Remove containers, images and volumes when you want a full reset (use carefully):

```bash
docker compose down --rmi all --volumes
```

## CI / Production notes

- The compose file is intended for local development and testing. For production, use a proper orchestration platform (Kubernetes, ECS) and secure secrets management.
- Tag images and push to a registry if you want CI to build and promote images.

---
