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

# Use npm start which includes drizzle-kit push
CMD ["npm", "run", "start"]
