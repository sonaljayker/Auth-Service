# Auth Service - Docker Setup Guide

This project uses Docker to run both the PostgreSQL database and the Spring Boot application.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

### Start Everything in One Command

```bash
docker-compose up -d
```

This will:
- Pull and start PostgreSQL 15 Alpine container
- Build the Spring Boot application Docker image
- Start the application container
- Create a shared network for communication between containers
- Expose the API on `http://localhost:8080`
- Expose PostgreSQL on `localhost:5432` (if needed for debugging)

### Verify Services are Running

```bash
docker-compose ps
```

Expected output:
```
NAME                COMMAND                  SERVICE      STATUS      PORTS
auth-service-app    "java -jar app.jar"     app          Up (healthy)
auth-service-db     "postgres"              postgres     Up (healthy)
```

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

Response (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "testuser",
  "enable": true,
  "provider": "LOCAL",
  "createdAt": "2026-10-09T13:00:00Z",
  "updatedAt": "2026-10-09T13:00:00Z"
}
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

Response (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE2OTcwMDAwMDAsImV4cCI6MTY5NzAwMDkwMCwiaXNzIjoiYXV0aC1zZXJ2aWNlIiwianRpIjoiYTAwZTg0MzAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAwIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6W10sInR5cCI6ImFjY2VzcyJ9.signature",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE2OTcwMDAwMDAsImV4cCI6MTY5NzYwNDgwMCwiaXNzIjoiYXV0aC1zZXJ2aWNlIiwianRpIjoiYTAwZTg0MzAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAwIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6W10sInR5cCI6InJlZnJlc2gifQ.signature",
  "message": "Login successful"
}
```

### Use Access Token for Protected Endpoints

```bash
curl -X GET http://localhost:8080/api/v1/test-users \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

## Docker Compose Services

### PostgreSQL Service

- **Image**: postgres:15-alpine
- **Container Name**: auth-service-db
- **Port**: 5432
- **Database**: auth_service
- **Username**: postgres
- **Password**: postgres
- **Volume**: postgres_data (persistent storage)
- **Network**: auth-network
- **Health Check**: Enabled - waits for database to be ready

### Application Service

- **Build**: Dockerfile (multi-stage build)
- **Container Name**: auth-service-app
- **Port**: 8080
- **Environment**: Uses Docker environment variables for configuration
- **Network**: auth-network (connects to PostgreSQL)
- **Depends On**: postgres (waits for health check)
- **Restart Policy**: unless-stopped

## Important Configuration

The application uses Docker-based configuration:

**Database Connection** (from docker-compose.yml):
```
SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/auth_service
```

Note: The hostname is `postgres` (the service name in docker-compose), NOT `localhost`

**JWT Configuration**:
```
SECURITY_JWT_SECRET: change-me-please-this-is-very-long-secret-key-1234567890
SECURITY_JWT_ACCESS_TTL_SECONDS: 900 (15 minutes)
SECURITY_JWT_REFRESH_TTL_SECONDS: 604800 (7 days)
SECURITY_JWT_ISSUER: auth-service
```

## Useful Docker Commands

### View Logs

```bash
# View application logs
docker-compose logs app -f

# View PostgreSQL logs
docker-compose logs postgres -f

# View all logs
docker-compose logs -f
```

### Stop All Services

```bash
docker-compose down
```

### Stop and Remove All Data

```bash
docker-compose down -v
```

### Rebuild Application Image

```bash
docker-compose build app
```

### Rebuild Everything

```bash
docker-compose up -d --build
```

### Access PostgreSQL Shell

```bash
docker exec -it auth-service-db psql -U postgres -d auth_service
```

Useful PostgreSQL commands:
```sql
-- List tables
\dt

-- Describe users table
\d users

-- Query all users
SELECT * FROM users;

-- Exit
\q
```

### View Network

```bash
docker network ls
docker network inspect auth-network
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 8080 or 5432
lsof -i :8080
lsof -i :5432

# Modify port mappings in docker-compose.yml
# Example: "9090:8080" to use port 9090 on host
```

### Application Can't Connect to Database

1. Verify PostgreSQL is healthy:
   ```bash
   docker-compose logs postgres
   ```

2. Verify both services are on the same network:
   ```bash
   docker network inspect auth-network
   ```

3. Check application logs:
   ```bash
   docker-compose logs app
   ```

### Database Connection Refused

- Wait 10-15 seconds for PostgreSQL to fully initialize
- The health check ensures the app starts only after the database is ready
- Check the logs for connection errors

### Rebuild Everything

If something goes wrong, start fresh:

```bash
# Stop and remove everything
docker-compose down -v

# Rebuild all images
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

## Production Considerations

1. **Change Default Credentials**:
   - Update POSTGRES_PASSWORD in docker-compose.yml
   - Update SPRING_DATASOURCE_PASSWORD

2. **Change JWT Secret**:
   - Replace with a strong, random secret in docker-compose.yml
   - Use 32+ characters

3. **Use Environment Files**:
   Create `.env` file:
   ```
   POSTGRES_USER=prod_user
   POSTGRES_PASSWORD=very_secure_password_here
   JWT_SECRET=production_grade_secret_key_here
   ```

4. **Use Secrets Management**:
   - Docker Swarm Secrets
   - Kubernetes Secrets
   - AWS Secrets Manager
   - HashiCorp Vault

5. **Security Hardening**:
   - Remove unnecessary ports
   - Use read-only filesystems where possible
   - Run containers as non-root users
   - Use network policies

## Next Steps

1. Start the containers: `docker-compose up -d`
2. Test the API endpoints with curl or Postman
3. Monitor logs: `docker-compose logs -f`
4. For production, implement proper secrets management
5. Consider adding reverse proxy (Nginx) in front of the app
6. Set up CI/CD pipelines for automated builds and deployments
