# Architecture & Workflow

This document describes the high-level architecture, runtime components, and request flows for the Auth-Service project (branch: `fix-auth-login-flow`). It also includes deployment and troubleshooting notes to help developers and operators run, debug, and extend the system.

## Overview

Auth-Service is a Spring Boot-based authentication microservice that provides registration, login, and user management APIs. It uses JWTs (access + refresh tokens) for stateless authentication and PostgreSQL as the persistent store. Nginx is included as an optional reverse proxy for TLS termination, routing and public endpoints.

Key runtime components:
- nginx (optional reverse-proxy)
- app (Spring Boot service under `backend/`)
- postgres (database container)

The repo is organized with the Java/Maven project inside `backend/`. Docker compose files and infrastructure docs remain at the repository root.

## Architecture (logical)

Client (browser / mobile / API client)
  ↓ HTTPS
Nginx (reverse proxy)
  ↓ Internal Docker network
Spring Boot app (auth-service)
  ↓ JDBC
PostgreSQL

Files location (important):
- backend/ — all Java, Maven and Dockerfile for building the app
- docker-compose.yml — root-level compose that brings up postgres, app, nginx
- docker-compose.*.yml — environment-specific overrides (dev/uat/prod)
- docs/ — explanatory documentation (this file)

## Runtime Docker setup

Docker compose brings up 3 services:
- postgres: `postgres:15-alpine`, DB data persisted by `postgres_data` volume. In dev and uat the port `5432` is published to host.
- app: built from `backend/` (Dockerfile lives in backend). JVM listens on port 8080 inside the container. The compose file maps backend context for building the image.
- nginx: optional reverse-proxy using configuration at `nginx/nginx.conf` (mounted into the container).

Start commands (root):
- Development: `npm run dev:up` (uses `docker-compose.yml` + `docker-compose.dev.yml`)
- UAT: `npm run uat:up`
- Prod: `npm run prod:up`

(See `package.json` for convenience scripts.)

## API endpoints

Base path: `/api/v1`

Authentication endpoints (open):
- POST /api/v1/auth/register — create user (returns created user DTO)
- POST /api/v1/auth/login — login (returns accessToken + refreshToken)

User management endpoints (protected / example):
- GET /api/v1/test-users — get all test users (example controller)
- GET /api/v1/test-users/{userId} — get by id
- GET /api/v1/test-users/email/{email} — get by email
- POST /api/v1/test-users — create test user
- PUT /api/v1/test-users/{userId} — update
- DELETE /api/v1/test-users/{userId} — delete

Note: Security rules are configured in `SecurityConfig` to allow the register and login endpoints and require authentication for all other endpoints.

## Authentication flow (sequence)

1. Register
   - Client sends POST /api/v1/auth/register with {email, password, username, ...}
   - AuthServiceImp.register validates payload, encodes password with PasswordEncoder (BCrypt), then calls UserService.createUser which persists the user in Postgres.
   - Returns created UserDto (without raw password).

2. Login
   - Client sends POST /api/v1/auth/login with {email, password}
   - AuthServiceImp.login validates payload, loads stored User by email, verifies password using PasswordEncoder.matches().
   - If successful, JwtService.generateAccessToken(user) and generateRefreshToken(user, jti) are called.
   - Response contains JSON: { accessToken, refreshToken, message }

3. Using access token
   - For protected requests, client sends `Authorization: Bearer <accessToken>` header.
   - JwtAuthenticationFilter extracts token, verifies it (JwtService.parse), and verifies `typ` claim equals `access`.
   - If token valid, the filter loads user by id, builds a UsernamePasswordAuthenticationToken with authorities and sets the SecurityContext.
   - The controller receives request as an authenticated principal.

4. Refresh token flow (recommended pattern)
   - Client sends refresh token to a refresh endpoint (not provided yet) or your front end should request new tokens from server.
   - JwtService.isRefreshToken(token) checks `typ` claim equals `refresh` and a new access token is generated.
   - Recommended: store refresh jti or maintain invalidation list to support logout or refresh revocation.

## Data model highlights

- `User` (entity): maps to `users` table, implements `UserDetails` for Spring Security integration. Uses UUID primary keys.
- `Role` (entity): roles for users. Many-to-many with `User` (eager fetch in current model).
- DTOs: `UserDto`, `RoleDto`, `ErrorResponse` used to shape API responses.

## Security notes

- Secrets in `src/main/resources/application.properties` (development): `security.jwt.secret`, `security.jwt.access-ttl-seconds`, etc. For production, override these using environment variables (docker-compose environment or a secrets manager).
- JwtService constructs HMAC signing key from the shared secret. Keep secret secure and at least 256-bit length recommended.
- `SecurityConfig` disables CSRF and uses stateless session management; register/login paths are open.
- Passwords are stored as BCrypt hashes via `PasswordEncoder` bean.

## Deployment & environment settings

- The main compose file at root plus env-specific overlays are used by npm scripts.
- For production, do NOT keep secrets in repo — use env vars, GitHub Secrets, or a secrets manager and inject them at runtime.
- To bind Postgres only to localhost (safer for dev on multi-tenant hosts), set port mapping to `127.0.0.1:5432:5432` in `docker-compose.dev.yml`.

## Running locally (quick)

1. Ensure Docker / docker-compose installed and running.
2. From repo root:
   - npm run dev:up
   - wait for containers to start: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps`
   - check logs: `npm run logs` or `docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f app`
3. Test register: `curl -X POST http://localhost:8080/api/v1/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"pass","username":"user"}'`
4. Test login: `curl -X POST http://localhost:8080/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"pass"}'`

## CI / Build suggestions

- When building in CI, set working-directory to `backend/` or use `mvn -f backend/pom.xml`.
- Example GitHub Actions snippet to build & test backend:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: temurin
      - name: Build with Maven
        run: mvn -f backend/pom.xml -B clean package -DskipTests
```

## Troubleshooting

- If `docker-compose up` fails to reach the DB:
  - Check `docker-compose logs postgres` for Postgres startup errors.
  - Ensure `POSTGRES_PASSWORD` and `POSTGRES_USER` are set to expected values.
  - If the app container tries to use `localhost:5432`, ensure `SPRING_DATASOURCE_URL` uses `postgres:5432` inside containers.

- If JWT errors occur:
  - Verify `security.jwt.secret` is identical for sign/verify.
  - Ensure tokens used for protected requests are `typ=access` tokens (the code checks this claim).

- If roles/authorities missing or permission denied:
  - Check the `roles` table and `User.roles` mapping; currently roles are fetched eagerly.

## Next steps / Improvements

- Add a refresh-token API endpoint and token revocation support.
- Move sensitive configuration out of application.properties and into environment/secret store.
- Add OpenAPI docs exposure and secure swagger in non-prod only.
- Add integration tests that spin up postgres using Testcontainers and run key flows.

---

Repository reference: branch `fix-auth-login-flow` — backend path: `backend/`.
