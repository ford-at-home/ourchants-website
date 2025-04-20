#!/bin/bash

# Exit on error
set -e

echo "Fetching API endpoint from CloudFormation stack..."

# Get API endpoint from CloudFormation stack
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name "ApiStack" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
  --output text)

if [ -z "$API_ENDPOINT" ]; then
  echo "Error: Could not fetch API endpoint from CloudFormation stack"
  echo "Make sure the ApiStack exists and has an ApiUrl output"
  exit 1
fi

echo "Found API endpoint: $API_ENDPOINT"

# Create .env file
cat > .env << EOF
API_ENDPOINT=$API_ENDPOINT
EOF

echo "API endpoint stored in .env file" 