FROM node:18-alpine AS builder

WORKDIR /app

# Copy configuration files first
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.js ./
COPY .env ./

# Install dependencies
RUN npm ci

# Copy ALL source files
COPY . .

# Verify the file exists in Docker context
RUN find . -name "RedisDataFetcher.ts" -type f

# Build the application
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

# Copy necessary files for production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

EXPOSE 3000
CMD ["npm", "start"]