# Deployment Guide

This guide explains how to deploy the OurChants website using GitHub Actions.

## Prerequisites

1. AWS CLI installed and configured
2. GitHub CLI installed
3. Node.js and npm installed
4. Python 3.8+ installed

## Setup Steps

### 1. Install GitHub CLI

```bash
# macOS
brew install gh

# Ubuntu/Debian
sudo apt install gh

# Windows
scoop install gh
```

### 2. Authenticate with GitHub

```bash
gh auth login
```

Follow the prompts to:
- Choose HTTPS or SSH
- Choose how you want to authenticate (browser or token)
- Select your GitHub account

### 3. Configure AWS Credentials

```bash
aws configure
```

You'll need:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (us-east-1)
- Default output format (json)

### 4. Set Up GitHub Secrets

Run the following command to automatically set up the required secrets:

```bash
make auth
```

This will:
- Read your AWS credentials
- Read your API endpoint from .env
- Set up the following secrets in your GitHub repository:
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
  - API_ENDPOINT

### 5. Deploy

The site will automatically deploy when you push to the main branch. To deploy manually:

```bash
make deploy
```

## Manual Secret Setup

If you prefer to set secrets manually:

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add the following secrets:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - API_ENDPOINT

## Troubleshooting

### GitHub CLI Issues

If you get an error about GitHub CLI not being installed:
1. Verify installation: `gh --version`
2. If not installed, follow the installation steps above
3. If installed but not working, try: `gh auth login`

### AWS Credentials Issues

If you get an error about AWS credentials:
1. Verify AWS CLI is installed: `aws --version`
2. Configure AWS: `aws configure`
3. Test credentials: `aws sts get-caller-identity`

### Deployment Issues

If the deployment fails:
1. Check GitHub Actions logs
2. Verify all secrets are set correctly
3. Ensure AWS credentials have necessary permissions
4. Check CloudFront distribution ID is correct

## Security Notes

- Never commit AWS credentials to the repository
- Use GitHub secrets for sensitive information
- Regularly rotate AWS access keys
- Consider using GitHub OIDC for more secure AWS authentication 