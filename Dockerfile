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

# Set environment - let Railway set PORT dynamically
ENV NODE_ENV=production

# Default port (Railway will override via $PORT)
EXPOSE 5000

# Disable internal healthcheck - Railway handles this via railway.toml
# HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
#   CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-5000}/health || exit 1

# Simple startup: run drizzle push then start server
CMD ["sh", "-c", "echo '=== Starting Altus Ink ===' && echo 'PORT: ${PORT:-5000}' && echo 'DATABASE_URL starts with: ${DATABASE_URL:0:30}...' && npx drizzle-kit push && npm run start"]
