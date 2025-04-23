#!/bin/bash

# Exit on error
set -e

echo "Starting OurChants deployment..."
echo "--------------------------------"

# Get the API endpoint from the existing ApiStack
echo "Fetching API endpoint from existing ApiStack..."
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name "ApiStack" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
  --output text)

# Remove trailing slash if present
API_ENDPOINT=${API_ENDPOINT%/}

if [ -z "$API_ENDPOINT" ]; then
  echo "Error: Could not fetch API endpoint from stack output"
  echo "Available outputs:"
  aws cloudformation describe-stacks --stack-name "ApiStack" --query "Stacks[0].Outputs" --output table
  exit 1
fi

echo "Found API endpoint: $API_ENDPOINT"

# Store the API endpoint in .env file
echo "API_ENDPOINT=$API_ENDPOINT" > .env

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

interface GetPresignedUrlResponse {
  url: string;
  expiresIn: number;
}

export const getPresignedUrl = async (bucket: string, key: string): Promise<GetPresignedUrlResponse> => {
  try {
    const response = await fetch(\`\${API_ENDPOINT}/presigned-url\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ bucket, key })
    });
    if (!response.ok) {
      throw new Error('Failed to get presigned URL');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting presigned URL:', error);
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
CF_DISTRO_ID=$(aws cloudformation describe-stack-resources \
  --stack-name "OurChantsFrontendStack" \
  --query "StackResources[?ResourceType=='AWS::CloudFront::Distribution'].PhysicalResourceId | [0]" \
  --output text)

if [ -z "$CF_DISTRO_ID" ]; then
  echo "Error: Could not find CloudFront distribution in stack"
  exit 1
fi

echo "Found CloudFront distribution: $CF_DISTRO_ID"

# Get the S3 bucket name from the CloudFront distribution's origin
BUCKET_NAME=$(aws cloudfront get-distribution-config \
  --id "$CF_DISTRO_ID" \
  --query "DistributionConfig.Origins.Items[0].DomainName" \
  --output text | sed 's|.s3-website-us-east-1.amazonaws.com||')

if [ -z "$BUCKET_NAME" ]; then
  echo "Error: Could not fetch S3 bucket name from CloudFront distribution"
  exit 1
fi

echo "Found S3 bucket: $BUCKET_NAME"

# Upload files to S3
echo "Uploading files to S3..."
aws s3 sync "$PROJECT_ROOT/dist/" "s3://$BUCKET_NAME" --delete

# Get the CloudFront distribution URL
echo "Getting CloudFront distribution URL..."
CF_URL=$(aws cloudformation describe-stacks \
  --stack-name "OurChantsFrontendStack" \
  --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" \
  --output text)

if [ -z "$CF_URL" ]; then
  echo "Error: Could not fetch CloudFront URL from CloudFormation stack"
  exit 1
fi

echo "Found CloudFront URL: $CF_URL"

# Get the API Gateway ID
echo "Fetching API Gateway ID..."
API_ID=$(aws apigatewayv2 get-apis --query "Items[?Name=='SongsHttpApi'].ApiId" --output text)

if [ -z "$API_ID" ]; then
  echo "Error: Could not find API Gateway with name 'SongsHttpApi'"
  echo "Available APIs:"
  aws apigatewayv2 get-apis --query "Items[*].[Name,ApiId]" --output table
  exit 1
fi

echo "Found API Gateway ID: $API_ID"

# Create a temporary file for the CORS configuration
cat > cors-config.json << EOF
{
  "AllowOrigins": ["$CF_URL", "https://ourchants.com", "https://www.ourchants.com"],
  "AllowMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  "AllowHeaders": ["Content-Type", "Accept", "Authorization"],
  "MaxAge": 3000
}
EOF

# Configure CORS for the API (suppress output)
echo "Configuring CORS for API Gateway..."
aws apigatewayv2 update-api \
  --api-id "$API_ID" \
  --cors-configuration file://cors-config.json > /dev/null 2>&1

# Create a new deployment (suppress output)
DEPLOYMENT_ID=$(aws apigatewayv2 create-deployment \
  --api-id "$API_ID" \
  --query "DeploymentId" \
  --output text)

# Clean up
rm cors-config.json

echo "--------------------------------"
echo "Deployment complete!"
echo "Your website is available at: $CF_URL" 