#!/bin/bash

# Exit on error
set -e

echo "Setting up AWS infrastructure for Sacred Chants static website with API Gateway backend"
echo "--------------------------------------------------------------"

# Variables - you'll need to customize these
REGION="us-east-1"
BUCKET_NAME="sacred-chants-static-website"
API_NAME="sacred-chants-api"
LAMBDA_FUNCTION_NAME="sacred-chants-backend"
LAMBDA_ROLE_NAME="sacred-chants-lambda-role"
STAGE_NAME="prod"

# Ensure AWS CLI is configured
echo "Checking AWS CLI configuration..."
aws configure get aws_access_key_id || { echo "AWS CLI not configured. Run 'aws configure' first."; exit 1; }

# Create S3 bucket for static website hosting
echo "Creating S3 bucket for static website hosting..."
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
  echo "Bucket $BUCKET_NAME already exists."
else
  aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION" \
    ${REGION != "us-east-1" ? "--create-bucket-configuration LocationConstraint=$REGION" : ""}
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

# Create IAM role for Lambda function
echo "Creating IAM role for Lambda function..."
if aws iam get-role --role-name "$LAMBDA_ROLE_NAME" 2>/dev/null; then
  echo "Role $LAMBDA_ROLE_NAME already exists."
else
  LAMBDA_TRUST_POLICY='{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'
  
  aws iam create-role \
    --role-name "$LAMBDA_ROLE_NAME" \
    --assume-role-policy-document "$LAMBDA_TRUST_POLICY"
  
  # Attach basic Lambda execution policy
  aws iam attach-role-policy \
    --role-name "$LAMBDA_ROLE_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  
  # Wait for role to propagate
  echo "Waiting for IAM role to propagate..."
  sleep 10
fi

# Get the role ARN
LAMBDA_ROLE_ARN=$(aws iam get-role --role-name "$LAMBDA_ROLE_NAME" --query "Role.Arn" --output text)

# Create Lambda function for API backend
echo "Creating Lambda function code..."
mkdir -p lambda
cat > lambda/index.js << EOF
exports.handler = async (event) => {
  // Mock songs data
  const songs = [
    {
      id: "1",
      title: "Bohemian Rhapsody",
      artist: "Queen",
      duration: "5:55",
      albumCover: "https://upload.wikimedia.org/wikipedia/en/4/4d/Queen_A_Night_at_the_Opera.png"
    },
    {
      id: "2",
      title: "Hotel California",
      artist: "Eagles",
      duration: "6:30",
      albumCover: "https://upload.wikimedia.org/wikipedia/en/4/49/Hotelcalifornia.jpg"
    },
    // Add the rest of your mock songs here...
  ];
  
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(songs)
  };
  
  return response;
};
EOF

# Zip the Lambda function code
echo "Zipping Lambda function code..."
(cd lambda && zip -r ../function.zip *)

# Create or update Lambda function
echo "Creating/updating Lambda function..."
if aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" 2>/dev/null; then
  echo "Updating existing Lambda function..."
  aws lambda update-function-code \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --zip-file fileb://function.zip
else
  echo "Creating new Lambda function..."
  aws lambda create-function \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --runtime nodejs18.x \
    --role "$LAMBDA_ROLE_ARN" \
    --handler index.handler \
    --zip-file fileb://function.zip
fi

# Create API Gateway
echo "Creating API Gateway..."
API_ID=$(aws apigateway create-rest-api \
  --name "$API_NAME" \
  --description "API for Sacred Chants website" \
  --endpoint-configuration "types=REGIONAL" \
  --query "id" --output text)

echo "API Gateway created with ID: $API_ID"

# Get the root resource ID
ROOT_RESOURCE_ID=$(aws apigateway get-resources \
  --rest-api-id "$API_ID" \
  --query "items[0].id" --output text)

# Create a resource for /songs
echo "Creating /songs resource..."
SONGS_RESOURCE_ID=$(aws apigateway create-resource \
  --rest-api-id "$API_ID" \
  --parent-id "$ROOT_RESOURCE_ID" \
  --path-part "songs" \
  --query "id" --output text)

# Create GET method for /songs
echo "Creating GET method for /songs..."
aws apigateway put-method \
  --rest-api-id "$API_ID" \
  --resource-id "$SONGS_RESOURCE_ID" \
  --http-method GET \
  --authorization-type NONE

# Get Lambda ARN
LAMBDA_ARN=$(aws lambda get-function \
  --function-name "$LAMBDA_FUNCTION_NAME" \
  --query "Configuration.FunctionArn" --output text)

# Create integration between API Gateway and Lambda
echo "Creating integration between API Gateway and Lambda..."
aws apigateway put-integration \
  --rest-api-id "$API_ID" \
  --resource-id "$SONGS_RESOURCE_ID" \
  --http-method GET \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations"

