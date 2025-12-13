# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (need drizzle-kit for migrations at runtime)
RUN npm ci

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy necessary files
COPY shared ./shared
COPY drizzle.config.ts ./

# Set environment
ENV NODE_ENV=production

# Expose default port (Railway provides PORT via env)
EXPOSE 5000

# Ultra-simple startup - immediate output for debugging
CMD echo "=== ALTUS INK STARTING ===" && \
    echo "PORT=${PORT:-5000}" && \
    echo "NODE_ENV=${NODE_ENV}" && \
    echo "DATABASE_URL exists: $(if [ -n \"$DATABASE_URL\" ]; then echo 'YES'; else echo 'NO'; fi)" && \
    echo "Running drizzle-kit push..." && \
    npx drizzle-kit push 2>&1 || echo "Drizzle push failed but continuing..." && \
    echo "Starting server..." && \
    node dist/index.cjs
