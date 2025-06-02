# Multi-stage build for production optimization
FROM node:20-slim AS base

# Install security updates, dumb-init, and curl for health checks
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends dumb-init curl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Create app user for security
RUN groupadd --gid 1001 --system nodejs && \
    useradd --uid 1001 --system --gid nodejs --shell /bin/bash --create-home nodejs

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY server/package*.json ./server/

# Development stage - includes dev dependencies and testing tools
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm ci --only=development
RUN cd server && npm ci

# Copy source code and shared directory
COPY server/ ./server/
COPY shared/ ./shared/

# Install Playwright browsers for testing
RUN cd server && npx playwright install --with-deps

# Expose port for development
EXPOSE 3000

# Development command
CMD ["sh", "-c", "cd server && npm run dev"]

# Testing stage - optimized for running tests
FROM development AS testing

# Set test environment
ENV NODE_ENV=test

# Copy test configuration
COPY server/playwright.config.ts ./server/
COPY server/tests/ ./server/tests/

# Create test results directory
RUN mkdir -p /app/server/test-results

# Install wait-for-it or similar tool for service waiting
RUN apt-get update && apt-get install -y --no-install-recommends netcat-openbsd && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Create a test runner script
RUN echo '#!/bin/bash\n\
set -e\n\
echo "🚀 Starting test environment..."\n\
\n\
# Start the server in background\n\
echo "📡 Starting server..."\n\
cd /app/server && npm run dev:test &\n\
SERVER_PID=$!\n\
\n\
# Wait for server to be ready\n\
echo "⏳ Waiting for server to be ready..."\n\
timeout=60\n\
while [ $timeout -gt 0 ]; do\n\
  if nc -z localhost 3000; then\n\
    echo "✅ Server is ready!"\n\
    break\n\
  fi\n\
  echo "⏳ Waiting for server... ($timeout seconds left)"\n\
  sleep 2\n\
  timeout=$((timeout-2))\n\
done\n\
\n\
if [ $timeout -le 0 ]; then\n\
  echo "❌ Server failed to start within 60 seconds"\n\
  kill $SERVER_PID 2>/dev/null || true\n\
  exit 1\n\
fi\n\
\n\
# Run tests\n\
echo "🧪 Running tests..."\n\
cd /app/server && npm run test\n\
TEST_EXIT_CODE=$?\n\
\n\
# Cleanup\n\
echo "🧹 Cleaning up..."\n\
kill $SERVER_PID 2>/dev/null || true\n\
\n\
echo "🏁 Tests completed with exit code: $TEST_EXIT_CODE"\n\
exit $TEST_EXIT_CODE' > /app/run-tests.sh && chmod +x /app/run-tests.sh

# Run the test script
CMD ["/app/run-tests.sh"]

# Build stage - compile TypeScript
FROM base AS builder

# Install all dependencies for building
RUN npm ci
RUN cd server && npm ci

# Copy source code and shared directory
COPY server/ ./server/
COPY shared/ ./shared/

# Build the application
RUN cd server && npm run build

# Production stage - minimal image for deployment
FROM base AS production

# Set production environment
ENV NODE_ENV=production

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force
RUN cd server && npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/server/dist ./server/dist
COPY --from=builder --chown=nodejs:nodejs /app/server/package*.json ./server/

# Copy any additional runtime files
COPY --chown=nodejs:nodejs server/migrate-mongo-config.js ./server/
COPY --chown=nodejs:nodejs server/migrate-mongo-esm.js ./server/
COPY --chown=nodejs:nodejs server/migrations/ ./server/migrations/

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server/dist/server/src/app.js"]