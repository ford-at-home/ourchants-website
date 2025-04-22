#!/bin/bash

# ---------- CONFIG ----------
DOMAIN_NAME="ourchants.com"
S3_BUCKET="ourchants-website"
ACM_CERT_ARN="arn:aws:acm:us-east-1:418272766513:certificate/e5cce858-2cbe-41b2-938e-040822835e01"
HOSTED_ZONE_ID="Z092555735VYH79E1FDT"  # Replace with your actual hosted zone ID
LOG_FILE="cloudfront_debug_$(date +%Y%m%d_%H%M%S).log"
# ----------------------------

echo "🧪 CloudFront Troubleshooting Log" > "$LOG_FILE"
echo "Timestamp: $(date)" >> "$LOG_FILE"
echo "--------------------------------" >> "$LOG_FILE"

# Auto-detect CloudFront Distribution ID
DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?contains(Aliases.Items[?contains(@, '$DOMAIN_NAME')], '$DOMAIN_NAME')].Id" \
  --output text)

echo "🆔 CloudFront Distribution ID: $DIST_ID" >> "$LOG_FILE"

{
  echo -e "\n== CloudFront Distribution =="
  aws cloudfront get-distribution --id "$DIST_ID" | jq

  echo -e "\n== CloudFront Origin Settings =="
  aws cloudfront get-distribution-config --id "$DIST_ID" | jq '.DistributionConfig.Origins'

  echo -e "\n== S3 Bucket Policy =="
  aws s3api get-bucket-policy --bucket "$S3_BUCKET" --query 'Policy' --output text

  echo -e "\n== S3 Website Configuration =="
  aws s3api get-bucket-website --bucket "$S3_BUCKET"

  echo -e "\n== Route 53 DNS Records for Domain =="
  aws route53 list-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" \
    --query "ResourceRecordSets[?Name=='${DOMAIN_NAME}.']"

  echo -e "\n== ACM Certificate Status =="
  aws acm describe-certificate --certificate-arn "$ACM_CERT_ARN" | jq '.Certificate.Status, .Certificate.DomainValidationOptions'

  echo -e "\n== WAF WebACLs (if any) =="
  aws wafv2 list-web-acls --scope CLOUDFRONT | jq

} >> "$LOG_FILE" 2>&1

echo "✅ Log file created: $LOG_FILE"

