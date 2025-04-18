#!/bin/bash

# Exit on error
set -e

echo "Building and deploying frontend to S3..."
echo "----------------------------------------"

# Get the project root directory
PROJECT_ROOT=$(git rev-parse --show-toplevel)

# Get the API endpoint from the .env file
API_ENDPOINT=$(grep API_ENDPOINT .env | cut -d '=' -f2)

if [ -z "$API_ENDPOINT" ]; then
  echo "Error: API_ENDPOINT not found in .env file"
  exit 1
fi

echo "Found API endpoint: $API_ENDPOINT"

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
  echo "Make sure the OurChantsFrontendStack exists and has a WebsiteURL output"
  exit 1
fi

echo "Found S3 bucket: $BUCKET_NAME"

# Upload files to S3
echo "Uploading files to S3..."
aws s3 sync "$PROJECT_ROOT/dist/" "s3://$BUCKET_NAME" --delete

echo "----------------------------------------"
echo "Deployment complete!"
echo "Your website is available at: http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com" 