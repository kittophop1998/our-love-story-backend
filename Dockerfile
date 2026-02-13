# Build stage (optional - for type checking and validation)
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install all dependencies (including devDependencies for type checking)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src
COPY main.ts ./

# Optional: Type check (uncomment if you want to validate types during build)
# RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies + tsx (needed to run TypeScript)
RUN npm ci --omit=dev && npm install tsx

# Copy source code
COPY tsconfig.json ./
COPY src ./src
COPY main.ts ./

# Expose port
EXPOSE 8000

# Run the application with tsx
CMD ["npx", "tsx", "main.ts"]
