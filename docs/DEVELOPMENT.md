# Development Guide

## Prerequisites

- Node.js 18+
- Python 3.11+
- AWS CLI configured
- CDK CLI installed

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Python virtual environment:
   ```bash
   cd infrastructure
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

## Development Workflow

### Building and Testing

To build and test the project:
```bash
make build
```

This will:
- Install dependencies
- Run linter
- Run tests
- Build the frontend

### Deployment

To deploy changes:
```bash
make deploy
```

This will:
- Build the project
- Deploy to S3
- Update infrastructure via CDK

### Diagnostics

To run network diagnostics:
```bash
make diagnose
```

This will:
- Check network configuration
- Verify AWS services
- Generate a detailed log file

## Project Structure

```
ourchants-website/
├── infrastructure/     # CDK infrastructure code
│   ├── ourchants_stack.py
│   ├── domain_config.py
│   └── deploy-cdk.sh
├── src/               # Frontend source code
├── dist/              # Built frontend files
└── Makefile          # Build and deployment commands
```

## Infrastructure

The infrastructure is managed using AWS CDK and includes:
- S3 bucket for static website hosting
- CloudFront distribution
- API Gateway
- Lambda functions
- WAF rules
- Route53 DNS configuration

## Testing

- Unit tests: `npm run test`
- Linting: `npm run lint`
- Build verification: `make build`

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version
   - Verify dependencies
   - Check for linting errors

2. **Deployment Issues**
   - Verify AWS credentials
   - Check environment variables
   - Review CloudFormation stack status

3. **Network Issues**
   - Run `make diagnose`
   - Check AWS service status
   - Verify DNS configuration

## Best Practices

1. **Code Quality**
   - Run linter before committing
   - Write unit tests for new features
   - Follow TypeScript best practices

2. **Infrastructure**
   - Review CDK changes before deploying
   - Test infrastructure changes in staging
   - Monitor AWS service quotas

3. **Security**
   - Keep dependencies updated
   - Follow AWS security best practices
   - Monitor WAF rules

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/latest/APIReference/Welcome.html)
