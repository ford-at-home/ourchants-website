"""
CDK Stack for the OurChants frontend infrastructure.

This stack creates the necessary AWS resources for hosting the OurChants static website:
- S3 bucket for static website hosting
- CloudFront distribution for global content delivery
- WAF for basic protection
- Generates the TypeScript API client (songApi.ts) with the correct API endpoint

The stack is designed to work with the existing deployed stacks:
- OurChantsDatabaseStack
- OurChantsStack
"""

from aws_cdk import (
    Stack,
    aws_s3 as s3,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as cloudfront_origins,
    aws_wafv2 as wafv2,
    aws_route53 as route53,
    aws_route53_targets as targets,
    RemovalPolicy,
    CfnOutput,
    Duration,
    aws_iam as iam,
    aws_lambda as lambda_,
    aws_apigateway as apigateway,
    aws_ssm as ssm,
    CfnParameter,
    Fn,
)
from constructs import Construct
import os
import json
from typing import Dict, Any
import boto3
import time
from dotenv import load_dotenv

class OurChantsStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Load environment variables from .env file
        load_dotenv()
        api_endpoint = os.getenv('API_ENDPOINT')
        
        if not api_endpoint:
            raise ValueError("API_ENDPOINT not found in .env file. Please run get-endpoint.sh first.")

        # Store API endpoint in SSM Parameter Store
        ssm.StringParameter(
            self, "ApiEndpointParameter",
            parameter_name="/ourchants/api-endpoint",
            string_value=api_endpoint,
            description="API Gateway endpoint URL"
        )

        # Create S3 bucket for static website hosting with fixed name
        bucket = s3.Bucket(
            self,
            "SacredChantsBucket",
            bucket_name="ourchants-website",
            website_index_document="index.html",
            website_error_document="index.html",
            public_read_access=True,
            block_public_access=s3.BlockPublicAccess(
                block_public_acls=False,
                block_public_policy=False,
                ignore_public_acls=False,
                restrict_public_buckets=False
            ),
            removal_policy=RemovalPolicy.DESTROY,  # For development only
            auto_delete_objects=True,  # For development only
        )

        # Add CORS configuration to the bucket
        bucket.add_cors_rule(
            allowed_methods=[s3.HttpMethods.GET, s3.HttpMethods.HEAD],
            allowed_origins=["*"],
            allowed_headers=["*"],
            max_age=3000
        )

        # Create WAF WebACL
        web_acl = wafv2.CfnWebACL(
            self,
            "WebsiteWafAcl",
            default_action=wafv2.CfnWebACL.DefaultActionProperty(
                allow=wafv2.CfnWebACL.AllowActionProperty()
            ),
            scope="CLOUDFRONT",
            visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                cloud_watch_metrics_enabled=True,
                metric_name="WebsiteWafAcl",
                sampled_requests_enabled=True
            ),
            rules=[
                wafv2.CfnWebACL.RuleProperty(
                    name="AWS-AWSManagedRulesCommonRuleSet",
                    priority=0,
                    statement=wafv2.CfnWebACL.StatementProperty(
                        managed_rule_group_statement=wafv2.CfnWebACL.ManagedRuleGroupStatementProperty(
                            name="AWSManagedRulesCommonRuleSet",
                            vendor_name="AWS"
                        )
                    ),
                    visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                        cloud_watch_metrics_enabled=True,
                        metric_name="AWSManagedRulesCommonRuleSet",
                        sampled_requests_enabled=True
                    ),
                    override_action=wafv2.CfnWebACL.OverrideActionProperty(
                        none={}
                    )
                ),
                wafv2.CfnWebACL.RuleProperty(
                    name="AWS-AWSManagedRulesKnownBadInputsRuleSet",
                    priority=1,
                    statement=wafv2.CfnWebACL.StatementProperty(
                        managed_rule_group_statement=wafv2.CfnWebACL.ManagedRuleGroupStatementProperty(
                            name="AWSManagedRulesKnownBadInputsRuleSet",
                            vendor_name="AWS"
                        )
                    ),
                    visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                        cloud_watch_metrics_enabled=True,
                        metric_name="AWSManagedRulesKnownBadInputsRuleSet",
                        sampled_requests_enabled=True
                    ),
                    override_action=wafv2.CfnWebACL.OverrideActionProperty(
                        none={}
                    )
                ),
                wafv2.CfnWebACL.RuleProperty(
                    name="RateLimit",
                    priority=2,
                    action=wafv2.CfnWebACL.RuleActionProperty(
                        block=wafv2.CfnWebACL.BlockActionProperty()
                    ),
                    statement=wafv2.CfnWebACL.StatementProperty(
                        rate_based_statement=wafv2.CfnWebACL.RateBasedStatementProperty(
                            limit=1000,
                            aggregate_key_type="IP"
                        )
                    ),
                    visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                        cloud_watch_metrics_enabled=True,
                        metric_name="RateLimit",
                        sampled_requests_enabled=True
                    )
                )
            ]
        )

        # Create CloudFront distribution
        distribution = cloudfront.Distribution(
            self,
            "WebsiteDistribution",
            web_acl_id=web_acl.attr_arn,
            default_behavior=cloudfront.BehaviorOptions(
                origin=cloudfront_origins.HttpOrigin(
                    domain_name=bucket.bucket_website_domain_name,
                    protocol_policy=cloudfront.OriginProtocolPolicy.HTTP_ONLY
                ),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowed_methods=cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                cache_policy=cloudfront.CachePolicy.CACHING_OPTIMIZED,
                origin_request_policy=cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN
            ),
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=403,
                    response_http_status=200,
                    response_page_path="/index.html"
                ),
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/index.html"
                )
            ]
        )

        # Generate songApi.ts file with full API implementation
        song_api_content = f'''import {{ Song }} from "@/types/song";

// API Configuration
const API_BASE_URL = "{api_endpoint.rstrip('/')}";

interface ApiError {{
  error: string;
  code: string;
  details?: Record<string, any>;
}}

async function handleResponse<T>(response: Response): Promise<T> {{
  if (!response.ok) {{
    const error: ApiError = await response.json();
    throw new Error(`${{error.error}} (Code: ${{error.code}})`);
  }}
  return response.json();
}}

export const createSong = async (song: Omit<Song, 'song_id'>): Promise<Song> => {{
  const response = await fetch(`${{API_BASE_URL}}/songs`, {{
    method: 'POST',
    headers: {{ 'Content-Type': 'application/json' }},
    body: JSON.stringify(song),
  }});
  return handleResponse<Song>(response);
}};

export const getSong = async (songId: string): Promise<Song> => {{
  const response = await fetch(`${{API_BASE_URL}}/songs/${{songId}}`);
  return handleResponse<Song>(response);
}};

export const listSongs = async (): Promise<Song[]> => {{
  const response = await fetch(`${{API_BASE_URL}}/songs`, {{
    headers: {{
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }}
  }});
  return handleResponse<Song[]>(response);
}};

export const updateSong = async (songId: string, song: Omit<Song, 'song_id'>): Promise<Song> => {{
  const response = await fetch(`${{API_BASE_URL}}/songs/${{songId}}`, {{
    method: 'PUT',
    headers: {{ 'Content-Type': 'application/json' }},
    body: JSON.stringify(song),
  }});
  return handleResponse<Song>(response);
}};

export const deleteSong = async (songId: string): Promise<void> => {{
  const response = await fetch(`${{API_BASE_URL}}/songs/${{songId}}`, {{
    method: 'DELETE',
  }});
  if (!response.ok) {{
    const error: ApiError = await response.json();
    throw new Error(`${{error.error}} (Code: ${{error.code}})`);
  }}
}};

// Helper function for concurrent updates with retry logic
export const updateSongWithRetry = async (
  songId: string,
  song: Omit<Song, 'song_id'>,
  maxRetries = 3
): Promise<Song> => {{
  let retries = 0;
  
  while (retries < maxRetries) {{
    try {{
      return await updateSong(songId, song);
    }} catch (error) {{
      if (error.message.includes('409') && retries < maxRetries - 1) {{
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        continue;
      }}
      throw error;
    }}
  }}
  
  throw new Error('Max retries exceeded');
}};
'''

        # Get the project root directory (go up one level from infrastructure)
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        target_path = os.path.join(project_root, 'src', 'lib', 'songApi.ts')
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        
        # Write the file
        with open(target_path, 'w') as f:
            f.write(song_api_content)

        # Outputs
        CfnOutput(
            self,
            "WebsiteURL",
            value=f"https://{distribution.distribution_domain_name}",
            description="URL of the website"
        )

        CfnOutput(
            self,
            "ApiEndpoint",
            value=api_endpoint,
            description="The API Gateway endpoint URL"
        ) 