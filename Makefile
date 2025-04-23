# Variables
BUCKET_NAME = ourchants-website
REGION = us-east-1
PROJECT_ROOT = $(shell git rev-parse --show-toplevel)
DOMAIN_NAME ?= ourchants.com
CF_DISTRO_ID = EFJFO56LXFQJM

# Build and Test
.PHONY: build
build:
	@echo "🔨 Building project..."
	npm install
	npm run build
	npm run lint
	npm run test

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
	@API_ENDPOINT=$$(grep API_ENDPOINT .env | cut -d '=' -f2); \
	if [ -z "$$API_ENDPOINT" ]; then \
		echo "Error: API_ENDPOINT not found in .env file"; \
		exit 1; \
	fi; \
	sed "s|API_ENDPOINT_PLACEHOLDER|$${API_ENDPOINT}|g" "$(PROJECT_ROOT)/src/services/songApi.template.ts" > "$(PROJECT_ROOT)/src/services/songApi.ts"

	@# Configure S3 for static website hosting
	@echo "⚙️ Configuring S3 for static website hosting..."
	aws s3 website s3://$(BUCKET_NAME) --index-document index.html --error-document index.html

	@# Deploy to S3
	@echo "📦 Deploying to S3..."
	aws s3 sync dist/ s3://$(BUCKET_NAME) --delete

	@# Invalidate CloudFront cache and wait for completion
	@echo "🔄 Invalidating CloudFront cache..."
	@INVALIDATION_ID=$$(aws cloudfront create-invalidation --distribution-id "$(CF_DISTRO_ID)" --paths "/*" --query 'Invalidation.Id' --output text); \
	if [ -z "$$INVALIDATION_ID" ]; then \
		echo "Error: Failed to create CloudFront invalidation"; \
		exit 1; \
	fi; \
	echo "Created invalidation: $$INVALIDATION_ID"
	
	@echo "⏳ Waiting for invalidation to complete..."
	@aws cloudfront wait invalidation-completed --distribution-id "$(CF_DISTRO_ID)" --id "$$INVALIDATION_ID" || { \
		echo "Error: CloudFront invalidation failed or timed out"; \
		exit 1; \
	}
	@echo "✅ CloudFront cache invalidation completed"

	@# Deploy infrastructure
	@echo "🏗️  Deploying infrastructure..."
	@cd infrastructure && ./deploy-cdk.sh

	@echo "✅ Deployment complete! Site should be available at https://$(DOMAIN_NAME)"

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
	@echo "  make diagnose - Run network diagnostics"
	@echo "  make clean   - Clean build files and dependencies"
	@echo ""
	@echo "Variables:"
	@echo "  DOMAIN_NAME - Custom domain name (default: ourchants.com)"
	@echo "  BUCKET_NAME - S3 bucket name (default: ourchants-website)"
	@echo "  REGION     - AWS region (default: us-east-1)"
	@echo "  CF_DISTRO_ID - CloudFront distribution ID (default: EFJFO56LXFQJM)"
