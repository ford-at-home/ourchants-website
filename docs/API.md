# API Documentation

This document describes the API endpoints used by the OurChants website.

## Base URL

The API is hosted at: `https://hezyeh6kgj.execute-api.us-east-1.amazonaws.com`

## Authentication

Currently, the API is public and doesn't require authentication.

## Endpoints

### Songs

#### List All Songs
```http
GET /songs
```

Response:
```json
[
  {
    "song_id": "string",
    "title": "string",
    "artist": "string",
    "duration": number,
    "file_path": "string",
    "created_at": "string",
    "updated_at": "string"
  }
]
```

#### Get Song by ID
```http
GET /songs/{song_id}
```

Response:
```json
{
  "song_id": "string",
  "title": "string",
  "artist": "string",
  "duration": number,
  "file_path": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

### Audio Files

#### Get Presigned URL
```http
POST /presigned-url
```

Request:
```json
{
  "file_path": "string"
}
```

Response:
```json
{
  "url": "string",
  "expires_in": number
}
```

## Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

Error Response Format:
```json
{
  "error": "string",
  "code": "string",
  "details": {
    "field": "string",
    "message": "string"
  }
}
```

## Rate Limiting

The API is rate-limited to 1000 requests per IP address per hour.

## CORS

The API supports CORS with the following configuration:
- Allowed Origins: 
  - https://ourchants.com
  - http://localhost:5173
  - http://localhost:3000
- Allowed Methods: GET, POST, OPTIONS
- Allowed Headers: Content-Type, Accept, Authorization, X-Api-Key

## Implementation

The API is implemented using:
- AWS API Gateway (HTTP API)
- Lambda functions
- S3 for audio file storage

For more details about the backend implementation, see [ourchants-api](https://github.com/ford-at-home/ourchants-api). 