# ==========================================
# Stage 1: Build the TypeScript application
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files first
# This improves Docker layer caching
COPY package*.json ./

# Install all dependencies, including devDependencies
RUN npm ci

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy application source
COPY src ./src

# Compile TypeScript → dist/
RUN npm run build


# ==========================================
# Stage 2: Production image
# ==========================================
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy dependency files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled application from builder
COPY --from=builder /app/dist ./dist

# Nexora backend port
EXPOSE 10000

# Start the compiled application
CMD ["node", "dist/server.js"]
