"""
CDK application entry point for OurChants frontend infrastructure.

This file:
- Initializes the CDK app
- Creates the OurChants frontend stack
- Uses the existing deployed stacks' outputs
"""

#!/usr/bin/env python3
import os
from aws_cdk import App
from ourchants_stack import OurChantsStack

# Initialize the CDK app
app = App()

# Create the stack using existing deployed stacks' outputs
OurChantsStack(
    app,
    "OurChantsFrontendStack",
    env={
        "account": os.environ.get("CDK_DEFAULT_ACCOUNT"),
        "region": os.environ.get("CDK_DEFAULT_REGION", "us-east-1"),
    },
)

# Synthesize the CloudFormation template
app.synth()
