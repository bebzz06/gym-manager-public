#!/bin/bash

# Production deployment script for Google Cloud Run
set -e

IMAGE_TAG=$1
SERVICE_NAME="gym-manager-server"
REGION="us-central1"

if [ -z "$IMAGE_TAG" ]; then
  echo "Error: Image tag is required"
  echo "Usage: $0 <image-tag>"
  exit 1
fi

echo "🚀 Deploying to Cloud Run Production..."
echo "Image: $IMAGE_TAG"

gcloud run deploy ${SERVICE_NAME} \
  --image="$IMAGE_TAG" \
  --platform=managed \
  --region="$REGION" \
  --allow-unauthenticated \
  --set-env-vars="\
NODE_ENV=production,\
HOST=0.0.0.0,\
CLIENT_URL=$CLIENT_URL,\
DB_NAME=$DB_NAME,\
API_VERSION=/api/v1,\
ACCESS_TOKEN_EXPIRATION_TIME_IN_MINUTES=$ACCESS_TOKEN_EXPIRATION_TIME_IN_MINUTES,\
REFRESH_TOKEN_EXPIRATION_TIME_IN_DAYS=$REFRESH_TOKEN_EXPIRATION_TIME_IN_DAYS,\
FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID,\
FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET,\
EMAIL_FROM=$EMAIL_FROM,\
PAGUELO_FACIL_URL=$PAGUELO_FACIL_URL,\
ENABLE_SENTRY=true" \
  --set-secrets="\
MONGODB_URI=mongodb-uri-production:latest,\
JWT_SECRET=jwt-secret-production:latest,\
JWT_REFRESH_SECRET=jwt-refresh-secret-production:latest,\
FIREBASE_PRIVATE_KEY=firebase-private-key-production:latest,\
FIREBASE_CLIENT_EMAIL=firebase-client-email-production:latest,\
RESEND_API_KEY=resend-api-key-production:latest,\
SENTRY_DSN=sentry-dsn-production:latest" \
  --memory=1Gi \
  --cpu=2 \
  --concurrency=100 \
  --max-instances=20 \
  --timeout=300

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region="$REGION" --format='value(status.url)')

# Set BASE_URL environment variable
gcloud run services update ${SERVICE_NAME} \
  --region="$REGION" \
  --update-env-vars="BASE_URL=$SERVICE_URL"

echo "✅ Production deployment successful!"
echo "🌐 Service URL: $SERVICE_URL"
echo "🔍 Health check: $SERVICE_URL/api/v1/health"

# Run health check
echo "🩺 Running health check..."
if curl -f "$SERVICE_URL/api/v1/health" > /dev/null 2>&1; then
  echo "✅ Health check passed!"
else
  echo "❌ Health check failed!"
  exit 1
fi 