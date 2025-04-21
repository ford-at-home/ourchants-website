import json
import boto3
from datetime import datetime
from boto3.dynamodb.conditions import Key
import os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['BLOG_TABLE_NAME'])

def lambda_handler(event, context):
    http_method = event['requestContext']['http']['method']
    
    if http_method == 'GET':
        return get_posts(event)
    elif http_method == 'POST':
        return create_post(event)
    else:
        return {
            'statusCode': 405,
            'body': json.dumps({'error': 'Method not allowed'})
        }

def get_posts(event):
    try:
        # Get all posts, sorted by date
        response = table.scan()
        posts = response.get('Items', [])
        
        # Sort posts by date (newest first)
        posts.sort(key=lambda x: x['created_at'], reverse=True)
        
        return {
            'statusCode': 200,
            'body': json.dumps(posts)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def create_post(event):
    try:
        body = json.loads(event['body'])
        
        # Validate required fields
        required_fields = ['title', 'content', 'author']
        for field in required_fields:
            if field not in body:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'error': f'Missing required field: {field}'})
                }
        
        # Create post
        post = {
            'id': str(datetime.now().timestamp()),
            'title': body['title'],
            'content': body['content'],
            'author': body['author'],
            'created_at': datetime.now().isoformat(),
            'tags': body.get('tags', []),
            'image_url': body.get('image_url')
        }
        
        table.put_item(Item=post)
        
        return {
            'statusCode': 201,
            'body': json.dumps(post)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        } 