# Deployment Guide

## Prerequisites

- AWS CLI configured with appropriate permissions
- Node.js 18+ installed
- Python 3.11+ installed
- CDK CLI installed (`npm install -g aws-cdk`)
- Domain name registered (e.g., ourchants.com)

## Deployment Steps

### 1. Initial Setup

First, set up your environment variables:

```bash
# Create .env file with required variables
echo "API_ENDPOINT=your-api-endpoint" > .env
echo "DOMAIN_NAME=ourchants.com" >> .env
```

### 2. Build and Deploy

The deployment process is handled by a single command:

```bash
make deploy
```

This command will:
1. Build the project
   - Install dependencies
   - Run linter
   - Run tests
   - Build the frontend

2. Deploy to production
   - Update API configuration
   - Deploy to S3
   - Deploy infrastructure via CDK
   - Configure domain and SSL

### 3. Verify Deployment

After deployment, verify:
1. The site is accessible at your custom domain (e.g., https://ourchants.com)
2. SSL certificate is valid
3. API endpoints are working
4. Audio files are playing correctly

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check S3 bucket CORS configuration
   - Verify API Gateway CORS settings
   - Ensure CloudFront distribution is properly configured

2. **SSL Certificate Issues**
   - Verify DNS validation records are correct
   - Check ACM certificate status
   - Ensure CloudFront is using the correct certificate

3. **Domain Not Resolving**
   - Check Route53 hosted zone configuration
   - Verify A record points to CloudFront
   - Allow time for DNS propagation (can take up to 48 hours)

### Diagnostics

Run network diagnostics:
```bash
make diagnose
```

This will:
- Check network configuration
- Verify AWS services
- Generate a detailed log file

## Maintenance

### Updating the Site

1. Make changes to the frontend code
2. Run `make deploy`

### Updating Infrastructure

1. Modify CDK code in `infrastructure/`
2. Run `make deploy` to update infrastructure

### Certificate Renewal

ACM certificates are automatically renewed, but you can manually check status:
```bash
aws acm list-certificates --region us-east-1
```

## Security Considerations

- Keep AWS credentials secure
- Regularly rotate access keys
- Monitor CloudFront and API Gateway logs
- Review WAF rules periodically
- Keep dependencies updated

## Cost Optimization

- Use CloudFront caching effectively
- Monitor S3 storage usage
- Review Lambda function execution times
- Consider using AWS Budgets for cost tracking 