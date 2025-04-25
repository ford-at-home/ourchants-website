# Variables
BUCKET_NAME = ourchants-website
REGION = us-east-1
PROJECT_ROOT = $(shell git rev-parse --show-toplevel)
DOMAIN_NAME ?= ourchants.com
CF_DISTRO_ID = EFJFO56LXFQJM

# Build and Test
.PHONY: build test test-watch test-coverage
build:
	@echo "🔨 Building project..."
	npm install
	npm run build
	npm run lint
	npm run test

test:
	@echo "🧪 Running tests..."
	npx vitest run

test-watch:
	@echo "👀 Running tests in watch mode..."
	npx vitest

test-coverage:
	@echo "📊 Running tests with coverage..."
	npx vitest run --coverage

# Authentication Setup
.PHONY: auth
auth:
	@echo "🔐 Setting up GitHub Actions authentication..."
	@if [ ! -f .env ]; then \
		echo "Error: .env file not found"; \
		exit 1; \
	fi

	@# Check for AWS credentials
	@if [ ! -f ~/.aws/credentials ]; then \
		echo "Error: AWS credentials not found. Please run 'aws configure' first."; \
		exit 1; \
	fi

	@# Get AWS credentials
	@AWS_ACCESS_KEY_ID=$$(aws configure get aws_access_key_id); \
	AWS_SECRET_ACCESS_KEY=$$(aws configure get aws_secret_access_key); \
	if [ -z "$$AWS_ACCESS_KEY_ID" ] || [ -z "$$AWS_SECRET_ACCESS_KEY" ]; then \
		echo "Error: Could not get AWS credentials from aws configure"; \
		exit 1; \
	fi

	@# Get API endpoint
	@API_ENDPOINT=$$(grep API_ENDPOINT .env | cut -d '=' -f2); \
	if [ -z "$$API_ENDPOINT" ]; then \
		echo "Error: API_ENDPOINT not found in .env file"; \
		exit 1; \
	fi

	@# Check if GitHub CLI is installed
	@if ! command -v gh &> /dev/null; then \
		echo "Error: GitHub CLI (gh) is not installed. Please install it first."; \
		exit 1; \
	fi

	@# Check if GitHub CLI is authenticated
	@if ! gh auth status &> /dev/null; then \
		echo "Error: GitHub CLI is not authenticated. Please run 'gh auth login' first."; \
		exit 1; \
	fi

	@echo "📝 Setting up GitHub secrets..."
	@echo "$$AWS_ACCESS_KEY_ID" | gh secret set AWS_ACCESS_KEY_ID || { echo "Error: Failed to set AWS_ACCESS_KEY_ID"; exit 1; }
	@echo "$$AWS_SECRET_ACCESS_KEY" | gh secret set AWS_SECRET_ACCESS_KEY || { echo "Error: Failed to set AWS_SECRET_ACCESS_KEY"; exit 1; }
	@echo "$$API_ENDPOINT" | gh secret set API_ENDPOINT || { echo "Error: Failed to set API_ENDPOINT"; exit 1; }
	@echo "✅ GitHub secrets set successfully!"

	@# Deploy OIDC stack
	@echo "🔄 Deploying GitHub OIDC stack..."
	@cd infrastructure && ./deploy-cdk.sh GitHubOidcDeploymentRoleStack
	@echo "✅ OIDC stack deployed successfully!"

# Full Deployment
.PHONY: deploy
deploy: build
	@echo "🚀 Deploying to production..."
	@# Set up environment
	@if [ ! -f .env ]; then \
		echo "Error: .env file not found"; \
		exit 1; \
	fi; \
	if ! grep -q "DOMAIN_NAME" .env; then \
		echo "DOMAIN_NAME=$(DOMAIN_NAME)" >> .env; \
	fi

	@# Update API configuration
	@echo "🔄 Updating API configuration..."
	@node scripts/update-api-endpoint.js

	@# Configure S3 for static website hosting
	@echo "⚙️ Configuring S3 for static website hosting..."
	aws s3 website s3://$(BUCKET_NAME) --index-document index.html --error-document index.html

	@# Deploy to S3
	@echo "📦 Deploying to S3..."
	aws s3 sync dist/ s3://$(BUCKET_NAME) --delete

	@# Invalidate CloudFront cache
	@echo "🔄 Invalidating CloudFront cache..."
	@INVALIDATION_ID=$$(aws cloudfront create-invalidation --distribution-id "$(CF_DISTRO_ID)" --paths "/*" --query 'Invalidation.Id' --output text); \
	if [ -z "$$INVALIDATION_ID" ]; then \
		echo "Warning: Failed to create CloudFront invalidation, but deployment completed"; \
	else \
		echo "Created invalidation: $$INVALIDATION_ID"; \
		echo "Note: Cache invalidation may take a few minutes to complete"; \
	fi

	@# Deploy infrastructure
	@echo "🏗️  Deploying infrastructure..."
	@cd infrastructure && ./deploy-cdk.sh

	@echo "✅ Deployment complete! Site should be available at https://$(DOMAIN_NAME)"
	@echo "Note: If you don't see your changes immediately, wait a few minutes for CloudFront cache to clear"

# Diagnostics
.PHONY: diagnose
diagnose:
	@mkdir -p logs
	@echo "📋 Running full network environment diagnosis..."
	@bash infrastructure/check_stack_env.sh | tee logs/env-profile-$(shell date +"%Y%m%d-%H%M%S").log

# Cleanup
.PHONY: clean
clean:
	rm -rf dist
	rm -rf node_modules

# Help
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make build   - Build, lint, and test the project"
	@echo "  make deploy  - Full deployment (build, deploy, infrastructure)"
	@echo "  make auth    - Set up GitHub Actions authentication"
	@echo "  make diagnose - Run network diagnostics"
	@echo "  make clean   - Clean build files and dependencies"
	@echo "  make test    - Run tests once"
	@echo "  make test-watch - Run tests in watch mode"
	@echo "  make test-coverage - Run tests with coverage"
	@echo ""
	@echo "Variables:"
	@echo "  DOMAIN_NAME - Custom domain name (default: ourchants.com)"
	@echo "  BUCKET_NAME - S3 bucket name (default: ourchants-website)"
	@echo "  REGION     - AWS region (default: us-east-1)"
	@echo "  CF_DISTRO_ID - CloudFront distribution ID (default: EFJFO56LXFQJM)"
