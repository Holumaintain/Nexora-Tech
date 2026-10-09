# Nexora Technologies — Docker & Containerization Documentation

## 1. Overview

Nexora Technologies is a full-stack web application consisting of:

* A static frontend served by Nginx
* A Node.js + TypeScript + Express backend
* MongoDB Atlas as the application database
* Docker containers for the frontend and backend
* Docker Compose for local multi-container orchestration

The Docker implementation provides a reproducible environment for development, testing, deployment preparation, and future CI/CD automation.

The containerization architecture is designed to support the later DevOps stages of the project:

```text
Docker
   ↓
Amazon ECR
   ↓
Terraform AWS Infrastructure
   ↓
EC2 / EKS
   ↓
Ansible Configuration
   ↓
Jenkins CI/CD
   ↓
Kubernetes Deployment
```

---

# 2. Project Architecture

The Nexora-Tech project is divided into frontend and backend applications.

```text
Nexora-Tech/
│
├── frontend/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── sections/
│   ├── index.html
│   ├── Dockerfile
│   └── .dockerignore
│
├── backend/
│   ├── src/
│   ├── dist/
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .dockerignore
│
├── docker-compose.yml
└── DOCKER.md
```

---

# 3. Container Architecture

The local Docker environment consists of two application containers.

```text
                         LOCAL MACHINE
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
       Frontend Container          Backend Container
          Nginx Alpine              Node.js Alpine
          Port 80                    Port 10000
                │                           │
                │                           │
        Host: 8082                 Host: 5000
                │                           │
                └───────────┬───────────────┘
                            │
                            ▼
                       MongoDB Atlas
```

The frontend is accessed through:

```text
http://localhost:8082
```

The backend is accessed through:

```text
http://localhost:5000
```

Inside the backend container, Express listens on:

```text
0.0.0.0:10000
```

The host-to-container mapping is:

```text
5000 → 10000
```

---

# 4. Frontend Container

## Technology

The Nexora frontend is a static HTML/CSS/JavaScript application.

It is served using:

```text
Nginx Alpine
```

## Frontend Dockerfile

```dockerfile
FROM nginx:alpine

COPY . /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

## Explanation

### Base image

```dockerfile
FROM nginx:alpine
```

Uses the lightweight Alpine-based Nginx image.

### Copy application

```dockerfile
COPY . /usr/share/nginx/html
```

Copies the Nexora frontend into Nginx's default web root.

### Expose HTTP

```dockerfile
EXPOSE 80
```

Documents that Nginx listens on port 80 inside the container.

### Health check

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1
```

Docker periodically verifies that Nginx is responding.

### Start Nginx

```dockerfile
CMD ["nginx", "-g", "daemon off;"]
```

Runs Nginx in the foreground so Docker can monitor the process.

---

# 5. Frontend `.dockerignore`

The frontend uses:

```text
.netlify
.git
.gitignore
Dockerfile
.dockerignore
README.md
```

This prevents unnecessary development and deployment files from being included in the Docker build context.

The `.netlify` directory is particularly important because it previously caused an unnecessarily large Docker build context.

After applying the `.dockerignore`, the frontend build context was reduced to approximately:

```text
15.08 kB
```

---

# 6. Backend Container

## Technology

The Nexora backend uses:

* Node.js
* TypeScript
* Express
* MongoDB/Mongoose
* Zod
* JWT authentication
* Nodemailer
* Helmet
* CORS
* Morgan
* Rate limiting

The backend is built using a multi-stage Docker build.

---

# 7. Backend Multi-Stage Dockerfile

```dockerfile
# ==========================================
# Stage 1: Build the TypeScript application
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build


# ==========================================
# Stage 2: Production image
# ==========================================
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
```

---

# 8. Backend Multi-Stage Build Explanation

The Dockerfile uses two stages.

## Stage 1 — Builder

```text
node:22-alpine
```

The builder installs all dependencies, including development dependencies, and compiles the TypeScript source.

```dockerfile
RUN npm ci
```

Then:

```dockerfile
RUN npm run build
```

generates the production JavaScript files in:

```text
dist/
```

## Stage 2 — Production

A fresh lightweight Node.js Alpine image is used.

Only production dependencies are installed:

```dockerfile
RUN npm ci --omit=dev
```

The compiled application is copied from the builder:

```dockerfile
COPY --from=builder /app/dist ./dist
```

This prevents TypeScript source and development dependencies from being included unnecessarily in the final runtime image.

