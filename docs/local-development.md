# Momento — Local Development Guide

## 1. Requirements

Before running the project, make sure you have installed:

- Node.js
- npm
- Git
- PostgreSQL
- VS Code or Trae IDE

## 2. Project Structure

Momento/
- frontend/
- api-gateway/
- services/
  - auth-service/
  - user-service/
  - post-service/
  - provider-service/
  - admin-service/
  - notification-service/
- database/
- docs/
- README.md

## 3. Install Dependencies

Each part has its own dependencies.

### Frontend

Command:

cd frontend  
npm install

### API Gateway

Command:

cd api-gateway  
npm install

### Database Workspace

Command:

cd database  
npm install

### Services

Commands:

cd services/auth-service  
npm install

cd ../user-service  
npm install

cd ../post-service  
npm install

cd ../provider-service  
npm install

cd ../admin-service  
npm install

cd ../notification-service  
npm install

## 4. Environment Variables

Each backend service has a `.env.example` file.

Create a `.env` file in each service folder based on `.env.example`.

The `database/` folder also has its own `.env.example` file.

Create this file:

database/.env

Based on:

database/.env.example

Example for database:

DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/momento?schema=public"

Replace `YOUR_PASSWORD` with your real PostgreSQL password.

Example for API Gateway:

PORT=3000  
FRONTEND_URL=http://localhost:5173

AUTH_SERVICE_URL=http://localhost:3001  
USER_SERVICE_URL=http://localhost:3002  
POST_SERVICE_URL=http://localhost:3003  
PROVIDER_SERVICE_URL=http://localhost:3004  
ADMIN_SERVICE_URL=http://localhost:3005  
NOTIFICATION_SERVICE_URL=http://localhost:3006

## 5. PostgreSQL Setup

Create a local PostgreSQL database named:

momento

You can create it from pgAdmin or with SQL:

CREATE DATABASE momento;

The database connection is configured in:

database/.env

The Prisma schema is located in:

database/prisma/schema.prisma

## 6. Prisma Commands

Run these commands from the `database/` folder.

Format the schema:

npx prisma format

Validate the schema:

npx prisma validate

Run the first migration:

npx prisma migrate dev --name init

Generate Prisma Client:

npx prisma generate

Open Prisma Studio:

npx prisma studio

## 7. Local Ports

Frontend: http://localhost:5173

API Gateway: http://localhost:3000

Auth Service: http://localhost:3001

User Service: http://localhost:3002

Post Service: http://localhost:3003

Provider Service: http://localhost:3004

Admin Service: http://localhost:3005

Notification Service: http://localhost:3006

## 8. Run the Project

From the project root, run all backend services:

npm run dev:backend

Run the full project, including frontend:

npm run dev

Run only the frontend:

npm run dev:frontend

Run only the API Gateway:

npm run dev:gateway

## 9. Health Check Routes

### Direct Service Routes

curl.exe http://localhost:3000/api/health

curl.exe http://localhost:3001/health

curl.exe http://localhost:3002/health

curl.exe http://localhost:3003/health

curl.exe http://localhost:3004/health

curl.exe http://localhost:3005/health

curl.exe http://localhost:3006/health

### Through API Gateway

curl.exe http://localhost:3000/api/auth/health

curl.exe http://localhost:3000/api/users/health

curl.exe http://localhost:3000/api/posts/health

curl.exe http://localhost:3000/api/providers/health

curl.exe http://localhost:3000/api/admin/health

curl.exe http://localhost:3000/api/notifications/health

## 10. Notes

- Do not commit `.env` files.
- Do not commit `node_modules`.
- Use `.env.example` files to document required environment variables.
- The project uses one PostgreSQL database in the first version.
- Prisma configuration and migrations are centralized in the `database/` folder.
- Docker will be added later after the local version is stable.