#!/bin/bash

# Exit on error
set -e

echo "Deploying CDK infrastructure..."

# Change to infrastructure directory
cd "$(dirname "$0")"

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install Python dependencies in virtual environment
python3 -m pip install -r requirements.txt

# Install CDK CLI if not already installed
if ! command -v cdk &> /dev/null; then
    echo "Installing CDK CLI..."
    npm install -g aws-cdk
fi

# Force CDK to use virtual environment's Python
export CDK_PYTHON="$(pwd)/.venv/bin/python"

# Deploy CDK
cdk deploy --require-approval never

echo "CDK deployment complete!" 