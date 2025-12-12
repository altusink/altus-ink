# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build and drizzle-kit)
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
ENV PORT=5000

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Create startup script to debug and run
RUN echo '#!/bin/sh' > /app/start.sh && \
  echo 'echo "=== ENVIRONMENT DEBUG ===" ' >> /app/start.sh && \
  echo 'echo "DATABASE_URL starts with: ${DATABASE_URL:0:30}..."' >> /app/start.sh && \
  echo 'echo "All env vars:" && env | grep -E "DATABASE|SESSION|RAILWAY" | head -20' >> /app/start.sh && \
  echo 'echo "=========================" ' >> /app/start.sh && \
  echo 'if [ -z "$DATABASE_URL" ]; then' >> /app/start.sh && \
  echo '  echo "ERROR: DATABASE_URL not set! Sleeping to keep container alive..."' >> /app/start.sh && \
  echo '  sleep 300' >> /app/start.sh && \
  echo '  exit 1' >> /app/start.sh && \
  echo 'fi' >> /app/start.sh && \
  echo 'npx drizzle-kit push && npm run start' >> /app/start.sh && \
  chmod +x /app/start.sh

CMD ["/app/start.sh"]
