#!/bin/bash
set -euo pipefail

: <<'__DOC__'

╔════════════════════════════════════════════════════════════════════════════════╗
║                             🌐 check_stack_env.sh                             ║
╠════════════════════════════════════════════════════════════════════════════════╣
║ PURPOSE:                                                                       ║
║   This script builds a full diagnostic "data profile" of the app's cloud       ║
║   networking environment — including API Gateway, CloudFront, S3, and logging. ║
║                                                                                ║
║ WHAT IT DOES:                                                                  ║
║   - Discovers the active CloudFront distribution used by the static frontend   ║
║     via S3 origin or CloudFormation stack (OurChantsFrontendStack).            ║
║   - Inspects API Gateway CORS, stages, routes, integrations.                   ║
║   - Dumps S3 website, CORS, policy, public access, and index.html info.        ║
║   - Fetches CloudFront cache behaviors, error responses, origins, status.      ║
║   - Runs live curl requests against the public API to simulate traffic.        ║
║   - Lists relevant CloudWatch log groups for additional observability.         ║
║                                                                                ║
║ HOW TO USE IT:                                                                 ║
║   1. Run this from any environment with AWS CLI access to your deployment.     ║
║   2. Let it stream output — this script is meant to be read *visually*         ║
║      and/or piped into a file to create a historical baseline.                 ║
║   3. Ideal as part of a diagnostic bundle when investigating mobile slowness,  ║
║      bad routing, failed CORS, or just needing to "understand the setup."      ║
║                                                                                ║
║ INTENDED OUTCOME:                                                              ║
║   A complete situational awareness snapshot of how traffic flows in and out    ║
║   of the app: from client → CloudFront → S3 / Lambda via API Gateway.          ║
╚════════════════════════════════════════════════════════════════════════════════╝

__DOC__

# =============================
# CONFIG
# =============================

BUCKET_NAME="ourchants-website"
STACK_NAME="OurChantsFrontendStack"
API_ID="hezyeh6kgj"

divider() {
  echo -e "\n============================== $1 ==============================\n"
}

run() {
  echo -e "\n> $1"
  eval "$1" || echo "⚠️  Command failed: $1"
}

# =============================
# CloudFront Distribution ID Discovery
# =============================
divider "CloudFront Distribution Lookup"

echo "🔍 Looking for CloudFront distribution with S3 origin: ${BUCKET_NAME}.s3.amazonaws.com"
echo "Running: aws cloudfront list-distributions --query \"DistributionList.Items[?Origins.Items[0].DomainName=='${BUCKET_NAME}.s3.amazonaws.com'].Id | [0]\" --output text"
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Origins.Items[0].DomainName=='${BUCKET_NAME}.s3.amazonaws.com'].Id | [0]" \
  --output text 2>/dev/null)
echo "Result: $DISTRIBUTION_ID"

if [[ "$DISTRIBUTION_ID" == "None" || -z "$DISTRIBUTION_ID" ]]; then
  echo "🔍 Trying CloudFormation stack lookup in stack: $STACK_NAME"
  echo "Running: aws cloudformation describe-stack-resources --stack-name \"$STACK_NAME\" --query \"StackResources[?ResourceType=='AWS::CloudFront::Distribution'].PhysicalResourceId | [0]\" --output text"
  DISTRIBUTION_ID=$(aws cloudformation describe-stack-resources \
    --stack-name "$STACK_NAME" \
    --query "StackResources[?ResourceType=='AWS::CloudFront::Distribution'].PhysicalResourceId | [0]" \
    --output text)
  echo "Result: $DISTRIBUTION_ID"
fi

if [[ "$DISTRIBUTION_ID" == "None" || -z "$DISTRIBUTION_ID" ]]; then
  echo "⚠️  No CloudFront distribution found. This could mean:"
  echo "    1. The distribution hasn't been created yet"
  echo "    2. The distribution exists with a different configuration"
  echo "    3. AWS credentials don't have permission to list distributions"
  echo "    Continuing with other checks..."
  DISTRIBUTION_ID=""
else
  echo "✅ Found CloudFront distribution: $DISTRIBUTION_ID"
fi

# =============================
# API Gateway Checks
# =============================
divider "API Gateway ($API_ID)"

echo "Checking API Gateway configuration..."
run "aws apigatewayv2 get-api --api-id $API_ID"
run "aws apigatewayv2 get-api --api-id $API_ID --query 'CorsConfiguration'"
run "aws apigatewayv2 get-stages --api-id $API_ID"
run "aws apigatewayv2 get-stage --api-id $API_ID --stage-name '\$default'"
run "aws apigatewayv2 get-integrations --api-id $API_ID"
run "aws apigatewayv2 get-routes --api-id $API_ID"

# =============================
# S3 Configuration
# =============================
divider "S3 Bucket: $BUCKET_NAME"

echo "Checking S3 bucket configuration..."
run "aws s3api get-bucket-website --bucket $BUCKET_NAME"
run "aws s3api get-bucket-cors --bucket $BUCKET_NAME"
run "aws s3api get-bucket-policy --bucket $BUCKET_NAME --query 'Policy' --output text"
run "aws s3api head-object --bucket $BUCKET_NAME --key 'index.html'"
run "aws s3api get-bucket-policy-status --bucket $BUCKET_NAME"
run "aws s3api get-public-access-block --bucket $BUCKET_NAME"

# =============================
# CloudFront Configuration
# =============================
if [[ -n "$DISTRIBUTION_ID" ]]; then
  divider "CloudFront Distribution: $DISTRIBUTION_ID"

  echo "Checking CloudFront distribution configuration..."
  run "aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.Status'"
  run "aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DistributionConfig'"
  run "aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DistributionConfig.Origins'"
  run "aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DistributionConfig.DefaultCacheBehavior'"
  run "aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DistributionConfig.CustomErrorResponses'"
else
  echo "⚠️  Skipping CloudFront detailed config checks (no distribution ID found)."
fi

# =============================
# Network Test
# =============================
divider "Network: Curl API Checks"

echo "Testing API endpoints..."
run "curl -v https://$API_ID.execute-api.us-east-1.amazonaws.com/songs"
run "curl -v -H \"Origin: http://localhost:3000\" -H \"Access-Control-Request-Method: GET\" -X OPTIONS https://$API_ID.execute-api.us-east-1.amazonaws.com/songs"

# =============================
# CloudWatch Log Groups
# =============================
divider "CloudWatch Logs"

echo "Checking CloudWatch log groups..."
run "aws logs describe-log-groups --log-group-name-prefix '/aws/apigateway'"
run "aws logs describe-log-groups --log-group-name-prefix '/aws/lambda'"

echo -e "\n✅ Environment diagnostics complete."
