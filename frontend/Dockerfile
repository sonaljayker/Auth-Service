# Multi-stage build for React + Vite Frontend
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production server stage
FROM nginx:alpine

# Copy built production assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy internal Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
