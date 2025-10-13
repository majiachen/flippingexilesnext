FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies) for build
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install only production dependencies after build
RUN npm ci --only=production

EXPOSE 3000
CMD ["npm", "start"]