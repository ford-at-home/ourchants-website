"""
Project documentation for the OurChants frontend infrastructure.

This file contains:
- Project overview
- Setup instructions
- Deployment procedures
- Development guidelines
- Troubleshooting tips

It serves as the primary documentation for developers working on the infrastructure.
"""

# OurChants Infrastructure

This document outlines the AWS infrastructure setup for the OurChants application.

## Overview

The infrastructure consists of:
- S3 bucket for static website hosting
- CloudFront distribution for content delivery
- Route53 for DNS management
- API Gateway for REST API
- Lambda functions for backend logic
- DynamoDB for data storage
- Cognito for authentication

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  CloudFront     │────▶│  S3 Bucket      │────▶│  Static Files   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │
        │
        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  API Gateway    │────▶│  Lambda         │────▶│  DynamoDB       │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │
        │
        ▼
┌─────────────────┐
│                 │
│  Cognito        │
│                 │
└─────────────────┘
```

## Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js v18 or higher
- CDK CLI installed (`npm install -g aws-cdk`)
- Python 3.8+ (for Lambda functions)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure AWS credentials:
```bash
aws configure
```

3. Bootstrap CDK (first time only):
```bash
cdk bootstrap
```

## Deployment

### Development Environment
```bash
cdk deploy --context env=dev
```

### Production Environment
```bash
cdk deploy --context env=prod
```

## Environment Configuration

Environment-specific settings are stored in SSM Parameter Store under `/ourchants/{env}/`:

- `API_URL`: The API Gateway endpoint
- `COGNITO_USER_POOL_ID`: Cognito user pool ID
- `COGNITO_CLIENT_ID`: Cognito client ID
- `S3_BUCKET_NAME`: S3 bucket name for static files
- `DYNAMODB_TABLE_NAME`: DynamoDB table name

## Infrastructure Components

### 1. Frontend Hosting
- S3 bucket configured for static website hosting
- CloudFront distribution with:
  - SSL/TLS encryption
  - Compression
  - Cache behaviors
  - Error pages
  - WAF rules

### 2. API Layer
- API Gateway with:
  - REST API
  - CORS configuration
  - Rate limiting
  - Request validation
  - Authentication

### 3. Backend Services
- Lambda functions for:
  - Song management
  - File uploads
  - Authentication
  - Data processing

### 4. Data Storage
- DynamoDB table with:
  - Partition key: `song_id`
  - Sort key: `created_at`
  - GSI for queries
  - TTL for data expiration

### 5. Authentication
- Cognito user pool with:
  - Email verification
  - Password policies
  - MFA support
  - Social login

## Monitoring and Logging

### CloudWatch
- Log groups for Lambda functions
- Metrics for API Gateway
- Alarms for errors and throttling

### X-Ray
- Request tracing
- Service map
- Performance insights

## Security

### IAM Policies
- Least privilege access
- Role-based access control
- Service-specific permissions

### Network Security
- VPC configuration
- Security groups
- Network ACLs

### Data Protection
- Encryption at rest
- Encryption in transit
- Key management

## Maintenance

### Backup
- Daily DynamoDB backups
- S3 versioning
- Cross-region replication

### Updates
- CDK pipeline for updates
- Canary deployments
- Rollback procedures

## Troubleshooting

### Common Issues

1. **Deployment Failures**
   - Check CloudFormation logs
   - Verify IAM permissions
   - Validate resource limits

2. **API Errors**
   - Check Lambda logs
   - Verify API Gateway configuration
   - Test authentication flow

3. **Performance Issues**
   - Monitor CloudWatch metrics
   - Check cache hit ratios
   - Review Lambda cold starts

## Support

For infrastructure support:
1. Check CloudWatch logs
2. Review deployment history
3. Contact AWS support if needed

## Cost Optimization

- Use reserved instances
- Implement auto-scaling
- Monitor resource usage
- Clean up unused resources

## License

This project is licensed under the MIT License - see the LICENSE file for details.
