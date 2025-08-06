# Multi-stage build for production
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Backend builder stage
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy backend package files
COPY package*.json ./
RUN npm ci

# Copy backend source
COPY . .
COPY --from=frontend-builder /app/public ./public

# Build backend (skip frontend since it's already built)
RUN npx nest build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files and install production dependencies only
COPY --from=backend-builder --chown=nestjs:nodejs /app/package*.json ./
RUN npm ci --omit=dev

# Copy built application
COPY --from=backend-builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=backend-builder --chown=nestjs:nodejs /app/public ./public

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application with proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]