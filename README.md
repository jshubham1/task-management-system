# Task Management System

A full‑stack, production‑ready Task Management System with a modern React/Next.js frontend and a robust Spring Boot (
Java 21) backend backed by PostgreSQL. It supports authentication and authorization with JWT, role‑based access,
task/project management, and is containerized via Docker Compose. Optional Nginx reverse proxy is provided for
production.

## Table of Contents

- Overview
- Key Features
- Architecture
- Tech Stack
- Project Structure
- Backend Overview
- Frontend Overview
- Local Development
- Running with Docker Compose
- Environments & Configuration
- API Documentation (OpenAPI/Swagger)
- Security & Authentication
- Testing
- Troubleshooting

## Overview

This repository contains:

- backend/task-management-api: Spring Boot REST API using JPA/Hibernate, JWT security, Mail, and OpenAPI.
- frontend: Next.js 15 (React 19) app styled with Tailwind CSS and modern UI primitives.
- docker-compose.yml: Orchestrates PostgreSQL, backend API, optional frontend, and optional Nginx.

## Key Features

- AuthN/AuthZ: JWT access/refresh tokens, RBAC, CORS config
- Projects & Tasks: CRUD, status, priority, assignment
- Validation & error handling with problem details
- Postgres persistence, virtual threads enabled for scalability
- OpenAPI docs with springdoc
- Developer‑friendly DX: hot reload, typed DTOs, React Query, Zustand

## Architecture

Below is a high‑level architecture. Replace domain/ports as needed.

```mermaid
flowchart LR
  subgraph Client
    U[User Browser]
  end

  subgraph Frontend [Next.js (frontend)]
    FE[Next.js App\nReact 19 + Tailwind\nReact Query]
  end

  subgraph Edge [Optional Nginx]
    NX[Nginx Reverse Proxy]
  end

  subgraph API [Spring Boot (backend/task-management-api)]
    SB[Spring Boot 3.5\nWeb + Security + Validation\nOpenAPI + Mail]
    SEC[JWT Security\nAuth Filters]
    SVC[Services]
    REPO[JPA Repositories]
  end

  subgraph DB [PostgreSQL]
    PG[(task_management)]
  end

  U --> FE
  FE -- HTTPS/REST --> NX
  FE -- HTTPS/REST --> SB
  NX -- Proxy --> SB
  SB --> SEC
  SB --> SVC --> REPO --> PG

  SEC -. issues/verifies .- FE
```

Runtime topology (Docker):

- postgres:15 stores data in named volume `postgres_data`
- backend `task_management_api` exposes 8080, depends on db health
- optional frontend exposes 4200 (compose references an Angular path; see note below)
- optional Nginx exposes 80/443 and proxies to backend/frontend

Note: docker-compose currently points frontend context to `./frontend/task-management-ui` (Angular). This repo’s
frontend is Next.js under `./frontend`. If you intend to run the frontend via Compose, update the `frontend` service
context and ports accordingly.

## Tech Stack

- Frontend: Next.js 15, React 19, Tailwind CSS 4, Headless UI/Radix UI, Zustand, React Hook Form, Zod, TanStack Query
- Backend: Spring Boot 3.5, Java 21 (virtual threads), Spring Web, Security, Validation, Data JPA, Mail
- Database: PostgreSQL 15
- Auth: JSON Web Tokens (jjwt)
- Docs: springdoc-openapi
- Build tools: Maven, Node.js
- Containerization: Docker, Docker Compose, optional Nginx

## Project Structure

```
task-management-system/
├─ backend/
│  └─ task-management-api/
│     ├─ pom.xml
│     ├─ Dockerfile
│     └─ src/main/java/com/taskmanagement/api/
│        ├─ TaskManagementApiApplication.java
│        ├─ config/
│        ├─ controller/
│        ├─ dto/
│        ├─ entity/
│        ├─ enums/
│        ├─ exception/
│        ├─ repository/
│        ├─ security/
│        └─ service/
├─ frontend/
│  ├─ package.json
│  ├─ next.config.ts
│  └─ src/
├─ docker-compose.yml
└─ README.md
```

## Backend Overview

