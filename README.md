# Auth Service

A Spring Boot authentication service built with Java 21, Maven, PostgreSQL, Spring Security, and JWT-based authentication.

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
├── docker-compose.dev.yml
├── docker-compose.uat.yml
├── docker-compose.prod.yml
├── package.json
├── frontend/
│   └── .gitkeep
├── DOCKER_SETUP.md
├── NGINX_SETUP.md
└── .gitignore
```

## Tech stack

- Java 21
- Spring Boot 3.3.11
- Spring Security
- JWT (access + refresh tokens)
- PostgreSQL
- Docker / Docker Compose
- Maven

## Features

- User registration
- User login
- JWT token generation and validation
- Password hashing with BCrypt
- PostgreSQL persistence
- Nginx reverse proxy support
- Dev / UAT / Prod compose overrides

## Quick start

### Prerequisites

- Java 21
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

## API overview

Base path:

```text
/api/v1
```

Endpoints:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/test-users`
- `GET /api/v1/test-users/{userId}`
- `GET /api/v1/test-users/email/{email}`
- `POST /api/v1/test-users`
- `PUT /api/v1/test-users/{userId}`
- `DELETE /api/v1/test-users/{userId}`

## Security model

- Public endpoints: register and login
- All other endpoints require JWT authentication
- Passwords are encoded with BCrypt
- JWT secret and TTL are configured in `backend/src/main/resources/application.properties`

## Environment configuration

Use environment variables or compose overrides for UAT/Prod secrets.

Examples:

```bash
export UAT_JWT_SECRET=my-uat-secret
export PROD_JWT_SECRET=my-prod-secret
```

## Architecture docs

See:

- `docs/ARCHITECTURE_AND_WORKFLOW.md`

## Troubleshooting

### App cannot connect to PostgreSQL

Check that the app uses the service hostname `postgres` inside Docker and not `localhost`.

Example value:

```properties
spring.datasource.url=jdbc:postgresql://postgres:5432/auth_service
```

### JWT validation fails

Verify that the secret configured in Docker and in the Spring Boot app matches exactly.

## License

This project is intended for internal learning and project development use.
