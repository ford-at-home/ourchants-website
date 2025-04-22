"""
Domain configuration for OurChants website.

This module provides domain-related configuration for the CDK stack:
- ACM certificate
- Route53 hosted zone
- CloudFront domain configuration
"""

from aws_cdk import (
    aws_certificatemanager as acm,
    aws_route53 as route53,
    aws_route53_targets as targets,
    aws_cloudfront as cloudfront,
    Stack,
)
from constructs import Construct

class DomainConfig:
    def __init__(self, stack: Stack, domain_name: str):
        self.domain_name = domain_name
        self.stack = stack
        self._setup_domain()

    def _setup_domain(self):
        # Get the hosted zone
        self.hosted_zone = route53.HostedZone.from_lookup(
            self.stack,
            "HostedZone",
            domain_name=self.domain_name
        )

        # Create ACM certificate
        self.certificate = acm.Certificate(
            self.stack,
            "Certificate",
            domain_name=self.domain_name,
            validation=acm.CertificateValidation.from_dns(self.hosted_zone)
        )

    def configure_cloudfront(self, distribution: cloudfront.Distribution):
        """Configure CloudFront distribution with custom domain."""
        # Create Route53 A record
        route53.ARecord(
            self.stack,
            "AliasRecord",
            zone=self.hosted_zone,
            target=route53.RecordTarget.from_alias(
                targets.CloudFrontTarget(distribution)
            )
        )
        
        return {
            'certificate': self.certificate,
            'domain_name': self.domain_name
        } 