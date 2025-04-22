#!/bin/bash
# bootstrap_domain.sh
# Purpose: Verifies and validates the domain setup for OurChants website
# This script checks:
# 1. Domain registration in Route 53
# 2. CDK stack deployment
# 3. CloudFront distribution
# 4. ACM certificate
# 5. DNS configuration
#
# Usage: ./bootstrap_domain.sh
# Prerequisites:
# - AWS CLI configured with appropriate credentials
# - Domain registered in Route 53
# - CDK stack deployed
# - jq installed for JSON parsing
#
# Author: OurChants Team
# Last Updated: 2024

set -e

DOMAIN="ourchants.com"
REGION="us-east-1"
STACK_NAME="OurChantsFrontendStack"

echo "🔍 Verifying domain registration..."
if aws route53domains get-domain-detail --domain-name "$DOMAIN" >/dev/null 2>&1; then
  echo "✅ Domain is registered."
else
  echo "❌ Domain is not registered. Please register the domain first."
  exit 1
fi

echo "🔍 Checking CDK stack deployment..."
if aws cloudformation describe-stacks --stack-name "$STACK_NAME" >/dev/null 2>&1; then
  echo "✅ CDK stack is deployed."
else
  echo "❌ CDK stack is not deployed. Please run 'make cdk' first."
  exit 1
fi

echo "🔍 Verifying CloudFront distribution..."
CF_DISTRO_ID=$(aws cloudformation describe-stack-resources \
  --stack-name "$STACK_NAME" \
  --query "StackResources[?ResourceType=='AWS::CloudFront::Distribution'].PhysicalResourceId | [0]" \
  --output text)

if [[ "$CF_DISTRO_ID" == "None" || -z "$CF_DISTRO_ID" ]]; then
  echo "❌ Could not find CloudFront distribution in stack $STACK_NAME"
  exit 1
fi

echo "✅ Found CloudFront distribution ID: $CF_DISTRO_ID"

echo "🔍 Checking ACM certificate..."
CERT_ARN=$(aws acm list-certificates --region $REGION --output json \
  | jq -r --arg domain "$DOMAIN" '.CertificateSummaryList[] | select(.DomainName==$domain) | .CertificateArn')

if [[ -n "$CERT_ARN" ]]; then
  STATUS=$(aws acm describe-certificate --certificate-arn "$CERT_ARN" --region $REGION --query 'Certificate.Status' --output text)
  echo "✅ Found certificate: $CERT_ARN (status: $STATUS)"
else
  echo "❌ No certificate found. Please check CDK deployment."
  exit 1
fi

echo "🔍 Verifying DNS configuration..."
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name "$DOMAIN" \
  --query 'HostedZones[0].Id' --output text | sed 's|/hostedzone/||')

if [[ -z "$HOSTED_ZONE_ID" ]]; then
  echo "❌ Could not find hosted zone for $DOMAIN"
  exit 1
fi

echo "✅ Found hosted zone: $HOSTED_ZONE_ID"

echo "🔍 Checking A record..."
CURRENT_CF_DOMAIN="d21wmvl5q9ujuy.cloudfront.net"
EXISTING_ALIAS=$(aws route53 list-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" \
  --query "ResourceRecordSets[?Name == '$DOMAIN.'].AliasTarget.DNSName" --output text)

if [[ "$EXISTING_ALIAS" == "$CURRENT_CF_DOMAIN." ]]; then
  echo "✅ A record is correctly configured."
else
  echo "❌ A record is not correctly configured. Please check CDK deployment."
  exit 1
fi

echo "🎉 All verifications passed! Your site should be accessible at: https://$DOMAIN"
echo "Note: DNS changes may take up to 48 hours to propagate globally."
