# Variables
BUCKET_NAME = ourchants-website
REGION = us-east-1

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

# Deployment commands
.PHONY: deploy
deploy: build
	aws s3 sync dist/ s3://$(BUCKET_NAME)
	@echo "Deployed to http://$(BUCKET_NAME).s3-website-$(REGION).amazonaws.com"

.PHONY: setup-infra
setup-infra:
	./setup-aws-infra.sh

.PHONY: clean
clean:
	rm -rf dist
	rm -rf node_modules

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make install     - Install dependencies"
	@echo "  make dev        - Start development server"
	@echo "  make build      - Build the project"
	@echo "  make lint       - Run linter"
	@echo "  make deploy     - Build and deploy to S3"
	@echo "  make setup-infra - Set up AWS infrastructure"
	@echo "  make clean      - Clean build files and dependencies" 