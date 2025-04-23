#!/usr/bin/env python3
"""
CDK application entry point for OurChants frontend infrastructure.

This file:
- Initializes the CDK app
- Creates the OurChants frontend stack
- Creates the GitHub OIDC deployment role stack
"""

import os
from aws_cdk import App, Environment
from ourchants_stack import OurChantsStack
from github_oidc_stack import GitHubOidcDeploymentRoleStack

app = App()

env = Environment(
    account=os.environ.get("CDK_DEFAULT_ACCOUNT"),
    region=os.environ.get("CDK_DEFAULT_REGION", "us-east-1")
)

# Main site + infrastructure
OurChantsStack(app, "OurChantsFrontendStack", env=env)

# GitHub OIDC deployment role stack
GitHubOidcDeploymentRoleStack(app, "GitHubOidcDeploymentRoleStack", env=env)

app.synth()
