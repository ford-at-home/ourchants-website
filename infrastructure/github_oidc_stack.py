from aws_cdk import (
    Stack,
    aws_iam as iam,
    Duration,
)
from constructs import Construct

class GitHubOidcDeploymentRoleStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        role_name = "github-actions-ourchants-deploy"
        github_repo = "ford-at-home/ourchants-website"
        branch = "main"

        oidc_provider = iam.OpenIdConnectProvider(
            self, "GitHubOIDCProvider",
            url="https://token.actions.githubusercontent.com",
            client_ids=["sts.amazonaws.com"]
        )

        deploy_role = iam.Role(
            self, "GitHubOIDCDeployRole",
            role_name=role_name,
            assumed_by=iam.FederatedPrincipal(
                oidc_provider.open_id_connect_provider_arn,
                conditions={
                    "StringEquals": {
                        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
                        "token.actions.githubusercontent.com:sub": f"repo:{github_repo}:ref:refs/heads/{branch}"
                    }
                },
                assume_role_action="sts:AssumeRoleWithWebIdentity"
            ),
            description="GitHub Actions deployment role for ourchants-website repo",
            max_session_duration=Duration.hours(1)
        )

        # Broad for now — scope down later
        deploy_role.add_managed_policy(iam.ManagedPolicy.from_aws_managed_policy_name("AdministratorAccess"))

        # S3 permissions
        deploy_role.add_to_policy(iam.PolicyStatement(
            actions=[
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:GetBucketWebsite",
                "s3:PutBucketWebsite"
            ],
            resources=[
                f"arn:aws:s3:::{github_repo.split('/')[1]}",
                f"arn:aws:s3:::{github_repo.split('/')[1]}/*"
            ]
        ))

        # CloudFront permissions
        deploy_role.add_to_policy(iam.PolicyStatement(
            actions=[
                "cloudfront:CreateInvalidation",
                "cloudfront:GetInvalidation",
                "cloudfront:ListInvalidations"
            ],
            resources=["*"]  # CloudFront doesn't support resource-level permissions for these actions
        ))

        # CDK permissions
        deploy_role.add_to_policy(iam.PolicyStatement(
            actions=[
                "cloudformation:*",
                "iam:*",
                "s3:*",
                "cloudfront:*",
                "route53:*",
                "acm:*"
            ],
            resources=["*"],
            conditions={
                "StringEquals": {
                    "aws:RequestTag/aws:cloudformation:stack-name": "OurChantsFrontendStack"
                }
            }
        ))

        # Allow the role to pass itself to other services
        deploy_role.add_to_policy(iam.PolicyStatement(
            actions=["iam:PassRole"],
            resources=[deploy_role.role_arn],
            conditions={
                "StringEquals": {
                    "iam:PassedToService": [
                        "cloudformation.amazonaws.com",
                        "cloudfront.amazonaws.com"
                    ]
                }
            }
        ))
