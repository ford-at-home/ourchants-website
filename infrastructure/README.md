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

# OurChants Frontend Infrastructure

This project contains the AWS CDK infrastructure code for deploying the OurChants frontend application.

## Overview

The infrastructure consists of:
- S3 bucket for static website hosting
- CloudFront distribution for content delivery
- Route53 record for custom domain
- TypeScript API client generation
- Environment-specific configuration

## Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js and npm installed
- Python 3.8+ installed
- CDK CLI installed (`npm install -g aws-cdk`)

## Setup

1. Create a Python virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

## Development

### Local Development

1. Start the development server:
```bash
cdk synth
```

2. Deploy to a development environment:
```bash
cdk deploy --context env=dev
```

### Environment Configuration

The stack supports multiple environments (dev, staging, prod). Configure the environment using the `--context` flag:

```bash
cdk deploy --context env=staging
```

Environment-specific settings are stored in SSM Parameter Store under `/ourchants/{env}/`.

## Deployment

### Manual Deployment

1. Deploy to production:
```bash
cdk deploy --context env=prod
```

### CI/CD Integration

The infrastructure is designed to be deployed through CI/CD pipelines. Environment variables and context are automatically configured based on the deployment environment.

## API Integration

The stack generates a TypeScript API client (`songApi.ts`) that provides type-safe access to the OurChants API. The API endpoint is configurable through the `ApiEndpoint` parameter.

## Troubleshooting

### Common Issues

1. **Deployment Failures**
   - Check CloudFormation logs in the AWS Console
   - Verify IAM permissions
   - Ensure all required parameters are provided

2. **API Client Generation**
   - Verify the API endpoint is correct
   - Check TypeScript compilation errors
   - Ensure all required types are defined

### Getting Help

For infrastructure-related issues, contact the DevOps team or create an issue in the repository.

## Security

- All resources are created with least-privilege IAM policies
- Environment-specific secrets are stored in SSM Parameter Store
- CloudFront distributions use HTTPS only
- S3 buckets have appropriate bucket policies

## Maintenance

### Updating Dependencies

1. Update Python dependencies:
```bash
pip install -U -r requirements.txt
pip install -U -r requirements-dev.txt
```

2. Update Node.js dependencies:
```bash
npm update
```

### Infrastructure Changes

1. Make changes to the CDK stack
2. Test changes in development environment
3. Deploy to staging for validation
4. Deploy to production after approval

## License

This project is licensed under the MIT License - see the LICENSE file for details.
