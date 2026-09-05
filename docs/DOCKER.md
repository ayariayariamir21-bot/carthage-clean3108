# Docker Documentation

## Overview

This document describes the Docker configuration for the Carthage-Clean project, a monorepo containing:

- **apps/web** - Next.js admin application with PostgreSQL database
- **apps/public-site** - Next.js static public site
- **packages/config** - Shared ESLint/Prettier configuration
- **packages/types** - Shared TypeScript types

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     docker-compose.yml                       │
├─────────────────────────────────────────────────────────────┤
│  postgres:16-alpine     │  web (Next.js)   │  public-site   │
│  Port: 5432             │  Port: 3000      │  Port: 3001    │
│  Volume: postgres_data  │  Standalone      │  Standalone    │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Production

```bash
# 1. Configure environment
cp apps/web/.env.example .env
# Edit .env with your values

# 2. Build and start
docker compose up -d --build

# 3. Verify
curl http://localhost:3000/api/health
curl http://localhost:3001
```

### Development

```bash
# 1. Start development environment
docker compose -f docker-compose.dev.yml up -d --build

# 2. Access applications
# Web app: http://localhost:3000
# Public site: http://localhost:3001
# Database: localhost:5433 (carthage/carthage/carthage_clean_dev)
```

## Services

### PostgreSQL (postgres)

| Property     | Value                             |
| ------------ | --------------------------------- |
| Image        | postgres:16-alpine                |
| Port         | 5432 (prod) / 5433 (dev)          |
| Volume       | postgres_data / postgres_dev_data |
| Healthcheck  | pg_isready                        |
| Init scripts | ./apps/web/db/migrations          |

### Web Application (web)

| Property  | Value                     |
| --------- | ------------------------- |
| Framework | Next.js 15 (standalone)   |
| Port      | 3000                      |
| Build     | Multi-stage Dockerfile    |
| Runtime   | node:20-alpine (non-root) |

### Public Site (public-site)

| Property  | Value                     |
| --------- | ------------------------- |
| Framework | Next.js 15 (standalone)   |
| Port      | 3001                      |
| Build     | Multi-stage Dockerfile    |
| Runtime   | node:20-alpine (non-root) |

## Environment Variables

### Required (.env)

```env
# Database
POSTGRES_USER=carthage
POSTGRES_PASSWORD=<your-secure-password>
POSTGRES_DB=carthage_clean

# Application
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public
ADMIN_EMAIL=admin@example.com
```

### Optional

| Variable    | Default           | Description           |
| ----------- | ----------------- | --------------------- |
| NODE_ENV    | production        | Node environment      |
| PORT        | 3000              | Web app port          |
| ADMIN_EMAIL | admin@example.com | Bootstrap admin email |

## Commands

### Build

```bash
# Production
docker compose build

# Development
docker compose -f docker-compose.dev.yml build
```

### Start

```bash
# Production (detached)
docker compose up -d

# Development (with logs)
docker compose -f docker-compose.dev.yml up
```

### Stop

```bash
# Production
docker compose down

# Development
docker compose -f docker-compose.dev.yml down
```

### Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f web
```

### Database

```bash
# Run migrations
docker compose exec web pnpm --filter @carthage-clean/web db:migrate

# Generate migration
docker compose exec web pnpm --filter @carthage-clean/web db:generate

# Studio
docker compose exec web pnpm --filter @carthage-clean/web db:studio

# Backup
docker compose exec postgres pg_dump -U carthage carthage_clean > backup.sql

# Restore
docker compose exec -T postgres psql -U carthage carthage_clean < backup.sql
```

### Cleanup

```bash
# Stop and remove volumes
docker compose down -v

# Remove all images
docker compose down --rmi all

# Prune system
docker system prune -a
```

## Health Checks

| Service     | Endpoint    | Interval |
| ----------- | ----------- | -------- |
| postgres    | pg_isready  | 10s      |
| web         | /api/health | 30s      |
| public-site | /           | 30s      |

## Security

- **Non-root user**: All containers run as `nextjs` user (UID 1001)
- **No secrets in images**: Environment variables only
- **Secrets**: `.env` files excluded via `.dockerignore`
- **Network isolation**: Internal bridge network
- **Read-only configs**: Config files mounted read-only where possible

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs web

# Check database connection
docker compose exec web env | grep DATABASE_URL

# Test database connection
docker compose exec web pg_isready -h postgres -U carthage
```

### Database Issues

```bash
# Reset database
docker compose down -v
docker compose up -d postgres
docker compose exec web pnpm --filter @carthage-clean/web db:migrate
```

### Permission Issues

```bash
# Fix file permissions
docker compose exec web chown -R nextjs:nodejs /app
```

### Port Conflicts

```bash
# Check used ports
docker compose ps

# Change ports in docker-compose.yml
ports:
  - "3000:3000"  # Change host port if needed
```

## Performance

### Build Optimization

- Multi-stage builds minimize final image size
- pnpm cache mounted during build
- Turbo build cache preserved
- Only production dependencies in runtime

### Runtime Optimization

- Next.js standalone output
- Non-root user
- Minimal base image (Alpine)
- Health checks configured

## Monitoring

### Health Endpoints

- Web: `GET /api/health`
- Public Site: `GET /`
- PostgreSQL: `pg_isready`

### Logs

```bash
# Follow all logs
docker compose logs -f --tail=100

# Specific service
docker compose logs -f --tail=100 web
```

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/ci.yml`) uses the same build process:

```yaml
- name: Build Docker image
  run: docker build .
```

## Rollback

```bash
# Tag current version
docker tag carthage-web:latest carthage-web:v1.0.0

# Rollback
docker tag carthage-web:v1.0.0 carthage-web:latest
docker compose up -d
```
