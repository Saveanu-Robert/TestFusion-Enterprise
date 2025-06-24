# TestFusion-Enterprise Docker Configuration
# Multi-stage build for optimized production image

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY tests/ ./tests/
COPY playwright.config.ts ./
COPY .env ./

# Build TypeScript
RUN npm run build

# Production stage
FROM mcr.microsoft.com/playwright:v1.53.0-focal

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci && npx playwright install --with-deps

# Copy built application and configuration
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/tests ./tests
COPY playwright.config.ts ./
COPY .env ./
COPY scripts/ ./scripts/

# Create directories for test results
RUN mkdir -p test-results playwright-report enterprise-reports

# Set environment variables
ENV NODE_ENV=production
ENV CI=true
ENV HEADLESS=true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node scripts/health-check.js || exit 1

# Default command
CMD ["npm", "run", "test:ci"]

# Labels for container metadata
LABEL maintainer="TestFusion-Enterprise Team"
LABEL version="1.0.0"
LABEL description="Enterprise test automation framework with Playwright"
