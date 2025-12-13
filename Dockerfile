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

# Force cache invalidation - update this timestamp to force rebuild
ARG CACHE_BUST=2025-12-13-v2

# Copy package files
COPY package*.json ./

# Install ALL dependencies (need drizzle-kit for migrations at runtime)
RUN npm ci

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy necessary files
COPY shared ./shared
COPY drizzle.config.ts ./

# Create startup script
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo 'echo "=== ALTUS INK STARTING ===" ' >> /app/entrypoint.sh && \
    echo 'echo "PORT: ${PORT:-5000}"' >> /app/entrypoint.sh && \
    echo 'echo "NODE_ENV: ${NODE_ENV}"' >> /app/entrypoint.sh && \
    echo 'echo "DATABASE_URL set: $(if [ -n "$DATABASE_URL" ]; then echo YES; else echo NO; fi)"' >> /app/entrypoint.sh && \
    echo 'echo "Running drizzle-kit push..."' >> /app/entrypoint.sh && \
    echo 'npx drizzle-kit push || echo "WARNING: Drizzle push failed"' >> /app/entrypoint.sh && \
    echo 'echo "Starting Node.js server..."' >> /app/entrypoint.sh && \
    echo 'exec node dist/index.cjs' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Set environment
ENV NODE_ENV=production

# Expose default port (Railway provides PORT via env)
EXPOSE 5000

# Run the startup script
ENTRYPOINT ["/app/entrypoint.sh"]
