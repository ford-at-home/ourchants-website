#!/bin/bash

# Exit on error
set -e

echo "Starting OurChants deployment..."
echo "--------------------------------"

# Deploy the CDK stack
echo "Deploying CDK stack..."
cd infrastructure
cdk deploy --app "python3 app.py"

# Get the API endpoint from .env file
echo "Fetching API endpoint from .env file..."
API_ENDPOINT=$(grep API_ENDPOINT .env | cut -d '=' -f2)

if [ -z "$API_ENDPOINT" ]; then
  echo "Error: Could not fetch API endpoint from .env file"
  exit 1
fi

echo "Found API endpoint: $API_ENDPOINT"

# Extract the API Gateway ID from the endpoint URL
API_ID=$(echo $API_ENDPOINT | sed 's|https://||' | sed 's|.execute-api.*||')

echo "Using API Gateway ID: $API_ID"

# Get the project root directory
PROJECT_ROOT=$(git rev-parse --show-toplevel)

# Update the songApi.ts file with the actual API endpoint
echo "Updating songApi.ts with actual API endpoint..."
cat > "$PROJECT_ROOT/src/services/songApi.ts" << EOF
import { Song } from "@/types/song";

// API Gateway endpoint from CloudFormation stack
const API_ENDPOINT = "$API_ENDPOINT";

export const fetchSongs = async (): Promise<Song[]> => {
  try {
    const response = await fetch(\`\${API_ENDPOINT}/songs\`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch songs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching songs:', error);
    throw error;
  }
};
EOF

# Install dependencies and build the React app
echo "Installing dependencies and building React app..."
cd "$PROJECT_ROOT"
npm install
npm run build

# Get the S3 bucket name from the CDK stack
echo "Getting S3 bucket name from CDK stack..."
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name "OurChantsFrontendStack" \
  --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" \
  --output text | sed 's|http://||' | sed 's|.s3-website-us-east-1.amazonaws.com||')

if [ -z "$BUCKET_NAME" ]; then
  echo "Error: Could not fetch S3 bucket name from CloudFormation stack"
  exit 1
fi

echo "Found S3 bucket: $BUCKET_NAME"

# Upload files to S3
echo "Uploading files to S3..."
aws s3 sync "$PROJECT_ROOT/dist/" "s3://$BUCKET_NAME" --delete

# Get the S3 website URL
WEBSITE_URL="http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"

# Enable CORS for the API
echo "Enabling CORS for API Gateway..."
aws apigateway update-rest-api \
  --rest-api-id "$API_ID" \
  --patch-operations \
    op=replace,path=/cors/enabled,value=true \
    op=replace,path=/cors/allowOrigins,value="$WEBSITE_URL" \
    op=replace,path=/cors/allowMethods,value="GET,POST,PUT,DELETE" \
    op=replace,path=/cors/allowHeaders,value="Content-Type,Accept" \
    op=replace,path=/cors/maxAge,value="3000"

# Create a new deployment
DEPLOYMENT_ID=$(aws apigateway create-deployment \
  --rest-api-id "$API_ID" \
  --stage-name "prod" \
  --query "id" \
  --output text)

echo "--------------------------------"
echo "Deployment complete!"
echo "Your website is available at: $WEBSITE_URL"
echo "API Gateway CORS configured to accept requests from: $WEBSITE_URL" 