### Benefits

The multi-stage build:

* reduces the production image footprint
* separates build and runtime responsibilities
* excludes development dependencies
* avoids shipping unnecessary TypeScript source
* provides a cleaner production container

---

# 9. Backend `.dockerignore`

The backend uses:

```text
node_modules
dist
.env
.env.*
coverage
.git
.gitignore
Dockerfile
.dockerignore
npm-debug.log*
```

This prevents:

* local dependencies
* generated build files
* environment secrets
* Git metadata
* coverage files
* npm logs

from being sent to Docker during image construction.

---

# 10. Environment Variables

The backend requires environment variables for runtime configuration.

Important variables include:

```text
NODE_ENV
PORT
CLIENT_URL
MONGODB_URI
JWT_SECRET
JWT_EXPIRES_IN
MAIL_FROM
CONTACT_RECEIVER
```

Optional SMTP configuration is also supported for email functionality.

Example local configuration:

```text
NODE_ENV=production
PORT=10000
CLIENT_URL=http://localhost:8082
MONGODB_URI=<MongoDB Atlas connection string>
JWT_SECRET=<secure secret>
JWT_EXPIRES_IN=<configured expiration>
MAIL_FROM=<configured sender>
CONTACT_RECEIVER=<configured receiver>
```

Actual secrets must never be committed to GitHub.

The `.env` file is excluded through:

```text
.env
.env.*
```

in the backend `.dockerignore`.

Production secrets should be supplied through the deployment platform or secret-management mechanism.

---

# 11. Database Architecture

Nexora uses:

```text
MongoDB Atlas
```

as its database.

The application containers are intentionally stateless.

```text
Frontend Container
       │
Backend Container
       │
       ▼
MongoDB Atlas
       │
       ▼
Persistent application data
```

No local MongoDB container is required for the current production-oriented Docker architecture.

This means persistent application data remains outside the application containers.

## Why MongoDB Atlas instead of a local Docker volume?

The Nexora backend already uses MongoDB Atlas and is successfully connecting to it from the Docker container.

Adding another MongoDB container would create an unnecessary second database architecture and could introduce:

* duplicated data
* configuration complexity
* additional resource usage
* confusion between local and production databases

Therefore, Docker manages the application containers while MongoDB Atlas manages persistent database storage.

---

# 12. Docker Compose

The project uses the following `docker-compose.yml`:

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    image: nexora-backend:1.0.0
    container_name: nexora-backend-compose
    env_file:
      - ./backend/.env
    ports:
      - "5000:10000"
    restart: unless-stopped
    healthcheck:
      test:
        [
          "CMD",
          "wget",
          "--no-verbose",
          "--tries=1",
          "--spider",
          "http://127.0.0.1:10000/api/health"
        ]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 20s

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    image: nexora-frontend:1.0.0
    container_name: nexora-frontend-compose
    ports:
      - "8082:80"
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped
```

---

# 13. Compose Services

## Backend

Container:

```text
nexora-backend-compose
```

Image:

```text
nexora-backend:1.0.0
```

Host port:

```text
5000
```

Container port:

```text
10000
```

Mapping:

```text
5000:10000
```

---

## Frontend

Container:

```text
nexora-frontend-compose
```

Image:

```text
nexora-frontend:1.0.0
```

Host port:

```text
8082
```

Container port:

```text
80
```

Mapping:

```text
8082:80
```

Port 8080 was intentionally not used because it is occupied by another Java-based service on the development machine.

---

# 14. Service Dependency

The frontend depends on the backend being healthy:

```yaml
depends_on:
  backend:
    condition: service_healthy
```

The backend health check is:

```text
http://127.0.0.1:10000/api/health
```

This prevents Compose from considering the frontend dependency satisfied merely because the backend process has started.

Instead, the backend must successfully respond to its health endpoint.

---

# 15. Backend Health Check

The backend container uses:

```yaml
healthcheck:
  test:
    [
      "CMD",
      "wget",
      "--no-verbose",
      "--tries=1",
      "--spider",
      "http://127.0.0.1:10000/api/health"
    ]
  interval: 30s
  timeout: 5s
  retries: 3
  start_period: 20s
```

This verifies:

1. Node.js is running.
2. Express is running.
3. The application can respond.
4. The container is operational.

The health endpoint also reports database connectivity.

---

# 16. Frontend Health Check

The Nginx container uses:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1
```

This verifies that Nginx is serving the frontend.

---

# 17. Frontend API Configuration

