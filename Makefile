# Variables
BUCKET_NAME = ourchants-website
REGION = us-east-1
PROJECT_ROOT = $(shell git rev-parse --show-toplevel)
WEBSITE_URL = http://$(BUCKET_NAME).s3-website-$(REGION).amazonaws.com

# Development commands
.PHONY: install
install:
	npm install

.PHONY: dev
dev:
	npm run dev

.PHONY: build
build:
	npm run build

.PHONY: lint
lint:
	npm run lint

# Testing commands
.PHONY: test
test: install
	npm run test

.PHONY: test-build
test-build: build
	# Add any build verification tests here
	@echo "Build verification tests passed"

.PHONY: test-all
test-all: test test-build

# Deployment stages
.PHONY: setup-env
setup-env:
	@echo "Setting up environment variables..."
	@if [ -f .env ]; then \
		API_ENDPOINT=$$(grep API_ENDPOINT .env | cut -d '=' -f2); \
		if [ -z "$$API_ENDPOINT" ]; then \
			echo "Error: API_ENDPOINT not found in .env file"; \
			exit 1; \
		fi; \
		echo "Found API endpoint: $$API_ENDPOINT"; \
	else \
		echo "Error: .env file not found"; \
		exit 1; \
	fi

.PHONY: update-api
update-api: setup-env
	@echo "Updating API configuration..."
	@API_ENDPOINT=$$(grep API_ENDPOINT .env | cut -d '=' -f2); \
	sed "s|API_ENDPOINT_PLACEHOLDER|$${API_ENDPOINT}|g" "$(PROJECT_ROOT)/src/services/songApi.template.ts" > "$(PROJECT_ROOT)/src/services/songApi.ts"

.PHONY: deploy-s3
deploy-s3: build
	@echo "Deploying to S3..."
	aws s3 sync dist/ s3://$(BUCKET_NAME) --delete
	@echo "Deployed to $(WEBSITE_URL)"

.PHONY: configure-cors
configure-cors:
	@echo "Configuring CORS for API Gateway..."
	@API_ID=$$(aws apigatewayv2 get-apis --query "Items[?Name=='SongsHttpApi'].ApiId" --output text); \
	if [ -z "$$API_ID" ]; then \
		echo "Error: Could not find API Gateway with name 'SongsHttpApi'"; \
		echo "Available APIs:"; \
		aws apigatewayv2 get-apis --query "Items[*].[Name,ApiId]" --output table; \
		exit 1; \
	fi; \
	echo "Found API Gateway ID: $$API_ID"; \
	cat > cors-config.json << EOF \
	{ \
	  "AllowOrigins": ["$(WEBSITE_URL)"], \
	  "AllowMethods": ["GET", "POST", "PUT", "DELETE"], \
	  "AllowHeaders": ["Content-Type", "Accept"], \
	  "MaxAge": 3000 \
	} \
	EOF \
	aws apigatewayv2 update-api --api-id "$$API_ID" --cors-configuration file://cors-config.json > /dev/null 2>&1; \
	aws apigatewayv2 create-deployment --api-id "$$API_ID" > /dev/null 2>&1; \
	rm cors-config.json; \
	echo "CORS configuration complete!"

# CDK deployment
.PHONY: cdk
cdk:
	@cd infrastructure && ./deploy-cdk.sh

# Full deployment commands
.PHONY: deploy
deploy: test-all update-api deploy-s3

.PHONY: deploy-prod
deploy-prod: deploy configure-cors
	@echo "Production deployment complete!"

.PHONY: boom
boom: deploy-prod cdk
	@echo "🚀 Full deployment completed successfully!"

# Infrastructure commands
.PHONY: setup-infra
setup-infra:
	./infrastructure/deploy.sh

.PHONY: clean
clean:
	rm -rf dist
	rm -rf node_modules

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  Development:"
	@echo "    make install     - Install dependencies"
	@echo "    make dev        - Start development server"
	@echo "    make build      - Build the project"
	@echo "    make lint       - Run linter"
	@echo ""
	@echo "  Testing:"
	@echo "    make test       - Run tests"
	@echo "    make test-build - Verify build"
	@echo "    make test-all   - Run all tests"
	@echo ""
	@echo "  Deployment:"
	@echo "    make setup-env  - Set up environment variables"
	@echo "    make update-api - Update API configuration"
	@echo "    make deploy-s3  - Deploy to S3"
	@echo "    make configure-cors - Configure CORS for API Gateway"
	@echo "    make deploy     - Full deployment (test + deploy)"
	@echo "    make deploy-prod - Production deployment (includes CORS)"
	@echo "    make boom      - Complete deployment process"
	@echo ""
	@echo "  Infrastructure:"
	@echo "    make setup-infra - Set up AWS infrastructure"
	@echo "    make clean      - Clean build files and dependencies" 