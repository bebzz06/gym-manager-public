#!/bin/bash

# Local deployment testing script
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🧪 Testing production deployment locally..."
echo "📁 Server directory: $SERVER_DIR"

# Check if .env.development exists
if [ ! -f "$SERVER_DIR/.env.development" ]; then
  echo "❌ Error: .env.development not found"
  echo "Please create .env.development file first"
  exit 1
fi

# Build the production image
echo "🏗️  Building production Docker image..."
docker build -t gym-manager-server:local-test --target production -f "$SERVER_DIR/Dockerfile" "$SERVER_DIR/.."

# Stop any existing container
echo "🧹 Cleaning up existing containers..."
docker stop gym-manager-local-test 2>/dev/null || true
docker rm gym-manager-local-test 2>/dev/null || true

# Run the container
echo "🚀 Starting local production server..."
docker run -d \
  --name gym-manager-local-test \
  -p 8080:8080 \
  -e NODE_ENV=development \
  -e HOST=0.0.0.0 \
  -e PORT=8080 \
  --env-file "$SERVER_DIR/.env.development" \
  gym-manager-server:local-test

# Wait for startup
echo "⏳ Waiting for server to start..."
sleep 5

# Test health endpoint
echo "🩺 Testing health endpoint..."
if curl -f http://localhost:8080/api/v1/health > /dev/null 2>&1; then
  echo "✅ Health check passed!"
  echo "🌐 Server running at: http://localhost:8080"
  echo "🔍 Health check: http://localhost:8080/api/v1/health"
  echo ""
  echo "📋 Available commands:"
  echo "  View logs: docker logs gym-manager-local-test"
  echo "  Stop server: docker stop gym-manager-local-test"
  echo "  Remove container: docker rm gym-manager-local-test"
else
  echo "❌ Health check failed!"
  echo "📋 Showing container logs:"
  docker logs gym-manager-local-test
  docker stop gym-manager-local-test
  docker rm gym-manager-local-test
  exit 1
fi 