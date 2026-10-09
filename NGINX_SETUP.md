# Nginx Reverse Proxy Configuration Guide

## Overview

Nginx is configured as a reverse proxy in front of the Spring Boot application. It handles:
- SSL/TLS termination (when configured)
- Load balancing
- Request routing
- Security headers
- CORS configuration
- Rate limiting (can be added)
- Request/response caching (can be added)

## Architecture

```
Client → Nginx (Port 80/443) → Spring Boot App (Port 8080) → PostgreSQL
```

## Quick Start

Start all services including Nginx:

```bash
docker-compose up -d
```

Access the application:
- **API**: http://localhost/api/v1/auth/register
- **Health**: http://localhost/health
- **Swagger UI**: http://localhost/swagger-ui/ (if enabled)

## Nginx Configuration Details

### Upstream Configuration

```nginx
upstream auth_service {
    server app:8080;
}
```

- Defines the backend server (Spring Boot app)
- Uses internal Docker network name `app`

### Server Configuration

**Listen Port**: 80 (HTTP)

**Security Headers**:
- `X-Frame-Options`: Prevents clickjacking attacks
- `X-Content-Type-Options`: Prevents MIME type sniffing
- `X-XSS-Protection`: Enables browser XSS protection
- `Referrer-Policy`: Controls referrer information
- `Permissions-Policy`: Restricts sensitive browser features

**CORS Headers**:
- Allows cross-origin requests
- Configured for all methods: GET, POST, PUT, DELETE, OPTIONS
- Handles preflight requests automatically

### Location Blocks

#### 1. Root Path `/`
Routes all requests to the Spring Boot application:
```nginx
location / {
    proxy_pass http://auth_service;
    # ... proxy settings
}
```

#### 2. Health Check `/health`
Dedicated endpoint for health monitoring:
```nginx
location /health {
    proxy_pass http://auth_service/actuator/health;
    access_log off;  # Disable logging for health checks
}
```

#### 3. API Endpoints `/api/`
Specific routing for all API calls:
```nginx
location /api/ {
    proxy_pass http://auth_service;
    # ... proxy settings
}
```

#### 4. Swagger/OpenAPI `/swagger-ui/` and `/v3/api-docs`
Routes API documentation requests to the Spring Boot app

#### 5. Security `/`
Denies access to hidden files and directories:
```nginx
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}
```

## Proxy Settings Explained

```nginx
proxy_http_version 1.1;              # Use HTTP/1.1 for connections
proxy_set_header Upgrade $http_upgrade;    # Support WebSocket upgrades
proxy_set_header Connection 'upgrade';     # Keep connections alive
proxy_set_header Host $host;          # Forward original host
proxy_set_header X-Real-IP $remote_addr;   # Client's real IP
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # Client IP chain
proxy_set_header X-Forwarded-Proto $scheme;  # Original protocol (http/https)
proxy_cache_bypass $http_upgrade;     # Don't cache WebSocket requests
proxy_read_timeout 90s;               # Backend read timeout
proxy_connect_timeout 75s;            # Backend connection timeout
```

## Using Nginx with Docker

### Check Nginx Status

```bash
docker-compose ps nginx
```

### View Nginx Logs

```bash
# Real-time logs
docker-compose logs nginx -f

# Last 50 lines
docker-compose logs nginx --tail=50
```

### Reload Nginx Configuration

```bash
# Reload without stopping
docker exec auth-service-nginx nginx -s reload

# Test configuration
docker exec auth-service-nginx nginx -t
```

### Enter Nginx Container

```bash
docker exec -it auth-service-nginx sh
```

## Testing Nginx

### Test Registration

```bash
curl -X POST http://localhost/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser"
  }'
```

### Test Login

```bash
curl -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Health Endpoint

```bash
curl http://localhost/health
```

### Test with Headers

```bash
curl -v http://localhost/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "pass123", "username": "user"}'
```

Check response headers:
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Access-Control-Allow-Origin`
- etc.

## SSL/TLS Configuration (HTTPS)

### Generate Self-Signed Certificate (Testing Only)

```bash
mkdir -p nginx/ssl

openssl req -x509 -newkey rsa:4096 -keyout nginx/ssl/private.key \
  -out nginx/ssl/certificate.crt -days 365 -nodes \
  -subj "/C=US/ST=State/L=City/O=Org/CN=localhost"
```

### Update Nginx Configuration for HTTPS

Add to `nginx/nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name localhost;

    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name localhost;
    return 301 https://$server_name$request_uri;
}
```

### Update docker-compose.yml for HTTPS

```yaml
nginx:
  ports:
    - "80:80"
    - "443:443"
```

### Test HTTPS Connection

```bash
curl -k https://localhost/health
```

## Performance Optimization

### Enable Gzip Compression

Add to `nginx/nginx.conf`:

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript 
           application/json application/javascript application/xml+rss 
           application/rss+xml font/truetype font/opentype 
           application/vnd.ms-fontobject image/svg+xml;
```

### Enable Caching

Add to `nginx/nginx.conf`:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 1m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    add_header X-Cache-Status $upstream_cache_status;
    # ... rest of configuration
}
```

### Rate Limiting

Add to `nginx/nginx.conf`:

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/v1/auth/login {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://auth_service;
    # ... rest of configuration
}
```

## Monitoring

### Enable Access Logs

Access logs are enabled by default in Nginx:

```bash
# View access logs
docker exec auth-service-nginx tail -f /var/log/nginx/access.log
```

### Enable Error Logs

```bash
# View error logs
docker exec auth-service-nginx tail -f /var/log/nginx/error.log
```

## Troubleshooting

### 502 Bad Gateway

Means Nginx can't reach the backend app. Check:

```bash
# 1. Verify app is running
docker-compose ps app

# 2. Check app logs
docker-compose logs app

# 3. Verify network connectivity
docker network inspect auth-network

# 4. Test connection from nginx container
docker exec auth-service-nginx curl -i http://app:8080/api/v1/auth/register
```

### Connection Timeout

Increase timeout values in nginx.conf:

```nginx
proxy_read_timeout 120s;
proxy_connect_timeout 90s;
```

### Port Already in Use

```bash
# Check what's using port 80
lsof -i :80

# Change port in docker-compose.yml
# From: "80:80"
# To: "8000:80"
```

### Nginx Won't Start

Test configuration:

```bash
# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Check logs
docker-compose logs nginx
```

## Production Considerations

1. **Use Real SSL Certificates**:
   - Let's Encrypt (free)
   - DigiCert, GlobalSign, etc.

2. **Enable HTTPS Only**:
   - Redirect all HTTP to HTTPS
   - Use HSTS headers

3. **Load Balancing**:
   - Multiple backend instances
   - Health checks

4. **Security**:
   - Disable server version disclosure
   - Implement WAF rules
   - Rate limiting
   - IP whitelisting

5. **Monitoring**:
   - Enable access/error logs
   - Monitor upstream health
   - Set up alerts

6. **Backup Configuration**:
   - Keep nginx.conf in version control
   - Document custom settings

## Next Steps

1. Start all services: `docker-compose up -d`
2. Test endpoints through Nginx
3. Monitor logs: `docker-compose logs -f`
4. For production, configure SSL/TLS
5. Implement additional security measures
6. Set up monitoring and alerting