# Add permission for API Gateway to invoke Lambda
echo "Adding permission for API Gateway to invoke Lambda..."
aws lambda add-permission \
  --function-name "$LAMBDA_FUNCTION_NAME" \
  --statement-id "apigateway-$API_ID" \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:$REGION:$(aws sts get-caller-identity --query 'Account' --output text):$API_ID/*/*/songs"

# Create OPTIONS method for CORS
echo "Creating OPTIONS method for CORS..."
aws apigateway put-method \
  --rest-api-id "$API_ID" \
  --resource-id "$SONGS_RESOURCE_ID" \
  --http-method OPTIONS \
  --authorization-type NONE

# Create mock integration for OPTIONS
echo "Creating mock integration for OPTIONS..."
aws apigateway put-integration \
  --rest-api-id "$API_ID" \
  --resource-id "$SONGS_RESOURCE_ID" \
  --http-method OPTIONS \
  --type MOCK \
  --request-templates '{"application/json":"{\"statusCode\": 200}"}'

# Set up OPTIONS method response
echo "Setting up OPTIONS method response..."
aws apigateway put-method-response \
  --rest-api-id "$API_ID" \
  --resource-id "$SONGS_RESOURCE_ID" \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters "method.response.header.Access-Control-Allow-Headers=true,method.response.header.Access-Control-Allow-Methods=true,method.response.header.Access-Control-Allow-Origin=true"

# Set up OPTIONS integration response
echo "Setting up OPTIONS integration response..."
aws apigateway put-integration-response \
  --rest-api-id "$API_ID" \
  --resource-id "$SONGS_RESOURCE_ID" \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",\"method.response.header.Access-Control-Allow-Methods\":\"'GET,OPTIONS'\",\"method.response.header.Access-Control-Allow-Origin\":\"'*'\"}" \
  --response-templates "{\"application/json\": \"\"}"

# Deploy the API
echo "Deploying the API to stage: $STAGE_NAME..."
aws apigateway create-deployment \
  --rest-api-id "$API_ID" \
  --stage-name "$STAGE_NAME"

# Get the API endpoint URL
API_ENDPOINT="https://$API_ID.execute-api.$REGION.amazonaws.com/$STAGE_NAME"
echo "API Gateway endpoint: $API_ENDPOINT"

# Generate updated songApi.ts file with actual API endpoint
echo "Generating updated songApi.ts file with API endpoint..."
cat > songApi.ts.new << EOF
import { Song } from "@/types/song";

// API Gateway endpoint
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
    // Return mock data as fallback for now
    return mockSongs;
  }
};

// Keep mock data for fallback
const mockSongs: Song[] = [
  {
    id: "1",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    duration: "5:55",
    albumCover: "https://upload.wikimedia.org/wikipedia/en/4/4d/Queen_A_Night_at_the_Opera.png"
  },
  {
    id: "2",
    title: "Hotel California",
    artist: "Eagles",
    duration: "6:30",
    albumCover: "https://upload.wikimedia.org/wikipedia/en/4/49/Hotelcalifornia.jpg"
  },
  {
    id: "3",
    title: "Billie Jean",
    artist: "Michael Jackson",
    duration: "4:54",
    albumCover: "https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png"
  },
  {
    id: "4",
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    duration: "5:56",
    albumCover: "https://upload.wikimedia.org/wikipedia/en/3/3b/Appetitefordestructioncover.jpg"
  },
  {
    id: "5",
    title: "Beat It",
    artist: "Michael Jackson",
    duration: "4:18",
    albumCover: "https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png"
  },
  {
    id: "6",
    title: "Paradise City",
    artist: "Guns N' Roses",
    duration: "6:46",
    albumCover: "https://upload.wikimedia.org/wikipedia/en/3/3b/Appetitefordestructioncover.jpg"
  },
  {
    id: "7",
    title: "We Will Rock You",
    artist: "Queen",
    duration: "2:02",
    albumCover: "https://upload.wikimedia.org/wikipedia/en/4/4d/Queen_A_Night_at_the_Opera.png"
  }
];
EOF

echo "--------------------------------------------------------------"
echo "Infrastructure setup complete!"
echo ""
echo "Next steps:"
echo "1. Build your React app with: npm run build"
echo "2. Upload the build files to the S3 bucket: aws s3 sync dist/ s3://$BUCKET_NAME"
echo "3. Your website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo "4. Use this API endpoint in your code: $API_ENDPOINT/songs"
echo "5. Replace the songApi.ts file with the generated version (songApi.ts.new)"
echo ""
echo "Happy coding!"
