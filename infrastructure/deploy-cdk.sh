#!/bin/bash

# Exit on error
set -e

# Silence warnings
export JSII_SILENCE_WARNING_DEPRECATED_NODE_VERSION=1
export CDK_DISABLE_NOTICES=1

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

# Debug: List available stacks
echo "Available stacks:"
cdk list

# Synthesize CDK app first
echo "Synthesizing CDK app..."
cdk synth

# If no arguments provided, deploy all stacks
if [ $# -eq 0 ]; then
    echo "No stacks specified, deploying all stacks..."
    cdk deploy --all --require-approval never
else
    # Deploy each specified stack
    for stack in "$@"; do
        echo "Deploying $stack..."
        cdk deploy "$stack" --require-approval never
    done
fi

echo "CDK deployment complete!" 