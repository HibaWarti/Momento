# Momento — Microservices Architecture

## 1. Architecture Overview

Momento follows a microservices-oriented architecture.  
The application is divided into independent services, each responsible for a specific business domain.

The frontend communicates with the backend through an API Gateway.  
The API Gateway redirects requests to the appropriate service.

## 2. Global Project Structure

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
│   └── notification-service/
├── docs/
└── README.md