The Nexora frontend uses environment-aware API configuration.

Production:

```text
/api
```

Local development:

```text
http://localhost:5000/api
```

The configuration logic is:

```javascript
window.NEXORA_CONFIG = {
  API_BASE_URL:
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000/api"
      : "/api",
};
```

This allows the same frontend codebase to support both:

### Local Docker

```text
Browser
   ↓
localhost:8082
   ↓
localhost:5000/api
```

### Production Netlify

```text
Browser
   ↓
Netlify
   ↓
/api/*
   ↓
Render backend
```

The existing Netlify deployment therefore remains independent from the local Docker environment.

---

# 18. Building the Images

From the project root:

```powershell
cd C:\Projects\Codar\Nexora-Tech
```

Build the complete application:

```powershell
docker compose build
```

Or build and start:

```powershell
docker compose up -d --build
```

---

# 19. Starting the Application

Start the containers:

```powershell
docker compose up -d
```

Check the services:

```powershell
docker compose ps
```

Expected result:

```text
nexora-backend-compose     Up ... (healthy)
nexora-frontend-compose    Up ... (healthy)
```

---

# 20. Accessing the Application

Frontend:

```text
http://localhost:8082
```

Backend:

```text
http://localhost:5000
```

Backend health endpoint:

```text
http://localhost:5000/api/health
```

---

# 21. Testing the Backend

Run:

```powershell
curl.exe http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Nexora API is running",
  "data": {
    "environment": "production",
    "database": "connected"
  }
}
```

The exact timestamp and uptime values will change.

---

# 22. Testing the Frontend

Run:

```powershell
curl.exe http://localhost:8082
```

A successful response should return the Nexora HTML document beginning with:

```html
<!doctype html>
<html lang="en">
```

The response confirms that Nginx is serving the application.

The application can also be tested visually in a browser:

```text
http://localhost:8082
```

---

# 23. Restarting the Application

Restart both services:

```powershell
docker compose restart
```

Then:

```powershell
docker compose ps
```

Verify the backend:

```powershell
curl.exe http://localhost:5000/api/health
```

Verify the frontend:

```powershell
curl.exe http://localhost:8082
```

---

# 24. Stopping the Application

Stop the Compose services:

```powershell
docker compose down
```

This removes the application containers and Compose network.

It does not remove MongoDB Atlas data.

Start the application again with:

```powershell
docker compose up -d
```

---

# 25. Viewing Logs

View all logs:

```powershell
docker compose logs
```

View the latest logs:

```powershell
docker compose logs --tail=100
```

Backend logs:

```powershell
docker compose logs backend
```

Frontend logs:

```powershell
docker compose logs frontend
```

Follow backend logs live:

```powershell
docker compose logs -f backend
```

Follow frontend logs live:

```powershell
docker compose logs -f frontend
```

---

# 26. Rebuilding After Code Changes

After changing the application:

```powershell
docker compose up -d --build
```

Then verify:

```powershell
docker compose ps
```

And:

```powershell
curl.exe http://localhost:5000/api/health
curl.exe http://localhost:8082
```

---

# 27. Removing Containers

To stop and remove the Compose environment:

```powershell
docker compose down
```

To rebuild from scratch without using Docker's build cache:

```powershell
docker compose build --no-cache
```

Then:

```powershell
docker compose up -d
```

Use `--no-cache` only when necessary because normal cached builds are significantly faster.

---

# 28. Docker Images

The current Nexora images are:

```text
nexora-backend:1.0.0
nexora-frontend:1.0.0
```

List images:

```powershell
docker images
```

Inspect an image:

```powershell
docker image inspect nexora-backend:1.0.0
```

Inspect the frontend image:

```powershell
docker image inspect nexora-frontend:1.0.0
```

---

# 29. Container Status

List running containers:

```powershell
docker ps
```

List all containers:

```powershell
docker ps -a
```

Inspect the backend:

```powershell
docker inspect nexora-backend-compose
```

Inspect the frontend:

```powershell
docker inspect nexora-frontend-compose
```

---

# 30. Docker Network

Docker Compose creates a project network:

```text
nexora-tech_default
```

The containers are attached to this network.

View networks:

```powershell
docker network ls
```

Inspect the Nexora network:

```powershell
docker network inspect nexora-tech_default
```

---

# 31. Security Considerations

The Docker implementation follows several security practices.

### Secrets are not baked into images

The backend Dockerfile does not copy `.env`.

Instead:

