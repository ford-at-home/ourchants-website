# CloudFront Implementation Specification

## Overview
This document outlines the implementation of CloudFront for the OurChants static website. The implementation focuses on improving global content delivery while maintaining simplicity and security.

## Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  CloudFront     │────▶│  S3 Website     │────▶│  Static Files   │
│                 │     │  Endpoint       │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Components

### 1. CloudFront Distribution
- Origin: S3 website endpoint (http://ourchants-website.s3-website-us-east-1.amazonaws.com)
- Behaviors:
  - Default (*) - S3 origin
  - Cache policy: CachingOptimized
  - Origin request policy: CORS-S3Origin
  - Viewer protocol policy: Redirect to HTTPS
- Error pages:
  - 403 -> 200 /index.html
  - 404 -> 200 /index.html
- Price class: All (global distribution)
- WAF: Basic protection rules

### 2. S3 Configuration
- Maintains current website hosting configuration
- Keeps existing CORS rules
- No changes to bucket policy required

### 3. WAF Rules
- AWSManagedRulesCommonRuleSet
- AWSManagedRulesKnownBadInputsRuleSet
- Rate limiting rule (1000 requests per 5 minutes per IP)

## Implementation Steps

1. Update CDK Stack:
   - Add CloudFront distribution
   - Configure WAF
   - Update outputs to use CloudFront domain

2. Update Deployment:
   - No changes to build process
   - No changes to S3 sync process
   - Update documentation with new domain

## Considerations

### Security
- Using S3 website endpoint for simplicity
- HTTPS enforced at CloudFront level
- Basic WAF protection
- No sensitive data in static files

### Performance
- Global distribution
- Optimized caching
- Compression enabled
- No regional restrictions

### Maintenance
- CloudFront distribution managed by CDK
- WAF rules managed by CDK
- No manual configuration required

## API Gateway Consideration (Optional)
The API Gateway currently doesn't use CloudFront. If improved global performance is needed for the API, a separate CloudFront distribution could be added with the following configuration:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  CloudFront     │────▶│  API Gateway    │────▶│  Lambda         │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

Configuration would include:
- Origin: API Gateway regional endpoint
- Cache policy: CachingDisabled
- Origin request policy: AllViewer
- CORS configuration at API Gateway level
- WAF rules specific to API protection

## Rollback Plan
1. Revert CDK changes
2. Update outputs to use S3 website URL
3. Delete CloudFront distribution
4. Delete WAF ACL

## Monitoring
- CloudFront metrics in CloudWatch
- WAF metrics and logs
- S3 access logs (optional) 