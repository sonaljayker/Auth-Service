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

- Java 25
- Spring Boot 3.5.6
- Spring Security
- JWT (access + refresh tokens)
- PostgreSQL
- Docker / Docker Compose
- Maven

## Features

- **Enterprise Registration & Login**: Email + Password with BCrypt encryption & JWT (Access + Refresh tokens).
- **Two-Factor Authentication (2FA / TOTP)**: RFC 6238 time-step algorithm with ZXing QR code generation compatible with Google Authenticator, Microsoft Authenticator, and Authy.
- **Passwordless OTP Login**: 6-digit numeric OTP generation with 5-minute TTL, rate-limiting, and Gmail SMTP delivery.
- **Forgot & Reset Password**: Multi-step recovery workflow with secure 6-digit verification code sent via Gmail.
- **Instant Web QR Code Scan Login**: Real-time session QR code generation, browser polling, and instant authentication upon mobile approval.
- **Gmail SMTP Integration**: High-reliability Gmail SMTP dispatch with HTML email templates and console fallback for local testing.
- **PostgreSQL Persistence**: Hibernate entities for users, roles, OTP tokens, password reset tokens, and QR sessions.
- **Nginx Reverse Proxy Support**: TLS termination and routing.
- **Dev / UAT / Prod Compose Overrides**: Production-ready container orchestration.

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

## API overview

Base path:

```text
/api/v1
```

Endpoints:

### Authentication & Security
- `POST /api/v1/auth/register` — Register a new account
- `POST /api/v1/auth/login` — Sign in with password (triggers 2FA challenge if enabled)
- `POST /api/v1/auth/login/2fa-verify` — Complete 2FA login with 6-digit Authenticator code
- `POST /api/v1/auth/otp/send` — Request a 6-digit OTP code to email or phone
- `POST /api/v1/auth/otp/login` — Sign in directly with 6-digit OTP code
- `POST /api/v1/auth/forgot-password` — Request password reset code
- `POST /api/v1/auth/reset-password` — Reset password using verification code
- `GET /api/v1/auth/qr/generate` — Generate real-time Web QR Login session
- `GET /api/v1/auth/qr/status/{sessionToken}` — Poll status of QR Login session
- `POST /api/v1/auth/qr/approve` — Authorize a QR Login session from mobile/client
- `GET /api/v1/auth/2fa/setup` — Generate TOTP secret & QR code for Google/MS Authenticator (Protected)
- `POST /api/v1/auth/2fa/enable` — Verify code and activate 2FA (Protected)
- `POST /api/v1/auth/2fa/disable` — Deactivate 2FA (Protected)

### User Management (Protected)
- `GET /api/v1/test-users`
- `GET /api/v1/test-users/{userId}`
- `GET /api/v1/test-users/email/{email}`
- `POST /api/v1/test-users`
- `PUT /api/v1/test-users/{userId}`
- `DELETE /api/v1/test-users/{userId}`

## Security model

- Public endpoints: register, login, 2fa-verify, otp, forgot-password, reset-password, qr login
- Protected endpoints require Bearer JWT authentication header
- Passwords are encrypted with BCrypt
- TOTP 2FA uses HMAC-SHA1 RFC 6238 standard algorithm
- Gmail SMTP credentials configurable via environment variables (`GMAIL_USERNAME`, `GMAIL_APP_PASSWORD`, `MAIL_ENABLED`)

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