```text
.env
.env.*
```

are excluded.

### Development dependencies are excluded from production

The production image uses:

```dockerfile
npm ci --omit=dev
```

### Production images use lightweight Alpine images

The project uses:

```text
node:22-alpine
nginx:alpine
```

### Application containers are stateless

Persistent application data is maintained by MongoDB Atlas.

### Secrets must never be committed

Never commit:

```text
.env
```

or:

```text
.env.*
```

containing production credentials.

---

# 32. MongoDB Atlas Security

The backend connects to MongoDB Atlas using:

```text
MONGODB_URI
```

The connection string contains sensitive authentication information and must remain secret.

For production deployments:

* use secure environment variables
* restrict MongoDB network access appropriately
* use dedicated database credentials
* avoid exposing database credentials in source code
* avoid committing connection strings to GitHub

---

# 33. Current Verification Results

The Nexora Docker implementation was fully rebuilt and verified.

## Frontend

```text
Image:
nexora-frontend:1.0.0

Container:
nexora-frontend-compose

Port:
8082 → 80

Status:
Healthy
```

## Backend

```text
Image:
nexora-backend:1.0.0

Container:
nexora-backend-compose

Port:
5000 → 10000

Status:
Healthy
```

## Database

```text
MongoDB Atlas:
Connected
```

## Backend health test

```powershell
curl.exe http://localhost:5000/api/health
```

Result:

```text
success: true
message: Nexora API is running
database: connected
environment: production
```

## Frontend test

```powershell
curl.exe http://localhost:8082
```

Result:

```text
HTTP 200
```

and the Nexora HTML document was returned successfully.

## Restart test

The application was restarted using:

```powershell
docker compose restart
```

The backend successfully recovered and returned:

```text
HTTP 200
```

from:

```text
/api/health
```

## Rebuild test

The complete application was rebuilt using:

```powershell
docker compose up -d --build
```

Both images successfully rebuilt.

Final status:

```text
nexora-backend-compose     Up ... (healthy)
nexora-frontend-compose    Up ... (healthy)
```

This confirms that the application can be rebuilt and restarted successfully.

---

# 34. Troubleshooting

## Frontend does not load

Check:

```powershell
docker compose ps
```

Then:

```powershell
docker compose logs frontend
```

Verify:

```text
http://localhost:8082
```

---

## Backend does not become healthy

Check:

```powershell
docker compose logs backend
```

Verify MongoDB connectivity.

Check:

```powershell
curl.exe http://localhost:5000/api/health
```

---

## MongoDB connection failure

Verify:

```text
MONGODB_URI
```

in the backend environment.

Do not expose the connection string in GitHub or documentation.

---

## Port 8082 is already occupied

Check:

```powershell
netstat -ano | findstr :8082
```

If necessary, change the host-side Compose port:

```yaml
ports:
  - "8083:80"
```

The container port remains:

```text
80
```

---

## Port 5000 is already occupied

Check:

```powershell
netstat -ano | findstr :5000
```

If necessary, change only the host-side port:

```yaml
ports:
  - "5001:10000"
```

The backend still listens internally on:

```text
10000
```

---

# 35. Production Deployment Strategy

The local Docker Compose environment is primarily used for:

* containerization
* development
* testing
* integration verification
* CI/CD preparation

The production deployment architecture will eventually use Amazon ECR and Kubernetes/EKS.

The intended architecture is:

```text
GitHub
   │
   ▼
Jenkins
   │
   ├── Install dependencies
   ├── Run typecheck
   ├── Build application
   ├── Build Docker images
   │
   ▼
Amazon ECR
   │
   ├── nexora-frontend
   └── nexora-backend
   │
   ▼
Amazon EKS
   │
   ├── Frontend Deployment
   └── Backend Deployment
          │
          ▼
      MongoDB Atlas
```

---

# 36. Amazon ECR Image Strategy

The next containerization stage is to create two ECR repositories:

```text
nexora-frontend
nexora-backend
```

AWS region:

```text
eu-west-1
```

Images will eventually be tagged using the ECR registry:

```text
<account-id>.dkr.ecr.eu-west-1.amazonaws.com/nexora-frontend:<tag>
```

and:

```text
<account-id>.dkr.ecr.eu-west-1.amazonaws.com/nexora-backend:<tag>
```

Example release tags can include:

```text
1.0.0
latest
```

For CI/CD, immutable version tags such as Git commit SHAs are preferred.

---

# 37. Recommended CI/CD Image Flow

