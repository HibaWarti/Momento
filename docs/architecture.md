# Momento — Microservices Architecture

## 1. Architecture Overview

Momento follows a microservices-oriented architecture.  
The application is divided into independent services, each responsible for a specific business domain.

The frontend communicates with the backend through an API Gateway.  
The API Gateway redirects requests to the appropriate service.

## 2. Database Workspace

The project uses a centralized `database/` folder for Prisma configuration and migrations.

This choice keeps the first version simpler because all services use one PostgreSQL database.  
Later, the project can evolve into one database per service if needed.

## 3. Global Project Structure

```txt
momento/
├── frontend/
├── api-gateway/
├── services/
│   ├── auth-service/
│   ├── user-service/
│   ├── post-service/
│   ├── provider-service/
│   ├── admin-service/
│   ├── notification-service/
│   └── chat-service/
├── database/
├── docs/
└── README.md