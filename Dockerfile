# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY --from=builder /app/dist ./dist
COPY shared ./shared
COPY drizzle.config.ts ./

ENV NODE_ENV=production
EXPOSE 5000

# Run drizzle migrations at build time (not runtime)
RUN npx drizzle-kit generate || true

# Ultra-minimal CMD - just start Node directly
CMD ["node", "dist/index.cjs"]
