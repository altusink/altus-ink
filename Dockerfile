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

# Ultra-simple CMD - no set -e, no complex script
# Just echo and run node directly
CMD ["sh", "-c", "echo '=== ALTUS INK v3 ===' && echo \"PORT: $PORT\" && echo \"DB: ${DATABASE_URL:+SET}\" && npx drizzle-kit push; echo 'Starting server...' && exec node dist/index.cjs"]