Jenkins will eventually perform:

```text
GitHub Push
     │
     ▼
Jenkins
     │
     ├── npm ci
     ├── npm run typecheck
     ├── npm run build
     │
     ├── Docker build
     │
     ├── Docker image tag
     │
     ├── AWS ECR authentication
     │
     ├── Docker push
     │
     ▼
Amazon ECR
     │
     ▼
Kubernetes / EKS
```

The backend currently has no `npm test` script, so CI should use the actual available validation commands, including:

```powershell
npm run typecheck
npm run build
```

rather than inventing an `npm test` command.

---

# 38. Persistent Volumes

The current application does not require a Docker volume for application data.

The architecture is:

```text
Frontend:
Stateless

Backend:
Stateless

Database:
MongoDB Atlas
Persistent
```

If future services introduce local persistent storage, Docker volumes can be added at that time.

For example:

```yaml
volumes:
  application_data:
```

However, no unnecessary database volume has been introduced into the current Nexora architecture.

---

# 39. Assignment Deliverables

The Docker/Containerization phase provides the following deliverables:

### Dockerfile

```text
frontend/Dockerfile
backend/Dockerfile
```

### Docker Compose

```text
docker-compose.yml
```

### Environment configuration

```text
backend/.env
```

Kept outside Git.

### Docker ignore files

```text
frontend/.dockerignore
backend/.dockerignore
```

### Documentation

```text
DOCKER.md
```

### Docker images

```text
nexora-frontend:1.0.0
nexora-backend:1.0.0
```

### Health checks

Frontend:

```text
Nginx HTTP health check
```

Backend:

```text
/api/health
```

### Verification

```text
Docker build       ✓
Docker Compose     ✓
Frontend           ✓
Backend            ✓
MongoDB Atlas      ✓
Health checks      ✓
Restart            ✓
Rebuild            ✓
```

---

# 40. Useful Command Reference

## Start

```powershell
docker compose up -d
```

## Build and start

```powershell
docker compose up -d --build
```

## Stop

```powershell
docker compose down
```

## Restart

```powershell
docker compose restart
```

## Status

```powershell
docker compose ps
```

## Logs

```powershell
docker compose logs --tail=100
```

## Backend logs

```powershell
docker compose logs backend
```

## Frontend logs

```powershell
docker compose logs frontend
```

## Follow logs

```powershell
docker compose logs -f
```

## Rebuild without cache

```powershell
docker compose build --no-cache
```

## Backend health

```powershell
curl.exe http://localhost:5000/api/health
```

## Frontend

```powershell
curl.exe http://localhost:8082
```

## Running containers

```powershell
docker ps
```

## Images

```powershell
docker images
```

---

# 41. Final Docker Architecture

The completed Nexora containerization architecture is:

```text
                       NEXORA TECHNOLOGIES
                              │
                              ▼
                       Docker Compose
                              │
             ┌────────────────┴────────────────┐
             │                                 │
             ▼                                 ▼
     Frontend Container                Backend Container
        Nginx Alpine                    Node.js 22 Alpine
             │                                 │
        Port 80                             Port 10000
             │                                 │
       Host Port 8082                  Host Port 5000
             │                                 │
             └────────────────┬────────────────┘
                              │
                              ▼
                         MongoDB Atlas
                              │
                              ▼
                       Persistent Data
```

The containerization phase is therefore complete and provides a stable foundation for the next DevOps stages: **Amazon ECR, Terraform infrastructure, Ansible configuration management, Jenkins CI/CD, and Kubernetes/EKS deployment.**

---

# 42. Conclusion

Nexora Technologies has been successfully containerized using Docker and Docker Compose.

The implementation provides:

* Separate frontend and backend containers
* Nginx-based frontend serving
* Node.js Alpine backend runtime
* Multi-stage TypeScript backend builds
* Production-only backend dependencies
* Environment-based configuration
* MongoDB Atlas integration
* Backend health monitoring
* Frontend health monitoring
* Docker Compose orchestration
* Restart and rebuild capability
* Secure handling of environment secrets
* ECR-ready Docker images
* A foundation for Jenkins and Kubernetes deployment

The verified local application is available at:

```text
Frontend:
http://localhost:8082

Backend:
http://localhost:5000

Health:
http://localhost:5000/api/health
```

Final verified container state:

```text
nexora-backend-compose     Healthy
nexora-frontend-compose    Healthy
```

**Docker/Containerization Phase: COMPLETE**
