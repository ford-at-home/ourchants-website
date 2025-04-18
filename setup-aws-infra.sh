#!/bin/bash

# Exit on error
set -e

echo "Setting up AWS infrastructure for Sacred Chants static website"
echo "--------------------------------------------------------------"

# Variables - you'll need to customize these
REGION="us-east-1"
BUCKET_NAME="sacred-chants-static-website"
STACK_NAME="OurChantsStack"

# Ensure AWS CLI is configured
echo "Checking AWS CLI configuration..."
aws configure get aws_access_key_id || { echo "AWS CLI not configured. Run 'aws configure' first."; exit 1; }

# Get API endpoint from CloudFormation stack
echo "Fetching API endpoint from CloudFormation stack..."
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs[?OutputKey=='APIEndpoint'].OutputValue" \
  --output text)

if [ -z "$API_ENDPOINT" ]; then
  echo "Error: Could not fetch API endpoint from CloudFormation stack"
  exit 1
fi

echo "Found API endpoint: $API_ENDPOINT"

# Create S3 bucket for static website hosting
echo "Creating S3 bucket for static website hosting..."
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
  echo "Bucket $BUCKET_NAME already exists."
else
  aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION" \
    $(if [ "$REGION" != "us-east-1" ]; then echo "--create-bucket-configuration LocationConstraint=$REGION"; fi)
  echo "Bucket created successfully."
fi

# Configure bucket for static website hosting
echo "Configuring bucket for static website hosting..."
aws s3 website "s3://$BUCKET_NAME" --index-document index.html --error-document index.html

# Set bucket policy to allow public read access
echo "Setting bucket policy for public read access..."
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForGetBucketObjects",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file://bucket-policy.json

# Enable CORS for S3 bucket
echo "Enabling CORS for S3 bucket..."
cat > cors-configuration.json << EOF
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": [],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors --bucket "$BUCKET_NAME" --cors-configuration file://cors-configuration.json

# Generate updated songApi.ts file with actual API endpoint
echo "Generating updated songApi.ts file with API endpoint..."
cat > songApi.ts << EOF
import { Song } from "@/types/song";

// API Gateway endpoint from CloudFormation stack
const API_ENDPOINT = "$API_ENDPOINT";

export const fetchSongs = async (): Promise<Song[]> => {
  try {
    const response = await fetch(\`\${API_ENDPOINT}/songs\`);
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

echo "--------------------------------------------------------------"
echo "Infrastructure setup complete!"
echo ""
echo "Next steps:"
echo "1. Build your React app with: npm run build"
echo "2. Upload the build files to the S3 bucket: aws s3 sync dist/ s3://$BUCKET_NAME"
echo "3. Your website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo "4. The API endpoint ($API_ENDPOINT) has been configured in songApi.ts"
echo ""
echo "Happy coding!"

