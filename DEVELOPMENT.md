# Development Guide

## Environment Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- AWS CLI configured
- CDK CLI installed

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Python virtual environment:
   ```bash
   cd infrastructure
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Deployment Process

### Infrastructure Deployment
1. Ensure AWS credentials are configured
2. Deploy CDK stack:
   ```bash
   make cdk
   ```
   This will:
   - Create/update S3 bucket
   - Set up CloudFront distribution
   - Configure WAF rules
   - Set up API Gateway

### Frontend Deployment
1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to S3:
   ```bash
   make deploy
   ```

3. Invalidate CloudFront cache:
   ```bash
   aws cloudfront create-invalidation --distribution-id EFJFO56LXFQJM --paths "/*"
   ```

## CloudFront Configuration

The site is served through a CloudFront distribution with the following settings:

### Origin
- S3 REST endpoint: `ourchants-website.s3.amazonaws.com`
- Origin Protocol Policy: HTTPS only
- Origin Request Policy: CORS-S3Origin

### Cache Behavior
- Allowed Methods: GET, HEAD, OPTIONS
- Cache Policy: CachingOptimized
- Compress Objects: Yes
- Viewer Protocol Policy: Redirect HTTP to HTTPS

### Error Handling
- 403 and 404 errors redirect to `/index.html`
- Custom error responses configured for SPA routing

### Security
- WAF Web ACL attached
- TLS 1.2+ required
- HTTPS-only access

## Troubleshooting

### Common Issues

1. **Deployment Failures**
   - Check AWS credentials
   - Verify CDK CLI version
   - Ensure Python virtual environment is activated

2. **CloudFront Issues**
   - Check distribution status
   - Verify origin configuration
   - Clear browser cache
   - Invalidate CloudFront cache if needed

3. **API Gateway Issues**
   - Verify CORS configuration
   - Check Lambda function logs
   - Ensure API endpoint is correct

### Debugging Tools

1. **CloudFront**
   ```bash
   # Get distribution status
   aws cloudfront get-distribution --id EFJFO56LXFQJM

   # Create cache invalidation
   aws cloudfront create-invalidation --distribution-id EFJFO56LXFQJM --paths "/*"
   ```

2. **S3**
   ```bash
   # Check bucket configuration
   aws s3api get-bucket-website --bucket ourchants-website
   aws s3api get-bucket-cors --bucket ourchants-website
   ```

3. **API Gateway**
   ```bash
   # Get API details
   aws apigateway get-rest-apis
   aws apigateway get-stages --rest-api-id <api-id>
   ```

## Best Practices

1. **Development**
   - Use feature branches
   - Run tests before committing
   - Update documentation for changes

2. **Deployment**
   - Test changes locally first
   - Deploy to staging if available
   - Monitor CloudFront metrics
   - Keep cache invalidation minimal

3. **Security**
   - Keep dependencies updated
   - Follow AWS security best practices
   - Monitor WAF logs
   - Use HTTPS everywhere

## Monitoring

1. **CloudFront Metrics**
   - Cache hit ratio
   - Error rates
   - Request counts
   - Latency

2. **WAF Metrics**
   - Blocked requests
   - Allowed requests
   - Rule matches

3. **S3 Metrics**
   - Request counts
   - Error rates
   - Data transfer

## Maintenance

1. **Regular Tasks**
   - Update dependencies
   - Review CloudFront logs
   - Check WAF rules
   - Monitor costs

2. **Infrastructure Updates**
   - Follow CDK best practices
   - Test changes in staging
   - Document configuration changes
   - Update documentation

3. **Security Updates**
   - Review WAF rules
   - Update TLS settings
   - Monitor for vulnerabilities
   - Apply security patches 