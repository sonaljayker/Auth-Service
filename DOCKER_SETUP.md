# Auth Service - Docker Setup Guide

This project uses Docker to run both the PostgreSQL database and the Spring Boot application.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Getting Started

### 1. Start PostgreSQL Database

```bash
docker-compose up -d postgres
```

This will:
- Pull the PostgreSQL 15 Alpine image
- Create a container named `auth-service-db`
- Initialize the database with the name `auth_service`
- Map port 5432 on your host to port 5432 in the container
- Store data in a persistent volume named `postgres_data`

### 2. Verify Database is Running

```bash
docker-compose ps
```

You should see the `postgres` service with status `Up`.

### 3. Build the Application Docker Image

```bash
docker build -t auth-service:1.0 .
```

This will:
- Build a multi-stage Docker image
- First stage: Download dependencies and build the JAR
- Second stage: Run the JAR in a lightweight JDK Alpine image

### 4. Run the Application Container

```bash
docker run -d \
  --name auth-service-app \
  -p 8080:8080 \
  --network auth-network \
  auth-service:1.0
```

Alternatively, add this to `docker-compose.yml` and run:

```bash
docker-compose up -d
```

### 5. Verify Both Services are Running

```bash
docker-compose ps
```

You should see:
- `postgres` service running on port 5432
- `auth-service-app` service running on port 8080

## API Endpoints

Once running, the application will be available at `http://localhost:8080`

### Register a New User

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "username": "testuser"
  }'
```

### Login User

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "message": "Login successful"
}
```

## Useful Docker Commands

### View Logs

```bash
# View PostgreSQL logs
docker-compose logs postgres

# View Application logs
docker-compose logs auth-service-app

# View all logs
docker-compose logs -f
```

### Stop All Services

```bash
docker-compose down
```

### Stop and Remove Data

```bash
docker-compose down -v
```

### Access PostgreSQL Shell

```bash
docker exec -it auth-service-db psql -U postgres -d auth_service
```

### Rebuild and Restart Everything

```bash
docker-compose down -v
docker-compose build
docker-compose up -d
```

## Troubleshooting

### PostgreSQL Connection Refused

- Make sure PostgreSQL container is running: `docker-compose ps`
- Wait a few seconds for the database to fully initialize
- Check database logs: `docker-compose logs postgres`

### Application Can't Connect to Database

- Verify both services are on the same network: `auth-network`
- The connection string uses hostname `postgres` (container name)
- Make sure you're not running the app locally against Docker DB without proper networking

### Port Already in Use

```bash
# Check what's using port 5432 or 8080
lsof -i :5432
lsof -i :8080

# Kill the process or change the port mapping in docker-compose.yml
```

## Environment Variables

You can override database credentials by modifying `docker-compose.yml`:

```yaml
environment:
  POSTGRES_USER: your_username
  POSTGRES_PASSWORD: your_password
  POSTGRES_DB: your_database
```

**Note**: Update `src/main/resources/application.properties` accordingly.

## Security Notes

1. **JWT Secret**: Change the default JWT secret in `application.properties` to a production-grade secret
2. **Database Credentials**: Use environment variables or secrets management for production
3. **Network**: The `auth-network` bridge network ensures secure communication between containers
4. **Volumes**: Database data is persisted in the `postgres_data` volume

## Next Steps

- Set up CI/CD pipelines with Docker images
- Use environment variables for configuration management
- Implement secrets management for sensitive data
- Add Redis cache layer if needed
- Configure nginx reverse proxy for production
