# CloudFront Implementation Specification

## Overview
This document outlines the CloudFront distribution setup for the OurChants static website. The distribution is configured to serve content from an S3 bucket with optimal performance and security settings.

## Current Configuration

### CloudFront Distribution
- **Distribution ID**: `EFJFO56LXFQJM`
- **Domain**: `d21wmvl5q9ujuy.cloudfront.net`
- **Origin**: `ourchants-website.s3.amazonaws.com` (S3 REST endpoint)
- **Default Root Object**: `index.html`
- **Protocol**: HTTPS only (HTTP requests redirected to HTTPS)
- **Price Class**: All Edge Locations

### Origin Configuration
- **Origin Type**: S3 REST endpoint
- **Connection Attempts**: 3
- **Connection Timeout**: 10 seconds
- **Origin Shield**: Disabled

### Cache Behavior
- **Allowed Methods**: GET, HEAD, OPTIONS
- **Cached Methods**: GET, HEAD
- **Viewer Protocol Policy**: Redirect to HTTPS
- **Compression**: Enabled
- **Cache Policy**: `658327ea-f89d-4fab-a63d-7e88639e58f6`
- **Origin Request Policy**: `88a5eaf4-2fd4-4709-b370-b4c650ea3fcf`

### Error Handling
- **403 Errors**: Redirect to `/index.html` (SPA routing)
- **404 Errors**: Redirect to `/index.html` (SPA routing)
- **Error Caching TTL**: 300 seconds

### Security
- **WAF**: Enabled with WebACL `WebsiteWafAcl-WTSmQXLOsQCX`
- **TLS Version**: Minimum TLSv1
- **SSL Support Method**: VIP
- **IPv6**: Enabled

## Implementation Notes

### Why S3 REST Endpoint?
The distribution uses the S3 REST endpoint (`s3.amazonaws.com`) instead of the website endpoint (`s3-website-*.amazonaws.com`) because:
- Better HTTPS support
- Consistent caching headers
- More reliable mobile browser compatibility
- Better performance with CloudFront

### Cache Invalidation
To invalidate the CloudFront cache:
```bash
aws cloudfront create-invalidation --distribution-id EFJFO56LXFQJM --paths "/*"
```

### Monitoring
- CloudFront metrics available in AWS CloudWatch
- WAF logs available in the configured logging destination
- Real-time monitoring through CloudFront console

## Maintenance

### Updates
To update the CloudFront distribution:
1. Get current configuration:
   ```bash
   aws cloudfront get-distribution --id EFJFO56LXFQJM > current-config.json
   ```
2. Modify configuration
3. Update distribution:
   ```bash
   aws cloudfront update-distribution --id EFJFO56LXFQJM --distribution-config file://updated-config.json --if-match $(aws cloudfront get-distribution --id EFJFO56LXFQJM --query 'ETag' --output text)
   ```

### Troubleshooting
Common issues and solutions:
1. **Timeout Errors**: Check origin response time and connection settings
2. **403/404 Errors**: Verify S3 bucket permissions and error page configuration
3. **Mobile Issues**: Ensure proper HTTPS configuration and cache headers

## Future Considerations
- Enable CloudFront logging for better debugging
- Consider implementing Origin Shield for additional caching layer
- Evaluate need for custom SSL certificate
- Monitor performance metrics for potential optimizations

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