#!/bin/bash

# Exit on error
set -e

# Configuration
S3_BUCKET="ourchants-website"
CLOUDFRONT_DISTRIBUTION_ID="EFJFO56LXFQJM"
BUILD_DIR="dist"

echo "🚀 Starting frontend deployment..."

# Step 1: Build the frontend
echo "📦 Building frontend..."
npm run build

# Step 2: Sync to S3
echo "📤 Syncing to S3..."
aws s3 sync "$BUILD_DIR" "s3://$S3_BUCKET" --delete

# Step 3: Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*"

echo "✅ Deployment complete!"
echo "💡 Remember to hard refresh your browser (Shift+Reload) to see the changes." 