#!/bin/bash

# Exit on error
set -e

echo "Configuring CORS for API Gateway..."
echo "-----------------------------------"

# Get the API Gateway ID by listing APIs and finding the one with "OurChants" in the name
API_ID=$(aws apigatewayv2 get-apis \
  --query "Items[?contains(Name, 'OurChants')].ApiId" \
  --output text)

if [ -z "$API_ID" ]; then
  echo "Error: Could not find API Gateway with 'OurChants' in the name"
  echo "Available APIs:"
  aws apigatewayv2 get-apis --query "Items[*].[Name,ApiId]" --output table
  exit 1
fi

echo "Found API Gateway ID: $API_ID"

# Get the S3 website URL
WEBSITE_URL=$(aws cloudformation describe-stacks \
  --stack-name "OurChantsFrontendStack" \
  --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" \
  --output text)

if [ -z "$WEBSITE_URL" ]; then
  echo "Error: Could not fetch website URL from CloudFormation stack"
  exit 1
fi

echo "Found website URL: $WEBSITE_URL"

# Create a temporary file for the CORS configuration
cat > cors-config.json << EOF
{
  "cors": {
    "allowOrigins": ["$WEBSITE_URL"],
    "allowMethods": ["GET", "POST", "PUT", "DELETE"],
    "allowHeaders": ["Content-Type", "Accept"],
    "maxAge": 3000
  }
}
EOF

# Configure CORS for the API
echo "Configuring CORS for API Gateway..."
aws apigatewayv2 update-api \
  --api-id "$API_ID" \
  --cors-configuration file://cors-config.json

# Create a new deployment
echo "Creating new deployment..."
DEPLOYMENT_ID=$(aws apigatewayv2 create-deployment \
  --api-id "$API_ID" \
  --query "DeploymentId" \
  --output text)

echo "Created deployment: $DEPLOYMENT_ID"

# Clean up
rm cors-config.json

echo "-----------------------------------"
echo "CORS configuration complete!"
echo "Your API should now accept requests from: $WEBSITE_URL" 