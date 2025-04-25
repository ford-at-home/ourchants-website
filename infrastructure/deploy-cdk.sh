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

# Parse command line arguments
EXCLUDE_STACKS=()
while [[ $# -gt 0 ]]; do
    case $1 in
        --exclude)
            EXCLUDE_STACKS+=("$2")
            shift 2
            ;;
        *)
            STACK_NAME="$1"
            shift
            ;;
    esac
done

# Deploy CDK
if [ -n "$STACK_NAME" ]; then
    echo "Deploying specific stack: $STACK_NAME"
    cdk deploy "$STACK_NAME" --require-approval never
else
    if [ ${#EXCLUDE_STACKS[@]} -gt 0 ]; then
        echo "Deploying all stacks except: ${EXCLUDE_STACKS[*]}"
        # Get all stacks
        ALL_STACKS=($(cdk list))
        # Filter out excluded stacks
        STACKS_TO_DEPLOY=()
        for stack in "${ALL_STACKS[@]}"; do
            EXCLUDED=false
            for excluded in "${EXCLUDE_STACKS[@]}"; do
                if [ "$stack" = "$excluded" ]; then
                    EXCLUDED=true
                    break
                fi
            done
            if [ "$EXCLUDED" = false ]; then
                STACKS_TO_DEPLOY+=("$stack")
            fi
        done
        # Deploy remaining stacks
        if [ ${#STACKS_TO_DEPLOY[@]} -gt 0 ]; then
            for stack in "${STACKS_TO_DEPLOY[@]}"; do
                echo "Deploying stack: $stack"
                cdk deploy "$stack" --require-approval never
            done
        else
            echo "No stacks to deploy after exclusions"
            exit 0
        fi
    else
        echo "Deploying all stacks"
        cdk deploy --all --require-approval never
    fi
fi

echo "CDK deployment complete!" 