- Layers
    - controller: REST endpoints (e.g., `AuthController`, `ProjectController`)
    - service: business logic (`AuthService`, `ProjectService`, `TaskService`)
    - repository: Spring Data JPA interfaces
    - entity: JPA entities (User, Project, Task, etc.)
    - dto: request/response contracts and validation
    - security: JWT filters, authentication providers, configs
    - exception: global exception handling and problem details
    - config: application and cross‑cutting configuration

- Notable capabilities
    - JWT Access/Refresh token flow with configurable expirations
    - CORS allowlist via `APP_CORS_ALLOWED_ORIGINS`
    - OpenAPI spec and Swagger UI via springdoc
    - Optional email notifications via Spring Mail
    - Virtual threads enabled for improved concurrency (`SPRING_THREADS_VIRTUAL_ENABLED=true`)

- Build/run
    - Maven: `mvn spring-boot:run`
    - Jar: `mvn -DskipTests package` then `java -jar target/*.jar`

## Frontend Overview

- Next.js app with modern UI toolkit, forms, and state management
- API base URL configurable (e.g., `NEXT_PUBLIC_API_BASE_URL` or runtime env)
- Scripts
    - `npm run dev` — start dev server
    - `npm run build` — build for production
    - `npm start` — start production server

## Local Development

Prerequisites

- Java 21, Maven 3.9+
- Node.js 20+ and npm
- Docker Desktop (for Compose)

Run without Docker

1) Start Postgres locally (or via Docker):
    - DB: task_management, User: task_user, Password: SecurePassword123!
2) Backend: `cd backend/task-management-api && mvn spring-boot:run`
3) Frontend: `cd frontend && npm install && npm run dev`

Environment variables

- Backend commonly used (see docker-compose for full list):
    - SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/task_management
    - SPRING_DATASOURCE_USERNAME=task_user
    - SPRING_DATASOURCE_PASSWORD=SecurePassword123!
    - JWT_SECRET=change-me
    - JWT_EXPIRATION=86400000
    - JWT_REFRESH_EXPIRATION=2592000000
    - APP_CORS_ALLOWED_ORIGINS=http://localhost:3000

- Frontend commonly used:
    - NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

## Running with Docker Compose

1) Ensure Docker Desktop is running.
2) From repo root, build and start:
    - `docker compose up -d --build`
3) Services
    - API: http://localhost:8080
    - Postgres: localhost:5432
    - Nginx (optional): http://localhost
    - Frontend (if configured in compose): http://localhost:4200 or http://localhost:3000 (Next.js)

Adjust compose variables as needed. If using Next.js frontend, update the `frontend` service to use `./frontend` context
and expose port 3000.

## Environments & Configuration

- Profiles: default, `docker`
- Logging: `LOGGING_LEVEL_*` envs in compose
- Secrets: never commit secrets. Use `.env` files or docker secrets in production
- Volumes: `postgres_data`, `backend_logs`, `backend_uploads`

## API Documentation (OpenAPI/Swagger)

- Swagger UI: http://localhost:8080/swagger-ui/index.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

The project also includes an OpenAPI generator plugin; the authoritative YAML is under `src/main/resources/openapi.yaml`
in the backend module.

## Security & Authentication

- JWT based: access token and refresh token
- Typical flow
    1) Login with credentials → receive access + refresh tokens
    2) Add `Authorization: Bearer <access_token>` header on subsequent requests
    3) When access token expires, use refresh endpoint to obtain a new access token
- CORS: configured via `APP_CORS_ALLOWED_ORIGINS` env var

## Testing

- Backend: `mvn test`
- Frontend: `npm test` (Jest/RTL) and `npx playwright test` for E2E if configured

## Troubleshooting

- Backend cannot connect to DB inside Docker:
    - Ensure `SPRING_DATASOURCE_URL` points to the service name defined in Compose (`db` by default). The sample
      shows `my_postgres`; set it to `jdbc:postgresql://db:5432/task_management` for Compose networking.
- 404 on Swagger UI:
    - Verify springdoc dependency and that the app is running on 8080
- CORS errors from the browser:
    - Ensure the frontend origin is listed in `APP_CORS_ALLOWED_ORIGINS`
- Compose frontend mismatch:
    - Update the `frontend` service context to `./frontend` for Next.js or provide an Angular app
      under `./frontend/task-management-ui`.
