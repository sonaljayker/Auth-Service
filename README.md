# Auth Service

A Spring Boot authentication service built with Java 25, Maven, PostgreSQL, Spring Security, and JWT-based authentication.

## Project structure

```text
Auth-Service/
├── backend/                     # Java Spring Boot application
│   ├── .mvn/
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
├── docs/
│   └── ARCHITECTURE_AND_WORKFLOW.md
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── package.json
├── frontend/
│   └── .gitkeep
├── DOCKER_SETUP.md
├── NGINX_SETUP.md
└── .gitignore
```

## Tech stack

- Java 25
- Spring Boot 3.5.6
- Spring Security
- JWT (access + refresh tokens)
- PostgreSQL
- Docker / Docker Compose
- Maven

## Features

- **Enterprise Registration & Login**: Email + Password with BCrypt encryption & JWT (Access + Refresh tokens.
- **Passwordless OTP Login**: 6-digit numeric OTP generation with 5-minute TTL, rate-limiting, and Gmail SMTP delivery.
- **Forgot & Reset Password**: Multi-step recovery workflow with secure 6-digit verification code sent via Gmail.
- **Instant Web QR Code Scan Login**: Real-time session QR code generation, browser polling, and instant authentication upon mobile approval.
- **Gmail SMTP Integration**: High-reliability Gmail SMTP dispatch with HTML email templates and console fallback for local testing.
- **PostgreSQL Persistence**: Hibernate entities for users, roles, OTP tokens, password reset tokens, and QR sessions.
- **Nginx Reverse Proxy Support**: TLS termination and routing.

## Quick start

### Prerequisites

- Java 25
- Maven
- Docker Desktop / Docker Engine
- Node.js (optional, only for npm convenience scripts)

### Run with Docker

From the repo root:

```bash
npm run dev:up
```

To stop:

```bash
npm run dev:down
```

For UAT / Prod:

```bash
npm run uat:up
npm run prod:up
```

## Local backend development

From the repo root, run the Spring Boot app directly with Maven:

```bash
cd backend
./mvnw spring-boot:run
```

Or build the package:

```bash
cd backend
./mvnw clean package
```

