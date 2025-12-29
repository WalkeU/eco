# Docker Development Guide

## Tech Stack

- **Database**: MariaDB 11.8
- **Backend**: Node.js 20 (Alpine) + Express
- **Frontend**: React + Vite
- **Containerization**: Docker + Docker Compose

---

## Quick Start

### Development Mode

```powershell
docker-compose -f docker-compose.dev.yml up
```

### Production Mode

```powershell
docker-compose -f docker-compose.yml up --build
```

---

## Environment Comparison

| Feature                | Development (`docker-compose.dev.yml`) | Production (`docker-compose.yml`) |
| ---------------------- | -------------------------------------- | --------------------------------- |
| **File watching**      | Yes (volume mount)                     | No (code baked in image)          |
| **Hot reload**         | Nodemon + Vite HMR                     | No                                |
| **Dependencies**       | Dev + Production                       | Production only                   |
| **Frontend**           | Vite dev server (port 5173)            | Nginx (port 8080)                 |
| **Build optimization** | None                                   | Full (minify, tree-shake)         |
| **Image size**         | Larger                                 | Smaller                           |
| **Code changes**       | Instant                                | Requires rebuild                  |
| **node_modules**       | Anonymous volume (`/app/node_modules`) | Baked in image                    |

---

## Development Setup

### Services & Ports

- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:3000 (Express API)
- **Database**: MariaDB on port 3306

### Features

- Volume mounts: `./backend:/app` and `./frontend:/app`
- Anonymous volumes prevent host `node_modules` conflicts
- Database healthcheck ensures backend waits for DB
- Automatic `npm install` on container start

### Starting Development Environment

```powershell
# Stop all containers
docker-compose -f docker-compose.dev.yml down

# Start in foreground
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Live Reload Behavior

**Backend**: Nodemon watches for file changes and auto-restarts the server.

**Frontend**: Vite HMR updates the browser instantly without full page reload.

---

## Production Setup

### Services & Ports

- **Frontend**: http://localhost:8080 (Nginx)
- **Backend**: http://localhost:3000 (Express API)
- **Database**: MariaDB on port 3306

### Features

- Code built into image (no volume mounts)
- Production dependencies only (`npm ci --only=production`)
- Optimized Vite build (minified, tree-shaken)
- Nginx serves static frontend assets
- Smaller image sizes

### Starting Production Environment

```powershell
# Stop all containers
docker-compose -f docker-compose.yml down

# Build and start
docker-compose -f docker-compose.yml up --build

# Background mode
docker-compose -f docker-compose.yml up -d --build
```

**Note**: Code changes require full rebuild.

---

## Common Commands

### Development

```powershell
# Restart services
docker-compose -f docker-compose.dev.yml restart backend
docker-compose -f docker-compose.dev.yml restart frontend

# Rebuild containers (package.json changed)
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build

# Install new packages
docker-compose -f docker-compose.dev.yml exec backend npm install
docker-compose -f docker-compose.dev.yml exec frontend npm install

# Shell access
docker-compose -f docker-compose.dev.yml exec backend sh
docker-compose -f docker-compose.dev.yml exec frontend sh

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend
```

### Production

```powershell
# Restart all services
docker-compose -f docker-compose.yml restart

# Rebuild from scratch
docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml build --no-cache
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose -f docker-compose.yml logs -f
```

---

## Troubleshooting

### Database Version Mismatch

**Error**: `Invalid MySQL server downgrade: Cannot downgrade from 90500 to 80407`

**Solution**: Delete the volume and restart

```powershell
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up
```

⚠️ **Warning**: This deletes all database data.

### File Watcher Not Detecting Changes (Windows/WSL2)

**Solution 1**: Set polling in `docker-compose.dev.yml`

```yaml
environment:
  - CHOKIDAR_USEPOLLING=true
```

**Solution 2**: Restart Docker Desktop

### node_modules Issues

The anonymous volume `/app/node_modules` prevents the host from overwriting container dependencies.

**Adding new packages**:

1. Update `package.json`
2. Restart container: `docker-compose -f docker-compose.dev.yml restart backend`
3. Or manually install: `docker-compose -f docker-compose.dev.yml exec backend npm install`

### Port Already in Use

```powershell
# Find process using port
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Kill process
taskkill /PID <pid> /F
```

---

## Configuration Notes

### EXPOSE Directive

`EXPOSE` in Dockerfile is documentation only. Actual port mapping happens in `docker-compose.yml`:

```dockerfile
EXPOSE 3000  # Documentation
```

```yaml
ports:
  - "3000:3000" # Actual mapping
```

### Database Healthcheck

Backend waits for database to be ready:

```yaml
depends_on:
  db:
    condition: service_healthy
```

Prevents connection errors during startup.

### Environment Variables

**Development**: `VITE_API_BASE=http://localhost:3000` (browser-side)

**Production**: May use proxy (e.g., `/api` through Nginx)

---

## Dockerfile Structure

### Development (`Dockerfile.dev`)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

- Installs all dependencies (dev + prod)
- Relies on volume mount for code
- Uses nodemon for hot reload

### Production (`Dockerfile`)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

- Production dependencies only
- Code copied into image
- Optimized for size and security

# dev futtatás

# Leállítás

docker-compose -f docker-compose.dev.yml --env-file .env.dev down

# Rebuild és indítás

docker-compose -f docker-compose.dev.yml --env-file .env.dev up --build

## Skriptek

Itt találhatók a hasznos deployment és build segédfájlok a [scripts](scripts) mappában:

- **Build Images**: PowerShell: [scripts/build-images.ps1](scripts/build-images.ps1) — Bash: [scripts/build-images.sh](scripts/build-images.sh). Builds Docker images for production.

- **Copy to server**: PowerShell: [scripts/copy-to-server.ps1](scripts/copy-to-server.ps1) — Bash: [scripts/copy-to-server.sh](scripts/copy-to-server.sh). Copies built artifacts to the remote server.

- **Deploy Fresh**: PowerShell: [scripts/deploy-fresh.ps1](scripts/deploy-fresh.ps1) — Bash: [scripts/deploy-fresh.sh](scripts/deploy-fresh.sh). Full fresh deployment (use with caution).

- **Deploy Update**: PowerShell: [scripts/deploy-update.ps1](scripts/deploy-update.ps1) — Bash: [scripts/deploy-update.sh](scripts/deploy-update.sh). Incremental deployment for updates.

Példák (PowerShell):

```powershell
# Build images
.\scripts\build-images.ps1

# Copy to server
.\scripts\copy-to-server.ps1 -Server "user@host"

# Deploy fresh
.\scripts\deploy-fresh.ps1 -Server "user@host"
```

Windows-on használd a `.ps1` fájlokat; Linux/WSL esetén a `.sh` verziókat. További részletekért lásd a [scripts](scripts) mappa tartalmát.
