# Backend Service

This folder contains the Java Spring Boot application for the Auth Service.

## Purpose

The backend provides:

- user registration
- login with JWT generation
- password hashing
- user CRUD operations
- database persistence via PostgreSQL
- secured API endpoints using Spring Security

## Stack

- Java 21
- Maven
- Spring Boot 3.3.11
- PostgreSQL
- Spring Security
- JWT

## Folder structure

```text
backend/
├── .mvn/
├── src/
├── Dockerfile
├── pom.xml
├── mvnw
├── mvnw.cmd
└── target/   # generated on build
```

## Run locally

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

## Build jar

```bash
cd backend
./mvnw clean package -DskipTests
```

## Docker build

The Docker image is built from this folder:

```bash
cd backend
docker build -t auth-service-backend .
```

## Application properties

Configuration is stored in:

```text
backend/src/main/resources/application.properties
```

Important keys include:

- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`
- `security.jwt.secret`
- `security.jwt.access-ttl-seconds`
- `security.jwt.refresh-ttl-seconds`

## API examples

Register:

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","username":"user1"}'
```

Login:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

## Notes

- The backend is meant to run with the compose setup at the repo root.
- For production, keep secrets out of source control and set them via environment variables.
