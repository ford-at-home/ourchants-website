import aws_cdk as core
import aws_cdk.assertions as assertions

from infrastructure.infrastructure_stack import InfrastructureStack

# example tests. To run these tests, uncomment this file along with the example
# resource in infrastructure/infrastructure_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = InfrastructureStack(app, "infrastructure")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })

def test_api_gateway_created():
    app = core.App()
    stack = InfrastructureStack(app, "infrastructure")
    template = assertions.Template.from_stack(stack)

    # Verify API Gateway is created
    template.resource_count_is("AWS::ApiGateway::RestApi", 1)

    # Verify the /songs endpoint
    template.has_resource_properties("AWS::ApiGateway::Method", {
        "HttpMethod": "GET",
        "ResourceId": {
            "Fn::GetAtt": [
                "ApiGatewayRestApi",
                "RootResourceId"
            ]
        },
        "RequestParameters": {
            "method.request.querystring.artist_filter": False,
            "method.request.querystring.limit": False,
            "method.request.querystring.offset": False
        }
    })

    # Verify CORS configuration
    template.has_resource_properties("AWS::ApiGateway::Method", {
        "HttpMethod": "OPTIONS",
        "ResourceId": {
            "Fn::GetAtt": [
                "ApiGatewayRestApi",
                "RootResourceId"
            ]
        },
        "MethodResponses": [
            {
                "StatusCode": "200",
                "ResponseParameters": {
                    "method.response.header.Access-Control-Allow-Headers": "'Content-Type'",
                    "method.response.header.Access-Control-Allow-Methods": "'GET,POST,PUT,DELETE,OPTIONS'",
                    "method.response.header.Access-Control-Allow-Origin": "'*'"
                }
            }
        ]
    })

    # Verify Lambda integration
    template.has_resource_properties("AWS::ApiGateway::Method", {
        "HttpMethod": "GET",
        "Integration": {
            "Type": "AWS_PROXY",
            "IntegrationHttpMethod": "POST"
        }
    })

    # Verify Lambda function
    template.has_resource_properties("AWS::Lambda::Function", {
        "Handler": "index.handler",
        "Runtime": "nodejs18.x",
        "Environment": {
            "Variables": {
                "DYNAMODB_TABLE_NAME": {
                    "Ref": "SongsTable"
                }
            }
        }
    })

    # Verify DynamoDB table
    template.has_resource_properties("AWS::DynamoDB::Table", {
        "TableName": "songs",
        "KeySchema": [
            {
                "AttributeName": "song_id",
                "KeyType": "HASH"
            }
        ],
        "AttributeDefinitions": [
            {
                "AttributeName": "song_id",
                "AttributeType": "S"
            }
        ],
        "BillingMode": "PAY_PER_REQUEST"
    })
